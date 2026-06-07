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
var PlansService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlansService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const plan_entity_1 = require("./entities/plan.entity");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let PlansService = PlansService_1 = class PlansService {
    constructor(planRepository) {
        this.planRepository = planRepository;
        this.logger = new common_1.Logger(PlansService_1.name);
    }
    async create(dto) {
        const existing = await this.planRepository.findOne({ where: { name: dto.name } });
        if (existing)
            throw new common_1.ConflictException(`Plan "${dto.name}" already exists`);
        const plan = this.planRepository.create(dto);
        await this.planRepository.save(plan);
        this.logger.log(`Plan created: ${plan.name}`);
        return plan;
    }
    async findAll(pagination) {
        const { page, limit } = pagination;
        const [data, total] = await this.planRepository.findAndCount({
            where: { isActive: true },
            skip: (page - 1) * limit,
            take: limit,
            order: { price: 'ASC' },
        });
        return (0, pagination_dto_1.paginate)(data, total, page, limit);
    }
    async findOne(id) {
        const plan = await this.planRepository.findOne({ where: { id } });
        if (!plan)
            throw new common_1.NotFoundException(`Plan ${id} not found`);
        return plan;
    }
    async update(id, dto) {
        const plan = await this.findOne(id);
        Object.assign(plan, dto);
        return this.planRepository.save(plan);
    }
    async remove(id) {
        const plan = await this.findOne(id);
        await this.planRepository.remove(plan);
        this.logger.log(`Plan removed: ${plan.name}`);
    }
};
exports.PlansService = PlansService;
exports.PlansService = PlansService = PlansService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(plan_entity_1.Plan)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PlansService);
//# sourceMappingURL=plans.service.js.map