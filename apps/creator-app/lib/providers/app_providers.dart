import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/storage/storage_service.dart';
import '../core/network/api_client.dart';
import '../models/user_model.dart';
import '../models/creator_profile_model.dart';
import '../models/campaign_model.dart';
import '../models/bid_model.dart';
import '../models/collaboration_model.dart';
import '../models/chat_model.dart';
import '../models/wallet_model.dart';
import '../services/auth_service.dart';
import '../services/creator_service.dart';
import '../services/campaign_service.dart';
import '../services/collaboration_service.dart';
import '../services/chat_service.dart';
import '../services/wallet_service.dart';
import '../services/review_service.dart';

// Storage & Network
final storageServiceProvider = Provider<StorageService>((ref) {
  return StorageService();
});

final apiClientProvider = Provider<ApiClient>((ref) {
  final storageService = ref.watch(storageServiceProvider);
  return ApiClient(storageService: storageService);
});

// Services
final authServiceProvider = Provider<AuthService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  final storageService = ref.watch(storageServiceProvider);
  return AuthService(apiClient: apiClient, storageService: storageService);
});

final creatorServiceProvider = Provider<CreatorService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return CreatorService(apiClient: apiClient);
});

final campaignServiceProvider = Provider<CampaignService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return CampaignService(apiClient: apiClient);
});

final collaborationServiceProvider = Provider<CollaborationService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return CollaborationService(apiClient: apiClient);
});

final chatServiceProvider = Provider<ChatService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return ChatService(apiClient: apiClient);
});

final walletServiceProvider = Provider<WalletService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return WalletService(apiClient: apiClient);
});

final reviewServiceProvider = Provider<ReviewService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return ReviewService(apiClient: apiClient);
});

// Auth State Notifier
class AuthNotifier extends StateNotifier<AsyncValue<UserModel?>> {
  final AuthService _authService;

  AuthNotifier(this._authService) : super(const AsyncValue.loading()) {
    checkAuth();
  }

  Future<void> checkAuth() async {
    state = const AsyncValue.loading();
    try {
      final user = await _authService.checkCurrentUser();
      state = AsyncValue.data(user);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<bool> login(String email, String password) async {
    state = const AsyncValue.loading();
    try {
      final user = await _authService.login(email, password);
      state = AsyncValue.data(user);
      return true;
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return false;
    }
  }

  Future<bool> register(String fullName, String email, String password, String? phone) async {
    state = const AsyncValue.loading();
    try {
      final user = await _authService.register(
        fullName: fullName,
        email: email,
        password: password,
        phone: phone,
      );
      state = AsyncValue.data(user);
      return true;
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return false;
    }
  }

  Future<bool> verifyOtp(String otp) async {
    try {
      final success = await _authService.verifyOtp(otp);
      if (success) {
        state = AsyncValue.data(_authService.currentUser);
      }
      return success;
    } catch (_) {
      return false;
    }
  }

  Future<bool> submitKyc({
    required String panNumber,
    required String bankAccountNumber,
    required String ifscCode,
    required String accountHolderName,
  }) async {
    try {
      final updated = await _authService.submitKyc(
        panNumber: panNumber,
        bankAccountNumber: bankAccountNumber,
        ifscCode: ifscCode,
        accountHolderName: accountHolderName,
      );
      state = AsyncValue.data(updated);
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    state = const AsyncValue.data(null);
  }
}

final authStateProvider = StateNotifierProvider<AuthNotifier, AsyncValue<UserModel?>>((ref) {
  final authService = ref.watch(authServiceProvider);
  return AuthNotifier(authService);
});

// Profile Providers
final myProfileProvider = FutureProvider<CreatorProfileModel>((ref) async {
  final service = ref.watch(creatorServiceProvider);
  return await service.getMyProfile();
});

final discoverCreatorsProvider =
    FutureProvider.family<List<CreatorProfileModel>, ({String? query, String? category})>(
        (ref, params) async {
  final service = ref.watch(creatorServiceProvider);
  return await service.getDiscoverCreators(query: params.query, category: params.category);
});

// Campaign & Bids Providers
final campaignFeedProvider =
    FutureProvider.family<List<CampaignModel>, ({String? category, double? minBudget, double? maxBudget, String? query})>(
        (ref, params) async {
  final service = ref.watch(campaignServiceProvider);
  return await service.getCampaignFeed(
    category: params.category,
    minBudget: params.minBudget,
    maxBudget: params.maxBudget,
    query: params.query,
  );
});

final myBidsProvider = FutureProvider<List<BidModel>>((ref) async {
  final service = ref.watch(campaignServiceProvider);
  return await service.getMyBids();
});

// Collaboration Providers
final collaborationsProvider =
    FutureProvider.family<List<CollaborationModel>, String?>((ref, status) async {
  final service = ref.watch(collaborationServiceProvider);
  return await service.getMyCollaborations(status: status);
});

// Chat Providers
final conversationsProvider = FutureProvider<List<Conversation>>((ref) async {
  final service = ref.watch(chatServiceProvider);
  return await service.getConversations();
});

final chatMessagesProvider =
    FutureProvider.family<List<ChatMessage>, String>((ref, conversationId) async {
  final service = ref.watch(chatServiceProvider);
  return await service.getMessages(conversationId);
});

// Wallet Provider
final walletSummaryProvider = FutureProvider<WalletSummary>((ref) async {
  final service = ref.watch(walletServiceProvider);
  return await service.getWalletSummary();
});
