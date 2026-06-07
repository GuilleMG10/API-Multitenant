import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
export declare const TENANT_KEY = "tenantId";
export declare class TenantInterceptor implements NestInterceptor {
    private readonly SKIP_PATHS;
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
    private extractTenantFromSubdomain;
}
