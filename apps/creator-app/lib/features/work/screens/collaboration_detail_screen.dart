import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/helpers.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../models/collaboration_model.dart';
import 'deliverable_submit_screen.dart';
import '../../reviews/screens/leave_review_screen.dart';
import '../../chat/screens/chat_conversation_screen.dart';

class CollaborationDetailScreen extends ConsumerWidget {
  final CollaborationModel collaboration;

  const CollaborationDetailScreen({super.key, required this.collaboration});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statusColor = Helpers.getStatusColor(collaboration.status);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Collaboration Dossier'),
        actions: [
          IconButton(
            icon: const Icon(Icons.chat_bubble_outline_rounded),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => ChatConversationScreen(
                    conversationId: 'conv_1',
                    otherUserName: collaboration.brandName,
                    otherUserRole: 'BUSINESS',
                    campaignTitle: collaboration.campaignTitle,
                  ),
                ),
              );
            },
          ),
        ],
      ),
      bottomNavigationBar: Container(
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
            if (collaboration.status == 'IN_PROGRESS' || collaboration.status == 'REVISION_REQUESTED')
              Expanded(
                child: CustomButton(
                  label: collaboration.status == 'REVISION_REQUESTED' ? 'Submit Revision' : 'Submit Deliverables',
                  icon: Icons.upload_file_rounded,
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => DeliverableSubmitScreen(collaboration: collaboration),
                      ),
                    );
                  },
                ),
              )
            else if (collaboration.status == 'COMPLETED' && !collaboration.hasCreatorReviewed)
              Expanded(
                child: CustomButton(
                  label: 'Rate & Review Brand',
                  icon: Icons.star_rounded,
                  backgroundColor: AppTheme.warningColor,
                  textColor: Colors.black87,
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => LeaveReviewScreen(collaboration: collaboration),
                      ),
                    );
                  },
                ),
              )
            else
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => ChatConversationScreen(
                          conversationId: 'conv_1',
                          otherUserName: collaboration.brandName,
                          otherUserRole: 'BUSINESS',
                          campaignTitle: collaboration.campaignTitle,
                        ),
                      ),
                    );
                  },
                  icon: const Icon(Icons.chat_rounded),
                  label: const Text('Message Partner'),
                ),
              ),
          ],
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: statusColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: statusColor.withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  Icon(Icons.track_changes_rounded, color: statusColor, size: 28),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Current State: ${collaboration.status.replaceAll('_', ' ')}',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                            color: statusColor,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          _getStatusDescription(collaboration.status),
                          style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            Text(
              collaboration.campaignTitle,
              style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            Text('Partner: ${collaboration.brandName}', style: const TextStyle(fontSize: 14, color: AppTheme.textSecondary)),
            const SizedBox(height: 20),
            Text(
              'Earnings & Escrow Settlement Breakdown',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F2F6),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Agreed Contract Value:'),
                      Text(Helpers.formatCurrencyINR(collaboration.agreedAmount), style: const TextStyle(fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Platform Fee (10%):', style: TextStyle(color: AppTheme.errorColor)),
                      Text('- ${Helpers.formatCurrencyINR(collaboration.platformFee)}', style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.errorColor)),
                    ],
                  ),
                  const Divider(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Net Creator Payout (90%):', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                      Text(
                        Helpers.formatCurrencyINR(collaboration.netPayout),
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          color: AppTheme.successColor,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Target Deliverables',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            ...collaboration.deliverables.map((d) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Row(
                  children: [
                    const Icon(Icons.check_circle_outline_rounded, color: AppTheme.primaryColor, size: 18),
                    const SizedBox(width: 10),
                    Text(d, style: const TextStyle(fontSize: 14)),
                  ],
                ),
              );
            }),
            if (collaboration.deliverableProofUrl != null) ...[
              const SizedBox(height: 20),
              Text(
                'Submitted Deliverable Proof',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.borderColor),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.link_rounded, color: AppTheme.primaryColor, size: 20),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            collaboration.deliverableProofUrl!,
                            style: const TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.w600),
                          ),
                        ),
                      ],
                    ),
                    if (collaboration.deliverableNotes != null) ...[
                      const SizedBox(height: 8),
                      Text(
                        'Creator Notes: "${collaboration.deliverableNotes}"',
                        style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary),
                      ),
                    ],
                  ],
                ),
              ),
            ],
            if (collaboration.revisionNotes != null) ...[
              const SizedBox(height: 20),
              Text(
                'Brand Revision Feedback (Round ${collaboration.revisionRounds}/2)',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppTheme.warningColor.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.warningColor.withOpacity(0.3)),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.edit_note_rounded, color: Colors.orange),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        collaboration.revisionNotes!,
                        style: const TextStyle(fontSize: 13, height: 1.4),
                      ),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  String _getStatusDescription(String status) {
    switch (status) {
      case 'IN_PROGRESS':
        return 'Escrow funded! Create your content according to the campaign brief.';
      case 'SUBMITTED':
        return 'Deliverables submitted. Waiting for brand review and approval.';
      case 'REVISION_REQUESTED':
        return 'Brand requested minor revisions. Please update and resubmit.';
      case 'APPROVED':
      case 'COMPLETED':
        return 'Work approved! Escrow payout released to your wallet.';
      default:
        return 'Active collaboration milestone.';
    }
  }
}
