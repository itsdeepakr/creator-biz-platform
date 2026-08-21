import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateBusinessProfileDto {
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  companyType?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  pincode?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  gstNumber?: string;

  @IsOptional()
  @IsString()
  gstCertificateUrl?: string;

  @IsOptional()
  @IsString()
  businessLicenseUrl?: string;

  @IsOptional()
  @IsString()
  panNumber?: string;

  @IsOptional()
  @IsString()
  ownerName?: string;

  @IsOptional()
  @IsString()
  ownerIdDocumentUrl?: string;

  @IsOptional()
  @IsString()
  addressProofUrl?: string;

  @IsOptional()
  @IsBoolean()
  allowDirectInquiries?: boolean;

  @IsOptional()
  @IsBoolean()
  showInSearch?: boolean;
}
