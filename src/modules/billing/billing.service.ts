import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { TenantsService } from '../tenants/tenants.service';
import { TenantPlan } from '../tenants/enums/tenant-plan.enum';

const STRIPE_PLAN_PRICE_IDS: Record<TenantPlan, string | null> = {
  [TenantPlan.FREE]: null,
  [TenantPlan.PRO]: 'price_pro_monthly',
  [TenantPlan.ENTERPRISE]: 'price_enterprise_monthly',
};

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    private readonly tenantsService: TenantsService,
  ) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY')!, {
      apiVersion: '2023-10-16',
    });
  }

  async createStripeCustomer(tenantId: string): Promise<Stripe.Customer> {
    const tenant = await this.tenantsService.findOne(tenantId);

    if (tenant.stripeCustomerId) {
      const existing = await this.stripe.customers.retrieve(tenant.stripeCustomerId);
      if (!existing.deleted) return existing as Stripe.Customer;
    }

    const customer = await this.stripe.customers.create({
      name: tenant.name,
      metadata: { tenantId: tenant.id, subdomain: tenant.subdomain },
    });

    await this.tenantsService.updateStripeInfo(tenantId, customer.id);
    this.logger.log(`Stripe customer created for tenant: ${tenant.name}`);

    return customer;
  }

  async createSubscription(tenantId: string, plan: TenantPlan): Promise<Stripe.Subscription | null> {
    const tenant = await this.tenantsService.findOne(tenantId);

    if (!tenant.stripeCustomerId) {
      throw new BadRequestException('Tenant has no Stripe customer. Create one first.');
    }

    const priceId = STRIPE_PLAN_PRICE_IDS[plan];
    if (!priceId) {
      this.logger.log(`Plan ${plan} is free, no subscription needed`);
      return null;
    }

    const subscription = await this.stripe.subscriptions.create({
      customer: tenant.stripeCustomerId,
      items: [{ price: priceId }],
      metadata: { tenantId },
    });

    await this.tenantsService.updateStripeInfo(
      tenantId,
      tenant.stripeCustomerId,
      subscription.id,
    );

    this.logger.log(`Subscription created for tenant: ${tenant.name}, plan: ${plan}`);
    return subscription;
  }

  async cancelSubscription(tenantId: string): Promise<Stripe.Subscription | null> {
    const tenant = await this.tenantsService.findOne(tenantId);

    if (!tenant.stripeSubscriptionId) return null;

    const cancelled = await this.stripe.subscriptions.cancel(tenant.stripeSubscriptionId);

    await this.tenantsService.update(tenantId, { plan: TenantPlan.FREE });
    await this.tenantsService.updateStripeInfo(tenantId, tenant.stripeCustomerId!);

    this.logger.log(`Subscription cancelled for tenant: ${tenant.name}`);
    return cancelled;
  }

  async handleWebhook(payload: Buffer, signature: string): Promise<void> {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET')!;

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      throw new BadRequestException(`Webhook signature verification failed: ${err}`);
    }

    this.logger.log(`Processing Stripe event: ${event.type}`);

    switch (event.type) {
      case 'invoice.paid':
        await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    this.logger.log(`Invoice paid: ${invoice.id} for customer: ${invoice.customer}`);
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const tenantId = subscription.metadata['tenantId'];
    if (!tenantId) return;

    await this.tenantsService.update(tenantId, { plan: TenantPlan.FREE });
    this.logger.log(`Subscription deleted, downgraded tenant ${tenantId} to FREE`);
  }

  async getCustomerPortalUrl(tenantId: string, returnUrl: string): Promise<string> {
    const tenant = await this.tenantsService.findOne(tenantId);
    if (!tenant.stripeCustomerId) throw new NotFoundException('No billing account found');

    const session = await this.stripe.billingPortal.sessions.create({
      customer: tenant.stripeCustomerId,
      return_url: returnUrl,
    });

    return session.url;
  }
}
