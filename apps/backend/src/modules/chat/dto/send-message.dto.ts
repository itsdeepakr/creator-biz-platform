import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ChatReportReason } from '@prisma/client';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty({ message: 'Message content cannot be empty' })
  content!: string;

  @IsOptional()
  @IsString()
  messageType?: string = 'text';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];
}

export class CreateThreadDto {
  @IsOptional()
  @IsString()
  creatorId?: string;

  @IsOptional()
  @IsString()
  businessId?: string;

  @IsOptional()
  @IsString()
  campaignId?: string;
}

export class ReportThreadDto {
  @IsEnum(ChatReportReason)
  reason!: ChatReportReason;

  @IsOptional()
  @IsString()
  description?: string;
}
