import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/helpers.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/custom_text_field.dart';
import '../../../core/widgets/loading_indicator.dart';
import '../../../core/widgets/error_widget.dart';
import '../../../providers/app_providers.dart';

class PortfolioScreen extends ConsumerStatefulWidget {
  const PortfolioScreen({super.key});

  @override
  ConsumerState<PortfolioScreen> createState() => _PortfolioScreenState();
}

class _PortfolioScreenState extends ConsumerState<PortfolioScreen> {
  void _showAddItemDialog() {
    final titleController = TextEditingController();
    final descController = TextEditingController();
    final mediaUrlController = TextEditingController(
      text: 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=600',
    );
    final linkController = TextEditingController();
    String platform = 'Instagram Reel';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 24,
                right: 24,
                top: 24,
                bottom: 24 + MediaQuery.of(context).viewInsets.bottom,
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      'Add Portfolio Showcase',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 16),
                    CustomTextField(
                      controller: titleController,
                      label: 'Showcase Title *',
                      hintText: 'e.g. Brand X Autumn Launch Reel',
                    ),
                    const SizedBox(height: 12),
                    CustomTextField(
                      controller: descController,
                      label: 'Description & Campaign Impact',
                      hintText: 'e.g. Generated 150k impressions and 12k likes',
                      isMultiline: true,
                      maxLines: 3,
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      initialValue: platform,
                      decoration: const InputDecoration(labelText: 'Platform / Format'),
                      items: const [
                        DropdownMenuItem(value: 'Instagram Reel', child: Text('Instagram Reel')),
                        DropdownMenuItem(value: 'Instagram Post', child: Text('Instagram Post')),
                        DropdownMenuItem(value: 'YouTube Video', child: Text('YouTube Video')),
                        DropdownMenuItem(value: 'YouTube Short', child: Text('YouTube Short')),
                        DropdownMenuItem(value: 'Blog Post', child: Text('Blog Post')),
                      ],
                      onChanged: (val) {
                        if (val != null) setModalState(() => platform = val);
                      },
                    ),
                    const SizedBox(height: 12),
                    CustomTextField(
                      controller: mediaUrlController,
                      label: 'Thumbnail / Media Image URL *',
                    ),
                    const SizedBox(height: 12),
                    CustomTextField(
                      controller: linkController,
                      label: 'Live Link (Optional)',
                      hintText: 'https://instagram.com/...',
                    ),
                    const SizedBox(height: 24),
                    CustomButton(
                      label: 'Save to Portfolio',
                      onPressed: () async {
                        if (titleController.text.trim().isEmpty) return;
                        Navigator.of(ctx).pop();
                        await ref.read(creatorServiceProvider).addPortfolioItem(
                              title: titleController.text.trim(),
                              description: descController.text.trim(),
                              mediaUrl: mediaUrlController.text.trim(),
                              platform: platform,
                              externalUrl: linkController.text.trim(),
                            );
                        ref.invalidate(myProfileProvider);
                      },
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
    final profileAsync = ref.watch(myProfileProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Portfolio Showcases'),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showAddItemDialog,
        icon: const Icon(Icons.add_photo_alternate_rounded),
        label: const Text('Add Showcase'),
      ),
      body: RefreshIndicator(
        onRefresh: () async => ref.invalidate(myProfileProvider),
        child: profileAsync.when(
          loading: () => const LoadingIndicator(message: 'Loading portfolio items...'),
          error: (err, _) => ErrorDisplayWidget(
            message: err.toString(),
            onRetry: () => ref.invalidate(myProfileProvider),
          ),
          data: (profile) {
            final items = profile.portfolioItems;
            if (items.isEmpty) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.collections_bookmark_outlined, size: 56, color: AppTheme.textTertiary),
                    const SizedBox(height: 12),
                    const Text('No portfolio items yet'),
                    const SizedBox(height: 8),
                    ElevatedButton(
                      onPressed: _showAddItemDialog,
                      child: const Text('Add Your First Showcase'),
                    ),
                  ],
                ),
              );
            }

            return GridView.builder(
              padding: const EdgeInsets.all(16),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 0.72,
              ),
              itemCount: items.length,
              itemBuilder: (context, index) {
                final item = items[index];
                return Card(
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                    side: const BorderSide(color: AppTheme.borderColor),
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Stack(
                          fit: StackFit.expand,
                          children: [
                            Image.network(
                              item.mediaUrl,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => Container(
                                color: const Color(0xFFE4E7EB),
                                child: const Icon(Icons.image_outlined),
                              ),
                            ),
                            Positioned(
                              top: 6,
                              right: 6,
                              child: IconButton.filled(
                                iconSize: 16,
                                padding: EdgeInsets.zero,
                                constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                                style: IconButton.styleFrom(backgroundColor: Colors.black54),
                                icon: const Icon(Icons.delete_outline_rounded, color: Colors.white),
                                onPressed: () async {
                                  await ref.read(creatorServiceProvider).deletePortfolioItem(item.id);
                                  ref.invalidate(myProfileProvider);
                                },
                              ),
                            ),
                          ],
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(10),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: AppTheme.primaryLight.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                item.platform,
                                style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.primaryColor),
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              item.title,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                            ),
                            if (item.views > 0) ...[
                              const SizedBox(height: 4),
                              Text(
                                '${Helpers.getFollowerCount(item.views)} views',
                                style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }
}
