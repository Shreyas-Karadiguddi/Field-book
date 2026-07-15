import { Injectable, Dependencies, NotFoundException } from '@nestjs/common';
import sharp from 'sharp';
import { PrismaService } from '../common/prisma/prisma-service';
import { Role } from '../common/enums';

const PHOTO_TARGET_BYTES = 200 * 1024;
const PHOTO_RESIZE_OPTIONS = { fit: 'inside', withoutEnlargement: true };
const PHOTO_MAX_DIMENSION = 1600;

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

    return visit;
  }

  findForClient(clientId) {
    return this.prisma.visit.findMany({
      where: { clientId },
      orderBy: { visitedAt: 'desc' },
      include: { productsDiscussed: true, executive: true },
    });
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
      include: { client: true },
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

async function compressPhoto(buffer) {
  let quality = 80;
  let output = await resizeAndCompress(buffer, quality);

  while (output.length > PHOTO_TARGET_BYTES && quality > 30) {
    quality -= 10;
    output = await resizeAndCompress(buffer, quality);
  }

  return output;
}

function resizeAndCompress(buffer, quality) {
  return sharp(buffer)
    .resize(PHOTO_MAX_DIMENSION, PHOTO_MAX_DIMENSION, PHOTO_RESIZE_OPTIONS)
    .jpeg({ quality })
    .toBuffer();
}
