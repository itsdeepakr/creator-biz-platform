class ChatMessage {
  final String id;
  final String conversationId;
  final String senderId;
  final String senderName;
  final String? senderAvatar;
  final String senderRole; // 'BUSINESS', 'CREATOR', 'ADMIN'
  final String content;
  final String? mediaUrl;
  final String messageType;
  final bool isRead;
  final DateTime createdAt;

  ChatMessage({
    required this.id,
    required this.conversationId,
    required this.senderId,
    required this.senderName,
    this.senderAvatar,
    required this.senderRole,
    required this.content,
    this.mediaUrl,
    this.messageType = 'TEXT',
    this.isRead = false,
    required this.createdAt,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id'] as String? ?? '',
      conversationId: json['conversationId'] as String? ?? '',
      senderId: json['senderId'] as String? ?? '',
      senderName: json['senderName'] as String? ??
          (json['sender'] as Map<String, dynamic>?)?['name'] as String? ??
          'User',
      senderAvatar: json['senderAvatar'] as String? ??
          (json['sender'] as Map<String, dynamic>?)?['avatarUrl'] as String?,
      senderRole: json['senderRole'] as String? ?? 'BUSINESS',
      content: json['content'] as String? ?? json['message'] as String? ?? '',
      mediaUrl: json['mediaUrl'] as String?,
      messageType: json['messageType'] as String? ?? 'TEXT',
      isRead: json['isRead'] as bool? ?? false,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'] as String) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'conversationId': conversationId,
      'senderId': senderId,
      'senderName': senderName,
      'senderAvatar': senderAvatar,
      'senderRole': senderRole,
      'content': content,
      'mediaUrl': mediaUrl,
      'messageType': messageType,
      'isRead': isRead,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}

class Conversation {
  final String id;
  final String otherUserId;
  final String otherUserName;
  final String? otherUserAvatar;
  final String otherUserRole;
  final String? campaignId;
  final String? campaignTitle;
  final String lastMessage;
  final DateTime lastMessageAt;
  final int unreadCount;

  Conversation({
    required this.id,
    required this.otherUserId,
    required this.otherUserName,
    this.otherUserAvatar,
    required this.otherUserRole,
    this.campaignId,
    this.campaignTitle,
    required this.lastMessage,
    required this.lastMessageAt,
    this.unreadCount = 0,
  });

  factory Conversation.fromJson(Map<String, dynamic> json) {
    return Conversation(
      id: json['id'] as String? ?? '',
      otherUserId: json['otherUserId'] as String? ?? '',
      otherUserName: json['otherUserName'] as String? ??
          (json['creator'] as Map<String, dynamic>?)?['displayName'] as String? ??
          'Creator',
      otherUserAvatar: json['otherUserAvatar'] as String? ??
          (json['creator'] as Map<String, dynamic>?)?['avatarUrl'] as String?,
      otherUserRole: json['otherUserRole'] as String? ?? 'CREATOR',
      campaignId: json['campaignId'] as String?,
      campaignTitle: json['campaignTitle'] as String?,
      lastMessage: json['lastMessage'] as String? ?? 'No messages yet',
      lastMessageAt: json['lastMessageAt'] != null
          ? DateTime.tryParse(json['lastMessageAt'] as String) ?? DateTime.now()
          : DateTime.now(),
      unreadCount: (json['unreadCount'] as num?)?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'otherUserId': otherUserId,
      'otherUserName': otherUserName,
      'otherUserAvatar': otherUserAvatar,
      'otherUserRole': otherUserRole,
      'campaignId': campaignId,
      'campaignTitle': campaignTitle,
      'lastMessage': lastMessage,
      'lastMessageAt': lastMessageAt.toIso8601String(),
      'unreadCount': unreadCount,
    };
  }
}
