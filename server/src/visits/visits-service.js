import { Injectable, Dependencies, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma-service';
import { compressPhoto } from '../common/compress-photo';
import { Role, VisitChannel } from '../common/enums';

@Injectable()
@Dependencies(PrismaService)
export class VisitsService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async create(dto, photoBuffer, user) {
    const client = await this.prisma.client.findUnique({
      where: { id: dto.clientId },
    });
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const photo = photoBuffer ? await compressPhoto(photoBuffer) : undefined;
    const dealStage = dto.dealStage || client.dealStage;

    const visit = await this.prisma.visit.create({
      data: {
        clientId: dto.clientId,
        executiveId: user.sub,
        channel: dto.channel || VisitChannel.IN_PERSON,
        conversationNotes: dto.conversationNotes,
        photo,
        gpsLat: dto.gpsLat,
        gpsLng: dto.gpsLng,
        dealStage,
        quotationAmount: dto.quotationAmount,
        productsDiscussed: dto.productsDiscussed?.length
          ? { create: dto.productsDiscussed.map((productName) => ({ productName })) }
          : undefined,
      },
      include: { productsDiscussed: true },
    });

    await this.prisma.client.update({
      where: { id: dto.clientId },
      data: {
        dealStage,
        quotationAmount: dto.quotationAmount ?? client.quotationAmount,
      },
    });

    if (dto.followUpDate) {
      await this.prisma.followUp.create({
        data: {
          clientId: dto.clientId,
          executiveId: user.sub,
          dueDate: new Date(dto.followUpDate),
          notes: dto.followUpNotes,
        },
      });
    }

    const { photo: _photo, ...visitWithoutPhoto } = visit;
    return { ...visitWithoutPhoto, hasPhoto: photo != null };
  }

  async findForClient(clientId) {
    const visits = await this.prisma.visit.findMany({
      where: { clientId },
      orderBy: { visitedAt: 'desc' },
      include: {
        productsDiscussed: true,
        executive: { select: { id: true, name: true, email: true, role: true, area: true } },
      },
    });

    return visits.map(({ photo, ...visit }) => ({ ...visit, hasPhoto: photo != null }));
  }

  async findAll(user, { dealStage } = {}) {
    const visits = await this.prisma.visit.findMany({
      where: {
        ...(user.role === Role.EXECUTIVE ? { executiveId: user.sub } : {}),
        ...(dealStage ? { dealStage } : {}),
      },
      orderBy: { visitedAt: 'desc' },
      include: {
        client: { select: { id: true, shopName: true, businessType: true, area: true } },
        executive: { select: { id: true, name: true } },
        productsDiscussed: true,
      },
    });

    return visits.map(({ photo, ...visit }) => ({ ...visit, hasPhoto: photo != null }));
  }

  async findPhoto(id) {
    const visit = await this.prisma.visit.findUnique({ where: { id }, select: { photo: true } });
    return visit?.photo ?? null;
  }

  createFollowUp(dto, user) {
    return this.prisma.followUp.create({
      data: {
        clientId: dto.clientId,
        executiveId: user.sub,
        dueDate: new Date(dto.dueDate),
        notes: dto.notes,
      },
    });
  }

  findFollowUps(user, filters) {
    return this.prisma.followUp.findMany({
      where: buildFollowUpWhere(user, filters),
      orderBy: { dueDate: 'asc' },
      include: { client: true, executive: { select: { id: true, name: true } } },
    });
  }

  async completeFollowUp(id) {
    const followUp = await this.prisma.followUp.findUnique({ where: { id } });
    if (!followUp) {
      throw new NotFoundException('Follow-up not found');
    }
    return this.prisma.followUp.update({
      where: { id },
      data: { completed: true },
    });
  }
}

function buildFollowUpWhere(user, { status } = {}) {
  return {
    ...(user.role === Role.EXECUTIVE ? { executiveId: user.sub } : {}),
    ...(status === 'done' ? { completed: true } : {}),
    ...(status === 'pending' ? { completed: false } : {}),
  };
}
