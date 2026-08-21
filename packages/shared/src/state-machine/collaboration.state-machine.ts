import { CollaborationStatus, UserRole } from '../types/enums';

/**
 * Custom error thrown when an invalid state transition is attempted.
 */
export class CollaborationTransitionError extends Error {
  public readonly fromState: CollaborationStatus;
  public readonly toState: CollaborationStatus;
  public readonly role?: UserRole | string;

  constructor(fromState: CollaborationStatus, toState: CollaborationStatus, role?: UserRole | string) {
    const roleMsg = role ? ` by role '${role}'` : '';
    super(`Invalid collaboration state transition from '${fromState}' to '${toState}'${roleMsg}.`);
    this.name = 'CollaborationTransitionError';
    this.fromState = fromState;
    this.toState = toState;
    this.role = role;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Complete map of allowed next states from any given CollaborationStatus.
 */
export const VALID_TRANSITIONS: Record<CollaborationStatus, CollaborationStatus[]> = {
  [CollaborationStatus.APPLIED]: [
    CollaborationStatus.NEGOTIATING,
    CollaborationStatus.OFFERED,
    CollaborationStatus.ACCEPTED,
    CollaborationStatus.DECLINED,
    CollaborationStatus.CANCELLED,
  ],
  [CollaborationStatus.PENDING]: [
    CollaborationStatus.NEGOTIATING,
    CollaborationStatus.OFFERED,
    CollaborationStatus.ACCEPTED,
    CollaborationStatus.DECLINED,
    CollaborationStatus.CANCELLED,
  ],
  [CollaborationStatus.NEGOTIATING]: [
    CollaborationStatus.OFFERED,
    CollaborationStatus.ACCEPTED,
    CollaborationStatus.APPLIED,
    CollaborationStatus.PENDING,
    CollaborationStatus.DECLINED,
    CollaborationStatus.CANCELLED,
  ],
  [CollaborationStatus.OFFERED]: [
    CollaborationStatus.ACCEPTED,
    CollaborationStatus.NEGOTIATING,
    CollaborationStatus.DECLINED,
    CollaborationStatus.CANCELLED,
  ],
  [CollaborationStatus.ACCEPTED]: [
    CollaborationStatus.PAYMENT_PENDING,
    CollaborationStatus.IN_PROGRESS,
    CollaborationStatus.CANCELLED,
  ],
  [CollaborationStatus.PAYMENT_PENDING]: [
    CollaborationStatus.IN_PROGRESS,
    CollaborationStatus.CANCELLED,
  ],
  [CollaborationStatus.IN_PROGRESS]: [
    CollaborationStatus.DELIVERABLE_SUBMITTED,
    CollaborationStatus.SUBMITTED,
    CollaborationStatus.DISPUTED,
    CollaborationStatus.CANCELLED,
  ],
  [CollaborationStatus.DELIVERABLE_SUBMITTED]: [
    CollaborationStatus.APPROVED,
    CollaborationStatus.REVISION_REQUESTED,
    CollaborationStatus.DISPUTED,
  ],
  [CollaborationStatus.SUBMITTED]: [
    CollaborationStatus.APPROVED,
    CollaborationStatus.REVISION_REQUESTED,
    CollaborationStatus.DISPUTED,
  ],
  [CollaborationStatus.REVISION_REQUESTED]: [
    CollaborationStatus.DELIVERABLE_SUBMITTED,
    CollaborationStatus.SUBMITTED,
    CollaborationStatus.APPROVED,
    CollaborationStatus.DISPUTED,
    CollaborationStatus.CANCELLED,
  ],
  [CollaborationStatus.APPROVED]: [
    CollaborationStatus.PENDING_PAYOUT,
    CollaborationStatus.PAID,
    CollaborationStatus.PAID_OUT,
    CollaborationStatus.COMPLETED,
    CollaborationStatus.DISPUTED,
  ],
  [CollaborationStatus.PENDING_PAYOUT]: [
    CollaborationStatus.PAID,
    CollaborationStatus.PAID_OUT,
    CollaborationStatus.COMPLETED,
    CollaborationStatus.DISPUTED,
  ],
  [CollaborationStatus.PAID]: [
    CollaborationStatus.COMPLETED,
  ],
  [CollaborationStatus.PAID_OUT]: [
    CollaborationStatus.COMPLETED,
  ],
  [CollaborationStatus.COMPLETED]: [],
  [CollaborationStatus.DISPUTED]: [
    CollaborationStatus.APPROVED,
    CollaborationStatus.PENDING_PAYOUT,
    CollaborationStatus.PAID,
    CollaborationStatus.PAID_OUT,
    CollaborationStatus.COMPLETED,
    CollaborationStatus.REFUNDED,
    CollaborationStatus.CANCELLED,
  ],
  [CollaborationStatus.CANCELLED]: [],
  [CollaborationStatus.DECLINED]: [],
  [CollaborationStatus.REFUNDED]: [],
};

/**
 * Role-based transition permissions.
 */
export const ROLE_ALLOWED_TRANSITIONS: Record<UserRole, Partial<Record<CollaborationStatus, CollaborationStatus[]>>> = {
  [UserRole.CREATOR]: {
    [CollaborationStatus.APPLIED]: [CollaborationStatus.NEGOTIATING, CollaborationStatus.CANCELLED],
    [CollaborationStatus.PENDING]: [CollaborationStatus.NEGOTIATING, CollaborationStatus.ACCEPTED, CollaborationStatus.DECLINED, CollaborationStatus.CANCELLED],
    [CollaborationStatus.NEGOTIATING]: [CollaborationStatus.ACCEPTED, CollaborationStatus.CANCELLED],
    [CollaborationStatus.OFFERED]: [CollaborationStatus.ACCEPTED, CollaborationStatus.NEGOTIATING, CollaborationStatus.DECLINED],
    [CollaborationStatus.IN_PROGRESS]: [CollaborationStatus.DELIVERABLE_SUBMITTED, CollaborationStatus.SUBMITTED, CollaborationStatus.DISPUTED],
    [CollaborationStatus.REVISION_REQUESTED]: [CollaborationStatus.DELIVERABLE_SUBMITTED, CollaborationStatus.SUBMITTED, CollaborationStatus.DISPUTED],
  },
  [UserRole.BUSINESS]: {
    [CollaborationStatus.APPLIED]: [CollaborationStatus.NEGOTIATING, CollaborationStatus.OFFERED, CollaborationStatus.ACCEPTED, CollaborationStatus.DECLINED],
    [CollaborationStatus.PENDING]: [CollaborationStatus.NEGOTIATING, CollaborationStatus.OFFERED, CollaborationStatus.ACCEPTED, CollaborationStatus.DECLINED],
    [CollaborationStatus.NEGOTIATING]: [CollaborationStatus.OFFERED, CollaborationStatus.ACCEPTED, CollaborationStatus.DECLINED, CollaborationStatus.CANCELLED],
    [CollaborationStatus.OFFERED]: [CollaborationStatus.CANCELLED],
    [CollaborationStatus.ACCEPTED]: [CollaborationStatus.PAYMENT_PENDING, CollaborationStatus.IN_PROGRESS, CollaborationStatus.CANCELLED],
    [CollaborationStatus.PAYMENT_PENDING]: [CollaborationStatus.IN_PROGRESS, CollaborationStatus.CANCELLED],
    [CollaborationStatus.IN_PROGRESS]: [CollaborationStatus.DISPUTED],
    [CollaborationStatus.DELIVERABLE_SUBMITTED]: [CollaborationStatus.APPROVED, CollaborationStatus.REVISION_REQUESTED, CollaborationStatus.DISPUTED],
    [CollaborationStatus.SUBMITTED]: [CollaborationStatus.APPROVED, CollaborationStatus.REVISION_REQUESTED, CollaborationStatus.DISPUTED],
    [CollaborationStatus.REVISION_REQUESTED]: [CollaborationStatus.APPROVED, CollaborationStatus.DISPUTED],
  },
  [UserRole.ADMIN]: {
    // Admin can execute all valid transitions plus dispute resolutions and overrides
    [CollaborationStatus.APPLIED]: [CollaborationStatus.CANCELLED, CollaborationStatus.DECLINED],
    [CollaborationStatus.PENDING]: [CollaborationStatus.CANCELLED, CollaborationStatus.DECLINED],
    [CollaborationStatus.NEGOTIATING]: [CollaborationStatus.CANCELLED],
    [CollaborationStatus.OFFERED]: [CollaborationStatus.CANCELLED],
    [CollaborationStatus.ACCEPTED]: [CollaborationStatus.CANCELLED],
    [CollaborationStatus.PAYMENT_PENDING]: [CollaborationStatus.CANCELLED],
    [CollaborationStatus.IN_PROGRESS]: [CollaborationStatus.CANCELLED, CollaborationStatus.DISPUTED],
    [CollaborationStatus.DELIVERABLE_SUBMITTED]: [CollaborationStatus.APPROVED, CollaborationStatus.REVISION_REQUESTED, CollaborationStatus.DISPUTED],
    [CollaborationStatus.SUBMITTED]: [CollaborationStatus.APPROVED, CollaborationStatus.REVISION_REQUESTED, CollaborationStatus.DISPUTED],
    [CollaborationStatus.REVISION_REQUESTED]: [CollaborationStatus.APPROVED, CollaborationStatus.DISPUTED, CollaborationStatus.CANCELLED],
    [CollaborationStatus.APPROVED]: [CollaborationStatus.PENDING_PAYOUT, CollaborationStatus.PAID, CollaborationStatus.PAID_OUT, CollaborationStatus.COMPLETED, CollaborationStatus.DISPUTED],
    [CollaborationStatus.PENDING_PAYOUT]: [CollaborationStatus.PAID, CollaborationStatus.PAID_OUT, CollaborationStatus.COMPLETED, CollaborationStatus.DISPUTED],
    [CollaborationStatus.DISPUTED]: [CollaborationStatus.APPROVED, CollaborationStatus.PENDING_PAYOUT, CollaborationStatus.PAID, CollaborationStatus.PAID_OUT, CollaborationStatus.COMPLETED, CollaborationStatus.REFUNDED, CollaborationStatus.CANCELLED],
  },
  [UserRole.SUPER_ADMIN]: {
    // Super admin has full permissions across all statuses
    [CollaborationStatus.DISPUTED]: [CollaborationStatus.APPROVED, CollaborationStatus.PENDING_PAYOUT, CollaborationStatus.PAID, CollaborationStatus.PAID_OUT, CollaborationStatus.COMPLETED, CollaborationStatus.REFUNDED, CollaborationStatus.CANCELLED],
  },
};

/**
 * Checks whether a transition from currentState to nextState is valid.
 */
export function canTransition(
  currentState: CollaborationStatus,
  nextState: CollaborationStatus,
  role?: UserRole
): boolean {
  const allowed = VALID_TRANSITIONS[currentState] || [];
  if (!allowed.includes(nextState)) {
    return false;
  }
  if (role) {
    if (role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN) {
      return true;
    }
    const roleAllowed = ROLE_ALLOWED_TRANSITIONS[role]?.[currentState] || [];
    return roleAllowed.includes(nextState);
  }
  return true;
}

/**
 * Asserts that a state transition is valid, throwing CollaborationTransitionError if not.
 */
export function assertValidTransition(
  currentState: CollaborationStatus,
  nextState: CollaborationStatus,
  role?: UserRole
): void {
  if (!canTransition(currentState, nextState, role)) {
    throw new CollaborationTransitionError(currentState, nextState, role);
  }
}

/**
 * Returns list of allowed next states from the given state.
 */
export function getNextValidStates(
  currentState: CollaborationStatus,
  role?: UserRole
): CollaborationStatus[] {
  const globalAllowed = VALID_TRANSITIONS[currentState] || [];
  if (!role || role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN) {
    return globalAllowed;
  }
  const roleAllowed = ROLE_ALLOWED_TRANSITIONS[role]?.[currentState] || [];
  return globalAllowed.filter((s) => roleAllowed.includes(s));
}

/**
 * Checks if the state is terminal (no further transitions allowed).
 */
export function isTerminalState(status: CollaborationStatus): boolean {
  return [
    CollaborationStatus.COMPLETED,
    CollaborationStatus.CANCELLED,
    CollaborationStatus.DECLINED,
    CollaborationStatus.REFUNDED,
  ].includes(status);
}

/**
 * Checks if deliverables can be submitted in this state.
 */
export function canSubmitDeliverables(status: CollaborationStatus): boolean {
  return [
    CollaborationStatus.IN_PROGRESS,
    CollaborationStatus.REVISION_REQUESTED,
  ].includes(status);
}

/**
 * Checks if a revision can be requested, validating against max revisions limit.
 */
export function canRequestRevision(
  status: CollaborationStatus,
  currentRevisionCount = 0,
  maxRevisions = 2
): boolean {
  const isCorrectStatus = [
    CollaborationStatus.DELIVERABLE_SUBMITTED,
    CollaborationStatus.SUBMITTED,
  ].includes(status);
  return isCorrectStatus && currentRevisionCount < maxRevisions;
}

/**
 * Checks if deliverables can be approved in this state.
 */
export function canApproveDeliverables(status: CollaborationStatus): boolean {
  return [
    CollaborationStatus.DELIVERABLE_SUBMITTED,
    CollaborationStatus.SUBMITTED,
    CollaborationStatus.REVISION_REQUESTED,
  ].includes(status);
}

/**
 * Checks if escrow payment can be funded in this state.
 */
export function canFundEscrow(status: CollaborationStatus): boolean {
  return [
    CollaborationStatus.ACCEPTED,
    CollaborationStatus.PAYMENT_PENDING,
  ].includes(status);
}

/**
 * Checks if escrow payment can be released to the creator.
 */
export function canReleaseEscrow(status: CollaborationStatus): boolean {
  return [
    CollaborationStatus.APPROVED,
    CollaborationStatus.PENDING_PAYOUT,
  ].includes(status);
}

/**
 * Checks if a dispute can be raised in this state.
 */
export function canRaiseDispute(status: CollaborationStatus): boolean {
  return [
    CollaborationStatus.IN_PROGRESS,
    CollaborationStatus.DELIVERABLE_SUBMITTED,
    CollaborationStatus.SUBMITTED,
    CollaborationStatus.REVISION_REQUESTED,
    CollaborationStatus.APPROVED,
    CollaborationStatus.PENDING_PAYOUT,
  ].includes(status);
}
