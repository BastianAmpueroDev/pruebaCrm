import { Injectable } from '@nestjs/common';
import { OpportunitiesService } from '../../opportunities/opportunities.service';
import { DashboardService } from '../../dashboard/dashboard.service';

@Injectable()
export class ToolExecutor {
  constructor(
    private opportunitiesService: OpportunitiesService,
    private dashboardService: DashboardService,
  ) {}

  async execute(toolName: string, toolInput: Record<string, any>): Promise<string> {
    try {
      switch (toolName) {
        case 'list_opportunities': {
          const result = await this.opportunitiesService.findAll({
            stage: toolInput.stage,
            priority: toolInput.priority,
            owner: toolInput.owner,
            sortBy: toolInput.sort_by,
            sortOrder: toolInput.sort_order,
            limit: toolInput.limit ?? 10,
            page: 1,
          });
          return JSON.stringify(result);
        }

        case 'get_opportunity': {
          const result = await this.opportunitiesService.findOne(toolInput.id);
          return JSON.stringify(result);
        }

        case 'get_pipeline_metrics': {
          const result = await this.dashboardService.getMetrics();
          return JSON.stringify(result);
        }

        case 'get_upcoming_followups': {
          const result = await this.dashboardService.getUpcomingFollowups(toolInput.days ?? 7);
          return JSON.stringify(result);
        }

        default:
          return JSON.stringify({ error: `Tool desconocida: ${toolName}` });
      }
    } catch (error: any) {
      return JSON.stringify({ error: error.message ?? 'Error ejecutando tool' });
    }
  }
}
