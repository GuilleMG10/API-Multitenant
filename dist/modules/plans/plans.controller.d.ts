import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class PlansController {
    private readonly plansService;
    constructor(plansService: PlansService);
    findAll(pagination: PaginationDto): Promise<import("../../common/dto/pagination.dto").PaginatedResult<import("./entities/plan.entity").Plan>>;
    findOne(id: string): Promise<import("./entities/plan.entity").Plan>;
    create(dto: CreatePlanDto): Promise<import("./entities/plan.entity").Plan>;
    update(id: string, dto: UpdatePlanDto): Promise<import("./entities/plan.entity").Plan>;
    remove(id: string): Promise<void>;
}
