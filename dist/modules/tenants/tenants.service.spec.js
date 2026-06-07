"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const tenants_service_1 = require("./tenants.service");
const tenant_entity_1 = require("./entities/tenant.entity");
const tenant_data_source_service_1 = require("../../database/tenant-data-source.service");
const tenant_plan_enum_1 = require("./enums/tenant-plan.enum");
const mockTenant = {
    id: 'tenant-uuid-1',
    name: 'Acme Corp',
    subdomain: 'acme',
    plan: tenant_plan_enum_1.TenantPlan.FREE,
    isActive: true,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    schemaName: 'tenant_acme',
    createdAt: new Date(),
    updatedAt: new Date(),
};
const mockTenantRepository = {
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
};
const mockTenantDataSourceService = {
    createTenantSchema: jest.fn().mockResolvedValue(undefined),
    dropTenantSchema: jest.fn().mockResolvedValue(undefined),
};
describe('TenantsService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                tenants_service_1.TenantsService,
                { provide: (0, typeorm_1.getRepositoryToken)(tenant_entity_1.Tenant), useValue: mockTenantRepository },
                { provide: tenant_data_source_service_1.TenantDataSourceService, useValue: mockTenantDataSourceService },
            ],
        }).compile();
        service = module.get(tenants_service_1.TenantsService);
        jest.clearAllMocks();
    });
    describe('create', () => {
        it('should create a tenant and provision schema', async () => {
            mockTenantRepository.findOne.mockResolvedValue(null);
            mockTenantRepository.create.mockReturnValue(mockTenant);
            mockTenantRepository.save.mockResolvedValue(mockTenant);
            const result = await service.create({ name: 'Acme Corp', subdomain: 'acme' });
            expect(result).toEqual(mockTenant);
            expect(mockTenantDataSourceService.createTenantSchema).toHaveBeenCalledWith('tenant_acme');
        });
        it('should throw ConflictException when subdomain is taken', async () => {
            mockTenantRepository.findOne.mockResolvedValue(mockTenant);
            await expect(service.create({ name: 'Acme Corp 2', subdomain: 'acme' })).rejects.toThrow(common_1.ConflictException);
        });
    });
    describe('findOne', () => {
        it('should return a tenant by id', async () => {
            mockTenantRepository.findOne.mockResolvedValue(mockTenant);
            const result = await service.findOne('tenant-uuid-1');
            expect(result).toEqual(mockTenant);
        });
        it('should throw NotFoundException when tenant not found', async () => {
            mockTenantRepository.findOne.mockResolvedValue(null);
            await expect(service.findOne('non-existent-id')).rejects.toThrow(common_1.NotFoundException);
        });
    });
    describe('findAll', () => {
        it('should return paginated tenants', async () => {
            mockTenantRepository.findAndCount.mockResolvedValue([[mockTenant], 1]);
            const result = await service.findAll({ page: 1, limit: 10 });
            expect(result.data).toHaveLength(1);
            expect(result.meta.total).toBe(1);
            expect(result.meta.totalPages).toBe(1);
        });
    });
    describe('remove', () => {
        it('should remove tenant and drop schema', async () => {
            mockTenantRepository.findOne.mockResolvedValue(mockTenant);
            mockTenantRepository.remove.mockResolvedValue(mockTenant);
            await service.remove('tenant-uuid-1');
            expect(mockTenantDataSourceService.dropTenantSchema).toHaveBeenCalledWith('tenant_acme');
            expect(mockTenantRepository.remove).toHaveBeenCalledWith(mockTenant);
        });
    });
    describe('update', () => {
        it('should update tenant fields', async () => {
            const updatedTenant = { ...mockTenant, name: 'Acme Updated' };
            mockTenantRepository.findOne.mockResolvedValue(mockTenant);
            mockTenantRepository.save.mockResolvedValue(updatedTenant);
            const result = await service.update('tenant-uuid-1', { name: 'Acme Updated' });
            expect(result.name).toBe('Acme Updated');
        });
    });
});
//# sourceMappingURL=tenants.service.spec.js.map