import '../core/network/api_client.dart';
import '../models/chat_model.dart';

class ChatService {
  final ApiClient _apiClient;

  ChatService({required ApiClient apiClient}) : _apiClient = apiClient;

  final List<Conversation> _conversations = [
    Conversation(
      id: 'conv_1',
      otherUserId: 'creator_u_1',
      otherUserName: 'Aarav Sharma',
      otherUserAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
      otherUserRole: 'CREATOR',
      campaignId: 'camp_1',
      campaignTitle: 'Flagship Smartphone Launch',
      lastMessage: 'I have uploaded the 4K review reel to Instagram for review.',
      lastMessageAt: DateTime.now().subtract(const Duration(minutes: 40)),
      unreadCount: 1,
    ),
    Conversation(
      id: 'conv_2',
      otherUserId: 'creator_u_6',
      otherUserName: 'Kunal Gamer',
      otherUserAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      otherUserRole: 'CREATOR',
      campaignId: 'camp_2',
      campaignTitle: 'Wireless Gaming Earbuds Sound Test',
      lastMessage: 'Got the earbuds! Starting sound latency capture today.',
      lastMessageAt: DateTime.now().subtract(const Duration(hours: 3)),
      unreadCount: 0,
    ),
  ];

  final Map<String, List<ChatMessage>> _messages = {
    'conv_1': [
      ChatMessage(
        id: 'msg_1',
        conversationId: 'conv_1',
        senderId: 'creator_u_1',
        senderName: 'Aarav Sharma',
        senderRole: 'CREATOR',
        content: 'Hi! Submitted my pitch for the flagship phone launch.',
        createdAt: DateTime.now().subtract(const Duration(days: 1)),
        isRead: true,
      ),
      ChatMessage(
        id: 'msg_2',
        conversationId: 'conv_1',
        senderId: 'biz_u_1',
        senderName: 'Pooja Hegde',
        senderRole: 'BUSINESS',
        content: 'Thanks Aarav! We counter-offered at ₹42k with 1 extra story post.',
        createdAt: DateTime.now().subtract(const Duration(hours: 18)),
        isRead: true,
      ),
      ChatMessage(
        id: 'msg_3',
        conversationId: 'conv_1',
        senderId: 'creator_u_1',
        senderName: 'Aarav Sharma',
        senderRole: 'CREATOR',
        content: 'I have uploaded the 4K review reel to Instagram for review.',
        createdAt: DateTime.now().subtract(const Duration(minutes: 40)),
        isRead: false,
      ),
    ],
  };

  Future<List<Conversation>> getConversations() async {
    try {
      final response = await _apiClient.get('/chat/conversations');
      if (response.statusCode == 200) {
        final list = response.data as List<dynamic>;
        return list.map((e) => Conversation.fromJson(e as Map<String, dynamic>)).toList();
      }
    } catch (_) {}
    return _conversations;
  }

  Future<List<ChatMessage>> getMessages(String conversationId) async {
    try {
      final response = await _apiClient.get('/chat/conversations/$conversationId/messages');
      if (response.statusCode == 200) {
        final list = response.data as List<dynamic>;
        return list.map((e) => ChatMessage.fromJson(e as Map<String, dynamic>)).toList();
      }
    } catch (_) {}
    return _messages[conversationId] ?? [];
  }

  Future<ChatMessage> sendMessage({
    required String conversationId,
    required String content,
    String? mediaUrl,
  }) async {
    final newMsg = ChatMessage(
      id: 'msg_${DateTime.now().millisecondsSinceEpoch}',
      conversationId: conversationId,
      senderId: 'biz_u_1',
      senderName: 'Pooja Hegde',
      senderRole: 'BUSINESS',
      content: content,
      mediaUrl: mediaUrl,
      isRead: true,
      createdAt: DateTime.now(),
    );

    try {
      final response = await _apiClient.post(
        '/chat/conversations/$conversationId/messages',
        data: newMsg.toJson(),
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        final created = ChatMessage.fromJson(response.data as Map<String, dynamic>);
        _addMessageLocally(conversationId, created);
        return created;
      }
    } catch (_) {}

    _addMessageLocally(conversationId, newMsg);
    return newMsg;
  }

  void _addMessageLocally(String conversationId, ChatMessage message) {
    if (!_messages.containsKey(conversationId)) {
      _messages[conversationId] = [];
    }
    _messages[conversationId]!.add(message);

    final convIndex = _conversations.indexWhere((c) => c.id == conversationId);
    if (convIndex != -1) {
      final c = _conversations[convIndex];
      _conversations[convIndex] = Conversation(
        id: c.id,
        otherUserId: c.otherUserId,
        otherUserName: c.otherUserName,
        otherUserAvatar: c.otherUserAvatar,
        otherUserRole: c.otherUserRole,
        campaignId: c.campaignId,
        campaignTitle: c.campaignTitle,
        lastMessage: message.content,
        lastMessageAt: message.createdAt,
        unreadCount: 0,
      );
    }
  }

  Future<void> markAsRead(String conversationId) async {
    try {
      await _apiClient.post('/chat/conversations/$conversationId/read');
    } catch (_) {}
    final convIndex = _conversations.indexWhere((c) => c.id == conversationId);
    if (convIndex != -1) {
      final c = _conversations[convIndex];
      _conversations[convIndex] = Conversation(
        id: c.id,
        otherUserId: c.otherUserId,
        otherUserName: c.otherUserName,
        otherUserAvatar: c.otherUserAvatar,
        otherUserRole: c.otherUserRole,
        campaignId: c.campaignId,
        campaignTitle: c.campaignTitle,
        lastMessage: c.lastMessage,
        lastMessageAt: c.lastMessageAt,
        unreadCount: 0,
      );
    }
  }
}
