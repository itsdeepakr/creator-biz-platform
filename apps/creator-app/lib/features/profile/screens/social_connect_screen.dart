import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/custom_text_field.dart';
import '../../../providers/app_providers.dart';

class SocialConnectScreen extends ConsumerStatefulWidget {
  const SocialConnectScreen({super.key});

  @override
  ConsumerState<SocialConnectScreen> createState() => _SocialConnectScreenState();
}

class _SocialConnectScreenState extends ConsumerState<SocialConnectScreen> {
  final _instagramController = TextEditingController(text: 'aarav.tech');
  final _youtubeController = TextEditingController(text: 'AaravTechReviews');
  bool _isSyncing = false;

  @override
  void dispose() {
    _instagramController.dispose();
    _youtubeController.dispose();
    super.dispose();
  }

  Future<void> _syncAccount(String platform, String handle) async {
    if (handle.trim().isEmpty) return;
    setState(() => _isSyncing = true);

    await ref.read(creatorServiceProvider).connectSocialAccount(
          platform: platform,
          handle: handle.trim(),
        );

    ref.invalidate(myProfileProvider);

    if (mounted) {
      setState(() => _isSyncing = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('$platform account @$handle metrics synchronized!'),
          backgroundColor: AppTheme.successColor,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Connect Social Media'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Social Account Verification',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 6),
            const Text(
              'Link your active Instagram and YouTube accounts. Our background scrapers & Graph APIs automatically compute your real-time follower count, engagement rate, and average view benchmarks.',
              style: TextStyle(color: AppTheme.textSecondary, height: 1.4, fontSize: 13),
            ),
            const SizedBox(height: 24),
            // Instagram Connect
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
                      Icon(Icons.camera_alt_outlined, color: Colors.pink, size: 24),
                      SizedBox(width: 10),
                      Text('Instagram Profile', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  CustomTextField(
                    controller: _instagramController,
                    label: 'Instagram Username / Handle',
                    hintText: 'e.g. your_handle',
                    prefixIcon: const Icon(Icons.alternate_email_rounded),
                  ),
                  const SizedBox(height: 12),
                  CustomButton(
                    label: 'Sync Instagram Analytics',
                    icon: Icons.sync_rounded,
                    isLoading: _isSyncing,
                    onPressed: () => _syncAccount('instagram', _instagramController.text),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            // YouTube Connect
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
                      Icon(Icons.play_circle_fill_rounded, color: Colors.red, size: 24),
                      SizedBox(width: 10),
                      Text('YouTube Channel', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  CustomTextField(
                    controller: _youtubeController,
                    label: 'YouTube Channel Handle / ID',
                    hintText: 'e.g. @CreatorVlogs or UCxxxx',
                    prefixIcon: const Icon(Icons.smart_display_outlined),
                  ),
                  const SizedBox(height: 12),
                  CustomButton(
                    label: 'Sync YouTube Analytics',
                    icon: Icons.sync_rounded,
                    isLoading: _isSyncing,
                    onPressed: () => _syncAccount('youtube', _youtubeController.text),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
