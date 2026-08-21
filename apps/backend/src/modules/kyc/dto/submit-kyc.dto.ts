import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { VerificationStatus } from '@prisma/client';

export class SubmitKycDto {
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, {
    message: 'Invalid PAN format. Must be 5 uppercase letters, 4 digits, 1 uppercase letter (e.g. ABCDE1234F)',
  })
  panNumber?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, {
    message: 'Invalid GSTIN format (e.g. 27AAAAA0000A1Z5)',
  })
  gstNumber?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{9,18}$/, { message: 'Bank account number must be 9 to 18 digits' })
  bankAccountNumber?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, { message: 'Invalid IFSC code format (e.g. HDFC0001234)' })
  bankIfsc?: string;

  @IsOptional()
  @IsString()
  bankAccountHolderName?: string;

  @IsOptional()
  @IsString()
  idDocumentUrl?: string;

  @IsOptional()
  @IsString()
  idDocumentType?: string;

  @IsOptional()
  @IsString()
  gstCertificateUrl?: string;

  @IsOptional()
  @IsString()
  businessLicenseUrl?: string;

  @IsOptional()
  @IsString()
  addressProofUrl?: string;

  @IsOptional()
  @IsString()
  ownerName?: string;

  @IsOptional()
  @IsString()
  ownerIdDocumentUrl?: string;
}

export class ReviewKycDto {
  @IsEnum(VerificationStatus)
  status!: VerificationStatus;

  @IsOptional()
  @IsString()
  verificationNotes?: string;

  @IsString()
  @IsNotEmpty()
  targetType!: 'CREATOR' | 'BUSINESS';
}
