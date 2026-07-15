import {
  Controller,
  Dependencies,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import { ReportsService } from './reports-service';
import { ok } from '../common/http-response';
import { Role } from '../common/enums';
import { JwtAuthGuard } from '../common/guards/jwt-auth-guard';
import { RolesGuard } from '../common/guards/roles-guard';
import { Roles } from '../common/decorators/roles-decorator';
import { CurrentUser } from '../common/decorators/current-user-decorator';
import { bindParams } from '../common/bind-params';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Dependencies(ReportsService)
export class ReportsController {
  constructor(reportsService) {
    this.reportsService = reportsService;
  }

  @Get('dashboard')
  async dashboard(user) {
    return ok(await this.reportsService.executiveDashboard(user));
  }

  @Get('pipeline')
  @Roles(Role.MANAGER, Role.ADMIN)
  async pipeline(query) {
    return ok(await this.reportsService.managerPipeline(query));
  }

  @Get('area-coverage')
  @Roles(Role.MANAGER, Role.ADMIN)
  async areaCoverage() {
    return ok(await this.reportsService.areaCoverage());
  }

  @Get('nearby-clients')
  async nearbyClients(query, user) {
    const { lat, lng, radius } = query;
    return ok(await this.reportsService.nearbyClients(Number(lat), Number(lng), Number(radius) || 2000, user));
  }
}

bindParams(ReportsController, 'dashboard', { 0: CurrentUser() });
bindParams(ReportsController, 'pipeline', { 0: Query() });
bindParams(ReportsController, 'nearbyClients', {
  0: Query(),
  1: CurrentUser(),
});
