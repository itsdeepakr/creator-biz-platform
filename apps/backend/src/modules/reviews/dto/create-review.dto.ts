import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CriteriaRatingsDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  quality!: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  communication!: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  timeliness!: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  value!: number;
}

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  collaborationId!: string;

  @IsString()
  @IsNotEmpty()
  revieweeId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  overallRating!: number;

  @ValidateNested()
  @Type(() => CriteriaRatingsDto)
  criteriaRatings!: CriteriaRatingsDto;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class RespondReviewDto {
  @IsString()
  @IsNotEmpty()
  response!: string;
}
