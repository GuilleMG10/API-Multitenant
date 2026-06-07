import { TenantPlan } from '../enums/tenant-plan.enum';
export declare class Tenant {
    id: string;
    name: string;
    subdomain: string;
    plan: TenantPlan;
    isActive: boolean;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    schemaName: string | null;
    createdAt: Date;
    updatedAt: Date;
}
