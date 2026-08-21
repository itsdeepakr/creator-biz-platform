import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/helpers.dart';
import '../../../core/widgets/loading_indicator.dart';
import '../../../core/widgets/error_widget.dart';
import '../../../providers/app_providers.dart';
import 'edit_profile_screen.dart';
import 'social_connect_screen.dart';
import '../../portfolio/screens/portfolio_screen.dart';
import '../../wallet/screens/wallet_screen.dart';
import '../../auth/screens/kyc_screen.dart';
import '../../auth/screens/login_screen.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileAsync = ref.watch(myProfileProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Creator Profile', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_outlined),
            tooltip: 'Edit Profile',
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const EditProfileScreen()),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: AppTheme.errorColor),
            tooltip: 'Logout',
            onPressed: () async {
              await ref.read(authStateProvider.notifier).logout();
              if (context.mounted) {
                Navigator.of(context).pushAndRemoveUntil(
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                  (route) => false,
                );
              }
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async => ref.invalidate(myProfileProvider),
        child: profileAsync.when(
          loading: () => const LoadingIndicator(message: 'Loading creator profile...'),
          error: (err, _) => ErrorDisplayWidget(
            message: err.toString(),
            onRetry: () => ref.invalidate(myProfileProvider),
          ),
          data: (profile) {
            return SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Profile Header
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 36,
                        backgroundImage: profile.avatarUrl != null ? NetworkImage(profile.avatarUrl!) : null,
                        child: profile.avatarUrl == null
                            ? Text(profile.displayName[0], style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold))
                            : null,
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Flexible(
                                  child: Text(
                                    profile.displayName,
                                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                const SizedBox(width: 6),
                                const Icon(Icons.verified_rounded, color: AppTheme.primaryColor, size: 20),
                              ],
                            ),
                            Text(
                              '@${profile.handle}',
                              style: const TextStyle(fontSize: 14, color: AppTheme.textSecondary),
                            ),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                const Icon(Icons.location_on_outlined, size: 14, color: AppTheme.textTertiary),
                                const SizedBox(width: 2),
                                Text(
                                  profile.location ?? 'India',
                                  style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                                ),
                                const SizedBox(width: 12),
                                const Icon(Icons.star_rounded, size: 16, color: Colors.amber),
                                const SizedBox(width: 2),
                                Text(
                                  '${profile.rating} (${profile.reviewCount})',
                                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  if (profile.bio != null) ...[
                    const SizedBox(height: 16),
                    Text(
                      profile.bio!,
                      style: const TextStyle(fontSize: 14, height: 1.4, color: AppTheme.textPrimary),
                    ),
                  ],
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: profile.categories.map((cat) {
                      return Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryLight.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          cat,
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.primaryColor),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 24),
                  // Social Accounts Section
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Connected Social Analytics',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                      ),
                      TextButton(
                        onPressed: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(builder: (_) => const SocialConnectScreen()),
                          );
                        },
                        child: const Text('Manage'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  // Instagram Card
                  _buildSocialCard(
                    context: context,
                    platform: 'Instagram',
                    icon: Icons.camera_alt_outlined,
                    iconColor: Colors.pink,
                    handle: profile.instagram.handle ?? 'Not connected',
                    followers: profile.instagram.followers,
                    engagement: profile.instagram.engagementRate,
                    avgViews: profile.instagram.avgViews,
                    isConnected: profile.instagram.isConnected,
                  ),
                  const SizedBox(height: 12),
                  // YouTube Card
                  _buildSocialCard(
                    context: context,
                    platform: 'YouTube',
                    icon: Icons.play_circle_fill_rounded,
                    iconColor: Colors.red,
                    handle: profile.youtube.handle ?? 'Not connected',
                    followers: profile.youtube.followers,
                    engagement: profile.youtube.engagementRate,
                    avgViews: profile.youtube.avgViews,
                    isConnected: profile.youtube.isConnected,
                  ),
                  const SizedBox(height: 24),
                  // Portfolio Showcase
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Portfolio Showcases',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                      ),
                      TextButton(
                        onPressed: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(builder: (_) => const PortfolioScreen()),
                          );
                        },
                        child: const Text('View All'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  if (profile.portfolioItems.isEmpty)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F2F6),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Center(
                        child: TextButton.icon(
                          onPressed: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(builder: (_) => const PortfolioScreen()),
                            );
                          },
                          icon: const Icon(Icons.add_photo_alternate_outlined),
                          label: const Text('Add Your First Portfolio Showcase'),
                        ),
                      ),
                    )
                  else
                    SizedBox(
                      height: 170,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: profile.portfolioItems.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 12),
                        itemBuilder: (context, index) {
                          final item = profile.portfolioItems[index];
                          return Container(
                            width: 180,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppTheme.borderColor),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                ClipRRect(
                                  borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                                  child: Image.network(
                                    item.mediaUrl,
                                    height: 100,
                                    width: 180,
                                    fit: BoxFit.cover,
                                    errorBuilder: (_, __, ___) => Container(
                                      height: 100,
                                      color: const Color(0xFFE4E7EB),
                                      child: const Icon(Icons.image_outlined),
                                    ),
                                  ),
                                ),
                                Padding(
                                  padding: const EdgeInsets.all(8),
                                  child: Text(
                                    item.title,
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ),
                  const SizedBox(height: 24),
                  // Quick Links
                  ListTile(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    tileColor: Colors.white,
                    leading: const Icon(Icons.account_balance_wallet_outlined, color: AppTheme.primaryColor),
                    title: const Text('Earnings & Wallet Breakdown', style: TextStyle(fontWeight: FontWeight.w600)),
                    trailing: const Icon(Icons.chevron_right_rounded),
                    onTap: () {
                      Navigator.of(context).push(MaterialPageRoute(builder: (_) => const WalletScreen()));
                    },
                  ),
                  const SizedBox(height: 10),
                  ListTile(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    tileColor: Colors.white,
                    leading: const Icon(Icons.badge_outlined, color: AppTheme.primaryColor),
                    title: const Text('KYC & Payout Bank Details', style: TextStyle(fontWeight: FontWeight.w600)),
                    subtitle: Text('Status: ${profile.kycStatus}', style: const TextStyle(fontSize: 12)),
                    trailing: const Icon(Icons.chevron_right_rounded),
                    onTap: () {
                      Navigator.of(context).push(MaterialPageRoute(builder: (_) => const KycScreen()));
                    },
                  ),
                  const SizedBox(height: 32),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildSocialCard({
    required BuildContext context,
    required String platform,
    required IconData icon,
    required Color iconColor,
    required String handle,
    required int followers,
    required double engagement,
    required int avgViews,
    required bool isConnected,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.borderColor),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Icon(icon, color: iconColor, size: 24),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(platform, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    Text(handle, style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: isConnected ? AppTheme.successColor.withOpacity(0.12) : const Color(0xFFF1F2F6),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  isConnected ? 'Connected' : 'Not Connected',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: isConnected ? AppTheme.successColor : AppTheme.textTertiary,
                  ),
                ),
              ),
            ],
          ),
          if (isConnected) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
              decoration: BoxDecoration(
                color: const Color(0xFFF8F9FA),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  Column(
                    children: [
                      Text(Helpers.getFollowerCount(followers), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                      Text(platform == 'YouTube' ? 'Subscribers' : 'Followers', style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                    ],
                  ),
                  Column(
                    children: [
                      Text('$engagement%', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.primaryColor)),
                      const Text('Engagement', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                    ],
                  ),
                  Column(
                    children: [
                      Text(Helpers.getFollowerCount(avgViews), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                      const Text('Avg. Views', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
