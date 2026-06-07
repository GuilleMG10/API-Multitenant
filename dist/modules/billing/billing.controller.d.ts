import { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { BillingService } from './billing.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
export declare class BillingController {
    private readonly billingService;
    constructor(billingService: BillingService);
    createCustomer(tenantId: string): Promise<import("stripe").Stripe.Customer>;
    createSubscription(tenantId: string, dto: CreateSubscriptionDto): Promise<import("stripe").Stripe.Subscription | null>;
    cancelSubscription(tenantId: string): Promise<import("stripe").Stripe.Subscription | null>;
    getPortal(tenantId: string, returnUrl: string): Promise<string>;
    handleWebhook(req: RawBodyRequest<Request>, signature: string): Promise<{
        received: boolean;
    }>;
}
