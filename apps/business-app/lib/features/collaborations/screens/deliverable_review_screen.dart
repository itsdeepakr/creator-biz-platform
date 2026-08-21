import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/helpers.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/custom_text_field.dart';
import '../../../models/collaboration_model.dart';
import '../../../providers/app_providers.dart';
import 'file_dispute_screen.dart';
import '../../reviews/screens/rate_creator_screen.dart';
import '../../chat/screens/chat_conversation_screen.dart';

class DeliverableReviewScreen extends ConsumerStatefulWidget {
  final CollaborationModel collaboration;

  const DeliverableReviewScreen({super.key, required this.collaboration});

  @override
  ConsumerState<DeliverableReviewScreen> createState() => _DeliverableReviewScreenState();
}

class _DeliverableReviewScreenState extends ConsumerState<DeliverableReviewScreen> {
  bool _isProcessing = false;

  void _showRevisionDialog() {
    final revisionController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Request Revision (Round ${widget.collaboration.revisionRounds + 1}/2)'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Please provide clear, actionable feedback for the creator to update their submitted content.',
              style: TextStyle(fontSize: 13, color: AppTheme.textSecondary),
            ),
            const SizedBox(height: 14),
            CustomTextField(
              controller: revisionController,
              label: 'Revision Feedback Notes *',
              hintText: 'e.g. Please add close-up shots of the product label and include #BrandCampaign hashtag...',
              isMultiline: true,
              maxLines: 4,
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              if (revisionController.text.trim().isEmpty) return;
              Navigator.of(ctx).pop();
              setState(() => _isProcessing = true);
              await ref.read(collaborationServiceProvider).requestRevision(
                    collaborationId: widget.collaboration.id,
                    notes: revisionController.text.trim(),
                  );
              ref.invalidate(businessCollaborationsProvider);
              if (mounted) {
                setState(() => _isProcessing = false);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Revision request sent to creator!'),
                    backgroundColor: Colors.orange,
                  ),
                );
                Navigator.of(context).pop();
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.orange),
            child: const Text('Send Revision Request'),
          ),
        ],
      ),
    );
  }

  void _confirmApproval() {
    final netPayout = widget.collaboration.agreedAmount * 0.90;
    final platformFee = widget.collaboration.agreedAmount * 0.10;

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        icon: const Icon(Icons.verified_user_rounded, color: AppTheme.successColor, size: 48),
        title: const Text('Approve Work & Release Escrow?'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Approving this submission will instantly release funds from escrow to the creator wallet:'),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total Escrow Release:'),
                      Text(Helpers.formatCurrencyINR(widget.collaboration.agreedAmount), style: const TextStyle(fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Platform Fee (10%):', style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                      Text(Helpers.formatCurrencyINR(platformFee), style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Creator Net Payout (90%):', style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.successColor)),
                      Text(Helpers.formatCurrencyINR(netPayout), style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.successColor)),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              Navigator.of(ctx).pop();
              setState(() => _isProcessing = true);
              await ref.read(collaborationServiceProvider).approveDeliverableAndReleasePayout(
                    widget.collaboration.id,
                  );
              ref.invalidate(businessCollaborationsProvider);
              if (mounted) {
                setState(() => _isProcessing = false);
                Navigator.of(context).pushReplacement(
                  MaterialPageRoute(
                    builder: (_) => RateCreatorScreen(collaboration: widget.collaboration),
                  ),
                );
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.successColor),
            child: const Text('Approve & Release Funds'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final statusColor = Helpers.getStatusColor(widget.collaboration.status);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Review Deliverables'),
        actions: [
          IconButton(
            icon: const Icon(Icons.chat_bubble_outline_rounded),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => ChatConversationScreen(
                    conversationId: 'conv_1',
                    otherUserName: widget.collaboration.creatorName,
                    otherUserRole: 'CREATOR',
                    campaignTitle: widget.collaboration.campaignTitle,
                  ),
                ),
              );
            },
          ),
        ],
      ),
      bottomNavigationBar: widget.collaboration.status == 'SUBMITTED'
          ? Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              decoration: BoxDecoration(
                color: Theme.of(context).scaffoldBackgroundColor,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.06),
                    blurRadius: 10,
                    offset: const Offset(0, -3),
                  ),
                ],
              ),
              child: Row(
                children: [
                  if (widget.collaboration.revisionRounds < widget.collaboration.maxRevisionRounds)
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: _isProcessing ? null : _showRevisionDialog,
                        icon: const Icon(Icons.sync_rounded),
                        label: Text('Request Revision (${widget.collaboration.revisionRounds}/2)'),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          foregroundColor: Colors.orange,
                          side: const BorderSide(color: Colors.orange),
                        ),
                      ),
                    ),
                  if (widget.collaboration.revisionRounds < widget.collaboration.maxRevisionRounds)
                    const SizedBox(width: 12),
                  Expanded(
                    child: CustomButton(
                      label: 'Approve & Release Payout',
                      icon: Icons.check_circle_rounded,
                      backgroundColor: AppTheme.successColor,
                      isLoading: _isProcessing,
                      onPressed: _confirmApproval,
                    ),
                  ),
                ],
              ),
            )
          : null,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 26,
                  backgroundImage: widget.collaboration.creatorAvatar != null
                      ? NetworkImage(widget.collaboration.creatorAvatar!)
                      : null,
                  child: widget.collaboration.creatorAvatar == null
                      ? Text(widget.collaboration.creatorName[0], style: const TextStyle(fontWeight: FontWeight.bold))
                      : null,
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.collaboration.creatorName,
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        widget.collaboration.campaignTitle,
                        style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    widget.collaboration.status.replaceAll('_', ' '),
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: statusColor),
                  ),
                ),
              ],
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
                  const Row(
                    children: [
                      Icon(Icons.link_rounded, color: AppTheme.primaryColor, size: 24),
                      SizedBox(width: 10),
                      Text('Submitted Proof Link', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                    ],
                  ),
                  const SizedBox(height: 10),
                  SelectableText(
                    widget.collaboration.deliverableProofUrl ?? 'No URL provided',
                    style: const TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.w600, fontSize: 14),
                  ),
                  if (widget.collaboration.deliverableNotes != null) ...[
                    const Divider(height: 24),
                    const Text('Creator Notes:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    const SizedBox(height: 4),
                    Text(
                      widget.collaboration.deliverableNotes!,
                      style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary, height: 1.4),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'Agreed Deliverables Checklist',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            ...widget.collaboration.deliverables.map((d) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Row(
                  children: [
                    const Icon(Icons.check_circle_outline_rounded, color: AppTheme.successColor, size: 18),
                    const SizedBox(width: 10),
                    Text(d, style: const TextStyle(fontSize: 14)),
                  ],
                ),
              );
            }),
            const SizedBox(height: 24),
            Text(
              'Escrow Payment Security',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Funded in Escrow:'),
                      Text(Helpers.formatCurrencyINR(widget.collaboration.agreedAmount), style: const TextStyle(fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Escrow Payment ID:'),
                      Text(widget.collaboration.escrowPaymentId ?? 'pay_rzp_escrow_88921', style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            Align(
              alignment: Alignment.centerRight,
              child: TextButton.icon(
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => FileDisputeScreen(collaboration: widget.collaboration),
                    ),
                  );
                },
                icon: const Icon(Icons.report_problem_outlined, color: AppTheme.errorColor, size: 18),
                label: const Text('Raise Formal Dispute', style: TextStyle(color: AppTheme.errorColor)),
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}
