"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
const billing_service_1 = require("./billing.service");
const tenants_service_1 = require("../tenants/tenants.service");
const tenant_plan_enum_1 = require("../tenants/enums/tenant-plan.enum");
const mockStripeInstance = {
    customers: {
        create: jest.fn(),
        retrieve: jest.fn(),
    },
    subscriptions: {
        create: jest.fn(),
        cancel: jest.fn(),
    },
    webhooks: {
        constructEvent: jest.fn(),
    },
    billingPortal: {
        sessions: {
            create: jest.fn(),
        },
    },
};
jest.mock('stripe', () => ({
    __esModule: true,
    default: jest.fn(() => mockStripeInstance),
}));
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
const mockTenantsService = {
    findOne: jest.fn(),
    update: jest.fn(),
    updateStripeInfo: jest.fn(),
};
describe('BillingService', () => {
    let service;
    beforeEach(async () => {
        jest.clearAllMocks();
        const module = await testing_1.Test.createTestingModule({
            providers: [
                billing_service_1.BillingService,
                { provide: tenants_service_1.TenantsService, useValue: mockTenantsService },
                {
                    provide: config_1.ConfigService,
                    useValue: {
                        get: jest.fn().mockImplementation((key) => {
                            const config = {
                                STRIPE_SECRET_KEY: 'sk_test_mock_key',
                                STRIPE_WEBHOOK_SECRET: 'whsec_mock',
                            };
                            return config[key];
                        }),
                    },
                },
            ],
        }).compile();
        service = module.get(billing_service_1.BillingService);
    });
    describe('createStripeCustomer', () => {
        it('should create a Stripe customer when none exists', async () => {
            mockTenantsService.findOne.mockResolvedValue({ ...mockTenant });
            mockTenantsService.updateStripeInfo.mockResolvedValue(undefined);
            mockStripeInstance.customers.create.mockResolvedValue({
                id: 'cus_test123',
                name: 'Acme Corp',
                deleted: false,
            });
            const result = await service.createStripeCustomer('tenant-uuid-1');
            expect(result.id).toBe('cus_test123');
            expect(mockTenantsService.updateStripeInfo).toHaveBeenCalledWith('tenant-uuid-1', 'cus_test123');
        });
    });
    describe('createSubscription', () => {
        it('should throw BadRequestException when tenant has no stripe customer', async () => {
            mockTenantsService.findOne.mockResolvedValue({ ...mockTenant });
            await expect(service.createSubscription('tenant-uuid-1', tenant_plan_enum_1.TenantPlan.PRO)).rejects.toThrow(common_1.BadRequestException);
        });
        it('should return null for FREE plan', async () => {
            mockTenantsService.findOne.mockResolvedValue({
                ...mockTenant,
                stripeCustomerId: 'cus_test123',
            });
            const result = await service.createSubscription('tenant-uuid-1', tenant_plan_enum_1.TenantPlan.FREE);
            expect(result).toBeNull();
        });
    });
    describe('cancelSubscription', () => {
        it('should return null when no subscription exists', async () => {
            mockTenantsService.findOne.mockResolvedValue({ ...mockTenant });
            const result = await service.cancelSubscription('tenant-uuid-1');
            expect(result).toBeNull();
        });
        it('should cancel subscription and downgrade to FREE', async () => {
            mockTenantsService.findOne.mockResolvedValue({
                ...mockTenant,
                stripeCustomerId: 'cus_test123',
                stripeSubscriptionId: 'sub_test123',
            });
            mockTenantsService.update.mockResolvedValue(undefined);
            mockTenantsService.updateStripeInfo.mockResolvedValue(undefined);
            mockStripeInstance.subscriptions.cancel.mockResolvedValue({
                id: 'sub_test123',
                status: 'canceled',
            });
            await service.cancelSubscription('tenant-uuid-1');
            expect(mockTenantsService.update).toHaveBeenCalledWith('tenant-uuid-1', {
                plan: tenant_plan_enum_1.TenantPlan.FREE,
            });
        });
    });
});
//# sourceMappingURL=billing.service.spec.js.map