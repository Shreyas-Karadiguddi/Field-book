import {
  Injectable,
  Dependencies,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma/prisma-service';

const SAFE_FIELDS = {
  id: true,
  name: true,
  email: true,
  mobile: true,
  role: true,
  area: true,
  active: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
@Dependencies(PrismaService)
export class UsersService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  findAll({ role } = {}) {
    return this.prisma.user.findMany({
      where: role ? { role } : undefined,
      select: SAFE_FIELDS,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: SAFE_FIELDS });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async create({ name, email, password, mobile, role, area }) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: { name, email, mobile, passwordHash, role, area },
      select: SAFE_FIELDS,
    });
  }

  async update(id, dto, actingUser) {
    await this.ensureExists(id);
    if (dto.role && id === actingUser.sub && dto.role !== actingUser.role) {
      throw new ForbiddenException('You cannot change your own role');
    }

    return this.prisma.user.update({ where: { id }, data: dto, select: SAFE_FIELDS });
  }

  async setActive(id, active, actingUser) {
    await this.ensureExists(id);
    if (id === actingUser.sub && !active) {
      throw new ForbiddenException('You cannot deactivate your own account');
    }

    return this.prisma.user.update({ where: { id }, data: { active }, select: SAFE_FIELDS });
  }

  async ensureExists(id) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
