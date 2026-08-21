class DisputeModel {
  final String id;
  final String collaborationId;
  final String campaignTitle;
  final String creatorName;
  final String reason;
  final String? evidenceNotes;
  final String status; // 'OPEN', 'UNDER_REVIEW', 'RESOLVED_CREATOR', 'RESOLVED_BUSINESS', 'RESOLVED_SPLIT'
  final String? adminNotes;
  final double? splitBusinessRefundPercentage;
  final DateTime createdAt;
  final DateTime? resolvedAt;

  DisputeModel({
    required this.id,
    required this.collaborationId,
    required this.campaignTitle,
    required this.creatorName,
    required this.reason,
    this.evidenceNotes,
    this.status = 'OPEN',
    this.adminNotes,
    this.splitBusinessRefundPercentage,
    required this.createdAt,
    this.resolvedAt,
  });

  factory DisputeModel.fromJson(Map<String, dynamic> json) {
    return DisputeModel(
      id: json['id'] as String? ?? '',
      collaborationId: json['collaborationId'] as String? ?? '',
      campaignTitle: json['campaignTitle'] as String? ??
          (json['collaboration'] as Map<String, dynamic>?)?['campaignTitle'] as String? ??
          'Collaboration',
      creatorName: json['creatorName'] as String? ??
          (json['collaboration'] as Map<String, dynamic>?)?['creatorName'] as String? ??
          'Creator',
      reason: json['reason'] as String? ?? 'Contractual dispute',
      evidenceNotes: json['evidenceNotes'] as String? ?? json['notes'] as String?,
      status: json['status'] as String? ?? 'OPEN',
      adminNotes: json['adminNotes'] as String?,
      splitBusinessRefundPercentage:
          (json['splitBusinessRefundPercentage'] as num?)?.toDouble(),
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'] as String) ?? DateTime.now()
          : DateTime.now(),
      resolvedAt: json['resolvedAt'] != null
          ? DateTime.tryParse(json['resolvedAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'collaborationId': collaborationId,
      'campaignTitle': campaignTitle,
      'creatorName': creatorName,
      'reason': reason,
      'evidenceNotes': evidenceNotes,
      'status': status,
      'adminNotes': adminNotes,
      'splitBusinessRefundPercentage': splitBusinessRefundPercentage,
      'createdAt': createdAt.toIso8601String(),
      'resolvedAt': resolvedAt?.toIso8601String(),
    };
  }
}
