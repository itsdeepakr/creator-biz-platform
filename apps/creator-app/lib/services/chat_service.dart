import '../core/network/api_client.dart';
import '../models/chat_model.dart';

class ChatService {
  final ApiClient _apiClient;

  ChatService({required ApiClient apiClient}) : _apiClient = apiClient;

  final List<Conversation> _conversations = [
    Conversation(
      id: 'conv_1',
      otherUserId: 'biz_1',
      otherUserName: 'Apex Innovations',
      otherUserAvatar: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=300',
      otherUserRole: 'BUSINESS',
      campaignId: 'camp_1',
      campaignTitle: 'Flagship Smartphone Launch',
      lastMessage: 'We sent a counter-offer of ₹42,000. Let us know your thoughts!',
      lastMessageAt: DateTime.now().subtract(const Duration(minutes: 25)),
      unreadCount: 1,
    ),
    Conversation(
      id: 'conv_2',
      otherUserId: 'biz_103',
      otherUserName: 'ZenSpace Living',
      otherUserAvatar: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=300',
      otherUserRole: 'BUSINESS',
      campaignId: 'camp_103',
      campaignTitle: 'Ergonomic Standing Desk Review',
      lastMessage: 'Please add the close-up of the control keypad.',
      lastMessageAt: DateTime.now().subtract(const Duration(hours: 6)),
      unreadCount: 0,
    ),
    Conversation(
      id: 'conv_3',
      otherUserId: 'biz_101',
      otherUserName: 'SoundWave Audio',
      otherUserAvatar: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300',
      otherUserRole: 'BUSINESS',
      campaignId: 'camp_101',
      campaignTitle: 'Urban Wireless Earbuds Showcase',
      lastMessage: 'The tracking number for the earbuds shipment is DTDC994821.',
      lastMessageAt: DateTime.now().subtract(const Duration(days: 2)),
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
        content: 'Hi Apex team! I submitted a bid of ₹48,000 for the Flagship Smartphone campaign. Looking forward to testing the AI camera features.',
        createdAt: DateTime.now().subtract(const Duration(hours: 4)),
        isRead: true,
      ),
      ChatMessage(
        id: 'msg_2',
        conversationId: 'conv_1',
        senderId: 'biz_1',
        senderName: 'Apex Innovations',
        senderRole: 'BUSINESS',
        content: 'Hey Aarav! We checked your previous tech reels and loved the production quality. We can do ₹42,000 if you can add 1 extra story swipe-up link.',
        createdAt: DateTime.now().subtract(const Duration(hours: 2)),
        isRead: true,
      ),
      ChatMessage(
        id: 'msg_3',
        conversationId: 'conv_1',
        senderId: 'biz_1',
        senderName: 'Apex Innovations',
        senderRole: 'BUSINESS',
        content: 'We sent a counter-offer of ₹42,000. Let us know your thoughts!',
        createdAt: DateTime.now().subtract(const Duration(minutes: 25)),
        isRead: false,
      ),
    ],
    'conv_2': [
      ChatMessage(
        id: 'msg_201',
        conversationId: 'conv_2',
        senderId: 'creator_u_1',
        senderName: 'Aarav Sharma',
        senderRole: 'CREATOR',
        content: 'I have uploaded the first cut of the YouTube video for review: https://youtube.com/watch?v=preview_desk_99',
        createdAt: DateTime.now().subtract(const Duration(days: 2)),
        isRead: true,
      ),
      ChatMessage(
        id: 'msg_202',
        conversationId: 'conv_2',
        senderId: 'biz_103',
        senderName: 'ZenSpace Living',
        senderRole: 'BUSINESS',
        content: 'Great video! Please add the close-up of the control keypad and highlight the dual motor warranty.',
        createdAt: DateTime.now().subtract(const Duration(hours: 6)),
        isRead: true,
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
    String messageType = 'TEXT',
  }) async {
    final newMsg = ChatMessage(
      id: 'msg_${DateTime.now().millisecondsSinceEpoch}',
      conversationId: conversationId,
      senderId: 'creator_u_1',
      senderName: 'Aarav Sharma',
      senderRole: 'CREATOR',
      content: content,
      mediaUrl: mediaUrl,
      messageType: messageType,
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
