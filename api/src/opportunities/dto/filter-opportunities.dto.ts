import { IsEnum, IsOptional, IsString, IsNumber, IsDateString, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Stage, Priority } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class FilterOpportunitiesDto extends PaginationDto {
  @IsOptional()
  @IsEnum(Stage)
  stage?: Stage;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsString()
  owner?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minValue?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxValue?: number;

  @IsOptional()
  @IsDateString()
  followUpBefore?: string;

  @IsOptional()
  @IsDateString()
  followUpAfter?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeInactive?: boolean;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
