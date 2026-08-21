import { UserRole, VerificationStatus } from './enums';

export interface RegisterDto {
  email: string;
  phone?: string;
  password?: string;
  role: UserRole;
  displayName?: string;
  companyName?: string;
  category?: string;
  companyType?: string;
}

export interface LoginDto {
  email: string;
  password?: string;
  firebaseToken?: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  creatorProfileId?: string;
  businessProfileId?: string;
  adminProfileId?: string;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponseDto {
  user: {
    id: string;
    email: string;
    phone?: string | null;
    role: UserRole;
    isActive: boolean;
    isVerified: boolean;
    verificationStatus?: VerificationStatus;
    creatorProfileId?: string | null;
    businessProfileId?: string | null;
    adminProfileId?: string | null;
    displayName?: string;
    avatarUrl?: string | null;
  };
  tokens: AuthTokens;
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}
