import '../core/network/api_client.dart';
import '../models/creator_model.dart';

class CreatorDiscoveryService {
  final ApiClient _apiClient;

  CreatorDiscoveryService({required ApiClient apiClient}) : _apiClient = apiClient;

  final List<CreatorModel> _creators = [
    CreatorModel(
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
      completedDeals: 24,
      igFollowers: 125000,
      igEngagement: 4.8,
      ytSubscribers: 88000,
      portfolio: [
        CreatorPortfolioItem(
          id: 'port_1',
          title: 'OnePlus 12 Flagship Unboxing & Camera Test',
          mediaUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',
          platform: 'Instagram Reel',
          views: 125000,
        ),
        CreatorPortfolioItem(
          id: 'port_2',
          title: 'Sony WH-1000XM5 Deep Dive Experience',
          mediaUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
          platform: 'YouTube Video',
          views: 89000,
        ),
      ],
    ),
    CreatorModel(
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
      completedDeals: 31,
      igFollowers: 240000,
      igEngagement: 5.8,
      ytSubscribers: 110000,
      portfolio: [
        CreatorPortfolioItem(
          id: 'port_201',
          title: 'Summer Eco-Chic Lookbook 2026',
          mediaUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600',
          platform: 'Instagram Reel',
          views: 210000,
        ),
      ],
    ),
    CreatorModel(
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
      completedDeals: 17,
      igFollowers: 180000,
      igEngagement: 6.4,
      ytSubscribers: 320000,
      portfolio: [],
    ),
    CreatorModel(
      id: 'creator_p_4',
      userId: 'creator_u_4',
      handle: 'fit_ananya',
      displayName: 'Ananya Roy',
      bio: 'Certified strength trainer & functional fitness coach. Empowering 150k+ daily athletes with nutrition and workout tips.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      categories: ['Fitness', 'Lifestyle'],
      location: 'Delhi NCR, India',
      minRate: 18000,
      maxRate: 65000,
      rating: 4.9,
      reviewCount: 22,
      completedDeals: 20,
      igFollowers: 155000,
      igEngagement: 5.2,
      ytSubscribers: 75000,
      portfolio: [],
    ),
  ];

  Future<List<CreatorModel>> searchCreators({
    String? query,
    String? category,
    int? minFollowers,
    double? minEngagement,
    double? minRating,
    String? location,
  }) async {
    try {
      final response = await _apiClient.get(
        '/discover/creators',
        queryParameters: {
          if (query != null && query.isNotEmpty) 'q': query,
          if (category != null && category != 'All') 'category': category,
          if (minFollowers != null) 'minFollowers': minFollowers,
          if (minEngagement != null) 'minEngagement': minEngagement,
          if (minRating != null) 'minRating': minRating,
        },
      );
      if (response.statusCode == 200) {
        final list = response.data as List<dynamic>;
        return list.map((e) => CreatorModel.fromJson(e as Map<String, dynamic>)).toList();
      }
    } catch (_) {}

    var filtered = List<CreatorModel>.from(_creators);
    if (category != null && category != 'All') {
      filtered = filtered
          .where((c) => c.categories.any((cat) => cat.toLowerCase() == category.toLowerCase()))
          .toList();
    }
    if (query != null && query.isNotEmpty) {
      filtered = filtered
          .where((c) =>
              c.displayName.toLowerCase().contains(query.toLowerCase()) ||
              c.handle.toLowerCase().contains(query.toLowerCase()) ||
              c.categories.any((cat) => cat.toLowerCase().contains(query.toLowerCase())))
          .toList();
    }
    if (minFollowers != null) {
      filtered = filtered.where((c) => c.igFollowers >= minFollowers).toList();
    }
    if (minEngagement != null) {
      filtered = filtered.where((c) => c.igEngagement >= minEngagement).toList();
    }
    if (minRating != null) {
      filtered = filtered.where((c) => c.rating >= minRating).toList();
    }
    return filtered;
  }

  Future<CreatorModel?> getCreatorById(String id) async {
    try {
      final response = await _apiClient.get('/creators/$id');
      if (response.statusCode == 200) {
        return CreatorModel.fromJson(response.data as Map<String, dynamic>);
      }
    } catch (_) {}
    return _creators.firstWhere((c) => c.id == id, orElse: () => _creators.first);
  }
}
