import '../core/network/api_client.dart';
import '../models/creator_profile_model.dart';

class CreatorService {
  final ApiClient _apiClient;

  CreatorService({required ApiClient apiClient}) : _apiClient = apiClient;

  // In-memory demo profile state
  late CreatorProfileModel _myProfile = CreatorProfileModel(
    id: 'creator_p_1',
    userId: 'creator_u_1',
    handle: 'aarav_tech',
    displayName: 'Aarav Sharma',
    bio: 'Tech reviewer, Gadget enthusiast, and UI/UX designer creating high-converting tech reviews and lifestyle content.',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
    categories: ['Tech', 'Gaming', 'Lifestyle'],
    location: 'Bengaluru, India',
    minRate: 15000,
    maxRate: 80000,
    rating: 4.9,
    reviewCount: 28,
    completedCollaborationsCount: 24,
    instagram: SocialStat(
      platform: 'instagram',
      handle: 'aarav.tech',
      followers: 125000,
      engagementRate: 4.8,
      avgViews: 45000,
      postCount: 342,
      isConnected: true,
      lastSyncedAt: DateTime.now().subtract(const Duration(hours: 3)),
    ),
    youtube: SocialStat(
      platform: 'youtube',
      handle: 'AaravTechReviews',
      followers: 88000,
      engagementRate: 6.2,
      avgViews: 62000,
      postCount: 148,
      isConnected: true,
      lastSyncedAt: DateTime.now().subtract(const Duration(hours: 3)),
    ),
    portfolioItems: [
      PortfolioItem(
        id: 'port_1',
        title: 'OnePlus 12 Flagship Unboxing & Camera Test',
        description: 'Comprehensive review reel capturing 120k+ impressions and 8.4k saves.',
        mediaUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',
        platform: 'Instagram Reel',
        externalUrl: 'https://instagram.com/p/demo1',
        likes: 14200,
        views: 125000,
      ),
      PortfolioItem(
        id: 'port_2',
        title: 'Sony WH-1000XM5 Deep Dive Experience',
        description: 'Dedicated YouTube long-form review analyzing ANC and audio quality.',
        mediaUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
        platform: 'YouTube Video',
        externalUrl: 'https://youtube.com/watch?v=demo2',
        likes: 8500,
        views: 89000,
      ),
      PortfolioItem(
        id: 'port_3',
        title: 'Minimalist Desk Setup 2026 Edition',
        description: 'Multi-brand sponsored setup reel showcasing ergonomics and productivity gear.',
        mediaUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600',
        platform: 'Instagram Reel',
        likes: 22400,
        views: 180000,
      ),
    ],
    panNumber: 'ABCDE1234F',
    bankAccountNumber: '918237465012',
    ifscCode: 'HDFC0001234',
    accountHolderName: 'Aarav Sharma',
    kycStatus: 'VERIFIED',
  );

  CreatorProfileModel get myProfile => _myProfile;

  Future<CreatorProfileModel> getMyProfile() async {
    try {
      final response = await _apiClient.get('/creators/profile/me');
      if (response.statusCode == 200) {
        _myProfile = CreatorProfileModel.fromJson(response.data as Map<String, dynamic>);
        return _myProfile;
      }
    } catch (_) {}
    return _myProfile;
  }

  Future<CreatorProfileModel> updateProfile({
    String? displayName,
    String? bio,
    List<String>? categories,
    String? location,
    double? minRate,
    double? maxRate,
    String? avatarUrl,
  }) async {
    try {
      final response = await _apiClient.patch(
        '/creators/profile/me',
        data: {
          if (displayName != null) 'displayName': displayName,
          if (bio != null) 'bio': bio,
          if (categories != null) 'categories': categories,
          if (location != null) 'location': location,
          if (minRate != null) 'minRate': minRate,
          if (maxRate != null) 'maxRate': maxRate,
          if (avatarUrl != null) 'avatarUrl': avatarUrl,
        },
      );
      if (response.statusCode == 200) {
        _myProfile = CreatorProfileModel.fromJson(response.data as Map<String, dynamic>);
        return _myProfile;
      }
    } catch (_) {}

    _myProfile = _myProfile.copyWith(
      displayName: displayName,
      bio: bio,
      categories: categories,
      location: location,
      minRate: minRate,
      maxRate: maxRate,
      avatarUrl: avatarUrl,
    );
    return _myProfile;
  }

  Future<CreatorProfileModel> connectSocialAccount({
    required String platform,
    required String handle,
  }) async {
    try {
      final response = await _apiClient.post(
        '/social/connect',
        data: {'platform': platform, 'handle': handle},
      );
      if (response.statusCode == 200) {
        _myProfile = CreatorProfileModel.fromJson(response.data as Map<String, dynamic>);
        return _myProfile;
      }
    } catch (_) {}

    if (platform == 'instagram') {
      final updatedIg = SocialStat(
        platform: 'instagram',
        handle: handle,
        followers: 135000,
        engagementRate: 5.1,
        avgViews: 52000,
        postCount: 360,
        isConnected: true,
        lastSyncedAt: DateTime.now(),
      );
      _myProfile = _myProfile.copyWith(instagram: updatedIg);
    } else if (platform == 'youtube') {
      final updatedYt = SocialStat(
        platform: 'youtube',
        handle: handle,
        followers: 95000,
        engagementRate: 6.5,
        avgViews: 71000,
        postCount: 154,
        isConnected: true,
        lastSyncedAt: DateTime.now(),
      );
      _myProfile = _myProfile.copyWith(youtube: updatedYt);
    }
    return _myProfile;
  }

  Future<PortfolioItem> addPortfolioItem({
    required String title,
    String? description,
    required String mediaUrl,
    required String platform,
    String? externalUrl,
  }) async {
    final newItem = PortfolioItem(
      id: 'port_${DateTime.now().millisecondsSinceEpoch}',
      title: title,
      description: description,
      mediaUrl: mediaUrl,
      platform: platform,
      externalUrl: externalUrl,
      likes: 1200,
      views: 15000,
      createdAt: DateTime.now(),
    );

    try {
      final response = await _apiClient.post(
        '/portfolio',
        data: newItem.toJson(),
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        final created = PortfolioItem.fromJson(response.data as Map<String, dynamic>);
        _myProfile = _myProfile.copyWith(
          portfolioItems: [..._myProfile.portfolioItems, created],
        );
        return created;
      }
    } catch (_) {}

    _myProfile = _myProfile.copyWith(
      portfolioItems: [..._myProfile.portfolioItems, newItem],
    );
    return newItem;
  }

  Future<void> deletePortfolioItem(String itemId) async {
    try {
      await _apiClient.delete('/portfolio/$itemId');
    } catch (_) {}
    final updated = _myProfile.portfolioItems.where((i) => i.id != itemId).toList();
    _myProfile = _myProfile.copyWith(portfolioItems: updated);
  }

  Future<List<CreatorProfileModel>> getDiscoverCreators({
    String? query,
    String? category,
  }) async {
    try {
      final response = await _apiClient.get(
        '/discover/creators',
        queryParameters: {
          if (query != null && query.isNotEmpty) 'q': query,
          if (category != null && category != 'All') 'category': category,
        },
      );
      if (response.statusCode == 200) {
        final list = response.data as List<dynamic>;
        return list
            .map((e) => CreatorProfileModel.fromJson(e as Map<String, dynamic>))
            .toList();
      }
    } catch (_) {}

    // Diverse fallback list of creators
    final mockCreators = [
      _myProfile,
      CreatorProfileModel(
        id: 'creator_p_2',
        userId: 'creator_u_2',
        handle: 'priya_styles',
        displayName: 'Priya Verma',
        bio: 'Fashion designer & sustainable styling expert. Collaborating with top ethical apparel & luxury brands.',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        categories: ['Fashion', 'Beauty', 'Lifestyle'],
        location: 'Mumbai, India',
        minRate: 20000,
        maxRate: 95000,
        rating: 5.0,
        reviewCount: 36,
        completedCollaborationsCount: 31,
        instagram: SocialStat(
          platform: 'instagram',
          handle: 'priya.styles',
          followers: 240000,
          engagementRate: 5.8,
          avgViews: 98000,
          postCount: 512,
          isConnected: true,
          lastSyncedAt: DateTime.now().subtract(const Duration(hours: 6)),
        ),
        youtube: SocialStat(
          platform: 'youtube',
          handle: 'PriyaVermaVlogs',
          followers: 110000,
          engagementRate: 4.9,
          avgViews: 85000,
          postCount: 92,
          isConnected: true,
        ),
      ),
      CreatorProfileModel(
        id: 'creator_p_3',
        userId: 'creator_u_3',
        handle: 'chef_rohit',
        displayName: 'Rohit Kulkarni',
        bio: 'Culinary artist & quick gourmet recipe creator. Working with kitchenware, organic foods, and FMCG brands.',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        categories: ['Food', 'Lifestyle'],
        location: 'Pune, India',
        minRate: 12000,
        maxRate: 50000,
        rating: 4.8,
        reviewCount: 19,
        completedCollaborationsCount: 17,
        instagram: SocialStat(
          platform: 'instagram',
          handle: 'chef.rohit',
          followers: 180000,
          engagementRate: 6.4,
          avgViews: 140000,
          postCount: 420,
          isConnected: true,
        ),
        youtube: SocialStat(
          platform: 'youtube',
          handle: 'ChefRohitKitchen',
          followers: 320000,
          engagementRate: 7.1,
          avgViews: 210000,
          postCount: 230,
          isConnected: true,
        ),
      ),
    ];

    if (category != null && category != 'All') {
      return mockCreators
          .where((c) => c.categories.any((cat) => cat.toLowerCase() == category.toLowerCase()))
          .toList();
    }
    if (query != null && query.isNotEmpty) {
      return mockCreators
          .where((c) =>
              c.displayName.toLowerCase().contains(query.toLowerCase()) ||
              c.handle.toLowerCase().contains(query.toLowerCase()) ||
              c.categories.any((cat) => cat.toLowerCase().contains(query.toLowerCase())))
          .toList();
    }
    return mockCreators;
  }
}
