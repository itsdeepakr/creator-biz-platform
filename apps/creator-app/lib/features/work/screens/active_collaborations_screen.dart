import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/helpers.dart';
import '../../../core/widgets/loading_indicator.dart';
import '../../../core/widgets/error_widget.dart';
import '../../../models/collaboration_model.dart';
import '../../../providers/app_providers.dart';
import 'collaboration_detail_screen.dart';
import 'deliverable_submit_screen.dart';
import '../../reviews/screens/leave_review_screen.dart';

class ActiveCollaborationsScreen extends ConsumerStatefulWidget {
  const ActiveCollaborationsScreen({super.key});

  @override
  ConsumerState<ActiveCollaborationsScreen> createState() => _ActiveCollaborationsScreenState();
}

class _ActiveCollaborationsScreenState extends ConsumerState<ActiveCollaborationsScreen> {
  String _selectedStatus = 'ALL';

  final List<String> _filterTabs = [
    'ALL',
    'IN_PROGRESS',
    'SUBMITTED',
    'REVISION_REQUESTED',
    'COMPLETED',
  ];

  String _formatTabName(String tab) {
    switch (tab) {
      case 'ALL':
        return 'All Deals';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'SUBMITTED':
        return 'Under Review';
      case 'REVISION_REQUESTED':
        return 'Revisions';
      case 'COMPLETED':
        return 'Completed';
      default:
        return tab;
    }
  }

  @override
  Widget build(BuildContext context) {
    final collabsAsync = ref.watch(collaborationsProvider(_selectedStatus));

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Work & Collaborations', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: Column(
        children: [
          SizedBox(
            height: 48,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              itemCount: _filterTabs.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final tab = _filterTabs[index];
                final isSelected = tab == _selectedStatus;
                return ChoiceChip(
                  label: Text(_formatTabName(tab)),
                  selected: isSelected,
                  selectedColor: AppTheme.primaryColor,
                  labelStyle: TextStyle(
                    color: isSelected ? Colors.white : AppTheme.textPrimary,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    fontSize: 12,
                  ),
                  onSelected: (_) {
                    setState(() => _selectedStatus = tab);
                  },
                );
              },
            ),
          ),
          Expanded(
            child: RefreshIndicator(
              onRefresh: () async => ref.invalidate(collaborationsProvider),
              child: collabsAsync.when(
                loading: () => const LoadingIndicator(message: 'Loading active collaborations...'),
                error: (err, _) => ErrorDisplayWidget(
                  message: err.toString(),
                  onRetry: () => ref.invalidate(collaborationsProvider),
                ),
                data: (collabs) {
                  if (collabs.isEmpty) {
                    return const Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.assignment_outlined, size: 56, color: AppTheme.textTertiary),
                          SizedBox(height: 12),
                          Text('No collaborations in this stage'),
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
                      return _buildCollaborationCard(context, collab);
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

  Widget _buildCollaborationCard(BuildContext context, CollaborationModel collab) {
    final statusColor = Helpers.getStatusColor(collab.status);

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: AppTheme.borderColor),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (_) => CollaborationDetailScreen(collaboration: collab),
            ),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          collab.brandName,
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppTheme.textSecondary),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          collab.campaignTitle,
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: statusColor.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      collab.status.replaceAll('_', ' '),
                      style: TextStyle(
                        color: statusColor,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 6,
                runSpacing: 4,
                children: collab.deliverables.map((del) {
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F2F6),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(del, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500)),
                  );
                }).toList(),
              ),
              if (collab.status == 'REVISION_REQUESTED' && collab.revisionNotes != null) ...[
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppTheme.warningColor.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppTheme.warningColor.withOpacity(0.4)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.sync_problem_rounded, color: Colors.orange, size: 20),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Round ${collab.revisionRounds}/2 Revision: "${collab.revisionNotes}"',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
              const Divider(height: 20, color: AppTheme.borderColor),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Net Payout (after 10% fee)', style: TextStyle(fontSize: 11, color: AppTheme.textTertiary)),
                      const SizedBox(height: 2),
                      Text(
                        Helpers.formatCurrencyINR(collab.netPayout),
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.successColor,
                        ),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      if (collab.status == 'IN_PROGRESS' || collab.status == 'REVISION_REQUESTED')
                        ElevatedButton.icon(
                          onPressed: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => DeliverableSubmitScreen(collaboration: collab),
                              ),
                            );
                          },
                          icon: const Icon(Icons.upload_file_rounded, size: 16),
                          label: Text(collab.status == 'REVISION_REQUESTED' ? 'Resubmit' : 'Submit Work'),
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                            textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                        )
                      else if (collab.status == 'COMPLETED' && !collab.hasCreatorReviewed)
                        ElevatedButton.icon(
                          onPressed: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => LeaveReviewScreen(collaboration: collab),
                              ),
                            );
                          },
                          icon: const Icon(Icons.star_outline_rounded, size: 16),
                          label: const Text('Rate Brand'),
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                            backgroundColor: AppTheme.warningColor,
                            foregroundColor: Colors.black87,
                            textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                        )
                      else
                        OutlinedButton(
                          onPressed: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => CollaborationDetailScreen(collaboration: collab),
                              ),
                            );
                          },
                          child: const Text('View Status'),
                        ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
