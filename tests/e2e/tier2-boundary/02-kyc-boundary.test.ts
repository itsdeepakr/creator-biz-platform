/**
 * Tier 2: Boundary & Corner Cases — KYC & Verification
 */

import { describe, it, beforeEach } from '../harness/test-framework.ts';
import { TestContext } from '../harness/test-context.ts';
import { DomainAssertions } from '../harness/assertions.ts';

export function runKycBoundaryTests(ctx: TestContext): void {
  describe('Tier 2: KYC & Verification Boundary Cases', () => {
    beforeEach(() => {
      ctx.reset();
    });

    it('T2.02.1 - Rejects malformed Indian PAN format', async () => {
      ctx.asUnverifiedCreator();
      // Invalid PAN: 4 letters instead of 5, digits in wrong position
      const res = await ctx.api.submitCreatorKyc({
        panNumber: 'ABCD12345F', // 4 letters + 5 digits + 1 letter (invalid)
        bankAccountNumber: '123456789012',
        bankIfsc: 'HDFC0001234',
        bankAccountHolderName: 'Test Creator',
      });

      DomainAssertions.assertValidationError(res, 'pan');
    });

    it('T2.02.2 - Rejects invalid 15-character GSTIN format', async () => {
      ctx.asUnverifiedBusiness();
      // Invalid GSTIN: 12 chars instead of 15
      const res = await ctx.api.submitBusinessKyc({
        companyName: 'Test Biz',
        gstNumber: '29ABCDE1234F',
        panNumber: 'ABCDE1234F',
      });

      DomainAssertions.assertValidationError(res, 'gst');
    });

    it('T2.02.3 - Rejects invalid Indian IFSC code format (5th character not 0)', async () => {
      ctx.asUnverifiedCreator();
      // Invalid IFSC: 5th character is '1' instead of mandatory '0'
      const res = await ctx.api.submitCreatorKyc({
        panNumber: 'ABCDE1234F',
        bankAccountNumber: '123456789012',
        bankIfsc: 'HDFC1001234',
        bankAccountHolderName: 'Test Creator',
      });

      DomainAssertions.assertValidationError(res, 'ifsc');
    });

    it('T2.02.4 - Rejects invalid/short Bank Account number (<9 digits)', async () => {
      ctx.asUnverifiedCreator();
      const res = await ctx.api.submitCreatorKyc({
        panNumber: 'ABCDE1234F',
        bankAccountNumber: '12345',
        bankIfsc: 'HDFC0001234',
        bankAccountHolderName: 'Test Creator',
      });

      DomainAssertions.assertValidationError(res, 'bank account');
    });

    it('T2.02.5 - Rejects unauthenticated KYC submissions with 401 Unauthorized', async () => {
      ctx.asAnonymous();
      const res = await ctx.api.submitCreatorKyc({
        panNumber: 'ABCDE1234F',
        bankAccountNumber: '123456789012',
        bankIfsc: 'HDFC0001234',
        bankAccountHolderName: 'Test Creator',
      });

      DomainAssertions.assertUnauthorized(res);
    });
  });
}
