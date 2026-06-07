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
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("./entities/user.entity");
const user_role_enum_1 = require("./enums/user-role.enum");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let UsersService = UsersService_1 = class UsersService {
    constructor(userRepository) {
        this.userRepository = userRepository;
        this.logger = new common_1.Logger(UsersService_1.name);
    }
    async create(dto, tenantId) {
        const existing = await this.userRepository.findOne({ where: { email: dto.email } });
        if (existing)
            throw new common_1.ConflictException('Email already registered');
        const hashed = await bcrypt.hash(dto.password, 12);
        const user = this.userRepository.create({
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            password: hashed,
            role: dto.role ?? user_role_enum_1.UserRole.MEMBER,
            tenantId: tenantId ?? null,
        });
        await this.userRepository.save(user);
        this.logger.log(`User created: ${user.email}`);
        return this.sanitize(user);
    }
    async findAll(tenantId, pagination) {
        const { page, limit } = pagination;
        const [data, total] = await this.userRepository.findAndCount({
            where: tenantId ? { tenantId } : {},
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return (0, pagination_dto_1.paginate)(data.map((u) => this.sanitize(u)), total, page, limit);
    }
    async findOne(id) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException(`User ${id} not found`);
        return this.sanitize(user);
    }
    async update(id, dto, requestingUser) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException(`User ${id} not found`);
        if (requestingUser.role === user_role_enum_1.UserRole.MEMBER && requestingUser.id !== id) {
            throw new common_1.ForbiddenException('Cannot update other users');
        }
        Object.assign(user, dto);
        await this.userRepository.save(user);
        return this.sanitize(user);
    }
    async remove(id) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException(`User ${id} not found`);
        await this.userRepository.remove(user);
        this.logger.log(`User removed: ${user.email}`);
    }
    sanitize(user) {
        const sanitized = { ...user };
        delete sanitized.password;
        delete sanitized.refreshToken;
        return sanitized;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map