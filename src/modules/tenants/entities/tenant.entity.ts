import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TenantPlan } from '../enums/tenant-plan.enum';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  subdomain!: string;

  @Column({ type: 'enum', enum: TenantPlan, default: TenantPlan.FREE })
  plan!: TenantPlan;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ nullable: true, type: 'varchar' })
  stripeCustomerId!: string | null;

  @Column({ nullable: true, type: 'varchar' })
  stripeSubscriptionId!: string | null;

  @Column({ nullable: true, type: 'varchar' })
  schemaName!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
