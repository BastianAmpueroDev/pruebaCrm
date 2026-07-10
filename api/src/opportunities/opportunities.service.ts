import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { FilterOpportunitiesDto } from './dto/filter-opportunities.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class OpportunitiesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOpportunityDto) {
    return this.prisma.opportunity.create({
      data: {
        ...dto,
        nextFollowUpDate: new Date(dto.nextFollowUpDate),
      },
    });
  }

  async findAll(filters: FilterOpportunitiesDto) {
    const {
      page = 1,
      limit = 20,
      stage,
      priority,
      owner,
      search,
      minValue,
      maxValue,
      followUpBefore,
      followUpAfter,
      includeInactive,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const where: Prisma.OpportunityWhereInput = {};

    if (!includeInactive) {
      where.isActive = true;
    }

    if (stage) where.stage = stage;
    if (priority) where.priority = priority;
    if (owner) where.owner = { contains: owner, mode: 'insensitive' };

    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { opportunityName: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minValue !== undefined || maxValue !== undefined) {
      where.estimatedValue = {};
      if (minValue !== undefined) where.estimatedValue.gte = minValue;
      if (maxValue !== undefined) where.estimatedValue.lte = maxValue;
    }

    if (followUpBefore || followUpAfter) {
      where.nextFollowUpDate = {};
      if (followUpBefore) where.nextFollowUpDate.lte = new Date(followUpBefore);
      if (followUpAfter) where.nextFollowUpDate.gte = new Date(followUpAfter);
    }

    const validSortFields = [
      'createdAt',
      'updatedAt',
      'estimatedValue',
      'probability',
      'nextFollowUpDate',
      'companyName',
      'opportunityName',
    ];
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [total, data] = await Promise.all([
      this.prisma.opportunity.count({ where }),
      this.prisma.opportunity.findMany({
        where,
        orderBy: { [orderField]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const opportunity = await this.prisma.opportunity.findUnique({ where: { id } });
    if (!opportunity) {
      throw new NotFoundException(`Oportunidad ${id} no encontrada`);
    }
    return opportunity;
  }

  async update(id: string, dto: UpdateOpportunityDto) {
    await this.findOne(id);
    return this.prisma.opportunity.update({
      where: { id },
      data: {
        ...dto,
        nextFollowUpDate: dto.nextFollowUpDate ? new Date(dto.nextFollowUpDate) : undefined,
      },
    });
  }

  async remove(id: string, userRole: string) {
    if (userRole !== 'ADMIN') {
      throw new ForbiddenException('Solo los administradores pueden eliminar oportunidades');
    }
    await this.findOne(id);
    return this.prisma.opportunity.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getUpcomingFollowups(days: number = 7) {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    return this.prisma.opportunity.findMany({
      where: {
        isActive: true,
        nextFollowUpDate: {
          gte: now,
          lte: future,
        },
      },
      orderBy: { nextFollowUpDate: 'asc' },
    });
  }
}
