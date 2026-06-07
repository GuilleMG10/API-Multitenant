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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TenantsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tenant_entity_1 = require("./entities/tenant.entity");
const tenant_data_source_service_1 = require("../../database/tenant-data-source.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let TenantsService = TenantsService_1 = class TenantsService {
    constructor(tenantRepository, tenantDataSourceService) {
        this.tenantRepository = tenantRepository;
        this.tenantDataSourceService = tenantDataSourceService;
        this.logger = new common_1.Logger(TenantsService_1.name);
    }
    async create(dto) {
        const existing = await this.tenantRepository.findOne({
            where: { subdomain: dto.subdomain },
        });
        if (existing)
            throw new common_1.ConflictException('Subdomain already taken');
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
    async findAll(pagination) {
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;
        const [data, total] = await this.tenantRepository.findAndCount({
            skip,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return (0, pagination_dto_1.paginate)(data, total, page, limit);
    }
    async findOne(id) {
        const tenant = await this.tenantRepository.findOne({ where: { id } });
        if (!tenant)
            throw new common_1.NotFoundException(`Tenant ${id} not found`);
        return tenant;
    }
    async findBySubdomain(subdomain) {
        return this.tenantRepository.findOne({ where: { subdomain } });
    }
    async update(id, dto) {
        const tenant = await this.findOne(id);
        Object.assign(tenant, dto);
        return this.tenantRepository.save(tenant);
    }
    async remove(id) {
        const tenant = await this.findOne(id);
        await this.tenantDataSourceService.dropTenantSchema(tenant.schemaName);
        await this.tenantRepository.remove(tenant);
        this.logger.log(`Tenant removed: ${tenant.name}`);
    }
    async updateStripeInfo(id, stripeCustomerId, stripeSubscriptionId) {
        await this.tenantRepository.update(id, {
            stripeCustomerId,
            ...(stripeSubscriptionId && { stripeSubscriptionId }),
        });
    }
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = TenantsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        tenant_data_source_service_1.TenantDataSourceService])
], TenantsService);
//# sourceMappingURL=tenants.service.js.map