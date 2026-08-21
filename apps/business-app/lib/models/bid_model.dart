class BidModel {
  final String id;
  final String campaignId;
  final String campaignTitle;
  final String creatorId;
  final String creatorName;
  final String? creatorAvatar;
  final double creatorRating;
  final int creatorFollowers;
  final double amount;
  final String proposal;
  final List<String> deliverables;
  final String? estimatedTimeline;
  final String status; // 'PENDING', 'ACCEPTED', 'REJECTED', 'COUNTERED', 'WITHDRAWN'
  final double? counterAmount;
  final String? counterNotes;
  final DateTime createdAt;

  BidModel({
    required this.id,
    required this.campaignId,
    required this.campaignTitle,
    required this.creatorId,
    required this.creatorName,
    this.creatorAvatar,
    this.creatorRating = 5.0,
    this.creatorFollowers = 0,
    required this.amount,
    required this.proposal,
    this.deliverables = const [],
    this.estimatedTimeline,
    this.status = 'PENDING',
    this.counterAmount,
    this.counterNotes,
    required this.createdAt,
  });

  factory BidModel.fromJson(Map<String, dynamic> json) {
    return BidModel(
      id: json['id'] as String? ?? '',
      campaignId: json['campaignId'] as String? ?? '',
      campaignTitle: json['campaignTitle'] as String? ??
          (json['campaign'] as Map<String, dynamic>?)?['title'] as String? ??
          'Campaign',
      creatorId: json['creatorId'] as String? ?? '',
      creatorName: json['creatorName'] as String? ??
          (json['creator'] as Map<String, dynamic>?)?['displayName'] as String? ??
          (json['creator'] as Map<String, dynamic>?)?['name'] as String? ??
          'Creator',
      creatorAvatar: json['creatorAvatar'] as String? ??
          (json['creator'] as Map<String, dynamic>?)?['avatarUrl'] as String?,
      creatorRating: (json['creatorRating'] as num?)?.toDouble() ??
          ((json['creator'] as Map<String, dynamic>?)?['rating'] as num?)?.toDouble() ??
          5.0,
      creatorFollowers: (json['creatorFollowers'] as num?)?.toInt() ??
          ((json['creator'] as Map<String, dynamic>?)?['followerCount'] as num?)?.toInt() ??
          0,
      amount: (json['amount'] as num?)?.toDouble() ?? 0.0,
      proposal: json['proposal'] as String? ?? json['message'] as String? ?? '',
      deliverables: (json['deliverables'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      estimatedTimeline: json['estimatedTimeline'] as String?,
      status: json['status'] as String? ?? 'PENDING',
      counterAmount: (json['counterAmount'] as num?)?.toDouble(),
      counterNotes: json['counterNotes'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'] as String) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'campaignId': campaignId,
      'campaignTitle': campaignTitle,
      'creatorId': creatorId,
      'creatorName': creatorName,
      'creatorAvatar': creatorAvatar,
      'creatorRating': creatorRating,
      'creatorFollowers': creatorFollowers,
      'amount': amount,
      'proposal': proposal,
      'deliverables': deliverables,
      'estimatedTimeline': estimatedTimeline,
      'status': status,
      'counterAmount': counterAmount,
      'counterNotes': counterNotes,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  BidModel copyWith({
    String? id,
    String? campaignId,
    String? campaignTitle,
    String? creatorId,
    String? creatorName,
    String? creatorAvatar,
    double? creatorRating,
    int? creatorFollowers,
    double? amount,
    String? proposal,
    List<String>? deliverables,
    String? estimatedTimeline,
    String? status,
    double? counterAmount,
    String? counterNotes,
    DateTime? createdAt,
  }) {
    return BidModel(
      id: id ?? this.id,
      campaignId: campaignId ?? this.campaignId,
      campaignTitle: campaignTitle ?? this.campaignTitle,
      creatorId: creatorId ?? this.creatorId,
      creatorName: creatorName ?? this.creatorName,
      creatorAvatar: creatorAvatar ?? this.creatorAvatar,
      creatorRating: creatorRating ?? this.creatorRating,
      creatorFollowers: creatorFollowers ?? this.creatorFollowers,
      amount: amount ?? this.amount,
      proposal: proposal ?? this.proposal,
      deliverables: deliverables ?? this.deliverables,
      estimatedTimeline: estimatedTimeline ?? this.estimatedTimeline,
      status: status ?? this.status,
      counterAmount: counterAmount ?? this.counterAmount,
      counterNotes: counterNotes ?? this.counterNotes,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
