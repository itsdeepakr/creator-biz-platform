export enum UserRole {
  CREATOR = 'CREATOR',
  BUSINESS = 'BUSINESS',
  ADMIN = 'ADMIN',
}

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.CREATOR]: 1,
  [UserRole.BUSINESS]: 1,
  [UserRole.ADMIN]: 10,
};

export const ALL_ROLES = Object.values(UserRole);

export const PLATFORM_FEE_PERCENTAGE = 10;

export const COLLABORATION_STATES = [
  'PENDING',
  'NEGOTIATING',
  'ACCEPTED',
  'IN_PROGRESS',
  'DELIVERABLES_SUBMITTED',
  'PENDING_REVIEW',
  'APPROVED',
  'COMPLETED',
  'CANCELLED',
  'DISPUTED',
] as const;

export const DISPUTE_STATUSES = [
  'OPEN',
  'UNDER_REVIEW',
  'RESOLVED_BUYER',
  'RESOLVED_SELLER',
  'RESOLVED_MEDIATOR',
  'CLOSED',
] as const;

export const VERIFICATION_STATUSES = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'UNDER_REVIEW',
] as const;

export const MESSAGE_SENDER_TYPES = ['CREATOR', 'BUSINESS', 'SYSTEM'] as const;