import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantDataSourceService } from '../../database/tenant-data-source.service';
import { PaginationDto, paginate, PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    private readonly tenantDataSourceService: TenantDataSourceService,
  ) {}

  async create(dto: CreateTenantDto): Promise<Tenant> {
    const existing = await this.tenantRepository.findOne({
      where: { subdomain: dto.subdomain },
    });

    if (existing) throw new ConflictException('Subdomain already taken');

    const schemaName = `tenant_${dto.subdomain.replace(/-/g, '_')}`;

    const tenant = this.tenantRepository.create({
      ...dto,
      schemaName,
    });

    await this.tenantRepository.save(tenant);
    await this.tenantDataSourceService.createTenantSchema(schemaName);

    this.logger.log(`Tenant created: ${tenant.name} with schema: ${schemaName}`);

    return tenant;
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResult<Tenant>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await this.tenantRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return paginate(data, total, page, limit);
  }

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({ where: { id } });
    if (!tenant) throw new NotFoundException(`Tenant ${id} not found`);
    return tenant;
  }

  async findBySubdomain(subdomain: string): Promise<Tenant | null> {
    return this.tenantRepository.findOne({ where: { subdomain } });
  }

  async update(id: string, dto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.findOne(id);
    Object.assign(tenant, dto);
    return this.tenantRepository.save(tenant);
  }

  async remove(id: string): Promise<void> {
    const tenant = await this.findOne(id);
    await this.tenantDataSourceService.dropTenantSchema(tenant.schemaName!);
    await this.tenantRepository.remove(tenant);
    this.logger.log(`Tenant removed: ${tenant.name}`);
  }

  async updateStripeInfo(
    id: string,
    stripeCustomerId: string,
    stripeSubscriptionId?: string,
  ): Promise<void> {
    await this.tenantRepository.update(id, {
      stripeCustomerId,
      ...(stripeSubscriptionId && { stripeSubscriptionId }),
    });
  }
}
