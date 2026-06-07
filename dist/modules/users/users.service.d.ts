import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
export declare class UsersService {
    private readonly userRepository;
    private readonly logger;
    constructor(userRepository: Repository<User>);
    create(dto: CreateUserDto, tenantId?: string): Promise<User>;
    findAll(tenantId: string | undefined, pagination: PaginationDto): Promise<PaginatedResult<User>>;
    findOne(id: string): Promise<User>;
    update(id: string, dto: UpdateUserDto, requestingUser: User): Promise<User>;
    remove(id: string): Promise<void>;
    private sanitize;
}
