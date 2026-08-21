class EscrowPaymentOrder {
  final String orderId;
  final String collaborationId;
  final String campaignTitle;
  final String creatorName;
  final double amount;
  final String currency;
  final String status; // 'CREATED', 'PAID', 'HELD_IN_ESCROW', 'RELEASED', 'REFUNDED'
  final String? razorpayPaymentId;
  final DateTime createdAt;

  EscrowPaymentOrder({
    required this.orderId,
    required this.collaborationId,
    required this.campaignTitle,
    required this.creatorName,
    required this.amount,
    this.currency = 'INR',
    this.status = 'CREATED',
    this.razorpayPaymentId,
    required this.createdAt,
  });

  factory EscrowPaymentOrder.fromJson(Map<String, dynamic> json) {
    return EscrowPaymentOrder(
      orderId: json['orderId'] as String? ?? json['id'] as String? ?? '',
      collaborationId: json['collaborationId'] as String? ?? '',
      campaignTitle: json['campaignTitle'] as String? ?? 'Campaign Escrow',
      creatorName: json['creatorName'] as String? ?? 'Creator',
      amount: (json['amount'] as num?)?.toDouble() ?? 0.0,
      currency: json['currency'] as String? ?? 'INR',
      status: json['status'] as String? ?? 'CREATED',
      razorpayPaymentId: json['razorpayPaymentId'] as String? ?? json['paymentId'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'] as String) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'orderId': orderId,
      'collaborationId': collaborationId,
      'campaignTitle': campaignTitle,
      'creatorName': creatorName,
      'amount': amount,
      'currency': currency,
      'status': status,
      'razorpayPaymentId': razorpayPaymentId,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
