import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CollaborationStatus } from '@prisma/client';

export class CollaborationQueryDto {
  @IsOptional()
  @IsEnum(CollaborationStatus)
  status?: CollaborationStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
