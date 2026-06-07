import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantDataSourceService } from '../../database/tenant-data-source.service';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
export declare class TenantsService {
    private readonly tenantRepository;
    private readonly tenantDataSourceService;
    private readonly logger;
    constructor(tenantRepository: Repository<Tenant>, tenantDataSourceService: TenantDataSourceService);
    create(dto: CreateTenantDto): Promise<Tenant>;
    findAll(pagination: PaginationDto): Promise<PaginatedResult<Tenant>>;
    findOne(id: string): Promise<Tenant>;
    findBySubdomain(subdomain: string): Promise<Tenant | null>;
    update(id: string, dto: UpdateTenantDto): Promise<Tenant>;
    remove(id: string): Promise<void>;
    updateStripeInfo(id: string, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<void>;
}
