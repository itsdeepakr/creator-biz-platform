import 'package:flutter_test/flutter_test.dart';
import 'package:business_app/models/user_model.dart';
import 'package:business_app/models/business_profile_model.dart';
import 'package:business_app/models/campaign_model.dart';
import 'package:business_app/models/collaboration_model.dart';
import 'package:business_app/models/payment_model.dart';
import 'package:business_app/core/utils/helpers.dart';

void main() {
  group('Business App Unit & Model Tests', () {
    test('UserModel JSON serialization & copyWith', () {
      final user = UserModel(
        id: 'b_100',
        email: 'brand@apex.tech',
        fullName: 'Apex Tech Brand Lead',
        role: 'BUSINESS',
        kycStatus: 'VERIFIED',
        createdAt: DateTime(2026, 1, 1),
      );

      final json = user.toJson();
      expect(json['id'], 'b_100');
      expect(json['role'], 'BUSINESS');

      final deserialized = UserModel.fromJson(json);
      expect(deserialized.email, 'brand@apex.tech');
      expect(deserialized.kycStatus, 'VERIFIED');
    });

    test('BusinessProfileModel GSTIN and KYC verification state', () {
      final profile = BusinessProfileModel(
        id: 'bp_1',
        userId: 'b_100',
        companyName: 'Apex Innovations Pvt Ltd',
        industry: 'Consumer Tech',
        gstin: '29ABCDE1234F1Z5',
        contactPersonName: 'Pooja Hegde',
        isGstVerified: true,
        kycStatus: 'VERIFIED',
        createdAt: DateTime(2026, 1, 1),
      );

      expect(profile.companyName, 'Apex Innovations Pvt Ltd');
      expect(profile.gstin, '29ABCDE1234F1Z5');
      expect(profile.isGstVerified, isTrue);
    });

    test('CampaignModel budget range and deliverables verification', () {
      final campaign = CampaignModel(
        id: 'camp_101',
        title: 'Spring Campaign Launch',
        description: 'Launch campaign for smart devices',
        businessId: 'b_100',
        companyName: 'Apex Innovations',
        category: 'Tech',
        budgetMin: 30000,
        budgetMax: 60000,
        deliverables: ['Instagram Reel', 'YouTube Short'],
        deadline: DateTime(2026, 4, 30),
        createdAt: DateTime(2026, 1, 1),
      );

      expect(campaign.budgetMin, 30000);
      expect(campaign.budgetMax, 60000);
      expect(campaign.deliverables.length, 2);
    });

    test('Collaboration 10% Platform Fee & 90% Net Payout rule', () {
      final deal = CollaborationModel(
        id: 'collab_t1',
        campaignId: 'camp_101',
        campaignTitle: 'Spring Campaign Launch',
        businessId: 'b_100',
        companyName: 'Apex Innovations',
        creatorId: 'c_1',
        creatorName: 'Aarav Sharma',
        agreedAmount: 40000.0,
        createdAt: DateTime(2026, 1, 1),
        updatedAt: DateTime(2026, 1, 1),
      );

      expect(deal.agreedAmount, 40000.0);
      expect(deal.platformFee, 4000.0); // 10% platform fee
      expect(deal.netPayout, 36000.0); // 90% creator net payout
    });

    test('EscrowPaymentOrder status & serialization', () {
      final order = EscrowPaymentOrder(
        orderId: 'order_123',
        collaborationId: 'collab_t1',
        campaignTitle: 'Spring Campaign Launch',
        creatorName: 'Aarav Sharma',
        amount: 40000.0,
        status: 'HELD_IN_ESCROW',
        razorpayPaymentId: 'pay_rzp_test_1',
        createdAt: DateTime(2026, 1, 1),
      );

      final json = order.toJson();
      expect(json['status'], 'HELD_IN_ESCROW');
      expect(json['amount'], 40000.0);
    });

    test('Helpers formatting tests', () {
      expect(Helpers.formatCurrencyINR(75000), '₹75,000');
      expect(Helpers.getFollowerCount(240000), '240.0K');
      expect(Helpers.getFollowerCount(1200000), '1.2M');
    });
  });
}
