import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/custom_text_field.dart';
import '../../../models/collaboration_model.dart';
import '../../../providers/app_providers.dart';

class LeaveReviewScreen extends ConsumerStatefulWidget {
  final CollaborationModel collaboration;

  const LeaveReviewScreen({super.key, required this.collaboration});

  @override
  ConsumerState<LeaveReviewScreen> createState() => _LeaveReviewScreenState();
}

class _LeaveReviewScreenState extends ConsumerState<LeaveReviewScreen> {
  final _formKey = GlobalKey<FormState>();
  final _commentController = TextEditingController();
  double _overallRating = 5.0;
  double _communicationRating = 5.0;
  double _clarityRating = 5.0;
  double _timelinessRating = 5.0;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _submitReview() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSubmitting = true);

    try {
      await ref.read(reviewServiceProvider).leaveReview(
            collaborationId: widget.collaboration.id,
            campaignTitle: widget.collaboration.campaignTitle,
            targetId: widget.collaboration.brandId,
            rating: _overallRating,
            communicationRating: _communicationRating,
            qualityRating: _clarityRating,
            timelinessRating: _timelinessRating,
            comment: _commentController.text.trim(),
          );

      if (mounted) {
        setState(() => _isSubmitting = false);
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            icon: const Icon(Icons.stars_rounded, color: Colors.amber, size: 54),
            title: const Text('Review Published!'),
            content: const Text(
              'Thank you for rating your collaboration partner. Your feedback helps build a trusted marketplace ecosystem.',
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
          SnackBar(content: Text('Failed to submit review: $e')),
        );
      }
    }
  }

  Widget _buildStarRow(String title, double currentRating, ValueChanged<double> onRatingChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
            Text('${currentRating.toInt()} / 5', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.amber)),
          ],
        ),
        const SizedBox(height: 4),
        Row(
          children: List.generate(5, (index) {
            final starVal = (index + 1).toDouble();
            final isFilled = starVal <= currentRating;
            return IconButton(
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
              icon: Icon(
                isFilled ? Icons.star_rounded : Icons.star_border_rounded,
                color: Colors.amber,
                size: 32,
              ),
              onPressed: () => onRatingChanged(starVal),
            );
          }),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Rate Business Partner'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 30,
                      backgroundColor: AppTheme.primaryColor.withOpacity(0.1),
                      child: Text(
                        widget.collaboration.brandName[0],
                        style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppTheme.primaryColor),
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      widget.collaboration.brandName,
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      widget.collaboration.campaignTitle,
                      style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
              const Divider(height: 32, color: AppTheme.borderColor),
              _buildStarRow('Overall Experience', _overallRating, (v) => setState(() => _overallRating = v)),
              const SizedBox(height: 12),
              _buildStarRow('Communication & Support', _communicationRating, (v) => setState(() => _communicationRating = v)),
              const SizedBox(height: 12),
              _buildStarRow('Clarity of Brief & Guidelines', _clarityRating, (v) => setState(() => _clarityRating = v)),
              const SizedBox(height: 12),
              _buildStarRow('Promptness of Review & Approval', _timelinessRating, (v) => setState(() => _timelinessRating = v)),
              const SizedBox(height: 20),
              CustomTextField(
                controller: _commentController,
                label: 'Written Feedback & Review *',
                hintText: 'Share your experience working with this brand...',
                isMultiline: true,
                maxLines: 4,
                validator: (v) => v == null || v.trim().length < 5 ? 'Please write a brief review' : null,
              ),
              const SizedBox(height: 32),
              CustomButton(
                label: 'Submit Mutual Review',
                icon: Icons.star_rate_rounded,
                isLoading: _isSubmitting,
                onPressed: _submitReview,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
