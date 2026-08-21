import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/custom_text_field.dart';
import '../../../providers/app_providers.dart';
import '../../../core/navigation/app_navigator.dart';

class KycScreen extends ConsumerStatefulWidget {
  const KycScreen({super.key});

  @override
  ConsumerState<KycScreen> createState() => _KycScreenState();
}

class _KycScreenState extends ConsumerState<KycScreen> {
  final _formKey = GlobalKey<FormState>();
  final _panController = TextEditingController(text: 'ABCDE1234F');
  final _bankAccountController = TextEditingController(text: '987654321098');
  final _confirmAccountController = TextEditingController(text: '987654321098');
  final _ifscController = TextEditingController(text: 'HDFC0001234');
  final _holderNameController = TextEditingController(text: 'Aarav Sharma');
  bool _isLoading = false;
  String? _documentUploaded;

  @override
  void dispose() {
    _panController.dispose();
    _bankAccountController.dispose();
    _confirmAccountController.dispose();
    _ifscController.dispose();
    _holderNameController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmitKyc() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);

    final success = await ref.read(authStateProvider.notifier).submitKyc(
          panNumber: _panController.text.trim().toUpperCase(),
          bankAccountNumber: _bankAccountController.text.trim(),
          ifscCode: _ifscController.text.trim().toUpperCase(),
          accountHolderName: _holderNameController.text.trim(),
        );

    if (mounted) {
      setState(() => _isLoading = false);
      if (success) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (ctx) => AlertDialog(
            icon: const Icon(Icons.check_circle_outline_rounded, color: AppTheme.successColor, size: 54),
            title: const Text('KYC Submitted!'),
            content: const Text(
              'Your PAN and bank verification details have been received. Payouts will be processed to this account once verified.',
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.of(ctx).pop();
                  Navigator.of(context).pushReplacement(
                    MaterialPageRoute(builder: (_) => const AppNavigator()),
                  );
                },
                child: const Text('Go to Home'),
              ),
            ],
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Creator KYC & Payout Details'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryColor.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppTheme.primaryColor.withOpacity(0.2)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.verified_user_outlined, color: AppTheme.primaryColor, size: 28),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Text(
                          'KYC compliance is mandatory as per RBI guidelines for instant direct payouts and escrow settlements.',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: AppTheme.textPrimary,
                                height: 1.4,
                              ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  'PAN Details',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                CustomTextField(
                  controller: _panController,
                  label: 'PAN Card Number',
                  hintText: 'e.g. ABCDE1234F',
                  prefixIcon: const Icon(Icons.badge_outlined),
                  validator: (v) {
                    if (v == null || v.trim().length != 10) {
                      return 'Enter a valid 10-character PAN number';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 24),
                Text(
                  'Bank Account for Payouts',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                CustomTextField(
                  controller: _holderNameController,
                  label: 'Account Holder Name (as per Bank)',
                  hintText: 'e.g. Aarav Sharma',
                  prefixIcon: const Icon(Icons.person_outline_rounded),
                  validator: (v) => v == null || v.trim().isEmpty ? 'Enter holder name' : null,
                ),
                const SizedBox(height: 14),
                CustomTextField(
                  controller: _bankAccountController,
                  label: 'Bank Account Number',
                  hintText: 'e.g. 987654321098',
                  keyboardType: TextInputType.number,
                  prefixIcon: const Icon(Icons.account_balance_outlined),
                  validator: (v) => v == null || v.trim().length < 8 ? 'Enter valid account number' : null,
                ),
                const SizedBox(height: 14),
                CustomTextField(
                  controller: _confirmAccountController,
                  label: 'Confirm Bank Account Number',
                  hintText: 'Re-enter account number',
                  keyboardType: TextInputType.number,
                  prefixIcon: const Icon(Icons.account_balance_outlined),
                  validator: (v) {
                    if (v != _bankAccountController.text) {
                      return 'Account numbers do not match';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 14),
                CustomTextField(
                  controller: _ifscController,
                  label: 'IFSC Code',
                  hintText: 'e.g. HDFC0001234',
                  prefixIcon: const Icon(Icons.business_outlined),
                  validator: (v) => v == null || v.trim().length != 11 ? 'Enter valid 11-digit IFSC code' : null,
                ),
                const SizedBox(height: 20),
                GestureDetector(
                  onTap: () {
                    setState(() {
                      _documentUploaded = 'pan_card_aarav_sharma.pdf (1.2 MB)';
                    });
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F2F6),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: _documentUploaded != null ? AppTheme.successColor : AppTheme.borderColor,
                        style: BorderStyle.solid,
                      ),
                    ),
                    child: Column(
                      children: [
                        Icon(
                          _documentUploaded != null ? Icons.check_circle_rounded : Icons.cloud_upload_outlined,
                          size: 36,
                          color: _documentUploaded != null ? AppTheme.successColor : AppTheme.primaryColor,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          _documentUploaded ?? 'Upload PAN Card / Cancelled Cheque (Optional)',
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            color: _documentUploaded != null ? AppTheme.successColor : AppTheme.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Supported formats: PDF, JPG, PNG (Max 5MB)',
                          style: TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 32),
                CustomButton(
                  label: 'Submit for Verification',
                  isLoading: _isLoading,
                  onPressed: _handleSubmitKyc,
                ),
                const SizedBox(height: 12),
                TextButton(
                  onPressed: () {
                    Navigator.of(context).pushReplacement(
                      MaterialPageRoute(builder: (_) => const AppNavigator()),
                    );
                  },
                  child: const Text('Complete later'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
