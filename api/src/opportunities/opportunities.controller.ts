import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { FilterOpportunitiesDto } from './dto/filter-opportunities.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('opportunities')
@UseGuards(JwtAuthGuard)
export class OpportunitiesController {
  constructor(private opportunitiesService: OpportunitiesService) {}

  @Post()
  create(@Body() dto: CreateOpportunityDto) {
    return this.opportunitiesService.create(dto);
  }

  @Get()
  findAll(@Query() filters: FilterOpportunitiesDto) {
    return this.opportunitiesService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.opportunitiesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOpportunityDto) {
    return this.opportunitiesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.opportunitiesService.remove(id, user.role);
  }
}
