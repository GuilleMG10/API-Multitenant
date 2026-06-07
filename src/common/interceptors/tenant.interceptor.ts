import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

export const TENANT_KEY = 'tenantId';

type RequestWithTenant = Request & { tenantId?: string };

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  private readonly SKIP_PATHS = [
    '/api/v1/auth/login',
    '/api/v1/auth/register',
    '/api/v1/tenants',
    '/api/v1/billing/webhook',
    '/api/docs',
  ];

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithTenant>();
    const path = request.path;

    const shouldSkip = this.SKIP_PATHS.some(
      (skipPath) => path === skipPath || path.startsWith('/api/docs'),
    );

    if (!shouldSkip) {
      const tenantId =
        (request.headers['x-tenant-id'] as string) ||
        this.extractTenantFromSubdomain(request.hostname);

      if (tenantId) {
        request.tenantId = tenantId;
      }
    }

    return next.handle();
  }

  private extractTenantFromSubdomain(hostname: string): string | null {
    const parts = hostname.split('.');
    if (parts.length >= 3) {
      return parts[0];
    }
    return null;
  }
}
