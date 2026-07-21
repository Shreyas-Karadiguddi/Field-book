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
import { ClientsService } from './clients-service';
import { CreateClientDto } from './dto/create-client-dto';
import { UpdateClientDto } from './dto/update-client-dto';
import { validateDto } from '../common/validate-dto';
import { ok } from '../common/http-response';
import { Role } from '../common/enums';
import { JwtAuthGuard } from '../common/guards/jwt-auth-guard';
import { RolesGuard } from '../common/guards/roles-guard';
import { Roles } from '../common/decorators/roles-decorator';
import { CurrentUser } from '../common/decorators/current-user-decorator';
import { bindParams } from '../common/bind-params';

@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
@Dependencies(ClientsService)
export class ClientsController {
  constructor(clientsService) {
    this.clientsService = clientsService;
  }

  @Post()
  async create(body, user) {
    const dto = await validateDto(CreateClientDto, body);
    return ok(await this.clientsService.create(dto, user));
  }

  @Get()
  async findAll(query, user) {
    return ok(await this.clientsService.findAll(user, query));
  }

  @Get('executives')
  @Roles(Role.MANAGER, Role.ADMIN)
  async findExecutives() {
    return ok(await this.clientsService.findExecutives());
  }

  @Get(':id')
  async findOne(id, user) {
    return ok(await this.clientsService.findOne(id, user));
  }

  @Patch(':id')
  async update(id, body, user) {
    const dto = await validateDto(UpdateClientDto, body);
    return ok(await this.clientsService.update(id, dto, user));
  }
}

bindParams(ClientsController, 'create', { 0: Body(), 1: CurrentUser() });
bindParams(ClientsController, 'findAll', { 0: Query(), 1: CurrentUser() });
bindParams(ClientsController, 'findOne', { 0: Param('id'), 1: CurrentUser() });
bindParams(ClientsController, 'update', {
  0: Param('id'),
  1: Body(),
  2: CurrentUser(),
});
