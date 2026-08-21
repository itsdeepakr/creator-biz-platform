import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/custom_text_field.dart';
import '../../../models/collaboration_model.dart';
import '../../../providers/app_providers.dart';

class DeliverableSubmitScreen extends ConsumerStatefulWidget {
  final CollaborationModel collaboration;

  const DeliverableSubmitScreen({super.key, required this.collaboration});

  @override
  ConsumerState<DeliverableSubmitScreen> createState() => _DeliverableSubmitScreenState();
}

class _DeliverableSubmitScreenState extends ConsumerState<DeliverableSubmitScreen> {
  final _formKey = GlobalKey<FormState>();
  final _proofUrlController = TextEditingController();
  final _notesController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    if (widget.collaboration.deliverableProofUrl != null) {
      _proofUrlController.text = widget.collaboration.deliverableProofUrl!;
    }
  }

  @override
  void dispose() {
    _proofUrlController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _submitDeliverable() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSubmitting = true);

    try {
      await ref.read(collaborationServiceProvider).submitDeliverable(
            collaborationId: widget.collaboration.id,
            proofUrl: _proofUrlController.text.trim(),
            notes: _notesController.text.trim(),
          );

      ref.invalidate(collaborationsProvider);

      if (mounted) {
        setState(() => _isSubmitting = false);
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            icon: const Icon(Icons.check_circle_rounded, color: AppTheme.successColor, size: 48),
            title: const Text('Deliverables Submitted!'),
            content: const Text(
              'Your work has been submitted to the brand for review. You will be notified when they approve or request changes.',
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.of(ctx).pop();
                  Navigator.of(context).pop();
                },
                child: const Text('Done'),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSubmitting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Submission error: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.collaboration.status == 'REVISION_REQUESTED'
            ? 'Resubmit Deliverables'
            : 'Submit Deliverables'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                widget.collaboration.campaignTitle,
                style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Text(
                'Brand: ${widget.collaboration.brandName}',
                style: const TextStyle(fontSize: 14, color: AppTheme.textSecondary),
              ),
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppTheme.primaryColor.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Required Items:',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.primaryColor),
                    ),
                    const SizedBox(height: 6),
                    ...widget.collaboration.deliverables.map((d) => Text('• $d', style: const TextStyle(fontSize: 13))),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              CustomTextField(
                controller: _proofUrlController,
                label: 'Proof Link / Published URL *',
                hintText: 'https://instagram.com/reel/... or YouTube/Drive link',
                prefixIcon: const Icon(Icons.link_rounded),
                validator: (v) {
                  if (v == null || v.trim().isEmpty) return 'Please enter proof link';
                  if (!v.startsWith('http://') && !v.startsWith('https://')) {
                    return 'URL must start with https://';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 18),
              CustomTextField(
                controller: _notesController,
                label: 'Submission Notes & Metrics *',
                hintText: 'Describe the delivered content, mention stats or timestamps...',
                isMultiline: true,
                maxLines: 4,
                validator: (v) => v == null || v.trim().length < 5 ? 'Please provide submission notes' : null,
              ),
              const SizedBox(height: 32),
              CustomButton(
                label: 'Confirm & Send to Brand',
                icon: Icons.send_rounded,
                isLoading: _isSubmitting,
                onPressed: _submitDeliverable,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
