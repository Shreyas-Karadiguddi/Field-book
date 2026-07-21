import {
  Controller,
  Dependencies,
  UseGuards,
  Get,
  Post,
  Patch,
  Req,
  Res,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ClientsService } from './clients-service';
import { CreateClientDto } from './dto/create-client-dto';
import { UpdateClientDto } from './dto/update-client-dto';
import { validateDto } from '../common/validate-dto';
import { ok } from '../common/http-response';
import { readMultipartOrBody } from '../common/read-multipart-body';
import { Role } from '../common/enums';
import { JwtAuthGuard } from '../common/guards/jwt-auth-guard';
import { RolesGuard } from '../common/guards/roles-guard';
import { Roles } from '../common/decorators/roles-decorator';
import { CurrentUser } from '../common/decorators/current-user-decorator';
import { bindParams } from '../common/bind-params';

const JSON_FIELDS = ['competitorStack'];

@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
@Dependencies(ClientsService)
export class ClientsController {
  constructor(clientsService) {
    this.clientsService = clientsService;
  }

  @Post()
  async create(req, user) {
    const { fields, photoBuffer } = await readMultipartOrBody(req, JSON_FIELDS);
    const dto = await validateDto(CreateClientDto, fields);
    return ok(await this.clientsService.create(dto, photoBuffer, user));
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

  @Get(':id/photo')
  async getPhoto(id, user, res) {
    const photo = await this.clientsService.findPhoto(id, user);
    if (!photo) {
      throw new NotFoundException('No photo for this client');
    }
    res.header('Cache-Control', 'private, max-age=3600');
    res.type('image/jpeg');
    res.send(photo);
  }

  @Patch(':id')
  async update(id, req, user) {
    const { fields, photoBuffer } = await readMultipartOrBody(req, JSON_FIELDS);
    const dto = await validateDto(UpdateClientDto, fields);
    return ok(await this.clientsService.update(id, dto, photoBuffer, user));
  }
}

bindParams(ClientsController, 'create', { 0: Req(), 1: CurrentUser() });
bindParams(ClientsController, 'findAll', { 0: Query(), 1: CurrentUser() });
bindParams(ClientsController, 'findOne', { 0: Param('id'), 1: CurrentUser() });
bindParams(ClientsController, 'getPhoto', {
  0: Param('id'),
  1: CurrentUser(),
  2: Res(),
});
bindParams(ClientsController, 'update', {
  0: Param('id'),
  1: Req(),
  2: CurrentUser(),
});
