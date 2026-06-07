import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { UserRole } from './enums/user-role.enum';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { User } from './entities/user.entity';

@ApiTags('Users')
@ApiBearerAuth()
@ApiSecurity('X-Tenant-ID')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new user in the current tenant' })
  create(
    @Body() dto: CreateUserDto,
    @TenantId() tenantId: string | undefined,
  ) {
    return this.usersService.create(dto, tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'List users (filtered by tenant for non-SUPER_ADMIN)' })
  findAll(
    @CurrentUser() user: User,
    @TenantId() tenantId: string | undefined,
    @Query() pagination: PaginationDto,
  ) {
    const filter = user.role === UserRole.SUPER_ADMIN ? undefined : tenantId;
    return this.usersService.findAll(filter, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.usersService.update(id, dto, currentUser);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete user (ADMIN or SUPER_ADMIN only)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}
