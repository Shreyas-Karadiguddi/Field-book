import {
  Controller,
  Dependencies,
  UseGuards,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { UsersService } from './users-service';
import { CreateUserDto } from './dto/create-user-dto';
import { UpdateUserDto } from './dto/update-user-dto';
import { validateDto } from '../common/validate-dto';
import { ok } from '../common/http-response';
import { Role } from '../common/enums';
import { JwtAuthGuard } from '../common/guards/jwt-auth-guard';
import { RolesGuard } from '../common/guards/roles-guard';
import { Roles } from '../common/decorators/roles-decorator';
import { CurrentUser } from '../common/decorators/current-user-decorator';
import { bindParams } from '../common/bind-params';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Dependencies(UsersService)
export class UsersController {
  constructor(usersService) {
    this.usersService = usersService;
  }

  @Get()
  async findAll(query) {
    return ok(await this.usersService.findAll(query));
  }

  @Get(':id')
  async findOne(id) {
    return ok(await this.usersService.findOne(id));
  }

  @Post()
  async create(body) {
    const dto = await validateDto(CreateUserDto, body);
    return ok(await this.usersService.create(dto));
  }

  @Patch(':id')
  async update(id, body, user) {
    const dto = await validateDto(UpdateUserDto, body);
    return ok(await this.usersService.update(id, dto, user));
  }

  @Patch(':id/deactivate')
  async deactivate(id, user) {
    return ok(await this.usersService.setActive(id, false, user));
  }

  @Patch(':id/activate')
  async activate(id, user) {
    return ok(await this.usersService.setActive(id, true, user));
  }
}

bindParams(UsersController, 'findAll', { 0: Query() });
bindParams(UsersController, 'findOne', { 0: Param('id') });
bindParams(UsersController, 'create', { 0: Body() });
bindParams(UsersController, 'update', {
  0: Param('id'),
  1: Body(),
  2: CurrentUser(),
});
bindParams(UsersController, 'deactivate', { 0: Param('id'), 1: CurrentUser() });
bindParams(UsersController, 'activate', { 0: Param('id'), 1: CurrentUser() });
