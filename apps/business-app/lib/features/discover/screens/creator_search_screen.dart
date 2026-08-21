import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/utils/helpers.dart';
import '../../../core/widgets/loading_indicator.dart';
import '../../../core/widgets/error_widget.dart';
import '../../../models/creator_model.dart';
import '../../../providers/app_providers.dart';
import 'creator_profile_detail_screen.dart';

class CreatorSearchScreen extends ConsumerStatefulWidget {
  const CreatorSearchScreen({super.key});

  @override
  ConsumerState<CreatorSearchScreen> createState() => _CreatorSearchScreenState();
}

class _CreatorSearchScreenState extends ConsumerState<CreatorSearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _selectedCategory = 'All';
  int? _minFollowers;
  double? _minEngagement;
  double? _minRating;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _showFilterSheet() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: const EdgeInsets.all(24),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      'Filter Creators by Metrics',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 16),
                    const Text('Minimum Instagram Followers', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () => setModalState(() => _minFollowers = 10000),
                            style: OutlinedButton.styleFrom(
                              backgroundColor: _minFollowers == 10000 ? AppTheme.primaryLight.withOpacity(0.2) : null,
                            ),
                            child: const Text('10k+'),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () => setModalState(() => _minFollowers = 50000),
                            style: OutlinedButton.styleFrom(
                              backgroundColor: _minFollowers == 50000 ? AppTheme.primaryLight.withOpacity(0.2) : null,
                            ),
                            child: const Text('50k+'),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () => setModalState(() => _minFollowers = 100000),
                            style: OutlinedButton.styleFrom(
                              backgroundColor: _minFollowers == 100000 ? AppTheme.primaryLight.withOpacity(0.2) : null,
                            ),
                            child: const Text('100k+'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    const Text('Min Engagement Rate', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () => setModalState(() => _minEngagement = 3.0),
                            style: OutlinedButton.styleFrom(
                              backgroundColor: _minEngagement == 3.0 ? AppTheme.primaryLight.withOpacity(0.2) : null,
                            ),
                            child: const Text('3%+'),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () => setModalState(() => _minEngagement = 5.0),
                            style: OutlinedButton.styleFrom(
                              backgroundColor: _minEngagement == 5.0 ? AppTheme.primaryLight.withOpacity(0.2) : null,
                            ),
                            child: const Text('5%+'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    Row(
                      children: [
                        Expanded(
                          child: TextButton(
                            onPressed: () {
                              setState(() {
                                _minFollowers = null;
                                _minEngagement = null;
                                _minRating = null;
                              });
                              Navigator.of(ctx).pop();
                            },
                            child: const Text('Reset All'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () {
                              setState(() {});
                              Navigator.of(ctx).pop();
                            },
                            child: const Text('Apply Filters'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final params = (
      query: _searchController.text.isEmpty ? null : _searchController.text,
      category: _selectedCategory == 'All' ? null : _selectedCategory,
      minFollowers: _minFollowers,
      minEngagement: _minEngagement,
      minRating: _minRating,
    );

    final creatorsAsync = ref.watch(searchCreatorsProvider(params));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Find Creators & Influencers', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    decoration: InputDecoration(
                      hintText: 'Search creator name, bio, niche...',
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
                const SizedBox(width: 8),
                IconButton.filledTonal(
                  icon: const Icon(Icons.tune_rounded),
                  onPressed: _showFilterSheet,
                ),
              ],
            ),
          ),
          SizedBox(
            height: 46,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: AppConstants.categories.length + 1,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final cat = index == 0 ? 'All' : AppConstants.categories[index - 1];
                final isSelected = cat == _selectedCategory;
                return ChoiceChip(
                  label: Text(cat),
                  selected: isSelected,
                  selectedColor: AppTheme.primaryColor,
                  labelStyle: TextStyle(
                    color: isSelected ? Colors.white : AppTheme.textPrimary,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    fontSize: 12,
                  ),
                  onSelected: (_) {
                    setState(() => _selectedCategory = cat);
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
                onRetry: () => ref.invalidate(searchCreatorsProvider),
              ),
              data: (creators) {
                if (creators.isEmpty) {
                  return const Center(child: Text('No creators match your search criteria'));
                }

                return ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: creators.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 14),
                  itemBuilder: (context, index) {
                    final creator = creators[index];
                    return _buildCreatorCard(creator);
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCreatorCard(CreatorModel creator) {
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
              builder: (_) => CreatorProfileDetailScreen(creator: creator),
            ),
          );
        },
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
                const SizedBox(height: 10),
                Text(
                  creator.bio!,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary),
                ),
              ],
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    Column(
                      children: [
                        Text(
                          Helpers.getFollowerCount(creator.igFollowers),
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                        ),
                        const Text('Followers', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                      ],
                    ),
                    Container(height: 24, width: 1, color: AppTheme.borderColor),
                    Column(
                      children: [
                        Text(
                          '${creator.igEngagement}%',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.primaryColor),
                        ),
                        const Text('Engagement', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                      ],
                    ),
                    Container(height: 24, width: 1, color: AppTheme.borderColor),
                    Column(
                      children: [
                        Text(
                          '${creator.completedDeals}',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.successColor),
                        ),
                        const Text('Completed Deals', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
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
                    'Rates: ${Helpers.formatCurrencyINR(creator.minRate)} - ${Helpers.formatCurrencyINR(creator.maxRate)}',
                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => CreatorProfileDetailScreen(creator: creator),
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                    child: const Text('View Profile & Hire'),
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
