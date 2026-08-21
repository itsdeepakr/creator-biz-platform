class SocialStat {
  final String platform; // 'instagram' or 'youtube'
  final String? handle;
  final int followers;
  final double engagementRate;
  final int avgViews;
  final int postCount;
  final bool isConnected;
  final DateTime? lastSyncedAt;

  SocialStat({
    required this.platform,
    this.handle,
    this.followers = 0,
    this.engagementRate = 0.0,
    this.avgViews = 0,
    this.postCount = 0,
    this.isConnected = false,
    this.lastSyncedAt,
  });

  factory SocialStat.fromJson(Map<String, dynamic> json) {
    return SocialStat(
      platform: json['platform'] as String? ?? 'instagram',
      handle: json['handle'] as String? ?? json['username'] as String?,
      followers: (json['followers'] as num?)?.toInt() ??
          (json['followerCount'] as num?)?.toInt() ??
          (json['subscribers'] as num?)?.toInt() ??
          0,
      engagementRate: (json['engagementRate'] as num?)?.toDouble() ?? 0.0,
      avgViews: (json['avgViews'] as num?)?.toInt() ?? 0,
      postCount: (json['postCount'] as num?)?.toInt() ?? (json['videoCount'] as num?)?.toInt() ?? 0,
      isConnected: json['isConnected'] as bool? ?? false,
      lastSyncedAt: json['lastSyncedAt'] != null
          ? DateTime.tryParse(json['lastSyncedAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'platform': platform,
      'handle': handle,
      'followers': followers,
      'engagementRate': engagementRate,
      'avgViews': avgViews,
      'postCount': postCount,
      'isConnected': isConnected,
      'lastSyncedAt': lastSyncedAt?.toIso8601String(),
    };
  }
}

class PortfolioItem {
  final String id;
  final String title;
  final String? description;
  final String mediaUrl;
  final String platform;
  final String? externalUrl;
  final int likes;
  final int views;
  final DateTime? createdAt;

  PortfolioItem({
    required this.id,
    required this.title,
    this.description,
    required this.mediaUrl,
    required this.platform,
    this.externalUrl,
    this.likes = 0,
    this.views = 0,
    this.createdAt,
  });

  factory PortfolioItem.fromJson(Map<String, dynamic> json) {
    return PortfolioItem(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      description: json['description'] as String?,
      mediaUrl: json['mediaUrl'] as String? ?? json['thumbnailUrl'] as String? ?? '',
      platform: json['platform'] as String? ?? 'Instagram',
      externalUrl: json['externalUrl'] as String? ?? json['url'] as String?,
      likes: (json['likes'] as num?)?.toInt() ?? 0,
      views: (json['views'] as num?)?.toInt() ?? 0,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'mediaUrl': mediaUrl,
      'platform': platform,
      'externalUrl': externalUrl,
      'likes': likes,
      'views': views,
      'createdAt': createdAt?.toIso8601String(),
    };
  }
}

class CreatorProfileModel {
  final String id;
  final String userId;
  final String handle;
  final String displayName;
  final String? bio;
  final String? avatarUrl;
  final List<String> categories;
  final String? location;
  final double minRate;
  final double maxRate;
  final double rating;
  final int reviewCount;
  final int completedCollaborationsCount;
  final SocialStat instagram;
  final SocialStat youtube;
  final List<PortfolioItem> portfolioItems;
  final String? panNumber;
  final String? bankAccountNumber;
  final String? ifscCode;
  final String? accountHolderName;
  final String kycStatus;
  final String? kycRemarks;

  CreatorProfileModel({
    required this.id,
    required this.userId,
    required this.handle,
    required this.displayName,
    this.bio,
    this.avatarUrl,
    this.categories = const [],
    this.location,
    this.minRate = 0.0,
    this.maxRate = 0.0,
    this.rating = 5.0,
    this.reviewCount = 0,
    this.completedCollaborationsCount = 0,
    required this.instagram,
    required this.youtube,
    this.portfolioItems = const [],
    this.panNumber,
    this.bankAccountNumber,
    this.ifscCode,
    this.accountHolderName,
    this.kycStatus = 'PENDING',
    this.kycRemarks,
  });

  factory CreatorProfileModel.fromJson(Map<String, dynamic> json) {
    return CreatorProfileModel(
      id: json['id'] as String? ?? '',
      userId: json['userId'] as String? ?? '',
      handle: json['handle'] as String? ?? json['username'] as String? ?? '',
      displayName: json['displayName'] as String? ?? json['fullName'] as String? ?? '',
      bio: json['bio'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      categories: (json['categories'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      location: json['location'] as String?,
      minRate: (json['minRate'] as num?)?.toDouble() ?? 0.0,
      maxRate: (json['maxRate'] as num?)?.toDouble() ?? 0.0,
      rating: (json['rating'] as num?)?.toDouble() ?? 5.0,
      reviewCount: (json['reviewCount'] as num?)?.toInt() ?? 0,
      completedCollaborationsCount:
          (json['completedCollaborationsCount'] as num?)?.toInt() ?? 0,
      instagram: json['instagram'] != null
          ? SocialStat.fromJson(json['instagram'] as Map<String, dynamic>)
          : SocialStat(platform: 'instagram'),
      youtube: json['youtube'] != null
          ? SocialStat.fromJson(json['youtube'] as Map<String, dynamic>)
          : SocialStat(platform: 'youtube'),
      portfolioItems: (json['portfolioItems'] as List<dynamic>?)
              ?.map((e) => PortfolioItem.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      panNumber: json['panNumber'] as String?,
      bankAccountNumber: json['bankAccountNumber'] as String?,
      ifscCode: json['ifscCode'] as String?,
      accountHolderName: json['accountHolderName'] as String?,
      kycStatus: json['kycStatus'] as String? ?? 'PENDING',
      kycRemarks: json['kycRemarks'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'handle': handle,
      'displayName': displayName,
      'bio': bio,
      'avatarUrl': avatarUrl,
      'categories': categories,
      'location': location,
      'minRate': minRate,
      'maxRate': maxRate,
      'rating': rating,
      'reviewCount': reviewCount,
      'completedCollaborationsCount': completedCollaborationsCount,
      'instagram': instagram.toJson(),
      'youtube': youtube.toJson(),
      'portfolioItems': portfolioItems.map((e) => e.toJson()).toList(),
      'panNumber': panNumber,
      'bankAccountNumber': bankAccountNumber,
      'ifscCode': ifscCode,
      'accountHolderName': accountHolderName,
      'kycStatus': kycStatus,
      'kycRemarks': kycRemarks,
    };
  }

  CreatorProfileModel copyWith({
    String? id,
    String? userId,
    String? handle,
    String? displayName,
    String? bio,
    String? avatarUrl,
    List<String>? categories,
    String? location,
    double? minRate,
    double? maxRate,
    double? rating,
    int? reviewCount,
    int? completedCollaborationsCount,
    SocialStat? instagram,
    SocialStat? youtube,
    List<PortfolioItem>? portfolioItems,
    String? panNumber,
    String? bankAccountNumber,
    String? ifscCode,
    String? accountHolderName,
    String? kycStatus,
    String? kycRemarks,
  }) {
    return CreatorProfileModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      handle: handle ?? this.handle,
      displayName: displayName ?? this.displayName,
      bio: bio ?? this.bio,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      categories: categories ?? this.categories,
      location: location ?? this.location,
      minRate: minRate ?? this.minRate,
      maxRate: maxRate ?? this.maxRate,
      rating: rating ?? this.rating,
      reviewCount: reviewCount ?? this.reviewCount,
      completedCollaborationsCount:
          completedCollaborationsCount ?? this.completedCollaborationsCount,
      instagram: instagram ?? this.instagram,
      youtube: youtube ?? this.youtube,
      portfolioItems: portfolioItems ?? this.portfolioItems,
      panNumber: panNumber ?? this.panNumber,
      bankAccountNumber: bankAccountNumber ?? this.bankAccountNumber,
      ifscCode: ifscCode ?? this.ifscCode,
      accountHolderName: accountHolderName ?? this.accountHolderName,
      kycStatus: kycStatus ?? this.kycStatus,
      kycRemarks: kycRemarks ?? this.kycRemarks,
    );
  }
}
