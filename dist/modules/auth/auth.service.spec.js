"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const user_entity_1 = require("../users/entities/user.entity");
const user_role_enum_1 = require("../users/enums/user-role.enum");
const bcrypt = require("bcrypt");
const mockUser = {
    id: 'uuid-1',
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'John',
    lastName: 'Doe',
    role: user_role_enum_1.UserRole.MEMBER,
    tenantId: null,
    tenant: null,
    isActive: true,
    refreshToken: null,
    createdAt: new Date(),
    updatedAt: new Date(),
};
const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
};
const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mocked-token'),
    verify: jest.fn(),
};
const mockConfigService = {
    get: jest.fn().mockImplementation((key, defaultVal) => {
        const config = {
            JWT_ACCESS_SECRET: 'access-secret-32-chars-minimum-length',
            JWT_REFRESH_SECRET: 'refresh-secret-32-chars-minimum-length',
            JWT_ACCESS_EXPIRATION: '15m',
            JWT_REFRESH_EXPIRATION: '7d',
        };
        return config[key] ?? defaultVal;
    }),
};
describe('AuthService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                auth_service_1.AuthService,
                { provide: (0, typeorm_1.getRepositoryToken)(user_entity_1.User), useValue: mockUserRepository },
                { provide: jwt_1.JwtService, useValue: mockJwtService },
                { provide: config_1.ConfigService, useValue: mockConfigService },
            ],
        }).compile();
        service = module.get(auth_service_1.AuthService);
        jest.clearAllMocks();
    });
    describe('register', () => {
        it('should register a new user and return tokens', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);
            mockUserRepository.create.mockReturnValue(mockUser);
            mockUserRepository.save.mockResolvedValue(mockUser);
            mockUserRepository.update.mockResolvedValue(undefined);
            const result = await service.register({
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@example.com',
                password: 'Password123!',
            });
            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
            expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
        });
        it('should throw ConflictException if email already exists', async () => {
            mockUserRepository.findOne.mockResolvedValue(mockUser);
            await expect(service.register({
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@example.com',
                password: 'Password123!',
            })).rejects.toThrow(common_1.ConflictException);
        });
    });
    describe('login', () => {
        it('should login and return tokens when credentials are valid', async () => {
            const hashedPassword = await bcrypt.hash('Password123!', 12);
            mockUserRepository.findOne.mockResolvedValue({
                ...mockUser,
                password: hashedPassword,
            });
            mockUserRepository.update.mockResolvedValue(undefined);
            const result = await service.login({
                email: 'test@example.com',
                password: 'Password123!',
            });
            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
        });
        it('should throw UnauthorizedException when user not found', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);
            await expect(service.login({ email: 'noexist@example.com', password: 'wrong' })).rejects.toThrow(common_1.UnauthorizedException);
        });
        it('should throw UnauthorizedException when password is wrong', async () => {
            const hashedPassword = await bcrypt.hash('CorrectPassword!', 12);
            mockUserRepository.findOne.mockResolvedValue({
                ...mockUser,
                password: hashedPassword,
            });
            await expect(service.login({ email: 'test@example.com', password: 'WrongPassword!' })).rejects.toThrow(common_1.UnauthorizedException);
        });
        it('should throw UnauthorizedException when user is inactive', async () => {
            mockUserRepository.findOne.mockResolvedValue({ ...mockUser, isActive: false });
            await expect(service.login({ email: 'test@example.com', password: 'Password123!' })).rejects.toThrow(common_1.UnauthorizedException);
        });
    });
    describe('logout', () => {
        it('should nullify the refresh token', async () => {
            mockUserRepository.update.mockResolvedValue(undefined);
            await service.logout('uuid-1');
            expect(mockUserRepository.update).toHaveBeenCalledWith('uuid-1', { refreshToken: null });
        });
    });
});
//# sourceMappingURL=auth.service.spec.js.map