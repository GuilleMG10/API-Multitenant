import {
  Controller,
  Post,
  Body,
  UseGuards,
  Headers,
  RawBodyRequest,
  Req,
  Param,
  ParseUUIDPipe,
  Get,
  Query,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('customers/:tenantId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create Stripe customer for a tenant (SUPER_ADMIN only)' })
  createCustomer(@Param('tenantId', ParseUUIDPipe) tenantId: string) {
    return this.billingService.createStripeCustomer(tenantId);
  }

  @Post('subscriptions/:tenantId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a Stripe subscription for a tenant (SUPER_ADMIN only)' })
  createSubscription(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Body() dto: CreateSubscriptionDto,
  ) {
    return this.billingService.createSubscription(tenantId, dto.plan);
  }

  @Post('subscriptions/:tenantId/cancel')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Cancel subscription and downgrade tenant to FREE' })
  cancelSubscription(@Param('tenantId', ParseUUIDPipe) tenantId: string) {
    return this.billingService.cancelSubscription(tenantId);
  }

  @Get('portal/:tenantId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get Stripe billing portal URL' })
  getPortal(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Query('returnUrl') returnUrl: string,
  ) {
    return this.billingService.getCustomerPortalUrl(tenantId, returnUrl);
  }

  @Public()
  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook endpoint (public, verified by signature)' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    await this.billingService.handleWebhook(req.rawBody as Buffer, signature);
    return { received: true };
  }
}
