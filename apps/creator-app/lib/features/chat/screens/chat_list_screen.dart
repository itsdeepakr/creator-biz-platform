import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/helpers.dart';
import '../../../core/widgets/loading_indicator.dart';
import '../../../core/widgets/error_widget.dart';
import '../../../providers/app_providers.dart';
import 'chat_conversation_screen.dart';

class ChatListScreen extends ConsumerWidget {
  const ChatListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final convAsync = ref.watch(conversationsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Direct Messages', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: RefreshIndicator(
        onRefresh: () async => ref.invalidate(conversationsProvider),
        child: convAsync.when(
          loading: () => const LoadingIndicator(message: 'Loading conversations...'),
          error: (err, _) => ErrorDisplayWidget(
            message: err.toString(),
            onRetry: () => ref.invalidate(conversationsProvider),
          ),
          data: (conversations) {
            if (conversations.isEmpty) {
              return const Center(child: Text('No active conversations yet'));
            }

            return ListView.separated(
              itemCount: conversations.length,
              separatorBuilder: (_, __) => const Divider(height: 1, indent: 72, color: AppTheme.borderColor),
              itemBuilder: (context, index) {
                final conv = conversations[index];
                return ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  leading: Stack(
                    children: [
                      CircleAvatar(
                        radius: 26,
                        backgroundImage:
                            conv.otherUserAvatar != null ? NetworkImage(conv.otherUserAvatar!) : null,
                        child: conv.otherUserAvatar == null
                            ? Text(conv.otherUserName[0], style: const TextStyle(fontWeight: FontWeight.bold))
                            : null,
                      ),
                      if (conv.unreadCount > 0)
                        Positioned(
                          right: 0,
                          top: 0,
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            decoration: const BoxDecoration(
                              color: AppTheme.errorColor,
                              shape: BoxShape.circle,
                            ),
                            constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                            child: Text(
                              '${conv.unreadCount}',
                              textAlign: TextAlign.center,
                              style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                    ],
                  ),
                  title: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          conv.otherUserName,
                          style: TextStyle(
                            fontWeight: conv.unreadCount > 0 ? FontWeight.bold : FontWeight.w600,
                            fontSize: 15,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Text(
                        Helpers.getTimeAgo(conv.lastMessageAt),
                        style: const TextStyle(fontSize: 12, color: AppTheme.textTertiary),
                      ),
                    ],
                  ),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (conv.campaignTitle != null) ...[
                        const SizedBox(height: 2),
                        Text(
                          'Deal: ${conv.campaignTitle!}',
                          style: const TextStyle(fontSize: 11, color: AppTheme.primaryColor, fontWeight: FontWeight.w500),
                        ),
                      ],
                      const SizedBox(height: 3),
                      Text(
                        conv.lastMessage,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 13,
                          color: conv.unreadCount > 0 ? AppTheme.textPrimary : AppTheme.textSecondary,
                          fontWeight: conv.unreadCount > 0 ? FontWeight.w600 : FontWeight.normal,
                        ),
                      ),
                    ],
                  ),
                  onTap: () {
                    ref.read(chatServiceProvider).markAsRead(conv.id);
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => ChatConversationScreen(
                          conversationId: conv.id,
                          otherUserName: conv.otherUserName,
                          otherUserAvatar: conv.otherUserAvatar,
                          otherUserRole: conv.otherUserRole,
                          campaignTitle: conv.campaignTitle,
                        ),
                      ),
                    );
                  },
                );
              },
            );
          },
        ),
      ),
    );
  }
}
