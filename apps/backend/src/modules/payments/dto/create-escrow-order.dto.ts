import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEscrowOrderDto {
  @IsString()
  @IsNotEmpty()
  collaborationId!: string;
}

export class VerifyEscrowPaymentDto {
  @IsString()
  @IsNotEmpty()
  collaborationId!: string;

  @IsString()
  @IsNotEmpty()
  razorpayOrderId!: string;

  @IsString()
  @IsNotEmpty()
  razorpayPaymentId!: string;

  @IsString()
  @IsNotEmpty()
  razorpaySignature!: string;
}

export class ReleasePayoutDto {
  @IsString()
  @IsNotEmpty()
  collaborationId!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class RefundSplitDto {
  @IsString()
  @IsNotEmpty()
  collaborationId!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  businessRefundAmount!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  creatorPayoutAmount!: number;

  @IsString()
  @IsNotEmpty()
  reason!: string;
}
