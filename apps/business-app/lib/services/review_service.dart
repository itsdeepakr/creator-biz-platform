import '../core/network/api_client.dart';
import '../models/review_model.dart';

class ReviewService {
  final ApiClient _apiClient;

  ReviewService({required ApiClient apiClient}) : _apiClient = apiClient;

  final List<ReviewModel> _reviews = [];

  Future<ReviewModel> leaveReview({
    required String collaborationId,
    required String campaignTitle,
    required String targetCreatorId,
    required double rating,
    double? communicationRating,
    double? qualityRating,
    double? timelinessRating,
    required String comment,
  }) async {
    final newRev = ReviewModel(
      id: 'rev_${DateTime.now().millisecondsSinceEpoch}',
      collaborationId: collaborationId,
      campaignTitle: campaignTitle,
      reviewerId: 'biz_u_1',
      reviewerName: 'Apex Innovations Pvt Ltd',
      reviewerRole: 'BUSINESS',
      targetId: targetCreatorId,
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
        data: newRev.toJson(),
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        final created = ReviewModel.fromJson(response.data as Map<String, dynamic>);
        _reviews.insert(0, created);
        return created;
      }
    } catch (_) {}

    _reviews.insert(0, newRev);
    return newRev;
  }
}
