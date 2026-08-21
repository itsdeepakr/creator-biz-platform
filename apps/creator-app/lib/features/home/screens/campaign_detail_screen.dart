import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/helpers.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/bid_sheet.dart';
import '../../../models/campaign_model.dart';
import '../../chat/screens/chat_conversation_screen.dart';

class CampaignDetailScreen extends ConsumerWidget {
  final CampaignModel campaign;

  const CampaignDetailScreen({super.key, required this.campaign});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Campaign Brief'),
        actions: [
          IconButton(
            icon: const Icon(Icons.chat_bubble_outline_rounded),
            tooltip: 'Message Brand',
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => ChatConversationScreen(
                    conversationId: 'conv_1',
                    otherUserName: campaign.brandName,
                    otherUserRole: 'BUSINESS',
                    campaignTitle: campaign.title,
                  ),
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.share_outlined),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Campaign link copied to clipboard!')),
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
            Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Max Budget', style: TextStyle(fontSize: 11, color: AppTheme.textTertiary)),
                Text(
                  Helpers.formatCurrencyINR(campaign.budgetMax),
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.successColor,
                  ),
                ),
              ],
            ),
            const SizedBox(width: 20),
            Expanded(
              child: CustomButton(
                label: 'Place Your Bid',
                icon: Icons.gavel_rounded,
                onPressed: () {
                  BidSheet.show(
                    context,
                    campaignId: campaign.id,
                    campaignTitle: campaign.title,
                    campaignBudget: campaign.budgetMax,
                    availableDeliverables: campaign.deliverables,
                  );
                },
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
            Row(
              children: [
                CircleAvatar(
                  radius: 28,
                  backgroundColor: AppTheme.primaryColor.withOpacity(0.1),
                  child: Text(
                    campaign.brandName.substring(0, 1).toUpperCase(),
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.primaryColor),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        campaign.brandName,
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppTheme.textSecondary),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        campaign.title,
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                Chip(
                  label: Text('Category: ${campaign.category}'),
                  backgroundColor: AppTheme.primaryLight.withOpacity(0.2),
                ),
                Chip(
                  avatar: const Icon(Icons.schedule_rounded, size: 16),
                  label: Text('Deadline: ${Helpers.formatDate(campaign.deadline)}'),
                ),
                Chip(
                  avatar: const Icon(Icons.people_outline_rounded, size: 16),
                  label: Text('${campaign.applicantCount} applicants'),
                ),
              ],
            ),
            const Divider(height: 32, color: AppTheme.borderColor),
            Text(
              'Campaign Overview',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              campaign.description,
              style: const TextStyle(fontSize: 14, height: 1.5, color: AppTheme.textSecondary),
            ),
            const SizedBox(height: 24),
            Text(
              'Required Deliverables',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            ...campaign.deliverables.map((d) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  children: [
                    const Icon(Icons.check_circle_rounded, color: AppTheme.primaryColor, size: 18),
                    const SizedBox(width: 10),
                    Text(d, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                  ],
                ),
              );
            }),
            if (campaign.requirements.isNotEmpty) ...[
              const SizedBox(height: 24),
              Text(
                'Creator Eligibility',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              ...campaign.requirements.map((r) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.star_rounded, color: AppTheme.warningColor, size: 18),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(r, style: const TextStyle(fontSize: 14, color: AppTheme.textSecondary)),
                      ),
                    ],
                  ),
                );
              }),
            ],
            if (campaign.guidelines != null) ...[
              const SizedBox(height: 24),
              Text(
                'Brand Guidelines & Key Messages',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F2F6),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  campaign.guidelines!,
                  style: const TextStyle(fontSize: 13, height: 1.4, color: AppTheme.textPrimary),
                ),
              ),
            ],
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.successColor.withOpacity(0.08),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.successColor.withOpacity(0.3)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.lock_rounded, color: AppTheme.successColor, size: 28),
                  SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '100% Escrow Protection',
                          style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.successColor),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Brand deposits 100% contract funds before work starts. Payout released upon deliverable approval.',
                          style: TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}
