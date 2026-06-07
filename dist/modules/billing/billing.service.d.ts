import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { TenantsService } from '../tenants/tenants.service';
import { TenantPlan } from '../tenants/enums/tenant-plan.enum';
export declare class BillingService {
    private readonly configService;
    private readonly tenantsService;
    private readonly logger;
    private readonly stripe;
    constructor(configService: ConfigService, tenantsService: TenantsService);
    createStripeCustomer(tenantId: string): Promise<Stripe.Customer>;
    createSubscription(tenantId: string, plan: TenantPlan): Promise<Stripe.Subscription | null>;
    cancelSubscription(tenantId: string): Promise<Stripe.Subscription | null>;
    handleWebhook(payload: Buffer, signature: string): Promise<void>;
    private handleInvoicePaid;
    private handleSubscriptionDeleted;
    getCustomerPortalUrl(tenantId: string, returnUrl: string): Promise<string>;
}
