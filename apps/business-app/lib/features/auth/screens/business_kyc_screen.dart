import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/custom_text_field.dart';
import '../../../providers/app_providers.dart';
import '../../../core/navigation/app_navigator.dart';

class BusinessKycScreen extends ConsumerStatefulWidget {
  const BusinessKycScreen({super.key});

  @override
  ConsumerState<BusinessKycScreen> createState() => _BusinessKycScreenState();
}

class _BusinessKycScreenState extends ConsumerState<BusinessKycScreen> {
  final _formKey = GlobalKey<FormState>();
  final _companyController = TextEditingController(text: 'Apex Innovations Pvt Ltd');
  final _gstinController = TextEditingController(text: '29ABCDE1234F1Z5');
  final _panController = TextEditingController(text: 'ABCDE1234F');
  final _contactPersonController = TextEditingController(text: 'Pooja Hegde');
  final _websiteController = TextEditingController(text: 'https://apexinnovations.tech');
  String? _uploadedDoc;
  bool _isLoading = false;

  @override
  void dispose() {
    _companyController.dispose();
    _gstinController.dispose();
    _panController.dispose();
    _contactPersonController.dispose();
    _websiteController.dispose();
    super.dispose();
  }

  Future<void> _submitBusinessKyc() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);

    final success = await ref.read(authStateProvider.notifier).submitGstKyc(
          companyName: _companyController.text.trim(),
          gstin: _gstinController.text.trim().toUpperCase(),
          panNumber: _panController.text.trim().toUpperCase(),
          contactPerson: _contactPersonController.text.trim(),
          docName: _uploadedDoc,
        );

    if (mounted) {
      setState(() => _isLoading = false);
      if (success) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (ctx) => AlertDialog(
            icon: const Icon(Icons.verified_rounded, color: AppTheme.successColor, size: 54),
            title: const Text('GSTIN & Verification Submitted!'),
            content: const Text(
              'Your company documents and GSTIN have been submitted for verification. You now have full access to campaign creation and creator escrow payments.',
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.of(ctx).pop();
                  Navigator.of(context).pushReplacement(
                    MaterialPageRoute(builder: (_) => const AppNavigator()),
                  );
                },
                child: const Text('Go to Campaigns'),
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
        title: const Text('Company Verification & GSTIN'),
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
                      const Icon(Icons.verified_outlined, color: AppTheme.primaryColor, size: 28),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Text(
                          'Verified brand status enables Escrow protection, automated GST tax invoices, and priority campaign listing.',
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
                CustomTextField(
                  controller: _companyController,
                  label: 'Legal Entity Name *',
                  hintText: 'e.g. Acme Tech India Pvt Ltd',
                  prefixIcon: const Icon(Icons.business_rounded),
                  validator: (v) => v == null || v.trim().isEmpty ? 'Enter legal company name' : null,
                ),
                const SizedBox(height: 16),
                CustomTextField(
                  controller: _gstinController,
                  label: 'GSTIN (15-character alphanumeric) *',
                  hintText: 'e.g. 29ABCDE1234F1Z5',
                  prefixIcon: const Icon(Icons.receipt_long_rounded),
                  validator: (v) {
                    if (v == null || v.trim().length != 15) {
                      return 'Please enter a valid 15-character GSTIN';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                CustomTextField(
                  controller: _panController,
                  label: 'Company PAN *',
                  hintText: 'e.g. ABCDE1234F',
                  prefixIcon: const Icon(Icons.badge_outlined),
                  validator: (v) => v == null || v.trim().length != 10 ? 'Enter valid 10-digit PAN' : null,
                ),
                const SizedBox(height: 16),
                CustomTextField(
                  controller: _contactPersonController,
                  label: 'Authorized Representative Name *',
                  hintText: 'e.g. Pooja Hegde (Marketing Lead)',
                  prefixIcon: const Icon(Icons.person_outline_rounded),
                  validator: (v) => v == null || v.trim().isEmpty ? 'Enter contact person name' : null,
                ),
                const SizedBox(height: 16),
                CustomTextField(
                  controller: _websiteController,
                  label: 'Company Website',
                  hintText: 'https://company.com',
                  prefixIcon: const Icon(Icons.language_rounded),
                ),
                const SizedBox(height: 24),
                GestureDetector(
                  onTap: () {
                    setState(() {
                      _uploadedDoc = 'gst_registration_certificate.pdf (850 KB)';
                    });
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: _uploadedDoc != null ? AppTheme.successColor : AppTheme.borderColor,
                      ),
                    ),
                    child: Column(
                      children: [
                        Icon(
                          _uploadedDoc != null ? Icons.check_circle_rounded : Icons.upload_file_rounded,
                          size: 36,
                          color: _uploadedDoc != null ? AppTheme.successColor : AppTheme.primaryColor,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          _uploadedDoc ?? 'Upload GST Certificate / Certificate of Incorporation',
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            color: _uploadedDoc != null ? AppTheme.successColor : AppTheme.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'PDF, JPG, PNG up to 10MB',
                          style: TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 32),
                CustomButton(
                  label: 'Verify & Activate Brand Account',
                  isLoading: _isLoading,
                  onPressed: _submitBusinessKyc,
                ),
                const SizedBox(height: 12),
                TextButton(
                  onPressed: () {
                    Navigator.of(context).pushReplacement(
                      MaterialPageRoute(builder: (_) => const AppNavigator()),
                    );
                  },
                  child: const Text('Complete verification later'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
