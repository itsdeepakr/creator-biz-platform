class ReviewModel {
  final String id;
  final String collaborationId;
  final String campaignTitle;
  final String reviewerId;
  final String reviewerName;
  final String? reviewerAvatar;
  final String reviewerRole; // 'BUSINESS', 'CREATOR'
  final String targetId;
  final double rating;
  final double? communicationRating;
  final double? qualityRating;
  final double? timelinessRating;
  final String comment;
  final DateTime createdAt;

  ReviewModel({
    required this.id,
    required this.collaborationId,
    required this.campaignTitle,
    required this.reviewerId,
    required this.reviewerName,
    this.reviewerAvatar,
    required this.reviewerRole,
    required this.targetId,
    required this.rating,
    this.communicationRating,
    this.qualityRating,
    this.timelinessRating,
    required this.comment,
    required this.createdAt,
  });

  factory ReviewModel.fromJson(Map<String, dynamic> json) {
    return ReviewModel(
      id: json['id'] as String? ?? '',
      collaborationId: json['collaborationId'] as String? ?? '',
      campaignTitle: json['campaignTitle'] as String? ?? 'Collaboration',
      reviewerId: json['reviewerId'] as String? ?? '',
      reviewerName: json['reviewerName'] as String? ?? 'Reviewer',
      reviewerAvatar: json['reviewerAvatar'] as String?,
      reviewerRole: json['reviewerRole'] as String? ?? 'BUSINESS',
      targetId: json['targetId'] as String? ?? '',
      rating: (json['rating'] as num?)?.toDouble() ?? 5.0,
      communicationRating: (json['communicationRating'] as num?)?.toDouble(),
      qualityRating: (json['qualityRating'] as num?)?.toDouble(),
      timelinessRating: (json['timelinessRating'] as num?)?.toDouble(),
      comment: json['comment'] as String? ?? '',
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'] as String) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'collaborationId': collaborationId,
      'campaignTitle': campaignTitle,
      'reviewerId': reviewerId,
      'reviewerName': reviewerName,
      'reviewerAvatar': reviewerAvatar,
      'reviewerRole': reviewerRole,
      'targetId': targetId,
      'rating': rating,
      'communicationRating': communicationRating,
      'qualityRating': qualityRating,
      'timelinessRating': timelinessRating,
      'comment': comment,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
