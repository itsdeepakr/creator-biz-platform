import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/storage/storage_service.dart';
import '../core/network/api_client.dart';
import '../models/user_model.dart';
import '../models/business_profile_model.dart';
import '../models/creator_model.dart';
import '../models/campaign_model.dart';
import '../models/bid_model.dart';
import '../models/collaboration_model.dart';
import '../models/chat_model.dart';
import '../models/dispute_model.dart';
import '../models/payment_model.dart';
import '../services/auth_service.dart';
import '../services/business_service.dart';
import '../services/campaign_service.dart';
import '../services/creator_discovery_service.dart';
import '../services/collaboration_service.dart';
import '../services/payment_service.dart';
import '../services/dispute_service.dart';
import '../services/chat_service.dart';
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

final businessServiceProvider = Provider<BusinessService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return BusinessService(apiClient: apiClient);
});

final campaignServiceProvider = Provider<CampaignService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return CampaignService(apiClient: apiClient);
});

final creatorDiscoveryServiceProvider = Provider<CreatorDiscoveryService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return CreatorDiscoveryService(apiClient: apiClient);
});

final collaborationServiceProvider = Provider<CollaborationService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return CollaborationService(apiClient: apiClient);
});

final paymentServiceProvider = Provider<PaymentService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return PaymentService(apiClient: apiClient);
});

final disputeServiceProvider = Provider<DisputeService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return DisputeService(apiClient: apiClient);
});

final chatServiceProvider = Provider<ChatService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return ChatService(apiClient: apiClient);
});

final reviewServiceProvider = Provider<ReviewService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return ReviewService(apiClient: apiClient);
});

// Auth Notifier
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

  Future<bool> submitGstKyc({
    required String companyName,
    required String gstin,
    required String panNumber,
    required String contactPerson,
    String? docName,
  }) async {
    try {
      final updated = await _authService.submitGstKyc(
        companyName: companyName,
        gstin: gstin,
        panNumber: panNumber,
        contactPerson: contactPerson,
        docName: docName,
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
final myBusinessProfileProvider = FutureProvider<BusinessProfileModel>((ref) async {
  final service = ref.watch(businessServiceProvider);
  return await service.getMyProfile();
});

// Campaigns Provider
final myCampaignsProvider =
    FutureProvider.family<List<CampaignModel>, String?>((ref, status) async {
  final service = ref.watch(campaignServiceProvider);
  return await service.getMyCampaigns(status: status);
});

final campaignBidsProvider =
    FutureProvider.family<List<BidModel>, String>((ref, campaignId) async {
  final service = ref.watch(campaignServiceProvider);
  return await service.getBidsForCampaign(campaignId);
});

// Creator Search Provider
final searchCreatorsProvider =
    FutureProvider.family<List<CreatorModel>, ({String? query, String? category, int? minFollowers, double? minEngagement, double? minRating})>(
        (ref, params) async {
  final service = ref.watch(creatorDiscoveryServiceProvider);
  return await service.searchCreators(
    query: params.query,
    category: params.category,
    minFollowers: params.minFollowers,
    minEngagement: params.minEngagement,
    minRating: params.minRating,
  );
});

// Collaborations Provider
final businessCollaborationsProvider =
    FutureProvider.family<List<CollaborationModel>, String?>((ref, status) async {
  final service = ref.watch(collaborationServiceProvider);
  return await service.getMyCollaborations(status: status);
});

// Payment Provider
final escrowHistoryProvider = FutureProvider<List<EscrowPaymentOrder>>((ref) async {
  final service = ref.watch(paymentServiceProvider);
  return await service.getPaymentHistory();
});

// Disputes Provider
final disputesProvider = FutureProvider<List<DisputeModel>>((ref) async {
  final service = ref.watch(disputeServiceProvider);
  return await service.getDisputes();
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
