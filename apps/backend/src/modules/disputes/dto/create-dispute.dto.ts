import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { DisputeOutcome } from '@prisma/client';

export class CreateDisputeDto {
  @IsString()
  @IsNotEmpty()
  collaborationId!: string;

  @IsString()
  @IsNotEmpty()
  reason!: string;

  @IsString()
  @IsNotEmpty()
  category!: string; // 'DELIVERABLE_QUALITY' | 'NON_RESPONSIVE' | 'SCOPE_CREEP' | 'MISSED_DEADLINE' | 'PAYMENT_ISSUE' | 'OTHER'

  @IsOptional()
  evidence?: {
    description?: string;
    urls?: string[];
  };
}

export class AddEvidenceDto {
  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsOptional()
  urls?: string[];
}

export class ResolveDisputeDto {
  @IsEnum(DisputeOutcome)
  outcome!: DisputeOutcome;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amountRefunded?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amountReleased?: number;

  @IsString()
  @IsNotEmpty()
  resolutionNotes!: string;
}
