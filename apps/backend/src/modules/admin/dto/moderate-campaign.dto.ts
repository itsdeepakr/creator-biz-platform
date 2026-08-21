import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { CampaignStatus } from '@prisma/client';

export class ModerateCampaignDto {
  @IsEnum(CampaignStatus)
  status!: CampaignStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ModerateUserDto {
  @IsBoolean()
  isActive!: boolean;

  @IsOptional()
  @IsString()
  reason?: string;
}
