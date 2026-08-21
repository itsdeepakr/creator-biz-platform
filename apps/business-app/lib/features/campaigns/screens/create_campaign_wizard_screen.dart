import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/utils/helpers.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/custom_text_field.dart';
import '../../../providers/app_providers.dart';

class CreateCampaignWizardScreen extends ConsumerStatefulWidget {
  const CreateCampaignWizardScreen({super.key});

  @override
  ConsumerState<CreateCampaignWizardScreen> createState() => _CreateCampaignWizardScreenState();
}

class _CreateCampaignWizardScreenState extends ConsumerState<CreateCampaignWizardScreen> {
  int _currentStep = 0;
  final _formKey = GlobalKey<FormState>();

  // Step 1: Basic Info
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  String _selectedCategory = 'Tech';

  // Step 2: Deliverables & Requirements
  final Set<String> _selectedDeliverables = {'Instagram Reel'};
  final _requirementsController = TextEditingController(
    text: 'Min 40k followers, 3.5%+ engagement rate, 4K video quality',
  );

  // Step 3: Guidelines
  final _guidelinesController = TextEditingController(
    text: 'Include product unboxing and demonstrate primary features with brand link in bio.',
  );

  // Step 4: Budget & Timeline
  final _minBudgetController = TextEditingController(text: '20000');
  final _maxBudgetController = TextEditingController(text: '50000');
  DateTime _deadline = DateTime.now().add(const Duration(days: 14));
  bool _isPublishing = false;

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _requirementsController.dispose();
    _guidelinesController.dispose();
    _minBudgetController.dispose();
    _maxBudgetController.dispose();
    super.dispose();
  }

  Future<void> _publishCampaign() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedDeliverables.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Select at least one deliverable')),
      );
      return;
    }

    setState(() => _isPublishing = true);

    final reqs = _requirementsController.text
        .split(',')
        .map((e) => e.trim())
        .where((e) => e.isNotEmpty)
        .toList();

    try {
      await ref.read(campaignServiceProvider).createCampaign(
            title: _titleController.text.trim(),
            description: _descriptionController.text.trim(),
            category: _selectedCategory,
            budgetMin: double.tryParse(_minBudgetController.text) ?? 10000,
            budgetMax: double.tryParse(_maxBudgetController.text) ?? 30000,
            deliverables: _selectedDeliverables.toList(),
            requirements: reqs,
            guidelines: _guidelinesController.text.trim(),
            deadline: _deadline,
          );

      ref.invalidate(myCampaignsProvider);

      if (mounted) {
        setState(() => _isPublishing = false);
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (ctx) => AlertDialog(
            icon: const Icon(Icons.check_circle_rounded, color: AppTheme.successColor, size: 54),
            title: const Text('Campaign Published!'),
            content: const Text(
              'Your campaign is now live on CreatorBiz. Content creators can now discover your brief and submit pitch proposals.',
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.of(ctx).pop();
                  Navigator.of(context).pop();
                },
                child: const Text('View Campaigns'),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isPublishing = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to publish campaign: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Campaign Creation Wizard'),
      ),
      body: Form(
        key: _formKey,
        child: Stepper(
          type: StepperType.horizontal,
          currentStep: _currentStep,
          onStepTapped: (step) => setState(() => _currentStep = step),
          onStepContinue: () {
            if (_currentStep < 3) {
              setState(() => _currentStep++);
            } else {
              _publishCampaign();
            }
          },
          onStepCancel: () {
            if (_currentStep > 0) {
              setState(() => _currentStep--);
            } else {
              Navigator.of(context).pop();
            }
          },
          controlsBuilder: (context, details) {
            final isLast = _currentStep == 3;
            return Padding(
              padding: const EdgeInsets.only(top: 24),
              child: Row(
                children: [
                  Expanded(
                    child: CustomButton(
                      label: isLast ? 'Publish Campaign' : 'Next Step',
                      isLoading: _isPublishing,
                      onPressed: details.onStepContinue,
                    ),
                  ),
                  const SizedBox(width: 12),
                  if (_currentStep > 0)
                    OutlinedButton(
                      onPressed: details.onStepCancel,
                      child: const Text('Back'),
                    ),
                ],
              ),
            );
          },
          steps: [
            Step(
              title: const Text('Overview'),
              isActive: _currentStep >= 0,
              state: _currentStep > 0 ? StepState.complete : StepState.indexed,
              content: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  CustomTextField(
                    controller: _titleController,
                    label: 'Campaign Title *',
                    hintText: 'e.g. Next-Gen Smart Watch Launch 2026',
                    validator: (v) => v == null || v.trim().isEmpty ? 'Enter campaign title' : null,
                  ),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<String>(
                    initialValue: _selectedCategory,
                    decoration: const InputDecoration(labelText: 'Primary Niche Category *'),
                    items: AppConstants.categories
                        .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                        .toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _selectedCategory = val);
                    },
                  ),
                  const SizedBox(height: 16),
                  CustomTextField(
                    controller: _descriptionController,
                    label: 'Campaign Objective & Brief *',
                    hintText: 'Describe your product, target audience, and key goals...',
                    isMultiline: true,
                    maxLines: 4,
                    validator: (v) => v == null || v.trim().length < 10 ? 'Provide a descriptive brief' : null,
                  ),
                ],
              ),
            ),
            Step(
              title: const Text('Deliverables'),
              isActive: _currentStep >= 1,
              state: _currentStep > 1 ? StepState.complete : StepState.indexed,
              content: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Select Required Deliverables *', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: AppConstants.deliverableTypes.map((del) {
                      final isSelected = _selectedDeliverables.contains(del);
                      return FilterChip(
                        label: Text(del),
                        selected: isSelected,
                        onSelected: (selected) {
                          setState(() {
                            if (selected) {
                              _selectedDeliverables.add(del);
                            } else {
                              _selectedDeliverables.remove(del);
                            }
                          });
                        },
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 20),
                  CustomTextField(
                    controller: _requirementsController,
                    label: 'Creator Eligibility (Comma-separated)',
                    hintText: 'e.g. Min 50k followers, Tech niche, 4K camera',
                    isMultiline: true,
                    maxLines: 3,
                  ),
                ],
              ),
            ),
            Step(
              title: const Text('Guidelines'),
              isActive: _currentStep >= 2,
              state: _currentStep > 2 ? StepState.complete : StepState.indexed,
              content: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  CustomTextField(
                    controller: _guidelinesController,
                    label: 'Content Guidelines & Do\'s / Don\'ts *',
                    hintText: 'Specify mandatory brand tags, hashtag requirements, color themes...',
                    isMultiline: true,
                    maxLines: 5,
                  ),
                ],
              ),
            ),
            Step(
              title: const Text('Budget'),
              isActive: _currentStep >= 3,
              state: _currentStep == 3 ? StepState.indexed : StepState.complete,
              content: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: CustomTextField(
                          controller: _minBudgetController,
                          label: 'Min Budget (₹) *',
                          keyboardType: TextInputType.number,
                          prefixIcon: const Icon(Icons.currency_rupee_rounded),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: CustomTextField(
                          controller: _maxBudgetController,
                          label: 'Max Budget (₹) *',
                          keyboardType: TextInputType.number,
                          prefixIcon: const Icon(Icons.currency_rupee_rounded),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  ListTile(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    tileColor: const Color(0xFFF1F5F9),
                    leading: const Icon(Icons.calendar_today_rounded, color: AppTheme.primaryColor),
                    title: const Text('Campaign Application Deadline', style: TextStyle(fontSize: 13)),
                    subtitle: Text(
                      Helpers.formatDate(_deadline),
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                    ),
                    trailing: const Icon(Icons.edit_calendar_rounded),
                    onTap: () async {
                      final picked = await showDatePicker(
                        context: context,
                        initialDate: _deadline,
                        firstDate: DateTime.now(),
                        lastDate: DateTime.now().add(const Duration(days: 90)),
                      );
                      if (picked != null) {
                        setState(() => _deadline = picked);
                      }
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
