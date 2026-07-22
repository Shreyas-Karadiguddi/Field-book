import {
  Injectable,
  Dependencies,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma-service';
import { compressPhoto } from '../common/compress-photo';
import { Role } from '../common/enums';

@Injectable()
@Dependencies(PrismaService)
export class ClientsService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async create(dto, photoBuffer, user) {
    const photo = photoBuffer ? await compressPhoto(photoBuffer) : undefined;
    const client = await this.prisma.client.create({
      data: {
        ...dto,
        competitorStack: dto.competitorStack || [],
        photo,
        assignedExecutiveId: isExecutive(user) ? user.sub : dto.assignedExecutiveId || user.sub,
        createdById: user.sub,
      },
    });

    const { photo: _photo, ...clientWithoutPhoto } = client;
    return { ...clientWithoutPhoto, hasPhoto: photo != null };
  }

  async findAll(user, filters) {
    const clients = await this.prisma.client.findMany({
      where: buildClientWhere(user, filters),
      orderBy: { updatedAt: 'desc' },
    });

    return clients.map(({ photo, ...client }) => ({ ...client, hasPhoto: photo != null }));
  }

  findExecutives() {
    return this.prisma.user.findMany({
      where: { role: Role.EXECUTIVE, active: true },
      select: { id: true, name: true, area: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id, user) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        visits: {
          orderBy: { visitedAt: 'desc' },
          include: {
            productsDiscussed: true,
            executive: { select: { id: true, name: true, email: true, role: true, area: true } },
          },
        },
        followUps: {
          orderBy: { dueDate: 'asc' },
          include: { executive: { select: { id: true, name: true } } },
        },
        assignedExecutive: { select: { id: true, name: true, email: true, role: true, area: true } },
        createdBy: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }
    assertClientAccess(client, user);

    const { photo, ...clientWithoutPhoto } = client;
    return {
      ...clientWithoutPhoto,
      hasPhoto: photo != null,
      visits: client.visits.map(({ photo: visitPhoto, ...visit }) => ({ ...visit, hasPhoto: visitPhoto != null })),
    };
  }

  async update(id, dto, photoBuffer, user) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    assertClientAccess(client, user);

    const photo = photoBuffer ? await compressPhoto(photoBuffer) : undefined;
    const updated = await this.prisma.client.update({ where: { id }, data: { ...dto, photo } });

    const { photo: _photo, ...clientWithoutPhoto } = updated;
    return { ...clientWithoutPhoto, hasPhoto: (photo ?? client.photo) != null };
  }

  async findPhoto(id, user) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      select: { photo: true, assignedExecutiveId: true },
    });
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    assertClientAccess(client, user);

    return client.photo;
  }
}

function isExecutive(user) {
  return user.role === Role.EXECUTIVE;
}

function buildClientWhere(user, { area, city, state, dealStage } = {}) {
  return {
    ...(isExecutive(user) ? { assignedExecutiveId: user.sub } : {}),
    ...(area ? { area: { equals: area, mode: 'insensitive' } } : {}),
    ...(city ? { city: { equals: city, mode: 'insensitive' } } : {}),
    ...(state ? { state: { equals: state, mode: 'insensitive' } } : {}),
    ...(dealStage ? { dealStage } : {}),
  };
}

function assertClientAccess(client, user) {
  if (isExecutive(user) && client.assignedExecutiveId !== user.sub) {
    throw new ForbiddenException('You do not have access to this client');
  }
}
