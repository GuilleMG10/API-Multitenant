"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BillingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = require("stripe");
const tenants_service_1 = require("../tenants/tenants.service");
const tenant_plan_enum_1 = require("../tenants/enums/tenant-plan.enum");
const STRIPE_PLAN_PRICE_IDS = {
    [tenant_plan_enum_1.TenantPlan.FREE]: null,
    [tenant_plan_enum_1.TenantPlan.PRO]: 'price_pro_monthly',
    [tenant_plan_enum_1.TenantPlan.ENTERPRISE]: 'price_enterprise_monthly',
};
let BillingService = BillingService_1 = class BillingService {
    constructor(configService, tenantsService) {
        this.configService = configService;
        this.tenantsService = tenantsService;
        this.logger = new common_1.Logger(BillingService_1.name);
        this.stripe = new stripe_1.default(this.configService.get('STRIPE_SECRET_KEY'), {
            apiVersion: '2023-10-16',
        });
    }
    async createStripeCustomer(tenantId) {
        const tenant = await this.tenantsService.findOne(tenantId);
        if (tenant.stripeCustomerId) {
            const existing = await this.stripe.customers.retrieve(tenant.stripeCustomerId);
            if (!existing.deleted)
                return existing;
        }
        const customer = await this.stripe.customers.create({
            name: tenant.name,
            metadata: { tenantId: tenant.id, subdomain: tenant.subdomain },
        });
        await this.tenantsService.updateStripeInfo(tenantId, customer.id);
        this.logger.log(`Stripe customer created for tenant: ${tenant.name}`);
        return customer;
    }
    async createSubscription(tenantId, plan) {
        const tenant = await this.tenantsService.findOne(tenantId);
        if (!tenant.stripeCustomerId) {
            throw new common_1.BadRequestException('Tenant has no Stripe customer. Create one first.');
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
        await this.tenantsService.updateStripeInfo(tenantId, tenant.stripeCustomerId, subscription.id);
        this.logger.log(`Subscription created for tenant: ${tenant.name}, plan: ${plan}`);
        return subscription;
    }
    async cancelSubscription(tenantId) {
        const tenant = await this.tenantsService.findOne(tenantId);
        if (!tenant.stripeSubscriptionId)
            return null;
        const cancelled = await this.stripe.subscriptions.cancel(tenant.stripeSubscriptionId);
        await this.tenantsService.update(tenantId, { plan: tenant_plan_enum_1.TenantPlan.FREE });
        await this.tenantsService.updateStripeInfo(tenantId, tenant.stripeCustomerId);
        this.logger.log(`Subscription cancelled for tenant: ${tenant.name}`);
        return cancelled;
    }
    async handleWebhook(payload, signature) {
        const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        }
        catch (err) {
            throw new common_1.BadRequestException(`Webhook signature verification failed: ${err}`);
        }
        this.logger.log(`Processing Stripe event: ${event.type}`);
        switch (event.type) {
            case 'invoice.paid':
                await this.handleInvoicePaid(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await this.handleSubscriptionDeleted(event.data.object);
                break;
            default:
                this.logger.log(`Unhandled event type: ${event.type}`);
        }
    }
    async handleInvoicePaid(invoice) {
        this.logger.log(`Invoice paid: ${invoice.id} for customer: ${invoice.customer}`);
    }
    async handleSubscriptionDeleted(subscription) {
        const tenantId = subscription.metadata['tenantId'];
        if (!tenantId)
            return;
        await this.tenantsService.update(tenantId, { plan: tenant_plan_enum_1.TenantPlan.FREE });
        this.logger.log(`Subscription deleted, downgraded tenant ${tenantId} to FREE`);
    }
    async getCustomerPortalUrl(tenantId, returnUrl) {
        const tenant = await this.tenantsService.findOne(tenantId);
        if (!tenant.stripeCustomerId)
            throw new common_1.NotFoundException('No billing account found');
        const session = await this.stripe.billingPortal.sessions.create({
            customer: tenant.stripeCustomerId,
            return_url: returnUrl,
        });
        return session.url;
    }
};
exports.BillingService = BillingService;
exports.BillingService = BillingService = BillingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        tenants_service_1.TenantsService])
], BillingService);
//# sourceMappingURL=billing.service.js.map