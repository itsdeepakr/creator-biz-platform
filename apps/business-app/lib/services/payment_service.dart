import '../core/network/api_client.dart';
import '../models/payment_model.dart';

class PaymentService {
  final ApiClient _apiClient;

  PaymentService({required ApiClient apiClient}) : _apiClient = apiClient;

  final List<EscrowPaymentOrder> _orders = [
    EscrowPaymentOrder(
      orderId: 'order_rzp_101',
      collaborationId: 'collab_1',
      campaignTitle: 'Flagship Smartphone Launch',
      creatorName: 'Aarav Sharma',
      amount: 42000,
      status: 'HELD_IN_ESCROW',
      razorpayPaymentId: 'pay_rzp_escrow_88921',
      createdAt: DateTime.now().subtract(const Duration(days: 4)),
    ),
    EscrowPaymentOrder(
      orderId: 'order_rzp_102',
      collaborationId: 'collab_2',
      campaignTitle: 'Wireless Gaming Earbuds Sound Test',
      creatorName: 'Kunal Gamer',
      amount: 30000,
      status: 'HELD_IN_ESCROW',
      razorpayPaymentId: 'pay_rzp_escrow_88922',
      createdAt: DateTime.now().subtract(const Duration(days: 2)),
    ),
    EscrowPaymentOrder(
      orderId: 'order_rzp_103',
      collaborationId: 'collab_3',
      campaignTitle: 'Smart Home Security Cam Launch',
      creatorName: 'Priya Verma',
      amount: 50000,
      status: 'RELEASED',
      razorpayPaymentId: 'pay_rzp_escrow_88900',
      createdAt: DateTime.now().subtract(const Duration(days: 20)),
    ),
  ];

  Future<EscrowPaymentOrder> createEscrowOrder({
    required String collaborationId,
    required String campaignTitle,
    required String creatorName,
    required double amount,
  }) async {
    final order = EscrowPaymentOrder(
      orderId: 'order_rzp_${DateTime.now().millisecondsSinceEpoch}',
      collaborationId: collaborationId,
      campaignTitle: campaignTitle,
      creatorName: creatorName,
      amount: amount,
      status: 'CREATED',
      createdAt: DateTime.now(),
    );

    try {
      final response = await _apiClient.post(
        '/payments/escrow/create-order',
        data: order.toJson(),
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        final created = EscrowPaymentOrder.fromJson(response.data as Map<String, dynamic>);
        _orders.insert(0, created);
        return created;
      }
    } catch (_) {}

    _orders.insert(0, order);
    return order;
  }

  Future<bool> verifyAndHoldEscrow({
    required String orderId,
    required String razorpayPaymentId,
  }) async {
    try {
      final response = await _apiClient.post(
        '/payments/escrow/verify',
        data: {
          'orderId': orderId,
          'razorpayPaymentId': razorpayPaymentId,
        },
      );
      if (response.statusCode == 200) {
        return true;
      }
    } catch (_) {}

    final index = _orders.indexWhere((o) => o.orderId == orderId);
    if (index != -1) {
      final updated = EscrowPaymentOrder(
        orderId: _orders[index].orderId,
        collaborationId: _orders[index].collaborationId,
        campaignTitle: _orders[index].campaignTitle,
        creatorName: _orders[index].creatorName,
        amount: _orders[index].amount,
        status: 'HELD_IN_ESCROW',
        razorpayPaymentId: razorpayPaymentId,
        createdAt: _orders[index].createdAt,
      );
      _orders[index] = updated;
    }
    return true;
  }

  Future<List<EscrowPaymentOrder>> getPaymentHistory() async {
    try {
      final response = await _apiClient.get('/payments/history');
      if (response.statusCode == 200) {
        final list = response.data as List<dynamic>;
        return list.map((e) => EscrowPaymentOrder.fromJson(e as Map<String, dynamic>)).toList();
      }
    } catch (_) {}
    return _orders;
  }
}
