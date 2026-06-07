import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { TenantPlan } from '../../tenants/enums/tenant-plan.enum';

export class CreateSubscriptionDto {
  @ApiProperty({ enum: [TenantPlan.PRO, TenantPlan.ENTERPRISE] })
  @IsEnum(TenantPlan)
  @IsNotEmpty()
  plan!: TenantPlan;
}
