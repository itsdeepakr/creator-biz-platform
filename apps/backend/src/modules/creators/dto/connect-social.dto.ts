import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ConnectSocialDto {
  @IsString()
  @IsNotEmpty()
  platform!: string; // 'INSTAGRAM', 'YOUTUBE'

  @IsString()
  @IsNotEmpty()
  platformUserId!: string;

  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsNotEmpty()
  accessToken!: string;

  @IsOptional()
  @IsString()
  refreshToken?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  followerCount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  followingCount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  engagementRate?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  avgViews?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  audienceTopCities?: string[];
}
