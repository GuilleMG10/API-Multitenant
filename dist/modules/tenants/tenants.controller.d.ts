import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class TenantsController {
    private readonly tenantsService;
    constructor(tenantsService: TenantsService);
    create(dto: CreateTenantDto): Promise<import("./entities/tenant.entity").Tenant>;
    findAll(pagination: PaginationDto): Promise<import("../../common/dto/pagination.dto").PaginatedResult<import("./entities/tenant.entity").Tenant>>;
    findOne(id: string): Promise<import("./entities/tenant.entity").Tenant>;
    update(id: string, dto: UpdateTenantDto): Promise<import("./entities/tenant.entity").Tenant>;
    remove(id: string): Promise<void>;
}
