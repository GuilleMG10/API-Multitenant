import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { User } from './entities/user.entity';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(dto: CreateUserDto, tenantId: string | undefined): Promise<User>;
    findAll(user: User, tenantId: string | undefined, pagination: PaginationDto): Promise<import("../../common/dto/pagination.dto").PaginatedResult<User>>;
    findOne(id: string): Promise<User>;
    update(id: string, dto: UpdateUserDto, currentUser: User): Promise<User>;
    remove(id: string): Promise<void>;
}
