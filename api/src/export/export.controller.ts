import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OpportunitiesService } from '../opportunities/opportunities.service';
import { FilterOpportunitiesDto } from '../opportunities/dto/filter-opportunities.dto';

@Controller('opportunities')
@UseGuards(JwtAuthGuard)
export class ExportController {
  constructor(private opportunitiesService: OpportunitiesService) {}

  @Get('export.csv')
  async exportCsv(@Query() filters: FilterOpportunitiesDto, @Res() res: Response) {
    const { data } = await this.opportunitiesService.findAll({ ...filters, limit: 10000, page: 1 });

    const headers = [
      'ID', 'Empresa', 'Contacto', 'Email Contacto', 'Oportunidad',
      'Etapa', 'Prioridad', 'Valor Estimado', 'Moneda', 'Probabilidad (%)',
      'Responsable', 'Próximo Seguimiento', 'Activo', 'Creado',
    ];

    const rows = data.map((o) => [
      o.id,
      `"${o.companyName}"`,
      `"${o.contactName}"`,
      o.contactEmail,
      `"${o.opportunityName}"`,
      o.stage,
      o.priority,
      o.estimatedValue.toString(),
      o.currency,
      o.probability,
      `"${o.owner}"`,
      new Date(o.nextFollowUpDate).toISOString().split('T')[0],
      o.isActive ? 'Sí' : 'No',
      new Date(o.createdAt).toISOString().split('T')[0],
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="oportunidades.csv"');
    res.send('\uFEFF' + csv); // BOM para Excel
  }
}
