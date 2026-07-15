import { Injectable, Dependencies } from '@nestjs/common';
import { Prisma } from '../generated/prisma/index.js';
import { PrismaService } from '../common/prisma/prisma-service';
import { DealStage, Role } from '../common/enums';

const DEAL_STAGES = Object.values(DealStage);

@Injectable()
@Dependencies(PrismaService)
export class ReportsService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async executiveDashboard(user) {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const executiveId = user.sub;

    const [visitsThisWeek, hotLeads, followUpsDue, wonThisMonth] =
      await Promise.all([
        this.prisma.visit.count({
          where: { executiveId, visitedAt: { gte: startOfWeek } },
        }),
        this.prisma.client.count({
          where: { assignedExecutiveId: executiveId, dealStage: DealStage.HOT },
        }),
        this.prisma.followUp.count({
          where: { executiveId, completed: false, dueDate: { lte: now } },
        }),
        this.prisma.client.aggregate({
          where: {
            assignedExecutiveId: executiveId,
            dealStage: DealStage.WON,
            updatedAt: { gte: startOfMonth },
          },
          _count: true,
          _sum: { quotationAmount: true },
        }),
      ]);

    return {
      visitsThisWeek,
      hotLeads,
      followUpsDue,
      wonThisMonth: wonThisMonth._count,
      wonRevenueThisMonth: wonThisMonth._sum.quotationAmount || 0,
    };
  }

  async managerPipeline({ area } = {}) {
    const where = area ? { area } : {};

    const counts = await this.prisma.client.groupBy({
      by: ['dealStage'],
      where,
      _count: true,
    });

    const funnel = DEAL_STAGES.reduce((acc, stage) => {
      acc[stage] = counts.find((c) => c.dealStage === stage)?._count || 0;
      return acc;
    }, {});

    const won = funnel[DealStage.WON];
    const total = DEAL_STAGES.reduce((sum, stage) => sum + funnel[stage], 0);
    const conversionRate =
      total > 0 ? Number(((won / total) * 100).toFixed(1)) : 0;

    const leaderboard = await this.prisma.client.groupBy({
      by: ['assignedExecutiveId'],
      where: { ...where, dealStage: DealStage.WON },
      _sum: { quotationAmount: true },
      _count: true,
      orderBy: { _sum: { quotationAmount: 'desc' } },
    });

    const executives = await this.prisma.user.findMany({
      where: { id: { in: leaderboard.map((row) => row.assignedExecutiveId) } },
    });

    return {
      funnel,
      conversionRate,
      leaderboard: leaderboard.map((row) => ({
        executive: executives.find((e) => e.id === row.assignedExecutiveId),
        clientsWon: row._count,
        revenueWon: row._sum.quotationAmount || 0,
      })),
    };
  }

  async areaCoverage() {
    const clients = await this.prisma.client.findMany({
      select: { area: true, dealStage: true },
    });

    const byArea = {};
    for (const client of clients) {
      const area = client.area || 'Unassigned';
      byArea[area] ??= { total: 0, hot: 0, won: 0, lost: 0, lead: 0 };
      byArea[area].total += 1;
      byArea[area][client.dealStage.toLowerCase()] += 1;
    }

    return byArea;
  }

  nearbyClients(lat, lng, radiusMeters, user) {
    const executiveFilter =
      user.role === Role.EXECUTIVE
        ? Prisma.sql`AND "assignedExecutiveId" = ${user.sub}`
        : Prisma.empty;

    return this.prisma.$queryRaw`
      SELECT id, "shopName", "dealStage", lat, lng,
        ST_Distance(
          ST_MakePoint(lng, lat)::geography,
          ST_MakePoint(${lng}::float, ${lat}::float)::geography
        ) AS "distanceMeters"
      FROM clients
      WHERE lat IS NOT NULL AND lng IS NOT NULL
        AND ST_DWithin(
          ST_MakePoint(lng, lat)::geography,
          ST_MakePoint(${lng}::float, ${lat}::float)::geography,
          ${radiusMeters}
        )
        ${executiveFilter}
      ORDER BY "distanceMeters" ASC
    `;
  }
}
