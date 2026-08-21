import '../core/network/api_client.dart';
import '../models/review_model.dart';

class ReviewService {
  final ApiClient _apiClient;

  ReviewService({required ApiClient apiClient}) : _apiClient = apiClient;

  final List<ReviewModel> _reviews = [
    ReviewModel(
      id: 'rev_1',
      collaborationId: 'collab_4',
      campaignTitle: 'Smartphone Camera Gimbal Stabilization Test',
      reviewerId: 'biz_104',
      reviewerName: 'GlidePro Gear',
      reviewerAvatar: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=300',
      reviewerRole: 'BUSINESS',
      targetId: 'creator_u_1',
      rating: 5.0,
      communicationRating: 5.0,
      qualityRating: 5.0,
      timelinessRating: 5.0,
      comment: 'Exceptional creator! Aarav produced high-quality camera stabilization footage and delivered on schedule without any revisions needed.',
      createdAt: DateTime.now().subtract(const Duration(days: 10)),
    ),
    ReviewModel(
      id: 'rev_2',
      collaborationId: 'collab_100',
      campaignTitle: 'Noise Cancelling Headphones Review',
      reviewerId: 'biz_105',
      reviewerName: 'AuraSound India',
      reviewerRole: 'BUSINESS',
      targetId: 'creator_u_1',
      rating: 4.8,
      communicationRating: 4.8,
      qualityRating: 5.0,
      timelinessRating: 4.5,
      comment: 'Very professional and responsive. Great engagement on the YouTube long-form review.',
      createdAt: DateTime.now().subtract(const Duration(days: 25)),
    ),
  ];

  Future<List<ReviewModel>> getReviewsForTarget(String targetId) async {
    try {
      final response = await _apiClient.get('/reviews/user/$targetId');
      if (response.statusCode == 200) {
        final list = response.data as List<dynamic>;
        return list.map((e) => ReviewModel.fromJson(e as Map<String, dynamic>)).toList();
      }
    } catch (_) {}
    return _reviews;
  }

  Future<ReviewModel> leaveReview({
    required String collaborationId,
    required String campaignTitle,
    required String targetId,
    required double rating,
    double? communicationRating,
    double? qualityRating,
    double? timelinessRating,
    required String comment,
  }) async {
    final newReview = ReviewModel(
      id: 'rev_${DateTime.now().millisecondsSinceEpoch}',
      collaborationId: collaborationId,
      campaignTitle: campaignTitle,
      reviewerId: 'creator_u_1',
      reviewerName: 'Aarav Sharma',
      reviewerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
      reviewerRole: 'CREATOR',
      targetId: targetId,
      rating: rating,
      communicationRating: communicationRating,
      qualityRating: qualityRating,
      timelinessRating: timelinessRating,
      comment: comment,
      createdAt: DateTime.now(),
    );

    try {
      final response = await _apiClient.post(
        '/reviews',
        data: newReview.toJson(),
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        final created = ReviewModel.fromJson(response.data as Map<String, dynamic>);
        _reviews.insert(0, created);
        return created;
      }
    } catch (_) {}

    _reviews.insert(0, newReview);
    return newReview;
  }
}
