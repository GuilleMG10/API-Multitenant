import { TenantPlan } from '../enums/tenant-plan.enum';
export declare class CreateTenantDto {
    name: string;
    subdomain: string;
    plan?: TenantPlan;
}
