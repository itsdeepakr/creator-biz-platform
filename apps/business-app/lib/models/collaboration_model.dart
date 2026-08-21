class CollaborationModel {
  final String id;
  final String campaignId;
  final String campaignTitle;
  final String businessId;
  final String companyName;
  final String creatorId;
  final String creatorName;
  final String? creatorAvatar;
  final double agreedAmount;
  final double platformFee; // 10%
  final double netPayout; // 90%
  final String status; // 'AGREED', 'PAYMENT_PENDING', 'IN_PROGRESS', 'SUBMITTED', 'REVISION_REQUESTED', 'APPROVED', 'COMPLETED', 'DISPUTED', 'CANCELLED'
  final List<String> deliverables;
  final String? deliverableProofUrl;
  final String? deliverableNotes;
  final DateTime? submittedAt;
  final int revisionRounds;
  final int maxRevisionRounds;
  final String? revisionNotes;
  final bool isEscrowFunded;
  final String? escrowPaymentId;
  final DateTime? approvedAt;
  final DateTime? completedAt;
  final String? disputeReason;
  final String? disputeEvidence;
  final bool hasBrandReviewed;
  final DateTime createdAt;
  final DateTime updatedAt;

  CollaborationModel({
    required this.id,
    required this.campaignId,
    required this.campaignTitle,
    required this.businessId,
    required this.companyName,
    required this.creatorId,
    required this.creatorName,
    this.creatorAvatar,
    required this.agreedAmount,
    double? platformFee,
    double? netPayout,
    this.status = 'IN_PROGRESS',
    this.deliverables = const [],
    this.deliverableProofUrl,
    this.deliverableNotes,
    this.submittedAt,
    this.revisionRounds = 0,
    this.maxRevisionRounds = 2,
    this.revisionNotes,
    this.isEscrowFunded = true,
    this.escrowPaymentId,
    this.approvedAt,
    this.completedAt,
    this.disputeReason,
    this.disputeEvidence,
    this.hasBrandReviewed = false,
    required this.createdAt,
    required this.updatedAt,
  })  : platformFee = platformFee ?? (agreedAmount * 0.10),
        netPayout = netPayout ?? (agreedAmount * 0.90);

  factory CollaborationModel.fromJson(Map<String, dynamic> json) {
    final agreed = (json['agreedAmount'] as num?)?.toDouble() ??
        (json['amount'] as num?)?.toDouble() ??
        0.0;
    return CollaborationModel(
      id: json['id'] as String? ?? '',
      campaignId: json['campaignId'] as String? ?? '',
      campaignTitle: json['campaignTitle'] as String? ??
          (json['campaign'] as Map<String, dynamic>?)?['title'] as String? ??
          'Collaboration Deal',
      businessId: json['businessId'] as String? ?? json['brandId'] as String? ?? '',
      companyName: json['companyName'] as String? ??
          (json['business'] as Map<String, dynamic>?)?['companyName'] as String? ??
          'My Brand',
      creatorId: json['creatorId'] as String? ?? '',
      creatorName: json['creatorName'] as String? ??
          (json['creator'] as Map<String, dynamic>?)?['displayName'] as String? ??
          (json['creator'] as Map<String, dynamic>?)?['name'] as String? ??
          'Creator',
      creatorAvatar: json['creatorAvatar'] as String? ??
          (json['creator'] as Map<String, dynamic>?)?['avatarUrl'] as String?,
      agreedAmount: agreed,
      platformFee: (json['platformFee'] as num?)?.toDouble() ?? (agreed * 0.10),
      netPayout: (json['netPayout'] as num?)?.toDouble() ?? (agreed * 0.90),
      status: json['status'] as String? ?? 'IN_PROGRESS',
      deliverables: (json['deliverables'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      deliverableProofUrl: json['deliverableProofUrl'] as String? ??
          json['proofUrl'] as String?,
      deliverableNotes: json['deliverableNotes'] as String? ??
          json['submissionNotes'] as String?,
      submittedAt: json['submittedAt'] != null
          ? DateTime.tryParse(json['submittedAt'] as String)
          : null,
      revisionRounds: (json['revisionRounds'] as num?)?.toInt() ?? 0,
      maxRevisionRounds: (json['maxRevisionRounds'] as num?)?.toInt() ?? 2,
      revisionNotes: json['revisionNotes'] as String?,
      isEscrowFunded: json['isEscrowFunded'] as bool? ?? true,
      escrowPaymentId: json['escrowPaymentId'] as String? ?? json['paymentId'] as String?,
      approvedAt: json['approvedAt'] != null
          ? DateTime.tryParse(json['approvedAt'] as String)
          : null,
      completedAt: json['completedAt'] != null
          ? DateTime.tryParse(json['completedAt'] as String)
          : null,
      disputeReason: json['disputeReason'] as String?,
      disputeEvidence: json['disputeEvidence'] as String?,
      hasBrandReviewed: json['hasBrandReviewed'] as bool? ?? false,
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
      'businessId': businessId,
      'companyName': companyName,
      'creatorId': creatorId,
      'creatorName': creatorName,
      'creatorAvatar': creatorAvatar,
      'agreedAmount': agreedAmount,
      'platformFee': platformFee,
      'netPayout': netPayout,
      'status': status,
      'deliverables': deliverables,
      'deliverableProofUrl': deliverableProofUrl,
      'deliverableNotes': deliverableNotes,
      'submittedAt': submittedAt?.toIso8601String(),
      'revisionRounds': revisionRounds,
      'maxRevisionRounds': maxRevisionRounds,
      'revisionNotes': revisionNotes,
      'isEscrowFunded': isEscrowFunded,
      'escrowPaymentId': escrowPaymentId,
      'approvedAt': approvedAt?.toIso8601String(),
      'completedAt': completedAt?.toIso8601String(),
      'disputeReason': disputeReason,
      'disputeEvidence': disputeEvidence,
      'hasBrandReviewed': hasBrandReviewed,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  CollaborationModel copyWith({
    String? id,
    String? campaignId,
    String? campaignTitle,
    String? businessId,
    String? companyName,
    String? creatorId,
    String? creatorName,
    String? creatorAvatar,
    double? agreedAmount,
    double? platformFee,
    double? netPayout,
    String? status,
    List<String>? deliverables,
    String? deliverableProofUrl,
    String? deliverableNotes,
    DateTime? submittedAt,
    int? revisionRounds,
    int? maxRevisionRounds,
    String? revisionNotes,
    bool? isEscrowFunded,
    String? escrowPaymentId,
    DateTime? approvedAt,
    DateTime? completedAt,
    String? disputeReason,
    String? disputeEvidence,
    bool? hasBrandReviewed,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return CollaborationModel(
      id: id ?? this.id,
      campaignId: campaignId ?? this.campaignId,
      campaignTitle: campaignTitle ?? this.campaignTitle,
      businessId: businessId ?? this.businessId,
      companyName: companyName ?? this.companyName,
      creatorId: creatorId ?? this.creatorId,
      creatorName: creatorName ?? this.creatorName,
      creatorAvatar: creatorAvatar ?? this.creatorAvatar,
      agreedAmount: agreedAmount ?? this.agreedAmount,
      platformFee: platformFee ?? this.platformFee,
      netPayout: netPayout ?? this.netPayout,
      status: status ?? this.status,
      deliverables: deliverables ?? this.deliverables,
      deliverableProofUrl: deliverableProofUrl ?? this.deliverableProofUrl,
      deliverableNotes: deliverableNotes ?? this.deliverableNotes,
      submittedAt: submittedAt ?? this.submittedAt,
      revisionRounds: revisionRounds ?? this.revisionRounds,
      maxRevisionRounds: maxRevisionRounds ?? this.maxRevisionRounds,
      revisionNotes: revisionNotes ?? this.revisionNotes,
      isEscrowFunded: isEscrowFunded ?? this.isEscrowFunded,
      escrowPaymentId: escrowPaymentId ?? this.escrowPaymentId,
      approvedAt: approvedAt ?? this.approvedAt,
      completedAt: completedAt ?? this.completedAt,
      disputeReason: disputeReason ?? this.disputeReason,
      disputeEvidence: disputeEvidence ?? this.disputeEvidence,
      hasBrandReviewed: hasBrandReviewed ?? this.hasBrandReviewed,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
