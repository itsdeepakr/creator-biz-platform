import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SubmitDeliverableDto {
  @IsArray()
  @IsNotEmpty()
  deliverableLinks!: Array<{
    type?: string;
    url: string;
    platform?: string;
    caption?: string;
  }>;

  @IsOptional()
  @IsString()
  deliverableNotes?: string;
}

export class RequestRevisionDto {
  @IsString()
  @IsNotEmpty({ message: 'Revision feedback/notes are required' })
  revisionNotes!: string;

  @IsOptional()
  @IsString()
  revisionDeadline?: string;
}

export class CancelCollaborationDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
