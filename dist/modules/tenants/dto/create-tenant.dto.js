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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTenantDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const tenant_plan_enum_1 = require("../enums/tenant-plan.enum");
class CreateTenantDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { name: { required: true, type: () => String }, subdomain: { required: true, type: () => String, minLength: 3, pattern: "/^[a-z0-9-]+$/" }, plan: { required: false, enum: require("../enums/tenant-plan.enum").TenantPlan } };
    }
}
exports.CreateTenantDto = CreateTenantDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Acme Corp' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTenantDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'acme', description: 'Lowercase alphanumeric subdomain' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.Matches)(/^[a-z0-9-]+$/, { message: 'Subdomain must be lowercase alphanumeric with hyphens' }),
    __metadata("design:type", String)
], CreateTenantDto.prototype, "subdomain", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: tenant_plan_enum_1.TenantPlan, default: tenant_plan_enum_1.TenantPlan.FREE }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(tenant_plan_enum_1.TenantPlan),
    __metadata("design:type", String)
], CreateTenantDto.prototype, "plan", void 0);
//# sourceMappingURL=create-tenant.dto.js.map