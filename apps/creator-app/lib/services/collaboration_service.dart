import '../core/network/api_client.dart';
import '../models/collaboration_model.dart';

class CollaborationService {
  final ApiClient _apiClient;

  CollaborationService({required ApiClient apiClient}) : _apiClient = apiClient;

  // In-memory stateful collaborations list
  final List<CollaborationModel> _collaborations = [
    CollaborationModel(
      id: 'collab_1',
      campaignId: 'camp_101',
      campaignTitle: 'Urban Wireless Earbuds Showcase',
      brandId: 'biz_101',
      brandName: 'SoundWave Audio',
      brandLogo: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300',
      creatorId: 'creator_u_1',
      creatorName: 'Aarav Sharma',
      creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
      agreedAmount: 30000,
      status: 'IN_PROGRESS',
      deliverables: ['Instagram Reel', 'Instagram Story'],
      revisionRounds: 0,
      maxRevisionRounds: 2,
      createdAt: DateTime.now().subtract(const Duration(days: 3)),
      updatedAt: DateTime.now().subtract(const Duration(days: 1)),
    ),
    CollaborationModel(
      id: 'collab_2',
      campaignId: 'camp_102',
      campaignTitle: 'Mechanical Keyboard Unboxing & Sound Test',
      brandId: 'biz_102',
      brandName: 'KeyCraft Studios',
      brandLogo: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300',
      creatorId: 'creator_u_1',
      creatorName: 'Aarav Sharma',
      agreedAmount: 25000,
      status: 'SUBMITTED',
      deliverables: ['YouTube Short', 'Instagram Reel'],
      deliverableProofUrl: 'https://instagram.com/reel/C8xyz123',
      deliverableNotes: 'Draft reel link with ASMR typing sound and RGB lighting demonstration.',
      submittedAt: DateTime.now().subtract(const Duration(hours: 14)),
      revisionRounds: 0,
      maxRevisionRounds: 2,
      createdAt: DateTime.now().subtract(const Duration(days: 6)),
      updatedAt: DateTime.now().subtract(const Duration(hours: 14)),
    ),
    CollaborationModel(
      id: 'collab_3',
      campaignId: 'camp_103',
      campaignTitle: 'Ergonomic Standing Desk Review',
      brandId: 'biz_103',
      brandName: 'ZenSpace Living',
      brandLogo: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=300',
      creatorId: 'creator_u_1',
      creatorName: 'Aarav Sharma',
      agreedAmount: 45000,
      status: 'REVISION_REQUESTED',
      deliverables: ['YouTube Video', 'Instagram Story'],
      deliverableProofUrl: 'https://youtube.com/watch?v=preview_desk_99',
      deliverableNotes: 'First cut of the 10-minute setup and cable management guide.',
      revisionRounds: 1,
      maxRevisionRounds: 2,
      revisionNotes: 'Great video! Please add a clear 10-second close-up of the dual-motor control keypad and mention the 5-year warranty.',
      submittedAt: DateTime.now().subtract(const Duration(days: 2)),
      createdAt: DateTime.now().subtract(const Duration(days: 8)),
      updatedAt: DateTime.now().subtract(const Duration(hours: 6)),
    ),
    CollaborationModel(
      id: 'collab_4',
      campaignId: 'camp_104',
      campaignTitle: 'Smartphone Camera Gimbal Stabilization Test',
      brandId: 'biz_104',
      brandName: 'GlidePro Gear',
      creatorId: 'creator_u_1',
      creatorName: 'Aarav Sharma',
      agreedAmount: 38000,
      status: 'COMPLETED',
      deliverables: ['Instagram Reel', 'Instagram Post'],
      deliverableProofUrl: 'https://instagram.com/reel/C7abc456',
      deliverableNotes: 'Published high-retention reel with 85k views.',
      submittedAt: DateTime.now().subtract(const Duration(days: 14)),
      approvedAt: DateTime.now().subtract(const Duration(days: 10)),
      completedAt: DateTime.now().subtract(const Duration(days: 10)),
      hasCreatorReviewed: true,
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
        return list
            .map((e) => CollaborationModel.fromJson(e as Map<String, dynamic>))
            .toList();
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

    return _collaborations.firstWhere(
      (c) => c.id == id,
      orElse: () => _collaborations.first,
    );
  }

  Future<CollaborationModel> submitDeliverable({
    required String collaborationId,
    required String proofUrl,
    required String notes,
  }) async {
    try {
      final response = await _apiClient.post(
        '/collaborations/$collaborationId/submit',
        data: {
          'proofUrl': proofUrl,
          'notes': notes,
        },
      );
      if (response.statusCode == 200) {
        return CollaborationModel.fromJson(response.data as Map<String, dynamic>);
      }
    } catch (_) {}

    final index = _collaborations.indexWhere((c) => c.id == collaborationId);
    if (index != -1) {
      final current = _collaborations[index];
      final updated = current.copyWith(
        status: 'SUBMITTED',
        deliverableProofUrl: proofUrl,
        deliverableNotes: notes,
        submittedAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );
      _collaborations[index] = updated;
      return updated;
    }
    throw Exception('Collaboration not found');
  }
}
