import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/custom_text_field.dart';
import '../../../models/collaboration_model.dart';
import '../../../providers/app_providers.dart';

class RateCreatorScreen extends ConsumerStatefulWidget {
  final CollaborationModel collaboration;

  const RateCreatorScreen({super.key, required this.collaboration});

  @override
  ConsumerState<RateCreatorScreen> createState() => _RateCreatorScreenState();
}

class _RateCreatorScreenState extends ConsumerState<RateCreatorScreen> {
  double _overallRating = 5.0;
  double _qualityRating = 5.0;
  double _commRating = 5.0;
  double _timelinessRating = 5.0;
  final _commentController = TextEditingController(
    text: 'Exceptional content quality! Aarav understood our product brief perfectly and delivered on time.',
  );
  bool _isSubmitting = false;

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _submitReview() async {
    setState(() => _isSubmitting = true);

    try {
      await ref.read(reviewServiceProvider).leaveReview(
            collaborationId: widget.collaboration.id,
            campaignTitle: widget.collaboration.campaignTitle,
            targetCreatorId: widget.collaboration.creatorId,
            rating: _overallRating,
            qualityRating: _qualityRating,
            communicationRating: _commRating,
            timelinessRating: _timelinessRating,
            comment: _commentController.text.trim(),
          );

      ref.invalidate(businessCollaborationsProvider);

      if (mounted) {
        setState(() => _isSubmitting = false);
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (ctx) => AlertDialog(
            icon: const Icon(Icons.stars_rounded, color: Colors.amber, size: 54),
            title: const Text('Review Published!'),
            content: Text(
              'Thank you for rating ${widget.collaboration.creatorName}. Your mutual rating has been added to their public creator reputation score.',
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Rate Creator Performance'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: CircleAvatar(
                  radius: 36,
                  backgroundImage: widget.collaboration.creatorAvatar != null
                      ? NetworkImage(widget.collaboration.creatorAvatar!)
                      : null,
                  child: widget.collaboration.creatorAvatar == null
                      ? Text(widget.collaboration.creatorName[0], style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold))
                      : null,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                widget.collaboration.creatorName,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              Text(
                widget.collaboration.campaignTitle,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary),
              ),
              const SizedBox(height: 24),
              const Text(
                'Overall Experience Rating',
                textAlign: TextAlign.center,
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(5, (index) {
                  final starNum = index + 1;
                  return IconButton(
                    iconSize: 36,
                    icon: Icon(
                      starNum <= _overallRating ? Icons.star_rounded : Icons.star_outline_rounded,
                      color: Colors.amber,
                    ),
                    onPressed: () => setState(() => _overallRating = starNum.toDouble()),
                  );
                }),
              ),
              const Divider(height: 32),
              const Text('Detailed Criteria', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              const SizedBox(height: 12),
              _buildCriteriaRow('Content Quality & Production:', _qualityRating, (v) => setState(() => _qualityRating = v)),
              _buildCriteriaRow('Communication & Responsiveness:', _commRating, (v) => setState(() => _commRating = v)),
              _buildCriteriaRow('Timeliness & Deadline Adherence:', _timelinessRating, (v) => setState(() => _timelinessRating = v)),
              const SizedBox(height: 20),
              CustomTextField(
                controller: _commentController,
                label: 'Written Testimonial / Feedback',
                hintText: 'Share your experience working with this creator...',
                isMultiline: true,
                maxLines: 4,
              ),
              const SizedBox(height: 28),
              CustomButton(
                label: 'Publish Rating & Review',
                icon: Icons.send_rounded,
                isLoading: _isSubmitting,
                onPressed: _submitReview,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCriteriaRow(String title, double value, ValueChanged<double> onChanged) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(child: Text(title, style: const TextStyle(fontSize: 13))),
          Row(
            children: List.generate(5, (index) {
              final starNum = index + 1;
              return InkWell(
                onTap: () => onChanged(starNum.toDouble()),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 2),
                  child: Icon(
                    starNum <= value ? Icons.star_rounded : Icons.star_outline_rounded,
                    color: Colors.amber,
                    size: 22,
                  ),
                ),
              );
            }),
          ),
        ],
      ),
    );
  }
}
