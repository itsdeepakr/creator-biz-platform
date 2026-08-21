import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/helpers.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../providers/app_providers.dart';

class EscrowCheckoutScreen extends ConsumerStatefulWidget {
  final String collaborationId;
  final String campaignTitle;
  final String creatorName;
  final double agreedAmount;
  final VoidCallback onPaymentSuccess;

  const EscrowCheckoutScreen({
    super.key,
    required this.collaborationId,
    required this.campaignTitle,
    required this.creatorName,
    required this.agreedAmount,
    required this.onPaymentSuccess,
  });

  @override
  ConsumerState<EscrowCheckoutScreen> createState() => _EscrowCheckoutScreenState();
}

class _EscrowCheckoutScreenState extends ConsumerState<EscrowCheckoutScreen> {
  String _selectedPaymentMethod = 'UPI';
  bool _isProcessing = false;

  Future<void> _processRazorpayEscrowPayment() async {
    setState(() => _isProcessing = true);

    // Simulate Razorpay checkout modal & payment gateway verification
    await Future.delayed(const Duration(seconds: 2));

    try {
      final order = await ref.read(paymentServiceProvider).createEscrowOrder(
            collaborationId: widget.collaborationId,
            campaignTitle: widget.campaignTitle,
            creatorName: widget.creatorName,
            amount: widget.agreedAmount,
          );

      await ref.read(paymentServiceProvider).verifyAndHoldEscrow(
            orderId: order.orderId,
            razorpayPaymentId: 'pay_rzp_mock_${DateTime.now().millisecondsSinceEpoch}',
          );

      widget.onPaymentSuccess();

      if (mounted) {
        setState(() => _isProcessing = false);
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (ctx) => AlertDialog(
            icon: const Icon(Icons.shield_rounded, color: AppTheme.successColor, size: 54),
            title: const Text('Escrow Funded Successfully!'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  '${Helpers.formatCurrencyINR(widget.agreedAmount)} is safely held in CreatorBiz Escrow.',
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                const Text(
                  'The creator has been notified to start content creation according to your brief and agreed deliverables.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 13, color: AppTheme.textSecondary),
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.of(ctx).pop();
                  Navigator.of(context).pop();
                },
                child: const Text('Go to Collaborations'),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isProcessing = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Escrow payment failed: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Escrow Contract Checkout'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.primaryColor.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.primaryColor.withOpacity(0.2)),
                ),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.security_rounded, color: AppTheme.primaryColor, size: 24),
                        SizedBox(width: 8),
                        Text(
                          '100% Escrow Protected Contract',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.primaryColor),
                        ),
                      ],
                    ),
                    SizedBox(height: 6),
                    Text(
                      'Funds are held securely by Razorpay Escrow and released to the creator ONLY after you review and approve their work.',
                      style: TextStyle(fontSize: 12, color: AppTheme.textSecondary, height: 1.4),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.borderColor),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Deal Summary', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Campaign:', style: TextStyle(fontSize: 13, color: AppTheme.textSecondary)),
                        Expanded(
                          child: Text(
                            widget.campaignTitle,
                            textAlign: TextAlign.end,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Creator:', style: TextStyle(fontSize: 13, color: AppTheme.textSecondary)),
                        Text(widget.creatorName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                      ],
                    ),
                    const Divider(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Agreed Creator Rate:', style: TextStyle(fontSize: 13)),
                        Text(Helpers.formatCurrencyINR(widget.agreedAmount), style: const TextStyle(fontWeight: FontWeight.w600)),
                      ],
                    ),
                    const SizedBox(height: 4),
                    const Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Escrow Processing Fee:', style: TextStyle(fontSize: 13, color: AppTheme.textTertiary)),
                        Text('₹0 (Waived)', style: TextStyle(fontSize: 13, color: AppTheme.successColor, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const Divider(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Total Amount to Fund:', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                        Text(
                          Helpers.formatCurrencyINR(widget.agreedAmount),
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppTheme.primaryColor),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              const Text('Select Razorpay Payment Method', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
              const SizedBox(height: 12),
              _buildPaymentOption(
                id: 'UPI',
                title: 'UPI (Instant)',
                subtitle: 'Google Pay, PhonePe, Paytm, BHIM',
                icon: Icons.qr_code_scanner_rounded,
              ),
              const SizedBox(height: 8),
              _buildPaymentOption(
                id: 'NETBANKING',
                title: 'Corporate Net Banking',
                subtitle: 'HDFC, ICICI, SBI, Axis, Kotak',
                icon: Icons.account_balance_rounded,
              ),
              const SizedBox(height: 8),
              _buildPaymentOption(
                id: 'CARD',
                title: 'Corporate / Business Card',
                subtitle: 'Visa, Mastercard, RuPay',
                icon: Icons.credit_card_rounded,
              ),
              const SizedBox(height: 32),
              CustomButton(
                label: 'Pay & Lock ${Helpers.formatCurrencyINR(widget.agreedAmount)} in Escrow',
                icon: Icons.lock_rounded,
                isLoading: _isProcessing,
                onPressed: _processRazorpayEscrowPayment,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPaymentOption({
    required String id,
    required String title,
    required String subtitle,
    required IconData icon,
  }) {
    final isSelected = _selectedPaymentMethod == id;

    return InkWell(
      onTap: () => setState(() => _selectedPaymentMethod = id),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppTheme.primaryColor : AppTheme.borderColor,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(icon, color: isSelected ? AppTheme.primaryColor : AppTheme.textSecondary, size: 28),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  Text(subtitle, style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                ],
              ),
            ),
            Radio<String>(
              value: id,
              groupValue: _selectedPaymentMethod,
              onChanged: (val) {
                if (val != null) setState(() => _selectedPaymentMethod = val);
              },
            ),
          ],
        ),
      ),
    );
  }
}
