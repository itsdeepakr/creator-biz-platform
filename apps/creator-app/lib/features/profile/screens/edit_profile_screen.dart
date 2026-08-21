import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/custom_text_field.dart';
import '../../../providers/app_providers.dart';

class EditProfileScreen extends ConsumerStatefulWidget {
  const EditProfileScreen({super.key});

  @override
  ConsumerState<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends ConsumerState<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _bioController = TextEditingController();
  final _locationController = TextEditingController();
  final _minRateController = TextEditingController();
  final _maxRateController = TextEditingController();
  final Set<String> _selectedCategories = {};
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    final profile = ref.read(creatorServiceProvider).myProfile;
    _nameController.text = profile.displayName;
    _bioController.text = profile.bio ?? '';
    _locationController.text = profile.location ?? '';
    _minRateController.text = profile.minRate.toInt().toString();
    _maxRateController.text = profile.maxRate.toInt().toString();
    _selectedCategories.addAll(profile.categories);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _bioController.dispose();
    _locationController.dispose();
    _minRateController.dispose();
    _maxRateController.dispose();
    super.dispose();
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);

    await ref.read(creatorServiceProvider).updateProfile(
          displayName: _nameController.text.trim(),
          bio: _bioController.text.trim(),
          location: _locationController.text.trim(),
          minRate: double.tryParse(_minRateController.text) ?? 0,
          maxRate: double.tryParse(_maxRateController.text) ?? 0,
          categories: _selectedCategories.toList(),
        );

    ref.invalidate(myProfileProvider);

    if (mounted) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Profile updated successfully!'),
          backgroundColor: AppTheme.successColor,
        ),
      );
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Edit Creator Profile'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CustomTextField(
                controller: _nameController,
                label: 'Display Name *',
                prefixIcon: const Icon(Icons.person_outline_rounded),
                validator: (v) => v == null || v.trim().isEmpty ? 'Please enter name' : null,
              ),
              const SizedBox(height: 16),
              CustomTextField(
                controller: _bioController,
                label: 'Bio & Creative Focus *',
                isMultiline: true,
                maxLines: 4,
                validator: (v) => v == null || v.trim().isEmpty ? 'Please enter bio' : null,
              ),
              const SizedBox(height: 16),
              CustomTextField(
                controller: _locationController,
                label: 'City / Location',
                prefixIcon: const Icon(Icons.location_on_outlined),
              ),
              const SizedBox(height: 20),
              Text(
                'Content Categories (Select multiple)',
                style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: AppConstants.creatorCategories.map((cat) {
                  final isSelected = _selectedCategories.contains(cat);
                  return FilterChip(
                    label: Text(cat),
                    selected: isSelected,
                    onSelected: (selected) {
                      setState(() {
                        if (selected) {
                          _selectedCategories.add(cat);
                        } else {
                          _selectedCategories.remove(cat);
                        }
                      });
                    },
                  );
                }).toList(),
              ),
              const SizedBox(height: 24),
              Text(
                'Standard Rates per Collaboration (INR)',
                style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: CustomTextField(
                      controller: _minRateController,
                      label: 'Min Rate (₹)',
                      keyboardType: TextInputType.number,
                      prefixIcon: const Icon(Icons.currency_rupee_rounded),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: CustomTextField(
                      controller: _maxRateController,
                      label: 'Max Rate (₹)',
                      keyboardType: TextInputType.number,
                      prefixIcon: const Icon(Icons.currency_rupee_rounded),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),
              CustomButton(
                label: 'Save Changes',
                isLoading: _isLoading,
                onPressed: _saveProfile,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
