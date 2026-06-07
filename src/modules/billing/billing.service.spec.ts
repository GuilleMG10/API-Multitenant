import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { BillingService } from './billing.service';
import { TenantsService } from '../tenants/tenants.service';
import { TenantPlan } from '../tenants/enums/tenant-plan.enum';

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
  plan: TenantPlan.FREE,
  isActive: true,
  stripeCustomerId: null as string | null,
  stripeSubscriptionId: null as string | null,
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
  let service: BillingService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        { provide: TenantsService, useValue: mockTenantsService },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              const config: Record<string, string> = {
                STRIPE_SECRET_KEY: 'sk_test_mock_key',
                STRIPE_WEBHOOK_SECRET: 'whsec_mock',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
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
      expect(mockTenantsService.updateStripeInfo).toHaveBeenCalledWith(
        'tenant-uuid-1',
        'cus_test123',
      );
    });
  });

  describe('createSubscription', () => {
    it('should throw BadRequestException when tenant has no stripe customer', async () => {
      mockTenantsService.findOne.mockResolvedValue({ ...mockTenant });

      await expect(
        service.createSubscription('tenant-uuid-1', TenantPlan.PRO),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return null for FREE plan', async () => {
      mockTenantsService.findOne.mockResolvedValue({
        ...mockTenant,
        stripeCustomerId: 'cus_test123',
      });

      const result = await service.createSubscription('tenant-uuid-1', TenantPlan.FREE);

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
        plan: TenantPlan.FREE,
      });
    });
  });
});
