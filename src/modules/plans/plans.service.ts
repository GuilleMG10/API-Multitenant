import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from './entities/plan.entity';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { PaginationDto, paginate, PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class PlansService {
  private readonly logger = new Logger(PlansService.name);

  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
  ) {}

  async create(dto: CreatePlanDto): Promise<Plan> {
    const existing = await this.planRepository.findOne({ where: { name: dto.name } });
    if (existing) throw new ConflictException(`Plan "${dto.name}" already exists`);

    const plan = this.planRepository.create(dto);
    await this.planRepository.save(plan);
    this.logger.log(`Plan created: ${plan.name}`);
    return plan;
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResult<Plan>> {
    const { page, limit } = pagination;
    const [data, total] = await this.planRepository.findAndCount({
      where: { isActive: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { price: 'ASC' },
    });
    return paginate(data, total, page, limit);
  }

  async findOne(id: string): Promise<Plan> {
    const plan = await this.planRepository.findOne({ where: { id } });
    if (!plan) throw new NotFoundException(`Plan ${id} not found`);
    return plan;
  }

  async update(id: string, dto: UpdatePlanDto): Promise<Plan> {
    const plan = await this.findOne(id);
    Object.assign(plan, dto);
    return this.planRepository.save(plan);
  }

  async remove(id: string): Promise<void> {
    const plan = await this.findOne(id);
    await this.planRepository.remove(plan);
    this.logger.log(`Plan removed: ${plan.name}`);
  }
}
