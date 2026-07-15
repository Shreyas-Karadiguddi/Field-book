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
import { JwtAuthGuard } from '../common/guards/jwt-auth-guard';
import { CurrentUser } from '../common/decorators/current-user-decorator';
import { bindParams } from '../common/bind-params';

@Controller('clients')
@UseGuards(JwtAuthGuard)
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
