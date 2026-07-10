import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Stage, Priority } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getMetrics() {
    const [opportunities, followUps] = await Promise.all([
      this.prisma.opportunity.findMany({ where: { isActive: true } }),
      this.getUpcomingFollowups(7),
    ]);

    const totalPipeline = opportunities.reduce(
      (sum, o) => sum + Number(o.estimatedValue),
      0,
    );

    const weightedValue = opportunities.reduce(
      (sum, o) => sum + Number(o.estimatedValue) * (o.probability / 100),
      0,
    );

    const avgProbability =
      opportunities.length > 0
        ? opportunities.reduce((sum, o) => sum + o.probability, 0) / opportunities.length
        : 0;

    const byStage: Record<string, { count: number; value: number }> = {};
    for (const stage of Object.values(Stage)) {
      byStage[stage] = { count: 0, value: 0 };
    }
    for (const o of opportunities) {
      byStage[o.stage].count++;
      byStage[o.stage].value += Number(o.estimatedValue);
    }

    const byPriority: Record<string, number> = {};
    for (const priority of Object.values(Priority)) {
      byPriority[priority] = 0;
    }
    for (const o of opportunities) {
      byPriority[o.priority]++;
    }

    return {
      totalPipeline,
      weightedValue,
      totalOpportunities: opportunities.length,
      avgProbability: Math.round(avgProbability),
      byStage,
      byPriority,
      upcomingFollowups: followUps,
    };
  }

  async getUpcomingFollowups(days: number) {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    return this.prisma.opportunity.findMany({
      where: {
        isActive: true,
        nextFollowUpDate: { gte: now, lte: future },
      },
      orderBy: { nextFollowUpDate: 'asc' },
      select: {
        id: true,
        companyName: true,
        opportunityName: true,
        owner: true,
        nextFollowUpDate: true,
        priority: true,
        stage: true,
      },
    });
  }
}
