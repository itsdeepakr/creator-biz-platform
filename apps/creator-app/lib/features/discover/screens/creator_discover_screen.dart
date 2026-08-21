import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/helpers.dart';
import '../../../core/widgets/loading_indicator.dart';
import '../../../core/widgets/error_widget.dart';
import '../../../models/creator_profile_model.dart';
import '../../../providers/app_providers.dart';
import '../../chat/screens/chat_conversation_screen.dart';

class CreatorDiscoverScreen extends ConsumerStatefulWidget {
  const CreatorDiscoverScreen({super.key});

  @override
  ConsumerState<CreatorDiscoverScreen> createState() => _CreatorDiscoverScreenState();
}

class _CreatorDiscoverScreenState extends ConsumerState<CreatorDiscoverScreen> {
  String _selectedCategory = 'All';
  final TextEditingController _searchController = TextEditingController();

  final List<String> _categories = [
    'All',
    'Tech',
    'Fashion',
    'Gaming',
    'Food',
    'Lifestyle',
    'Beauty',
    'Fitness',
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final params = (
      query: _searchController.text.isEmpty ? null : _searchController.text,
      category: _selectedCategory == 'All' ? null : _selectedCategory,
    );

    final creatorsAsync = ref.watch(discoverCreatorsProvider(params));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Discover Creators', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search by creator name, handle, category...',
                prefixIcon: const Icon(Icons.search_rounded, size: 20),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear_rounded, size: 18),
                        onPressed: () {
                          _searchController.clear();
                          setState(() {});
                        },
                      )
                    : null,
                isDense: true,
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              ),
              onChanged: (_) => setState(() {}),
            ),
          ),
          SizedBox(
            height: 46,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _categories.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final cat = _categories[index];
                final isSelected = cat == _selectedCategory;
                return FilterChip(
                  label: Text(cat),
                  selected: isSelected,
                  onSelected: (selected) {
                    setState(() {
                      _selectedCategory = cat;
                    });
                  },
                );
              },
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: creatorsAsync.when(
              loading: () => const LoadingIndicator(message: 'Searching creators...'),
              error: (err, _) => ErrorDisplayWidget(
                message: err.toString(),
                onRetry: () => ref.invalidate(discoverCreatorsProvider),
              ),
              data: (creators) {
                if (creators.isEmpty) {
                  return const Center(child: Text('No creators found'));
                }
                return ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: creators.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 14),
                  itemBuilder: (context, index) {
                    final creator = creators[index];
                    return _buildCreatorCard(context, creator);
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCreatorCard(BuildContext context, CreatorProfileModel creator) {
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
                  radius: 28,
                  backgroundImage: creator.avatarUrl != null ? NetworkImage(creator.avatarUrl!) : null,
                  child: creator.avatarUrl == null
                      ? Text(creator.displayName[0], style: const TextStyle(fontWeight: FontWeight.bold))
                      : null,
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              creator.displayName,
                              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 6),
                          const Icon(Icons.verified_rounded, size: 16, color: AppTheme.primaryColor),
                        ],
                      ),
                      Text(
                        '@${creator.handle}',
                        style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary),
                      ),
                      if (creator.location != null)
                        Text(
                          creator.location!,
                          style: const TextStyle(fontSize: 12, color: AppTheme.textTertiary),
                        ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppTheme.warningColor.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.star_rounded, size: 16, color: Colors.amber),
                      const SizedBox(width: 4),
                      Text(
                        creator.rating.toStringAsFixed(1),
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            if (creator.bio != null) ...[
              const SizedBox(height: 12),
              Text(
                creator.bio!,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary),
              ),
            ],
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F2F6),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  Column(
                    children: [
                      Text(
                        Helpers.getFollowerCount(creator.instagram.followers),
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                      const Text('IG Followers', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                    ],
                  ),
                  Container(height: 24, width: 1, color: AppTheme.borderColor),
                  Column(
                    children: [
                      Text(
                        '${creator.instagram.engagementRate}%',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.primaryColor),
                      ),
                      const Text('Engagement', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                    ],
                  ),
                  Container(height: 24, width: 1, color: AppTheme.borderColor),
                  Column(
                    children: [
                      Text(
                        '${creator.completedCollaborationsCount}',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.successColor),
                      ),
                      const Text('Deals Done', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Starting at ${Helpers.formatCurrencyINR(creator.minRate)}',
                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: AppTheme.textPrimary),
                ),
                TextButton.icon(
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => ChatConversationScreen(
                          conversationId: 'conv_${creator.id}',
                          otherUserName: creator.displayName,
                          otherUserRole: 'CREATOR',
                        ),
                      ),
                    );
                  },
                  icon: const Icon(Icons.chat_bubble_outline_rounded, size: 16),
                  label: const Text('Connect'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
