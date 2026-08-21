class CreatorPortfolioItem {
  final String id;
  final String title;
  final String mediaUrl;
  final String platform;
  final String? url;
  final int views;

  CreatorPortfolioItem({
    required this.id,
    required this.title,
    required this.mediaUrl,
    required this.platform,
    this.url,
    this.views = 0,
  });

  factory CreatorPortfolioItem.fromJson(Map<String, dynamic> json) {
    return CreatorPortfolioItem(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      mediaUrl: json['mediaUrl'] as String? ?? '',
      platform: json['platform'] as String? ?? 'Instagram Reel',
      url: json['url'] as String? ?? json['externalUrl'] as String?,
      views: (json['views'] as num?)?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'mediaUrl': mediaUrl,
      'platform': platform,
      'url': url,
      'views': views,
    };
  }
}

class CreatorModel {
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
  final int completedDeals;
  final int igFollowers;
  final double igEngagement;
  final int ytSubscribers;
  final List<CreatorPortfolioItem> portfolio;

  CreatorModel({
    required this.id,
    required this.userId,
    required this.handle,
    required this.displayName,
    this.bio,
    this.avatarUrl,
    this.categories = const [],
    this.location,
    this.minRate = 0,
    this.maxRate = 0,
    this.rating = 5.0,
    this.reviewCount = 0,
    this.completedDeals = 0,
    this.igFollowers = 0,
    this.igEngagement = 0.0,
    this.ytSubscribers = 0,
    this.portfolio = const [],
  });

  factory CreatorModel.fromJson(Map<String, dynamic> json) {
    return CreatorModel(
      id: json['id'] as String? ?? '',
      userId: json['userId'] as String? ?? '',
      handle: json['handle'] as String? ?? '',
      displayName: json['displayName'] as String? ?? json['fullName'] as String? ?? 'Creator',
      bio: json['bio'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      categories: (json['categories'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      location: json['location'] as String?,
      minRate: (json['minRate'] as num?)?.toDouble() ?? 0.0,
      maxRate: (json['maxRate'] as num?)?.toDouble() ?? 0.0,
      rating: (json['rating'] as num?)?.toDouble() ?? 5.0,
      reviewCount: (json['reviewCount'] as num?)?.toInt() ?? 0,
      completedDeals: (json['completedDeals'] as num?)?.toInt() ??
          (json['completedCollaborationsCount'] as num?)?.toInt() ??
          0,
      igFollowers: (json['igFollowers'] as num?)?.toInt() ??
          ((json['instagram'] as Map<String, dynamic>?)?['followers'] as num?)?.toInt() ??
          0,
      igEngagement: (json['igEngagement'] as num?)?.toDouble() ??
          ((json['instagram'] as Map<String, dynamic>?)?['engagementRate'] as num?)?.toDouble() ??
          0.0,
      ytSubscribers: (json['ytSubscribers'] as num?)?.toInt() ??
          ((json['youtube'] as Map<String, dynamic>?)?['followers'] as num?)?.toInt() ??
          0,
      portfolio: (json['portfolio'] as List<dynamic>?)
              ?.map((e) => CreatorPortfolioItem.fromJson(e as Map<String, dynamic>))
              .toList() ??
          (json['portfolioItems'] as List<dynamic>?)
              ?.map((e) => CreatorPortfolioItem.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
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
      'completedDeals': completedDeals,
      'igFollowers': igFollowers,
      'igEngagement': igEngagement,
      'ytSubscribers': ytSubscribers,
      'portfolio': portfolio.map((e) => e.toJson()).toList(),
    };
  }
}
