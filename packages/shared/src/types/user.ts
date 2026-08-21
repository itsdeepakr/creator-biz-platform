import { UserRole } from './enums';

export interface UserDto {
  id: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  lastLoginAt?: Date | string | null;
}

export interface AdminProfileDto {
  id: string;
  userId: string;
  permissions: Record<string, any>;
  createdAt: Date | string;
}

export interface UpdateUserStatusDto {
  isActive?: boolean;
  isVerified?: boolean;
}
