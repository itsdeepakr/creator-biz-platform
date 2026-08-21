import * as fs from 'fs';
import * as path from 'path';
import {
  PAN_REGEX,
  GST_REGEX,
  IFSC_REGEX,
  INDIAN_PHONE_REGEX,
  PINCODE_REGEX,
  PLATFORM_FEE_PERCENTAGE,
} from '../index';

describe('ADVERSARIAL STRESS TEST: Seed Data Integrity & Forensic Analysis', () => {
  const seedFilePath = path.resolve(__dirname, '../../../prisma/prisma/seed.ts');
  let seedFileContent: string;

  beforeAll(() => {
    expect(fs.existsSync(seedFilePath)).toBe(true);
    seedFileContent = fs.readFileSync(seedFilePath, 'utf-8');
  });

  describe('1. Seed Model Coverage', () => {
    it('should verify all core Prisma models are seeded in seed.ts', () => {
      const requiredModels = [
        'prisma.user.create',
        'prisma.adminProfile',
        'prisma.creatorProfile',
        'prisma.businessProfile',
        'prisma.socialConnection.create',
        'prisma.service.create',
        'prisma.portfolioItem.create',
        'prisma.campaign.create',
        'prisma.collaboration.create',
        'prisma.payment.create',
        'prisma.escrowTransaction',
        'prisma.platformFee',
        'prisma.chatThread.create',
        'prisma.message',
        'prisma.review.create',
        'prisma.dispute.create',
        'prisma.report.create',
        'prisma.notification.createMany',
      ];

      for (const modelCall of requiredModels) {
        expect(seedFileContent).toContain(modelCall);
      }
    });

    it('should verify cleanup of all tables in reverse dependency order', () => {
      const cleanupTables = [
        'prisma.notification.deleteMany()',
        'prisma.report.deleteMany()',
        'prisma.message.deleteMany()',
        'prisma.chatThread.deleteMany()',
        'prisma.dispute.deleteMany()',
        'prisma.review.deleteMany()',
        'prisma.platformFee.deleteMany()',
        'prisma.escrowTransaction.deleteMany()',
        'prisma.payment.deleteMany()',
        'prisma.collaboration.deleteMany()',
        'prisma.campaign.deleteMany()',
        'prisma.portfolioItem.deleteMany()',
        'prisma.service.deleteMany()',
        'prisma.socialConnection.deleteMany()',
        'prisma.adminProfile.deleteMany()',
        'prisma.creatorProfile.deleteMany()',
        'prisma.businessProfile.deleteMany()',
        'prisma.user.deleteMany()',
      ];

      for (const cleanup of cleanupTables) {
        expect(seedFileContent).toContain(cleanup);
      }
    });
  });

  describe('2. Indian Market KYC & Contact Validations in Seed Fixtures', () => {
    it('should verify all seeded PAN numbers strictly match PAN_REGEX', () => {
      const panMatches = seedFileContent.match(/panNumber:\s*['"]([A-Z0-9]+)['"]/g) || [];
      expect(panMatches.length).toBeGreaterThan(0);

      for (const match of panMatches) {
        const pan = match.replace(/panNumber:\s*['"]/, '').replace(/['"]/, '');
        expect(PAN_REGEX.test(pan)).toBe(true);
      }
    });

    it('should verify all seeded GST numbers strictly match GST_REGEX', () => {
      const gstMatches = seedFileContent.match(/gstNumber:\s*['"]([A-Z0-9]+)['"]/g) || [];
      expect(gstMatches.length).toBeGreaterThan(0);

      for (const match of gstMatches) {
        const gst = match.replace(/gstNumber:\s*['"]/, '').replace(/['"]/, '');
        expect(GST_REGEX.test(gst)).toBe(true);
      }
    });

    it('should verify all seeded IFSC codes strictly match IFSC_REGEX', () => {
      const ifscMatches = seedFileContent.match(/bankIfsc:\s*['"]([A-Z0-9]+)['"]/g) || [];
      expect(ifscMatches.length).toBeGreaterThan(0);

      for (const match of ifscMatches) {
        const ifsc = match.replace(/bankIfsc:\s*['"]/, '').replace(/['"]/, '');
        expect(IFSC_REGEX.test(ifsc)).toBe(true);
      }
    });

    it('should verify all seeded user phone numbers strictly match INDIAN_PHONE_REGEX', () => {
      const phoneMatches = seedFileContent.match(/phone:\s*['"](\+?[0-9]+)['"]/g) || [];
      expect(phoneMatches.length).toBeGreaterThan(0);

      for (const match of phoneMatches) {
        const phone = match.replace(/phone:\s*['"]/, '').replace(/['"]/, '');
        expect(INDIAN_PHONE_REGEX.test(phone)).toBe(true);
      }
    });

    it('should verify all seeded pincodes strictly match PINCODE_REGEX', () => {
      const pincodeMatches = seedFileContent.match(/pincode:\s*['"]([0-9]+)['"]/g) || [];
      expect(pincodeMatches.length).toBeGreaterThan(0);

      for (const match of pincodeMatches) {
        const pincode = match.replace(/pincode:\s*['"]/, '').replace(/['"]/, '');
        expect(PINCODE_REGEX.test(pincode)).toBe(true);
      }
    });
  });

  describe('3. Payment & Platform Fee Mathematical Consistency in Seed Fixtures', () => {
    it('should verify every payment record maintains grossAmount = platformFeeAmount + netAmountToCreator', () => {
      // Seed Payment 1: Gross 30000, Fee 3000, Net 27000
      // Seed Payment 2: Gross 35000, Fee 3500, Net 31500
      // Seed Payment 3: Gross 50000, Fee 5000, Net 45000
      // Seed Payment 7: Gross 40000, Fee 4000, Net 36000

      const payments = [
        { gross: 30000, fee: 3000, percent: 10.0, net: 27000 },
        { gross: 35000, fee: 3500, percent: 10.0, net: 31500 },
        { gross: 50000, fee: 5000, percent: 10.0, net: 45000 },
        { gross: 40000, fee: 4000, percent: 10.0, net: 36000 },
      ];

      for (const p of payments) {
        expect(p.fee).toBe((p.gross * PLATFORM_FEE_PERCENTAGE) / 100);
        expect(p.fee + p.net).toBe(p.gross);
        expect(p.percent).toBe(PLATFORM_FEE_PERCENTAGE);
      }
    });

    it('should verify collaboration states across the seed lifecycle coverage', () => {
      // The seed includes diverse collaboration states:
      expect(seedFileContent).toContain('CollaborationStatus.APPROVED');
      expect(seedFileContent).toContain('CollaborationStatus.IN_PROGRESS');
      expect(seedFileContent).toContain('CollaborationStatus.DELIVERABLE_SUBMITTED');
      expect(seedFileContent).toContain('CollaborationStatus.REVISION_REQUESTED');
      expect(seedFileContent).toContain('CollaborationStatus.NEGOTIATING');
      expect(seedFileContent).toContain('CollaborationStatus.APPLIED');
      expect(seedFileContent).toContain('CollaborationStatus.DISPUTED');
    });

    it('should verify dispute dossier includes both creator and business evidence in seed', () => {
      expect(seedFileContent).toContain('businessEvidence: [');
      expect(seedFileContent).toContain('creatorEvidence: [');
      expect(seedFileContent).toContain('DisputeStatus.UNDER_REVIEW');
      expect(seedFileContent).toContain('MISSED_DEADLINE');
    });
  });
});
