"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantInterceptor = exports.TENANT_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.TENANT_KEY = 'tenantId';
let TenantInterceptor = class TenantInterceptor {
    constructor() {
        this.SKIP_PATHS = [
            '/api/v1/auth/login',
            '/api/v1/auth/register',
            '/api/v1/tenants',
            '/api/v1/billing/webhook',
            '/api/docs',
        ];
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const path = request.path;
        const shouldSkip = this.SKIP_PATHS.some((skipPath) => path === skipPath || path.startsWith('/api/docs'));
        if (!shouldSkip) {
            const tenantId = request.headers['x-tenant-id'] ||
                this.extractTenantFromSubdomain(request.hostname);
            if (tenantId) {
                request.tenantId = tenantId;
            }
        }
        return next.handle();
    }
    extractTenantFromSubdomain(hostname) {
        const parts = hostname.split('.');
        if (parts.length >= 3) {
            return parts[0];
        }
        return null;
    }
};
exports.TenantInterceptor = TenantInterceptor;
exports.TenantInterceptor = TenantInterceptor = __decorate([
    (0, common_1.Injectable)()
], TenantInterceptor);
//# sourceMappingURL=tenant.interceptor.js.map