import '../core/network/api_client.dart';
import '../models/collaboration_model.dart';

class CollaborationService {
  final ApiClient _apiClient;

  CollaborationService({required ApiClient apiClient}) : _apiClient = apiClient;

  final List<CollaborationModel> _collaborations = [
    CollaborationModel(
      id: 'collab_1',
      campaignId: 'camp_1',
      campaignTitle: 'Flagship Smartphone Launch - Tech Reel & Unboxing',
      businessId: 'biz_u_1',
      companyName: 'Apex Innovations Pvt Ltd',
      creatorId: 'creator_u_1',
      creatorName: 'Aarav Sharma',
      creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
      agreedAmount: 42000,
      status: 'SUBMITTED',
      deliverables: ['Instagram Reel', 'Instagram Story'],
      deliverableProofUrl: 'https://instagram.com/reel/C9tech_phone_review',
      deliverableNotes: 'Completed 4K 60fps unboxing reel emphasizing AI low-light camera and 120W charging demonstration.',
      submittedAt: DateTime.now().subtract(const Duration(hours: 5)),
      revisionRounds: 0,
      maxRevisionRounds: 2,
      isEscrowFunded: true,
      escrowPaymentId: 'pay_rzp_escrow_88921',
      createdAt: DateTime.now().subtract(const Duration(days: 4)),
      updatedAt: DateTime.now().subtract(const Duration(hours: 5)),
    ),
    CollaborationModel(
      id: 'collab_2',
      campaignId: 'camp_2',
      campaignTitle: 'Wireless Gaming Earbuds Sound Test & Review',
      businessId: 'biz_u_1',
      companyName: 'Apex Innovations Pvt Ltd',
      creatorId: 'creator_u_6',
      creatorName: 'Kunal Gamer',
      creatorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      agreedAmount: 30000,
      status: 'IN_PROGRESS',
      deliverables: ['YouTube Short', 'Instagram Reel'],
      revisionRounds: 0,
      maxRevisionRounds: 2,
      isEscrowFunded: true,
      escrowPaymentId: 'pay_rzp_escrow_88922',
      createdAt: DateTime.now().subtract(const Duration(days: 2)),
      updatedAt: DateTime.now().subtract(const Duration(days: 2)),
    ),
    CollaborationModel(
      id: 'collab_3',
      campaignId: 'camp_10',
      campaignTitle: 'Smart Home Security Cam Launch',
      businessId: 'biz_u_1',
      companyName: 'Apex Innovations Pvt Ltd',
      creatorId: 'creator_u_2',
      creatorName: 'Priya Verma',
      creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      agreedAmount: 50000,
      status: 'COMPLETED',
      deliverables: ['Instagram Reel', 'Instagram Post'],
      deliverableProofUrl: 'https://instagram.com/p/camera_security_priya',
      deliverableNotes: 'Published reel with 140k impressions.',
      submittedAt: DateTime.now().subtract(const Duration(days: 12)),
      approvedAt: DateTime.now().subtract(const Duration(days: 10)),
      completedAt: DateTime.now().subtract(const Duration(days: 10)),
      hasBrandReviewed: true,
      createdAt: DateTime.now().subtract(const Duration(days: 20)),
      updatedAt: DateTime.now().subtract(const Duration(days: 10)),
    ),
  ];

  Future<List<CollaborationModel>> getMyCollaborations({String? status}) async {
    try {
      final response = await _apiClient.get(
        '/collaborations',
        queryParameters: {
          if (status != null && status != 'ALL') 'status': status,
        },
      );
      if (response.statusCode == 200) {
        final list = response.data as List<dynamic>;
        return list.map((e) => CollaborationModel.fromJson(e as Map<String, dynamic>)).toList();
      }
    } catch (_) {}

    if (status != null && status != 'ALL') {
      return _collaborations
          .where((c) => c.status.toUpperCase() == status.toUpperCase())
          .toList();
    }
    return _collaborations;
  }

  Future<CollaborationModel?> getCollaborationById(String id) async {
    try {
      final response = await _apiClient.get('/collaborations/$id');
      if (response.statusCode == 200) {
        return CollaborationModel.fromJson(response.data as Map<String, dynamic>);
      }
    } catch (_) {}

    return _collaborations.firstWhere((c) => c.id == id, orElse: () => _collaborations.first);
  }

  Future<CollaborationModel> requestRevision({
    required String collaborationId,
    required String notes,
  }) async {
    try {
      final response = await _apiClient.post(
        '/collaborations/$collaborationId/request-revision',
        data: {'notes': notes},
      );
      if (response.statusCode == 200) {
        return CollaborationModel.fromJson(response.data as Map<String, dynamic>);
      }
    } catch (_) {}

    final index = _collaborations.indexWhere((c) => c.id == collaborationId);
    if (index != -1) {
      final current = _collaborations[index];
      final updated = current.copyWith(
        status: 'REVISION_REQUESTED',
        revisionRounds: current.revisionRounds + 1,
        revisionNotes: notes,
        updatedAt: DateTime.now(),
      );
      _collaborations[index] = updated;
      return updated;
    }
    throw Exception('Collaboration not found');
  }

  Future<CollaborationModel> approveDeliverableAndReleasePayout(String collaborationId) async {
    try {
      final response = await _apiClient.post(
        '/collaborations/$collaborationId/approve',
      );
      if (response.statusCode == 200) {
        return CollaborationModel.fromJson(response.data as Map<String, dynamic>);
      }
    } catch (_) {}

    final index = _collaborations.indexWhere((c) => c.id == collaborationId);
    if (index != -1) {
      final current = _collaborations[index];
      final updated = current.copyWith(
        status: 'COMPLETED',
        approvedAt: DateTime.now(),
        completedAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );
      _collaborations[index] = updated;
      return updated;
    }
    throw Exception('Collaboration not found');
  }
}
