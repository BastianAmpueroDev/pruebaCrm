import { Module } from '@nestjs/common';
import { AssistantController } from './assistant.controller';
import { AssistantService } from './assistant.service';
import { ToolExecutor } from './tools/tool-executor';
import { OpportunitiesModule } from '../opportunities/opportunities.module';
import { DashboardModule } from '../dashboard/dashboard.module';

@Module({
  imports: [OpportunitiesModule, DashboardModule],
  controllers: [AssistantController],
  providers: [AssistantService, ToolExecutor],
})
export class AssistantModule {}
