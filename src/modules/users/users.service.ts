import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './enums/user-role.enum';
import { PaginationDto, paginate, PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto, tenantId?: string): Promise<User> {
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(dto.password, 12);
    const user = this.userRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: hashed,
      role: dto.role ?? UserRole.MEMBER,
      tenantId: tenantId ?? null,
    });

    await this.userRepository.save(user);
    this.logger.log(`User created: ${user.email}`);
    return this.sanitize(user);
  }

  async findAll(tenantId: string | undefined, pagination: PaginationDto): Promise<PaginatedResult<User>> {
    const { page, limit } = pagination;
    const [data, total] = await this.userRepository.findAndCount({
      where: tenantId ? { tenantId } : {},
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return paginate(data.map((u) => this.sanitize(u)), total, page, limit);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return this.sanitize(user);
  }

  async update(id: string, dto: UpdateUserDto, requestingUser: User): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);

    if (requestingUser.role === UserRole.MEMBER && requestingUser.id !== id) {
      throw new ForbiddenException('Cannot update other users');
    }

    Object.assign(user, dto);
    await this.userRepository.save(user);
    return this.sanitize(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    await this.userRepository.remove(user);
    this.logger.log(`User removed: ${user.email}`);
  }

  private sanitize(user: User): User {
    const sanitized = { ...user };
    delete (sanitized as Partial<User>).password;
    delete (sanitized as Partial<User>).refreshToken;
    return sanitized as User;
  }
}
