import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/custom_text_field.dart';
import '../../../models/collaboration_model.dart';
import '../../../providers/app_providers.dart';

class FileDisputeScreen extends ConsumerStatefulWidget {
  final CollaborationModel collaboration;

  const FileDisputeScreen({super.key, required this.collaboration});

  @override
  ConsumerState<FileDisputeScreen> createState() => _FileDisputeScreenState();
}

class _FileDisputeScreenState extends ConsumerState<FileDisputeScreen> {
  final _formKey = GlobalKey<FormState>();
  String _selectedReason = AppConstants.disputeReasons.first;
  final _evidenceController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _evidenceController.dispose();
    super.dispose();
  }

  Future<void> _submitDispute() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSubmitting = true);

    try {
      await ref.read(disputeServiceProvider).fileDispute(
            collaborationId: widget.collaboration.id,
            campaignTitle: widget.collaboration.campaignTitle,
            creatorName: widget.collaboration.creatorName,
            reason: _selectedReason,
            evidenceNotes: _evidenceController.text.trim(),
          );

      ref.invalidate(disputesProvider);

      if (mounted) {
        setState(() => _isSubmitting = false);
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (ctx) => AlertDialog(
            icon: const Icon(Icons.gavel_rounded, color: AppTheme.errorColor, size: 54),
            title: const Text('Dispute Filed for Admin Review'),
            content: const Text(
              'Your dispute ticket has been registered. Our platform arbitration team will review the deliverables, message logs, and escrow contract terms within 24-48 business hours.',
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
          SnackBar(content: Text('Failed to submit dispute: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('File Contract Dispute'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppTheme.errorColor.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppTheme.errorColor.withOpacity(0.3)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.info_outline_rounded, color: AppTheme.errorColor, size: 28),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Text(
                          'Filing a dispute pauses automatic escrow release and places the funds into locked arbitration.',
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
                  'Deal: ${widget.collaboration.campaignTitle}',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                Text(
                  'Creator: ${widget.collaboration.creatorName}',
                  style: const TextStyle(color: AppTheme.textSecondary, fontSize: 14),
                ),
                const SizedBox(height: 20),
                DropdownButtonFormField<String>(
                  initialValue: _selectedReason,
                  isExpanded: true,
                  decoration: const InputDecoration(
                    labelText: 'Dispute Reason *',
                  ),
                  items: AppConstants.disputeReasons.map((r) {
                    return DropdownMenuItem(value: r, child: Text(r, overflow: TextOverflow.ellipsis));
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) setState(() => _selectedReason = val);
                  },
                ),
                const SizedBox(height: 16),
                CustomTextField(
                  controller: _evidenceController,
                  label: 'Evidence & Detailed Explanation *',
                  hintText: 'Please detail specific timestamps, missing requirements, or breach of guidelines...',
                  isMultiline: true,
                  maxLines: 5,
                  validator: (v) => v == null || v.trim().length < 10 ? 'Provide detailed explanation' : null,
                ),
                const SizedBox(height: 28),
                CustomButton(
                  label: 'Submit Dispute for Arbitration',
                  backgroundColor: AppTheme.errorColor,
                  isLoading: _isSubmitting,
                  onPressed: _submitDispute,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
