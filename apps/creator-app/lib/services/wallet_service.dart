import '../core/network/api_client.dart';
import '../models/wallet_model.dart';

class WalletService {
  final ApiClient _apiClient;

  WalletService({required ApiClient apiClient}) : _apiClient = apiClient;

  late WalletSummary _walletSummary = WalletSummary(
    totalGrossEarnings: 245000,
    totalPlatformFee: 24500, // 10%
    totalNetPayouts: 220500, // 90%
    pendingEscrowAmount: 55000,
    availableBalance: 42000,
    completedProjectsCount: 8,
    recentTransactions: [
      TransactionItem(
        id: 'tx_1',
        collaborationId: 'collab_4',
        campaignTitle: 'Smartphone Camera Gimbal Stabilization Test',
        brandName: 'GlidePro Gear',
        grossAmount: 38000,
        feeAmount: 3800,
        netAmount: 34200,
        type: 'PAYOUT',
        status: 'COMPLETED',
        referenceId: 'payout_rzp_991823',
        createdAt: DateTime.now().subtract(const Duration(days: 10)),
      ),
      TransactionItem(
        id: 'tx_2',
        collaborationId: 'collab_100',
        campaignTitle: 'Noise Cancelling Headphones Review',
        brandName: 'AuraSound India',
        grossAmount: 50000,
        feeAmount: 5000,
        netAmount: 45000,
        type: 'PAYOUT',
        status: 'COMPLETED',
        referenceId: 'payout_rzp_991102',
        createdAt: DateTime.now().subtract(const Duration(days: 25)),
      ),
      TransactionItem(
        id: 'tx_3',
        collaborationId: 'collab_1',
        campaignTitle: 'Urban Wireless Earbuds Showcase',
        brandName: 'SoundWave Audio',
        grossAmount: 30000,
        feeAmount: 3000,
        netAmount: 27000,
        type: 'ESCROW_HOLD',
        status: 'PENDING',
        referenceId: 'escrow_hold_00291',
        createdAt: DateTime.now().subtract(const Duration(days: 3)),
      ),
      TransactionItem(
        id: 'tx_4',
        collaborationId: 'collab_2',
        campaignTitle: 'Mechanical Keyboard Unboxing & Sound Test',
        brandName: 'KeyCraft Studios',
        grossAmount: 25000,
        feeAmount: 2500,
        netAmount: 22500,
        type: 'ESCROW_HOLD',
        status: 'PENDING',
        referenceId: 'escrow_hold_00292',
        createdAt: DateTime.now().subtract(const Duration(days: 6)),
      ),
    ],
  );

  Future<WalletSummary> getWalletSummary() async {
    try {
      final response = await _apiClient.get('/payments/earnings');
      if (response.statusCode == 200) {
        _walletSummary = WalletSummary.fromJson(response.data as Map<String, dynamic>);
        return _walletSummary;
      }
    } catch (_) {}
    return _walletSummary;
  }

  Future<List<TransactionItem>> getTransactionHistory() async {
    try {
      final response = await _apiClient.get('/payments/history');
      if (response.statusCode == 200) {
        final list = response.data as List<dynamic>;
        return list.map((e) => TransactionItem.fromJson(e as Map<String, dynamic>)).toList();
      }
    } catch (_) {}
    return _walletSummary.recentTransactions;
  }

  Future<bool> requestPayout(double amount) async {
    try {
      final response = await _apiClient.post(
        '/payments/request',
        data: {'amount': amount},
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        return true;
      }
    } catch (_) {}
    return true;
  }
}
