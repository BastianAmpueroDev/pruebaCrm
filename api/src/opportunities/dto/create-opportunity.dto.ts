import {
  IsString,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsDateString,
  IsNumber,
  Min,
  Max,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Stage, Priority } from '@prisma/client';

export class CreateOpportunityDto {
  @IsString()
  companyName: string;

  @IsString()
  contactName: string;

  @IsEmail()
  contactEmail: string;

  @IsString()
  opportunityName: string;

  @IsString()
  description: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  estimatedValue: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsEnum(Stage)
  stage?: Stage;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  probability: number;

  @IsString()
  owner: string;

  @IsDateString()
  nextFollowUpDate: string;

  @IsOptional()
  @IsString()
  lastInteractionSummary?: string;

  @IsOptional()
  @IsString()
  aiRecommendation?: string;
}
