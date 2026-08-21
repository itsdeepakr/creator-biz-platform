import 'package:flutter_test/flutter_test.dart';
import 'package:creator_app/models/user_model.dart';
import 'package:creator_app/models/creator_profile_model.dart';
import 'package:creator_app/models/collaboration_model.dart';
import 'package:creator_app/models/wallet_model.dart';
import 'package:creator_app/core/utils/helpers.dart';

void main() {
  group('Creator App Unit & Model Tests', () {
    test('UserModel JSON serialization & copyWith', () {
      final user = UserModel(
        id: 'u_100',
        email: 'creator@example.com',
        fullName: 'Test Creator',
        role: 'CREATOR',
        isEmailVerified: true,
        createdAt: DateTime(2026, 1, 1),
      );

      final json = user.toJson();
      expect(json['id'], 'u_100');
      expect(json['role'], 'CREATOR');

      final deserialized = UserModel.fromJson(json);
      expect(deserialized.email, 'creator@example.com');
      expect(deserialized.fullName, 'Test Creator');

      final updated = deserialized.copyWith(fullName: 'Updated Name');
      expect(updated.fullName, 'Updated Name');
    });

    test('CreatorProfileModel social stats & calculations', () {
      final profile = CreatorProfileModel(
        id: 'cp_1',
        userId: 'u_100',
        handle: 'techguy',
        displayName: 'Tech Guy',
        categories: ['Tech', 'Gaming'],
        instagram: SocialStat(
          platform: 'instagram',
          handle: 'techguy_ig',
          followers: 150000,
          engagementRate: 4.8,
          isConnected: true,
        ),
        youtube: SocialStat(
          platform: 'youtube',
          handle: 'techguy_yt',
          followers: 85000,
          engagementRate: 6.2,
          isConnected: true,
        ),
      );

      expect(profile.instagram.followers + profile.youtube.followers, 235000);
      expect(profile.instagram.followers, 150000);
      expect(profile.youtube.followers, 85000);
    });

    test('Collaboration 10% Platform Fee & 90% Net Payout rule', () {
      final deal = CollaborationModel(
        id: 'collab_t1',
        campaignId: 'camp_t1',
        campaignTitle: 'Test Campaign',
        brandId: 'b_1',
        brandName: 'Acme Corp',
        creatorId: 'u_100',
        creatorName: 'Tech Guy',
        agreedAmount: 50000.0,
        createdAt: DateTime(2026, 1, 1),
        updatedAt: DateTime(2026, 1, 1),
      );

      expect(deal.agreedAmount, 50000.0);
      expect(deal.platformFee, 5000.0); // 10% platform fee
      expect(deal.netPayout, 45000.0); // 90% net payout
    });

    test('Wallet Transaction Model calculations', () {
      final txn = TransactionItem(
        id: 'txn_1',
        grossAmount: 50000.0,
        type: 'PAYOUT',
        campaignTitle: 'Campaign Payout',
        brandName: 'Acme Corp',
        status: 'COMPLETED',
        createdAt: DateTime.now(),
      );

      expect(txn.grossAmount, 50000.0);
      expect(txn.feeAmount, 5000.0);
      expect(txn.netAmount, 45000.0);
    });

    test('Helpers formatting tests', () {
      expect(Helpers.formatCurrencyINR(50000), '₹50,000');
      expect(Helpers.getFollowerCount(1200), '1.2K');
      expect(Helpers.getFollowerCount(1500000), '1.5M');
      expect(Helpers.getFollowerCount(850), '850');
    });
  });
}
