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
  Body,
  NotFoundException,
} from '@nestjs/common';
import { VisitsService } from './visits-service';
import { CreateVisitDto } from './dto/create-visit-dto';
import { CreateFollowUpDto } from './dto/create-follow-up-dto';
import { validateDto } from '../common/validate-dto';
import { ok } from '../common/http-response';
import { readMultipartOrBody } from '../common/read-multipart-body';
import { JwtAuthGuard } from '../common/guards/jwt-auth-guard';
import { CurrentUser } from '../common/decorators/current-user-decorator';
import { bindParams } from '../common/bind-params';

const JSON_FIELDS = ['productsDiscussed'];

@Controller('visits')
@UseGuards(JwtAuthGuard)
@Dependencies(VisitsService)
export class VisitsController {
  constructor(visitsService) {
    this.visitsService = visitsService;
  }

  @Post()
  async create(req, user) {
    const { fields, photoBuffer } = await readMultipartOrBody(req, JSON_FIELDS);
    const dto = await validateDto(CreateVisitDto, fields);
    return ok(await this.visitsService.create(dto, photoBuffer, user));
  }

  @Get()
  async findAll(query, user) {
    return ok(await this.visitsService.findAll(user, query));
  }

  @Get('client/:clientId')
  async findForClient(clientId) {
    return ok(await this.visitsService.findForClient(clientId));
  }

  @Get(':id/photo')
  async getPhoto(id, res) {
    const photo = await this.visitsService.findPhoto(id);
    if (!photo) {
      throw new NotFoundException('No photo for this visit');
    }
    res.header('Cache-Control', 'private, max-age=3600');
    res.type('image/jpeg');
    res.send(photo);
  }

  @Get('follow-ups')
  async findFollowUps(query, user) {
    return ok(await this.visitsService.findFollowUps(user, query));
  }

  @Post('follow-ups')
  async createFollowUp(body, user) {
    const dto = await validateDto(CreateFollowUpDto, body);
    return ok(await this.visitsService.createFollowUp(dto, user));
  }

  @Patch('follow-ups/:id/complete')
  async completeFollowUp(id) {
    return ok(await this.visitsService.completeFollowUp(id));
  }
}

bindParams(VisitsController, 'create', { 0: Req(), 1: CurrentUser() });
bindParams(VisitsController, 'findAll', { 0: Query(), 1: CurrentUser() });
bindParams(VisitsController, 'findForClient', { 0: Param('clientId') });
bindParams(VisitsController, 'getPhoto', { 0: Param('id'), 1: Res() });
bindParams(VisitsController, 'findFollowUps', { 0: Query(), 1: CurrentUser() });
bindParams(VisitsController, 'createFollowUp', { 0: Body(), 1: CurrentUser() });
bindParams(VisitsController, 'completeFollowUp', { 0: Param('id') });
