class TransactionItem {
  final String id;
  final String? collaborationId;
  final String campaignTitle;
  final String brandName;
  final double grossAmount;
  final double feeAmount; // 10% platform fee
  final double netAmount; // 90%
  final String type; // 'PAYOUT', 'ESCROW_HOLD', 'ESCROW_RELEASE', 'REFUND'
  final String status; // 'COMPLETED', 'PENDING', 'FAILED'
  final String? referenceId;
  final DateTime createdAt;

  TransactionItem({
    required this.id,
    this.collaborationId,
    required this.campaignTitle,
    required this.brandName,
    required this.grossAmount,
    double? feeAmount,
    double? netAmount,
    required this.type,
    this.status = 'COMPLETED',
    this.referenceId,
    required this.createdAt,
  })  : feeAmount = feeAmount ?? (grossAmount * 0.10),
        netAmount = netAmount ?? (grossAmount * 0.90);

  factory TransactionItem.fromJson(Map<String, dynamic> json) {
    final gross = (json['grossAmount'] as num?)?.toDouble() ??
        (json['amount'] as num?)?.toDouble() ??
        0.0;
    return TransactionItem(
      id: json['id'] as String? ?? '',
      collaborationId: json['collaborationId'] as String?,
      campaignTitle: json['campaignTitle'] as String? ??
          (json['collaboration'] as Map<String, dynamic>?)?['campaignTitle'] as String? ??
          'Collaboration Payout',
      brandName: json['brandName'] as String? ??
          (json['collaboration'] as Map<String, dynamic>?)?['brandName'] as String? ??
          'Brand Partner',
      grossAmount: gross,
      feeAmount: (json['feeAmount'] as num?)?.toDouble() ?? (gross * 0.10),
      netAmount: (json['netAmount'] as num?)?.toDouble() ?? (gross * 0.90),
      type: json['type'] as String? ?? 'PAYOUT',
      status: json['status'] as String? ?? 'COMPLETED',
      referenceId: json['referenceId'] as String? ?? json['payoutId'] as String?,
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
      'brandName': brandName,
      'grossAmount': grossAmount,
      'feeAmount': feeAmount,
      'netAmount': netAmount,
      'type': type,
      'status': status,
      'referenceId': referenceId,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}

class WalletSummary {
  final double totalGrossEarnings;
  final double totalPlatformFee; // 10%
  final double totalNetPayouts; // 90%
  final double pendingEscrowAmount;
  final double availableBalance;
  final int completedProjectsCount;
  final List<TransactionItem> recentTransactions;

  WalletSummary({
    required this.totalGrossEarnings,
    double? totalPlatformFee,
    double? totalNetPayouts,
    this.pendingEscrowAmount = 0.0,
    this.availableBalance = 0.0,
    this.completedProjectsCount = 0,
    this.recentTransactions = const [],
  })  : totalPlatformFee = totalPlatformFee ?? (totalGrossEarnings * 0.10),
        totalNetPayouts = totalNetPayouts ?? (totalGrossEarnings * 0.90);

  factory WalletSummary.fromJson(Map<String, dynamic> json) {
    final gross = (json['totalGrossEarnings'] as num?)?.toDouble() ??
        (json['grossEarnings'] as num?)?.toDouble() ??
        0.0;
    return WalletSummary(
      totalGrossEarnings: gross,
      totalPlatformFee: (json['totalPlatformFee'] as num?)?.toDouble() ?? (gross * 0.10),
      totalNetPayouts: (json['totalNetPayouts'] as num?)?.toDouble() ??
          (json['netEarnings'] as num?)?.toDouble() ??
          (gross * 0.90),
      pendingEscrowAmount: (json['pendingEscrowAmount'] as num?)?.toDouble() ??
          (json['inEscrow'] as num?)?.toDouble() ??
          0.0,
      availableBalance: (json['availableBalance'] as num?)?.toDouble() ?? 0.0,
      completedProjectsCount: (json['completedProjectsCount'] as num?)?.toInt() ?? 0,
      recentTransactions: (json['recentTransactions'] as List<dynamic>?)
              ?.map((e) => TransactionItem.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'totalGrossEarnings': totalGrossEarnings,
      'totalPlatformFee': totalPlatformFee,
      'totalNetPayouts': totalNetPayouts,
      'pendingEscrowAmount': pendingEscrowAmount,
      'availableBalance': availableBalance,
      'completedProjectsCount': completedProjectsCount,
      'recentTransactions': recentTransactions.map((e) => e.toJson()).toList(),
    };
  }
}
