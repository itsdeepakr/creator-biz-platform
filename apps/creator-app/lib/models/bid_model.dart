class BidModel {
  final String id;
  final String campaignId;
  final String campaignTitle;
  final String? brandName;
  final String? brandLogo;
  final String creatorId;
  final String creatorName;
  final String? creatorAvatar;
  final double amount;
  final String proposal;
  final List<String> deliverables;
  final String? estimatedTimeline;
  final String status; // 'PENDING', 'ACCEPTED', 'REJECTED', 'COUNTERED', 'WITHDRAWN'
  final double? counterAmount;
  final String? counterNotes;
  final DateTime createdAt;
  final DateTime updatedAt;

  BidModel({
    required this.id,
    required this.campaignId,
    required this.campaignTitle,
    this.brandName,
    this.brandLogo,
    required this.creatorId,
    required this.creatorName,
    this.creatorAvatar,
    required this.amount,
    required this.proposal,
    this.deliverables = const [],
    this.estimatedTimeline,
    this.status = 'PENDING',
    this.counterAmount,
    this.counterNotes,
    required this.createdAt,
    required this.updatedAt,
  });

  factory BidModel.fromJson(Map<String, dynamic> json) {
    return BidModel(
      id: json['id'] as String? ?? '',
      campaignId: json['campaignId'] as String? ?? '',
      campaignTitle: json['campaignTitle'] as String? ??
          (json['campaign'] as Map<String, dynamic>?)?['title'] as String? ??
          'Campaign',
      brandName: json['brandName'] as String? ??
          (json['campaign'] as Map<String, dynamic>?)?['brandName'] as String? ??
          ((json['campaign'] as Map<String, dynamic>?)?['business']
              as Map<String, dynamic>?)?['companyName'] as String? ??
          'Brand',
      brandLogo: json['brandLogo'] as String? ??
          (json['campaign'] as Map<String, dynamic>?)?['brandLogo'] as String? ??
          ((json['campaign'] as Map<String, dynamic>?)?['business']
              as Map<String, dynamic>?)?['logoUrl'] as String?,
      creatorId: json['creatorId'] as String? ?? '',
      creatorName: json['creatorName'] as String? ??
          (json['creator'] as Map<String, dynamic>?)?['displayName'] as String? ??
          'Creator',
      creatorAvatar: json['creatorAvatar'] as String? ??
          (json['creator'] as Map<String, dynamic>?)?['avatarUrl'] as String?,
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
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'] as String) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'campaignId': campaignId,
      'campaignTitle': campaignTitle,
      'brandName': brandName,
      'brandLogo': brandLogo,
      'creatorId': creatorId,
      'creatorName': creatorName,
      'creatorAvatar': creatorAvatar,
      'amount': amount,
      'proposal': proposal,
      'deliverables': deliverables,
      'estimatedTimeline': estimatedTimeline,
      'status': status,
      'counterAmount': counterAmount,
      'counterNotes': counterNotes,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  BidModel copyWith({
    String? id,
    String? campaignId,
    String? campaignTitle,
    String? brandName,
    String? brandLogo,
    String? creatorId,
    String? creatorName,
    String? creatorAvatar,
    double? amount,
    String? proposal,
    List<String>? deliverables,
    String? estimatedTimeline,
    String? status,
    double? counterAmount,
    String? counterNotes,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return BidModel(
      id: id ?? this.id,
      campaignId: campaignId ?? this.campaignId,
      campaignTitle: campaignTitle ?? this.campaignTitle,
      brandName: brandName ?? this.brandName,
      brandLogo: brandLogo ?? this.brandLogo,
      creatorId: creatorId ?? this.creatorId,
      creatorName: creatorName ?? this.creatorName,
      creatorAvatar: creatorAvatar ?? this.creatorAvatar,
      amount: amount ?? this.amount,
      proposal: proposal ?? this.proposal,
      deliverables: deliverables ?? this.deliverables,
      estimatedTimeline: estimatedTimeline ?? this.estimatedTimeline,
      status: status ?? this.status,
      counterAmount: counterAmount ?? this.counterAmount,
      counterNotes: counterNotes ?? this.counterNotes,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
