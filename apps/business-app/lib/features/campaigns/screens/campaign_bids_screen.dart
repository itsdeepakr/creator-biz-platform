import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/helpers.dart';
import '../../../core/widgets/loading_indicator.dart';
import '../../../core/widgets/error_widget.dart';
import '../../../models/campaign_model.dart';
import '../../../models/bid_model.dart';
import '../../../providers/app_providers.dart';
import '../../payments/screens/escrow_checkout_screen.dart';
import '../../chat/screens/chat_conversation_screen.dart';

class CampaignBidsScreen extends ConsumerStatefulWidget {
  final CampaignModel campaign;

  const CampaignBidsScreen({super.key, required this.campaign});

  @override
  ConsumerState<CampaignBidsScreen> createState() => _CampaignBidsScreenState();
}

class _CampaignBidsScreenState extends ConsumerState<CampaignBidsScreen> {
  void _showCounterOfferDialog(BidModel bid) {
    final amountController = TextEditingController(text: bid.amount.toInt().toString());
    final notesController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Send Counter-Offer'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Creator: ${bid.creatorName}', style: const TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Text('Original Proposed Bid: ${Helpers.formatCurrencyINR(bid.amount)}'),
              const SizedBox(height: 16),
              TextField(
                controller: amountController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Counter Amount (INR) *',
                  prefixIcon: Icon(Icons.currency_rupee_rounded),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: notesController,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: 'Notes / Scope adjustments',
                  hintText: 'e.g. Can we include 1 additional story swipe-up?',
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              final newAmt = double.tryParse(amountController.text);
              if (newAmt == null || newAmt <= 0) return;
              Navigator.of(ctx).pop();
              await ref.read(campaignServiceProvider).counterBid(
                    campaignId: widget.campaign.id,
                    bidId: bid.id,
                    counterAmount: newAmt,
                    counterNotes: notesController.text.trim(),
                  );
              ref.invalidate(campaignBidsProvider(widget.campaign.id));
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Counter-offer of ₹${newAmt.toInt()} sent to ${bid.creatorName}!'),
                    backgroundColor: AppTheme.primaryColor,
                  ),
                );
              }
            },
            child: const Text('Send Counter'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bidsAsync = ref.watch(campaignBidsProvider(widget.campaign.id));

    return Scaffold(
      appBar: AppBar(
        title: Text('Pitches: ${widget.campaign.title}'),
      ),
      body: RefreshIndicator(
        onRefresh: () async => ref.invalidate(campaignBidsProvider(widget.campaign.id)),
        child: bidsAsync.when(
          loading: () => const LoadingIndicator(message: 'Loading creator pitches...'),
          error: (err, _) => ErrorDisplayWidget(
            message: err.toString(),
            onRetry: () => ref.invalidate(campaignBidsProvider(widget.campaign.id)),
          ),
          data: (bids) {
            if (bids.isEmpty) {
              return const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.group_outlined, size: 56, color: AppTheme.textTertiary),
                    SizedBox(height: 12),
                    Text('No creator bids received yet'),
                  ],
                ),
              );
            }

            return ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: bids.length,
              separatorBuilder: (_, __) => const SizedBox(height: 14),
              itemBuilder: (context, index) {
                final bid = bids[index];
                return _buildBidCard(context, bid);
              },
            );
          },
        ),
      ),
    );
  }

  Widget _buildBidCard(BuildContext context, BidModel bid) {
    final statusColor = Helpers.getStatusColor(bid.status);

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
                  radius: 24,
                  backgroundImage: bid.creatorAvatar != null ? NetworkImage(bid.creatorAvatar!) : null,
                  child: bid.creatorAvatar == null
                      ? Text(bid.creatorName[0], style: const TextStyle(fontWeight: FontWeight.bold))
                      : null,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        bid.creatorName,
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      Row(
                        children: [
                          const Icon(Icons.star_rounded, size: 15, color: Colors.amber),
                          const SizedBox(width: 2),
                          Text('${bid.creatorRating}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          const SizedBox(width: 8),
                          Text('${Helpers.getFollowerCount(bid.creatorFollowers)} followers', style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                        ],
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
                    bid.status,
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: statusColor),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Proposed Rate:', style: TextStyle(fontSize: 13, color: AppTheme.textSecondary)),
                      Text(
                        Helpers.formatCurrencyINR(bid.amount),
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
                      ),
                    ],
                  ),
                  if (bid.counterAmount != null) ...[
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Counter Sent:', style: TextStyle(fontSize: 13, color: AppTheme.primaryColor, fontWeight: FontWeight.bold)),
                        Text(
                          Helpers.formatCurrencyINR(bid.counterAmount!),
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.primaryColor),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              'Pitch Proposal:',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
            ),
            const SizedBox(height: 4),
            Text(
              bid.proposal,
              style: const TextStyle(fontSize: 13, height: 1.4, color: AppTheme.textSecondary),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 6,
              runSpacing: 4,
              children: bid.deliverables.map((del) {
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border.all(color: AppTheme.borderColor),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(del, style: const TextStyle(fontSize: 11)),
                );
              }).toList(),
            ),
            const Divider(height: 24, color: AppTheme.borderColor),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                IconButton(
                  icon: const Icon(Icons.chat_bubble_outline_rounded),
                  tooltip: 'Chat with Creator',
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => ChatConversationScreen(
                          conversationId: 'conv_1',
                          otherUserName: bid.creatorName,
                          otherUserRole: 'CREATOR',
                          campaignTitle: bid.campaignTitle,
                        ),
                      ),
                    );
                  },
                ),
                Row(
                  children: [
                    if (bid.status != 'ACCEPTED' && bid.status != 'REJECTED') ...[
                      OutlinedButton(
                        onPressed: () => _showCounterOfferDialog(bid),
                        child: const Text('Counter'),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton.icon(
                        onPressed: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => EscrowCheckoutScreen(
                                collaborationId: 'collab_new_${bid.id}',
                                campaignTitle: bid.campaignTitle,
                                creatorName: bid.creatorName,
                                agreedAmount: bid.counterAmount ?? bid.amount,
                                onPaymentSuccess: () async {
                                  await ref.read(campaignServiceProvider).acceptBid(
                                        widget.campaign.id,
                                        bid.id,
                                      );
                                  ref.invalidate(campaignBidsProvider(widget.campaign.id));
                                  ref.invalidate(businessCollaborationsProvider);
                                },
                              ),
                            ),
                          );
                        },
                        icon: const Icon(Icons.lock_rounded, size: 16),
                        label: const Text('Accept & Fund Escrow'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.successColor,
                        ),
                      ),
                    ],
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
