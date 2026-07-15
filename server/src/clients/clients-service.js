import {
  Injectable,
  Dependencies,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma-service';
import { Role } from '../common/enums';

@Injectable()
@Dependencies(PrismaService)
export class ClientsService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  create(dto, user) {
    return this.prisma.client.create({
      data: {
        ...dto,
        competitorStack: dto.competitorStack || [],
        assignedExecutiveId: isExecutive(user) ? user.sub : dto.assignedExecutiveId || user.sub,
      },
    });
  }

  findAll(user, filters) {
    return this.prisma.client.findMany({
      where: buildClientWhere(user, filters),
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id, user) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        visits: {
          orderBy: { visitedAt: 'desc' },
          include: { productsDiscussed: true, executive: true },
        },
        followUps: { orderBy: { dueDate: 'asc' } },
        assignedExecutive: true,
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }
    assertClientAccess(client, user);
    return client;
  }

  async update(id, dto, user) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    assertClientAccess(client, user);

    return this.prisma.client.update({ where: { id }, data: dto });
  }
}

function isExecutive(user) {
  return user.role === Role.EXECUTIVE;
}

function buildClientWhere(user, { area, dealStage } = {}) {
  return {
    ...(isExecutive(user) ? { assignedExecutiveId: user.sub } : {}),
    ...(area ? { area } : {}),
    ...(dealStage ? { dealStage } : {}),
  };
}

function assertClientAccess(client, user) {
  if (isExecutive(user) && client.assignedExecutiveId !== user.sub) {
    throw new ForbiddenException('You do not have access to this client');
  }
}
