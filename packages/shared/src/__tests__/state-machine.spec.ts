import {
  CollaborationStatus,
  UserRole,
  canTransition,
  assertValidTransition,
  getNextValidStates,
  isTerminalState,
  canSubmitDeliverables,
  canRequestRevision,
  canApproveDeliverables,
  canFundEscrow,
  canReleaseEscrow,
  canRaiseDispute,
  CollaborationTransitionError,
  PLATFORM_FEE_PERCENTAGE,
  PAN_REGEX,
  GST_REGEX,
  IFSC_REGEX,
  INDIAN_PHONE_REGEX,
} from '../index';

describe('Collaboration State Machine & Shared Core Tests', () => {
  describe('Valid State Transitions', () => {
    it('should allow valid transitions in normal lifecycle', () => {
      expect(canTransition(CollaborationStatus.APPLIED, CollaborationStatus.NEGOTIATING)).toBe(true);
      expect(canTransition(CollaborationStatus.NEGOTIATING, CollaborationStatus.ACCEPTED)).toBe(true);
      expect(canTransition(CollaborationStatus.ACCEPTED, CollaborationStatus.IN_PROGRESS)).toBe(true);
      expect(canTransition(CollaborationStatus.IN_PROGRESS, CollaborationStatus.DELIVERABLE_SUBMITTED)).toBe(true);
      expect(canTransition(CollaborationStatus.DELIVERABLE_SUBMITTED, CollaborationStatus.APPROVED)).toBe(true);
      expect(canTransition(CollaborationStatus.APPROVED, CollaborationStatus.PAID)).toBe(true);
      expect(canTransition(CollaborationStatus.PAID, CollaborationStatus.COMPLETED)).toBe(true);
    });

    it('should allow revision workflow transitions', () => {
      expect(canTransition(CollaborationStatus.DELIVERABLE_SUBMITTED, CollaborationStatus.REVISION_REQUESTED)).toBe(true);
      expect(canTransition(CollaborationStatus.REVISION_REQUESTED, CollaborationStatus.DELIVERABLE_SUBMITTED)).toBe(true);
      expect(canTransition(CollaborationStatus.REVISION_REQUESTED, CollaborationStatus.APPROVED)).toBe(true);
    });

    it('should allow dispute transitions and resolution', () => {
      expect(canTransition(CollaborationStatus.IN_PROGRESS, CollaborationStatus.DISPUTED)).toBe(true);
      expect(canTransition(CollaborationStatus.DELIVERABLE_SUBMITTED, CollaborationStatus.DISPUTED)).toBe(true);
      expect(canTransition(CollaborationStatus.DISPUTED, CollaborationStatus.APPROVED)).toBe(true);
      expect(canTransition(CollaborationStatus.DISPUTED, CollaborationStatus.REFUNDED)).toBe(true);
    });
  });

  describe('Invalid Transitions & Error Handling', () => {
    it('should reject invalid skip transitions', () => {
      expect(canTransition(CollaborationStatus.APPLIED, CollaborationStatus.APPROVED)).toBe(false);
      expect(canTransition(CollaborationStatus.APPLIED, CollaborationStatus.IN_PROGRESS)).toBe(false);
      expect(canTransition(CollaborationStatus.IN_PROGRESS, CollaborationStatus.PAID)).toBe(false);
    });

    it('should throw CollaborationTransitionError on assertValidTransition failure', () => {
      expect(() => {
        assertValidTransition(CollaborationStatus.APPLIED, CollaborationStatus.COMPLETED);
      }).toThrow(CollaborationTransitionError);
    });

    it('should properly include fromState and toState in CollaborationTransitionError', () => {
      try {
        assertValidTransition(CollaborationStatus.APPLIED, CollaborationStatus.COMPLETED);
      } catch (err: any) {
        expect(err).toBeInstanceOf(CollaborationTransitionError);
        expect(err.fromState).toBe(CollaborationStatus.APPLIED);
        expect(err.toState).toBe(CollaborationStatus.COMPLETED);
      }
    });
  });

  describe('Role-based Transitions', () => {
    it('should restrict transitions based on user role', () => {
      // Creator can submit deliverables
      expect(canTransition(CollaborationStatus.IN_PROGRESS, CollaborationStatus.DELIVERABLE_SUBMITTED, UserRole.CREATOR)).toBe(true);
      // Business cannot submit deliverables on behalf of creator
      expect(canTransition(CollaborationStatus.IN_PROGRESS, CollaborationStatus.DELIVERABLE_SUBMITTED, UserRole.BUSINESS)).toBe(false);

      // Business can request revisions
      expect(canTransition(CollaborationStatus.DELIVERABLE_SUBMITTED, CollaborationStatus.REVISION_REQUESTED, UserRole.BUSINESS)).toBe(true);
      // Creator cannot request revision from themselves
      expect(canTransition(CollaborationStatus.DELIVERABLE_SUBMITTED, CollaborationStatus.REVISION_REQUESTED, UserRole.CREATOR)).toBe(false);

      // Business can approve deliverables
      expect(canTransition(CollaborationStatus.DELIVERABLE_SUBMITTED, CollaborationStatus.APPROVED, UserRole.BUSINESS)).toBe(true);
      // Creator cannot approve own deliverables
      expect(canTransition(CollaborationStatus.DELIVERABLE_SUBMITTED, CollaborationStatus.APPROVED, UserRole.CREATOR)).toBe(false);

      // Admin has override permissions
      expect(canTransition(CollaborationStatus.DELIVERABLE_SUBMITTED, CollaborationStatus.APPROVED, UserRole.ADMIN)).toBe(true);
    });

    it('should get next valid states for role', () => {
      const creatorStates = getNextValidStates(CollaborationStatus.IN_PROGRESS, UserRole.CREATOR);
      expect(creatorStates).toContain(CollaborationStatus.DELIVERABLE_SUBMITTED);
      expect(creatorStates).toContain(CollaborationStatus.DISPUTED);
    });
  });

  describe('Workflow Helper Guards', () => {
    it('should identify terminal states correctly', () => {
      expect(isTerminalState(CollaborationStatus.COMPLETED)).toBe(true);
      expect(isTerminalState(CollaborationStatus.CANCELLED)).toBe(true);
      expect(isTerminalState(CollaborationStatus.REFUNDED)).toBe(true);
      expect(isTerminalState(CollaborationStatus.IN_PROGRESS)).toBe(false);
      expect(isTerminalState(CollaborationStatus.DELIVERABLE_SUBMITTED)).toBe(false);
    });

    it('should check deliverable submission capabilities', () => {
      expect(canSubmitDeliverables(CollaborationStatus.IN_PROGRESS)).toBe(true);
      expect(canSubmitDeliverables(CollaborationStatus.REVISION_REQUESTED)).toBe(true);
      expect(canSubmitDeliverables(CollaborationStatus.APPLIED)).toBe(false);
      expect(canSubmitDeliverables(CollaborationStatus.APPROVED)).toBe(false);
    });

    it('should enforce max revisions limit', () => {
      expect(canRequestRevision(CollaborationStatus.DELIVERABLE_SUBMITTED, 0, 2)).toBe(true);
      expect(canRequestRevision(CollaborationStatus.DELIVERABLE_SUBMITTED, 1, 2)).toBe(true);
      expect(canRequestRevision(CollaborationStatus.DELIVERABLE_SUBMITTED, 2, 2)).toBe(false);
      expect(canRequestRevision(CollaborationStatus.IN_PROGRESS, 0, 2)).toBe(false);
    });

    it('should check approval and payment conditions', () => {
      expect(canApproveDeliverables(CollaborationStatus.DELIVERABLE_SUBMITTED)).toBe(true);
      expect(canFundEscrow(CollaborationStatus.ACCEPTED)).toBe(true);
      expect(canReleaseEscrow(CollaborationStatus.APPROVED)).toBe(true);
      expect(canRaiseDispute(CollaborationStatus.IN_PROGRESS)).toBe(true);
      expect(canRaiseDispute(CollaborationStatus.COMPLETED)).toBe(false);
    });
  });

  describe('Platform Constants & Indian Validation Regex', () => {
    it('should have 10% platform fee', () => {
      expect(PLATFORM_FEE_PERCENTAGE).toBe(10);
    });

    it('should validate Indian PAN format', () => {
      expect(PAN_REGEX.test('ABCPS1234K')).toBe(true);
      expect(PAN_REGEX.test('AABCZ1234F')).toBe(true);
      expect(PAN_REGEX.test('INVALIDPAN1')).toBe(false);
      expect(PAN_REGEX.test('12345ABCDE')).toBe(false);
    });

    it('should validate Indian GSTIN format', () => {
      expect(GST_REGEX.test('27AABCZ1234F1Z5')).toBe(true);
      expect(GST_REGEX.test('29AABCU5678G1Z2')).toBe(true);
      expect(GST_REGEX.test('INVALIDGSTIN123')).toBe(false);
    });

    it('should validate Indian IFSC format', () => {
      expect(IFSC_REGEX.test('HDFC0000123')).toBe(true);
      expect(IFSC_REGEX.test('SBIN0001234')).toBe(true);
      expect(IFSC_REGEX.test('INVALIDIFSC')).toBe(false);
    });

    it('should validate Indian Phone format', () => {
      expect(INDIAN_PHONE_REGEX.test('+919820112233')).toBe(true);
      expect(INDIAN_PHONE_REGEX.test('9820112233')).toBe(true);
      expect(INDIAN_PHONE_REGEX.test('09820112233')).toBe(true);
      expect(INDIAN_PHONE_REGEX.test('1234567890')).toBe(false);
    });
  });
});
