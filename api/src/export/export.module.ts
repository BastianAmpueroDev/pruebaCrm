import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { OpportunitiesModule } from '../opportunities/opportunities.module';

@Module({
  imports: [OpportunitiesModule],
  controllers: [ExportController],
})
export class ExportModule {}
