import { PartialType } from '@nestjs/mapped-types';
import { CreateOpportunityDto } from './create-opportunity.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateOpportunityDto extends PartialType(CreateOpportunityDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
