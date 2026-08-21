import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DeliverableType } from '@prisma/client';

export class CreatePortfolioItemDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  mediaUrls!: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsEnum(DeliverableType)
  deliverableType?: DeliverableType;
}

export class UpdatePortfolioItemDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsEnum(DeliverableType)
  deliverableType?: DeliverableType;
}
