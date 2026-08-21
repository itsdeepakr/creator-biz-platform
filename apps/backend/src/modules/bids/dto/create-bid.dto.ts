import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBidDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Bid amount must be greater than 0' })
  bidAmount!: number;

  @IsOptional()
  @IsString()
  bidMessage?: string;
}

export class CounterOfferDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Counter offer amount must be greater than 0' })
  counterOfferAmount!: number;

  @IsOptional()
  @IsString()
  counterOfferMessage?: string;
}
