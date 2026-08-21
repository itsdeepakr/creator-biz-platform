import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/loading_indicator.dart';
import '../../../core/widgets/error_widget.dart';
import '../../../providers/app_providers.dart';
import 'edit_business_profile_screen.dart';
import '../../payments/screens/payment_history_screen.dart';
import '../../auth/screens/business_kyc_screen.dart';
import '../../auth/screens/login_screen.dart';

class BusinessProfileScreen extends ConsumerWidget {
  const BusinessProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileAsync = ref.watch(myBusinessProfileProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Company & Brand Profile', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          profileAsync.maybeWhen(
            data: (profile) => IconButton(
              icon: const Icon(Icons.edit_outlined),
              tooltip: 'Edit Profile',
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => EditBusinessProfileScreen(profile: profile),
                  ),
                );
              },
            ),
            orElse: () => const SizedBox.shrink(),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async => ref.invalidate(myBusinessProfileProvider),
        child: profileAsync.when(
          loading: () => const LoadingIndicator(message: 'Loading company profile...'),
          error: (err, _) => ErrorDisplayWidget(
            message: err.toString(),
            onRetry: () => ref.invalidate(myBusinessProfileProvider),
          ),
          data: (profile) {
            return SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  Center(
                    child: Stack(
                      children: [
                        CircleAvatar(
                          radius: 44,
                          backgroundImage: profile.logoUrl != null ? NetworkImage(profile.logoUrl!) : null,
                          child: profile.logoUrl == null
                              ? Text(profile.companyName[0], style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold))
                              : null,
                        ),
                        if (profile.isGstVerified)
                          Positioned(
                            bottom: 0,
                            right: 0,
                            child: Container(
                              padding: const EdgeInsets.all(4),
                              decoration: const BoxDecoration(
                                color: AppTheme.successColor,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.verified_rounded, color: Colors.white, size: 20),
                            ),
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),
                  Text(
                    profile.companyName,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    profile.industry,
                    style: const TextStyle(fontSize: 14, color: AppTheme.textSecondary),
                  ),
                  if (profile.website != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      profile.website!,
                      style: const TextStyle(fontSize: 13, color: AppTheme.primaryColor, fontWeight: FontWeight.w500),
                    ),
                  ],
                  const SizedBox(height: 20),
                  // GSTIN Card
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('GSTIN (Tax Identifier):', style: TextStyle(fontSize: 13, color: AppTheme.textSecondary)),
                            Row(
                              children: [
                                Text(profile.gstin ?? 'Not Added', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                                const SizedBox(width: 6),
                                if (profile.isGstVerified)
                                  const Icon(Icons.check_circle_rounded, color: AppTheme.successColor, size: 16),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Authorized Lead:', style: TextStyle(fontSize: 13, color: AppTheme.textSecondary)),
                            Text(profile.contactPersonName, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  _buildProfileOption(
                    icon: Icons.badge_outlined,
                    title: 'Update Legal KYC / GSTIN',
                    subtitle: 'Manage tax documents & verification',
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const BusinessKycScreen()),
                      );
                    },
                  ),
                  _buildProfileOption(
                    icon: Icons.receipt_long_outlined,
                    title: 'Escrow Settlements & Receipts',
                    subtitle: 'View payments & GST tax invoices',
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const PaymentHistoryScreen()),
                      );
                    },
                  ),
                  _buildProfileOption(
                    icon: Icons.shield_outlined,
                    title: 'Contract Security & Escrow Terms',
                    subtitle: 'Standard arbitration & escrow protection',
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('All contracts backed by 100% Escrow Protection')),
                      );
                    },
                  ),
                  _buildProfileOption(
                    icon: Icons.logout_rounded,
                    title: 'Sign Out',
                    subtitle: 'Log out of brand workspace',
                    textColor: AppTheme.errorColor,
                    onTap: () async {
                      await ref.read(authStateProvider.notifier).logout();
                      if (context.mounted) {
                        Navigator.of(context).pushAndRemoveUntil(
                          MaterialPageRoute(builder: (_) => const LoginScreen()),
                          (route) => false,
                        );
                      }
                    },
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildProfileOption({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    Color? textColor,
  }) {
    return ListTile(
      onTap: onTap,
      leading: Icon(icon, color: textColor ?? AppTheme.primaryColor),
      title: Text(title, style: TextStyle(fontWeight: FontWeight.w600, color: textColor, fontSize: 15)),
      subtitle: Text(subtitle, style: const TextStyle(fontSize: 12, color: AppTheme.textTertiary)),
      trailing: const Icon(Icons.chevron_right_rounded, size: 20),
      contentPadding: const EdgeInsets.symmetric(vertical: 4),
    );
  }
}
