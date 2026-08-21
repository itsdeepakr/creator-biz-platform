import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/helpers.dart';
import '../../../core/widgets/loading_indicator.dart';
import '../../../core/widgets/error_widget.dart';
import '../../../models/collaboration_model.dart';
import '../../../providers/app_providers.dart';
import 'deliverable_review_screen.dart';
import 'file_dispute_screen.dart';
import '../../reviews/screens/rate_creator_screen.dart';
import '../../chat/screens/chat_conversation_screen.dart';

class CollaborationsListScreen extends ConsumerStatefulWidget {
  const CollaborationsListScreen({super.key});

  @override
  ConsumerState<CollaborationsListScreen> createState() => _CollaborationsListScreenState();
}

class _CollaborationsListScreenState extends ConsumerState<CollaborationsListScreen> {
  String _selectedStatus = 'ALL';

  final List<String> _tabs = [
    'ALL',
    'IN_PROGRESS',
    'SUBMITTED',
    'REVISION_REQUESTED',
    'COMPLETED',
  ];

  String _formatTab(String tab) {
    switch (tab) {
      case 'ALL':
        return 'All Collaborations';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'SUBMITTED':
        return 'Needs Review';
      case 'REVISION_REQUESTED':
        return 'In Revision';
      case 'COMPLETED':
        return 'Completed';
      default:
        return tab;
    }
  }

  @override
  Widget build(BuildContext context) {
    final collabsAsync = ref.watch(businessCollaborationsProvider(_selectedStatus));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Collaboration Deals & Escrow', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: Column(
        children: [
          SizedBox(
            height: 48,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              itemCount: _tabs.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final tab = _tabs[index];
                final isSelected = tab == _selectedStatus;
                return ChoiceChip(
                  label: Text(_formatTab(tab)),
                  selected: isSelected,
                  selectedColor: AppTheme.primaryColor,
                  labelStyle: TextStyle(
                    color: isSelected ? Colors.white : AppTheme.textPrimary,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    fontSize: 12,
                  ),
                  onSelected: (_) => setState(() => _selectedStatus = tab),
                );
              },
            ),
          ),
          Expanded(
            child: RefreshIndicator(
              onRefresh: () async => ref.invalidate(businessCollaborationsProvider),
              child: collabsAsync.when(
                loading: () => const LoadingIndicator(message: 'Loading active deals...'),
                error: (err, _) => ErrorDisplayWidget(
                  message: err.toString(),
                  onRetry: () => ref.invalidate(businessCollaborationsProvider),
                ),
                data: (collabs) {
                  if (collabs.isEmpty) {
                    return const Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.handshake_outlined, size: 56, color: AppTheme.textTertiary),
                          SizedBox(height: 12),
                          Text('No active collaborations in this filter'),
                        ],
                      ),
                    );
                  }

                  return ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: collabs.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 14),
                    itemBuilder: (context, index) {
                      final collab = collabs[index];
                      return _buildCollaborationCard(collab);
                    },
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCollaborationCard(CollaborationModel collab) {
    final statusColor = Helpers.getStatusColor(collab.status);

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: AppTheme.borderColor),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 22,
                  backgroundImage:
                      collab.creatorAvatar != null ? NetworkImage(collab.creatorAvatar!) : null,
                  child: collab.creatorAvatar == null
                      ? Text(collab.creatorName[0], style: const TextStyle(fontWeight: FontWeight.bold))
                      : null,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        collab.creatorName,
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        collab.campaignTitle,
                        style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
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
                    collab.status.replaceAll('_', ' '),
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: statusColor),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.lock_rounded, size: 16, color: AppTheme.successColor),
                      const SizedBox(width: 6),
                      Text(
                        'Escrow Funded: ${Helpers.formatCurrencyINR(collab.agreedAmount)}',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                    ],
                  ),
                  if (collab.revisionRounds > 0)
                    Text(
                      'Round ${collab.revisionRounds}/2',
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.orange),
                    ),
                ],
              ),
            ),
            if (collab.deliverableProofUrl != null) ...[
              const SizedBox(height: 10),
              Text(
                'Submitted: ${collab.deliverableProofUrl}',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 12, color: AppTheme.primaryColor, fontWeight: FontWeight.w500),
              ),
            ],
            const Divider(height: 24, color: AppTheme.borderColor),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.chat_bubble_outline_rounded, size: 20),
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => ChatConversationScreen(
                              conversationId: 'conv_1',
                              otherUserName: collab.creatorName,
                              otherUserRole: 'CREATOR',
                              campaignTitle: collab.campaignTitle,
                            ),
                          ),
                        );
                      },
                    ),
                    TextButton.icon(
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => FileDisputeScreen(collaboration: collab),
                          ),
                        );
                      },
                      icon: const Icon(Icons.gavel_rounded, size: 16, color: AppTheme.errorColor),
                      label: const Text('Dispute', style: TextStyle(color: AppTheme.errorColor, fontSize: 12)),
                    ),
                  ],
                ),
                Row(
                  children: [
                    if (collab.status == 'SUBMITTED')
                      ElevatedButton.icon(
                        onPressed: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => DeliverableReviewScreen(collaboration: collab),
                            ),
                          );
                        },
                        icon: const Icon(Icons.rate_review_rounded, size: 16),
                        label: const Text('Review & Approve'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primaryColor,
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                      )
                    else if (collab.status == 'COMPLETED' && !collab.hasBrandReviewed)
                      ElevatedButton.icon(
                        onPressed: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => RateCreatorScreen(collaboration: collab),
                            ),
                          );
                        },
                        icon: const Icon(Icons.star_rounded, size: 16),
                        label: const Text('Rate Creator'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.amber[700],
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                      )
                    else
                      OutlinedButton(
                        onPressed: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => DeliverableReviewScreen(collaboration: collab),
                            ),
                          );
                        },
                        child: const Text('View Deal Details'),
                      ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
