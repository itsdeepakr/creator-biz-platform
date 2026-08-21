import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CampaignStatus, DeliverableType } from '@prisma/client';

export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  budgetType!: string; // 'fixed' | 'range'

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  budgetMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  budgetMax?: number;

  @IsOptional()
  @IsString()
  budgetCurrency?: string = 'INR';

  @IsArray()
  @IsEnum(DeliverableType, { each: true })
  deliverableTypes!: DeliverableType[];

  @IsNotEmpty()
  deliverableDetails!: any;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  creatorCount!: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  creatorCategories?: string[];

  @IsArray()
  @IsString({ each: true })
  requiredPlatforms!: string[];

  @IsOptional()
  @IsString()
  requiredLocation?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minFollowers?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxFollowers?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minEngagementRate?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsDateString()
  applicationDeadline?: string;

  @IsOptional()
  @IsBoolean()
  autoCloseAfterHire?: boolean;

  @IsOptional()
  @IsBoolean()
  allowNegotiation?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxRevisions?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  autoApproveAfterDays?: number;

  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;
}
