import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/custom_text_field.dart';
import '../../../models/business_profile_model.dart';
import '../../../providers/app_providers.dart';

class EditBusinessProfileScreen extends ConsumerStatefulWidget {
  final BusinessProfileModel profile;

  const EditBusinessProfileScreen({super.key, required this.profile});

  @override
  ConsumerState<EditBusinessProfileScreen> createState() => _EditBusinessProfileScreenState();
}

class _EditBusinessProfileScreenState extends ConsumerState<EditBusinessProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _companyController;
  late final TextEditingController _websiteController;
  late final TextEditingController _industryController;
  late final TextEditingController _descriptionController;
  late final TextEditingController _contactPersonController;
  late final TextEditingController _contactPhoneController;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _companyController = TextEditingController(text: widget.profile.companyName);
    _websiteController = TextEditingController(text: widget.profile.website ?? '');
    _industryController = TextEditingController(text: widget.profile.industry);
    _descriptionController = TextEditingController(text: widget.profile.description ?? '');
    _contactPersonController = TextEditingController(text: widget.profile.contactPersonName);
    _contactPhoneController = TextEditingController(text: widget.profile.contactPhone ?? '');
  }

  @override
  void dispose() {
    _companyController.dispose();
    _websiteController.dispose();
    _industryController.dispose();
    _descriptionController.dispose();
    _contactPersonController.dispose();
    _contactPhoneController.dispose();
    super.dispose();
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSaving = true);

    try {
      await ref.read(businessServiceProvider).updateProfile(
            companyName: _companyController.text.trim(),
            website: _websiteController.text.trim(),
            industry: _industryController.text.trim(),
            description: _descriptionController.text.trim(),
            contactPersonName: _contactPersonController.text.trim(),
            contactPhone: _contactPhoneController.text.trim(),
          );

      ref.invalidate(myBusinessProfileProvider);

      if (mounted) {
        setState(() => _isSaving = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Company profile updated successfully!'),
            backgroundColor: AppTheme.successColor,
          ),
        );
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSaving = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to update profile: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Edit Company Profile'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                CustomTextField(
                  controller: _companyController,
                  label: 'Legal Company / Brand Name *',
                  validator: (v) => v == null || v.trim().isEmpty ? 'Enter company name' : null,
                ),
                const SizedBox(height: 16),
                CustomTextField(
                  controller: _industryController,
                  label: 'Primary Industry / Sector *',
                  hintText: 'e.g. Consumer Electronics & IoT',
                  validator: (v) => v == null || v.trim().isEmpty ? 'Enter industry' : null,
                ),
                const SizedBox(height: 16),
                CustomTextField(
                  controller: _websiteController,
                  label: 'Official Website URL',
                  hintText: 'https://company.com',
                  prefixIcon: const Icon(Icons.language_rounded),
                ),
                const SizedBox(height: 16),
                CustomTextField(
                  controller: _contactPersonController,
                  label: 'Authorized Contact Person *',
                  hintText: 'e.g. Brand Marketing Manager',
                  validator: (v) => v == null || v.trim().isEmpty ? 'Enter contact person' : null,
                ),
                const SizedBox(height: 16),
                CustomTextField(
                  controller: _contactPhoneController,
                  label: 'Contact Phone Number',
                  hintText: '+91 91234 56789',
                  keyboardType: TextInputType.phone,
                  prefixIcon: const Icon(Icons.phone_outlined),
                ),
                const SizedBox(height: 16),
                CustomTextField(
                  controller: _descriptionController,
                  label: 'Company Overview & Brand Story',
                  hintText: 'Brief summary of what your company creates and stands for...',
                  isMultiline: true,
                  maxLines: 4,
                ),
                const SizedBox(height: 28),
                CustomButton(
                  label: 'Save Changes',
                  isLoading: _isSaving,
                  onPressed: _saveProfile,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
