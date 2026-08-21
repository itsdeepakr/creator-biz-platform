import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CampaignStatus, DeliverableType } from '@prisma/client';

export class UpdateCampaignDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  budgetType?: string;

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
  @IsArray()
  @IsEnum(DeliverableType, { each: true })
  deliverableTypes?: DeliverableType[];

  @IsOptional()
  deliverableDetails?: any;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  creatorCount?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  creatorCategories?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredPlatforms?: string[];

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

export class UpdateCampaignStatusDto {
  @IsEnum(CampaignStatus)
  status!: CampaignStatus;
}
