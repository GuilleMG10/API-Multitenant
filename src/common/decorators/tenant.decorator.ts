import { createParamDecorator, ExecutionContext } from '@nestjs/common';

type RequestWithTenant = { tenantId?: string };

export const TenantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<RequestWithTenant>();
    return request.tenantId;
  },
);
