/**
 * Tier 1: Feature Coverage — Creator & Business KYC Onboarding
 * Requirements: ORIGINAL_REQUEST §R1, R3, R4, PROJECT.md F04
 */

import { describe, it, beforeEach, expect } from '../harness/test-framework.ts';
import { TestContext } from '../harness/test-context.ts';
import { DomainAssertions } from '../harness/assertions.ts';
import { VerificationStatus } from '../harness/types.ts';

export function runKycOnboardingTests(ctx: TestContext): void {
  describe('Tier 1: Creator & Business KYC Onboarding', () => {
    beforeEach(() => {
      ctx.reset();
    });

    it('T1.02.1 - Creator submits valid Indian PAN and Bank details', async () => {
      ctx.asUnverifiedCreator();
      const res = await ctx.api.submitCreatorKyc({
        panNumber: 'ABCDE1234F',
        bankAccountNumber: '123456789012',
        bankIfsc: 'SBIN0001234',
        bankAccountHolderName: 'Ananya Lifestyle Diaries',
        idDocumentUrl: 'https://storage.creatorbiz.com/kyc/ananya_pan.jpg',
      });

      DomainAssertions.assertStatus(res, 200);
      expect(res.data?.verificationStatus).toBe(VerificationStatus.PENDING);
      expect(res.data?.panNumber).toBe('ABCDE1234F');
      expect(res.data?.bankIfsc).toBe('SBIN0001234');
    });

    it('T1.02.2 - Business submits valid Indian GSTIN and Company legal details', async () => {
      ctx.asUnverifiedBusiness();
      const res = await ctx.api.submitBusinessKyc({
        companyName: 'FashionCo Trends Private Limited',
        gstNumber: '27ABCDE1234F1Z5',
        panNumber: 'ABCDE1234F',
        gstCertificateUrl: 'https://storage.creatorbiz.com/kyc/fashionco_gst.pdf',
        businessLicenseUrl: 'https://storage.creatorbiz.com/kyc/fashionco_license.pdf',
      });

      DomainAssertions.assertStatus(res, 200);
      expect(res.data?.verificationStatus).toBe(VerificationStatus.PENDING);
      expect(res.data?.gstNumber).toBe('27ABCDE1234F1Z5');
      expect(res.data?.companyName).toBe('FashionCo Trends Private Limited');
    });

    it('T1.02.3 - Returns accurate KYC status for Creator', async () => {
      ctx.asVerifiedCreator();
      const res = await ctx.api.getKycStatus();
      DomainAssertions.assertStatus(res, 200);
      expect(res.data?.status).toBe(VerificationStatus.APPROVED);
    });

    it('T1.02.4 - Returns accurate KYC status for Business', async () => {
      ctx.asUnverifiedBusiness();
      const res = await ctx.api.getKycStatus();
      DomainAssertions.assertStatus(res, 200);
      expect(res.data?.status).toBe(VerificationStatus.PENDING);
    });

    it('T1.02.5 - Admin approves pending KYC and status reflects immediately', async () => {
      // 1. Unverified Creator submits KYC
      ctx.asUnverifiedCreator();
      await ctx.api.submitCreatorKyc({
        panNumber: 'ABCDE9999K',
        bankAccountNumber: '999888777666',
        bankIfsc: 'ICIC0001234',
        bankAccountHolderName: 'Ananya Lifestyle Diaries',
      });

      // 2. Admin approves KYC
      ctx.asAdmin();
      const approveRes = await ctx.api.approveKyc(ctx.seeds.creatorUnverified.id);
      DomainAssertions.assertStatus(approveRes, 200);

      // 3. Creator checks verified status
      ctx.asUnverifiedCreator();
      const statusRes = await ctx.api.getKycStatus();
      expect(statusRes.data?.status).toBe(VerificationStatus.APPROVED);
    });
  });
}
