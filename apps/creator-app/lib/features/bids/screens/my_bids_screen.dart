import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/helpers.dart';
import '../../../core/widgets/loading_indicator.dart';
import '../../../core/widgets/error_widget.dart';
import '../../../models/bid_model.dart';
import '../../../providers/app_providers.dart';
import '../../chat/screens/chat_conversation_screen.dart';

class MyBidsScreen extends ConsumerStatefulWidget {
  const MyBidsScreen({super.key});

  @override
  ConsumerState<MyBidsScreen> createState() => _MyBidsScreenState();
}

class _MyBidsScreenState extends ConsumerState<MyBidsScreen> {
  void _showCounterOfferDialog(BuildContext context, BidModel bid) {
    final counterController = TextEditingController(
      text: bid.counterAmount != null ? bid.counterAmount!.toInt().toString() : '',
    );
    final notesController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          title: const Text('Review Counter-Offer'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Brand: ${bid.brandName ?? "Brand Partner"}',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Text('Original Bid: ${Helpers.formatCurrencyINR(bid.amount)}'),
                if (bid.counterAmount != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    'Brand Countered: ${Helpers.formatCurrencyINR(bid.counterAmount!)}',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      color: AppTheme.primaryColor,
                    ),
                  ),
                ],
                if (bid.counterNotes != null) ...[
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F2F6),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      'Note: ${bid.counterNotes!}',
                      style: const TextStyle(fontSize: 13, fontStyle: FontStyle.italic),
                    ),
                  ),
                ],
                const SizedBox(height: 16),
                const Text('Or Counter With New Price:'),
                const SizedBox(height: 6),
                TextField(
                  controller: counterController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    hintText: 'Enter amount in INR',
                    prefixIcon: Icon(Icons.currency_rupee_rounded),
                  ),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: notesController,
                  decoration: const InputDecoration(
                    hintText: 'Optional response note',
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () async {
                Navigator.of(ctx).pop();
                await ref.read(campaignServiceProvider).respondToCounterOffer(
                      bidId: bid.id,
                      accept: false,
                    );
                ref.invalidate(myBidsProvider);
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Counter offer rejected')),
                  );
                }
              },
              child: const Text('Reject', style: TextStyle(color: AppTheme.errorColor)),
            ),
            OutlinedButton(
              onPressed: () async {
                final newAmount = double.tryParse(counterController.text);
                if (newAmount == null || newAmount <= 0) return;
                Navigator.of(ctx).pop();
                await ref.read(campaignServiceProvider).respondToCounterOffer(
                      bidId: bid.id,
                      accept: false,
                      newCounterAmount: newAmount,
                      notes: notesController.text,
                    );
                ref.invalidate(myBidsProvider);
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Re-countered with ₹$newAmount!')),
                  );
                }
              },
              child: const Text('Send Counter'),
            ),
            ElevatedButton(
              onPressed: () async {
                Navigator.of(ctx).pop();
                await ref.read(campaignServiceProvider).respondToCounterOffer(
                      bidId: bid.id,
                      accept: true,
                    );
                ref.invalidate(myBidsProvider);
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Counter-offer accepted! Deal moving to execution.'),
                      backgroundColor: AppTheme.successColor,
                    ),
                  );
                }
              },
              child: const Text('Accept Terms'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final bidsAsync = ref.watch(myBidsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Pitches & Bids'),
      ),
      body: RefreshIndicator(
        onRefresh: () async => ref.invalidate(myBidsProvider),
        child: bidsAsync.when(
          loading: () => const LoadingIndicator(message: 'Loading your submitted bids...'),
          error: (err, _) => ErrorDisplayWidget(
            message: err.toString(),
            onRetry: () => ref.invalidate(myBidsProvider),
          ),
          data: (bids) {
            if (bids.isEmpty) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.gavel_outlined, size: 56, color: AppTheme.textTertiary),
                    const SizedBox(height: 12),
                    const Text('No bids submitted yet'),
                    const SizedBox(height: 8),
                    ElevatedButton(
                      onPressed: () => Navigator.of(context).pop(),
                      child: const Text('Explore Campaigns'),
                    ),
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
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    bid.campaignTitle,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    bid.status,
                    style: TextStyle(
                      color: statusColor,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              'Brand: ${bid.brandName ?? "Partner Brand"}',
              style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary),
            ),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F2F6),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Your Bid:', style: TextStyle(fontSize: 13)),
                      Text(
                        Helpers.formatCurrencyINR(bid.amount),
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  if (bid.counterAmount != null) ...[
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Counter-Offer:',
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.primaryColor),
                        ),
                        Text(
                          Helpers.formatCurrencyINR(bid.counterAmount!),
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.primaryColor,
                          ),
                        ),
                      ],
                    ),
                    if (bid.counterNotes != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        'Notes: "${bid.counterNotes!}"',
                        style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary, fontStyle: FontStyle.italic),
                      ),
                    ],
                  ],
                ],
              ),
            ),
            const SizedBox(height: 10),
            Text(
              bid.proposal,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary),
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  Helpers.getTimeAgo(bid.createdAt),
                  style: const TextStyle(fontSize: 12, color: AppTheme.textTertiary),
                ),
                Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.chat_bubble_outline_rounded, size: 20),
                      tooltip: 'Discuss Terms',
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => ChatConversationScreen(
                              conversationId: 'conv_1',
                              otherUserName: bid.brandName ?? 'Brand Partner',
                              otherUserRole: 'BUSINESS',
                              campaignTitle: bid.campaignTitle,
                            ),
                          ),
                        );
                      },
                    ),
                    if (bid.status == 'COUNTERED') ...[
                      const SizedBox(width: 4),
                      ElevatedButton(
                        onPressed: () => _showCounterOfferDialog(context, bid),
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                        child: const Text('Review Counter'),
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
