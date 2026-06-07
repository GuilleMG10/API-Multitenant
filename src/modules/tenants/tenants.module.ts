import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { Tenant } from './entities/tenant.entity';
import { TenantDataSourceService } from '../../database/tenant-data-source.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant])],
  providers: [TenantsService, TenantDataSourceService],
  controllers: [TenantsController],
  exports: [TenantsService],
})
export class TenantsModule {}
