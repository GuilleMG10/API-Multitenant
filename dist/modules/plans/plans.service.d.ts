import { Repository } from 'typeorm';
import { Plan } from './entities/plan.entity';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
export declare class PlansService {
    private readonly planRepository;
    private readonly logger;
    constructor(planRepository: Repository<Plan>);
    create(dto: CreatePlanDto): Promise<Plan>;
    findAll(pagination: PaginationDto): Promise<PaginatedResult<Plan>>;
    findOne(id: string): Promise<Plan>;
    update(id: string, dto: UpdatePlanDto): Promise<Plan>;
    remove(id: string): Promise<void>;
}
