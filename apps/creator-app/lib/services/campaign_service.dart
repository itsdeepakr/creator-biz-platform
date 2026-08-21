import '../core/network/api_client.dart';
import '../models/campaign_model.dart';
import '../models/bid_model.dart';

class CampaignService {
  final ApiClient _apiClient;

  CampaignService({required ApiClient apiClient}) : _apiClient = apiClient;

  // In-memory stateful campaigns list
  final List<CampaignModel> _campaigns = [
    CampaignModel(
      id: 'camp_1',
      title: 'Flagship Smartphone Launch - Tech Reel & Unboxing',
      description: 'Looking for tech creators to create 1 dedicated unboxing Reel and 2 Story posts highlighting the AI camera features and ultra-fast charging capabilities of our next-gen flagship phone.',
      brandId: 'biz_1',
      brandName: 'Apex Innovations',
      brandLogo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=300',
      brandWebsite: 'https://apexinnovations.tech',
      category: 'Tech',
      budgetMin: 35000,
      budgetMax: 70000,
      deliverables: ['Instagram Reel', 'Instagram Story', 'Brand Mention'],
      requirements: ['Minimum 50k followers', 'Tech/Gadget niche', '4%+ engagement rate', '4K video resolution'],
      guidelines: 'Focus on camera low-light performance and 120W charging demonstration in real-world scenarios.',
      deadline: DateTime.now().add(const Duration(days: 10)),
      status: 'PUBLISHED',
      applicantCount: 12,
      createdAt: DateTime.now().subtract(const Duration(days: 2)),
    ),
    CampaignModel(
      id: 'camp_2',
      title: 'Summer Fitness & Organic Hydration Campaign',
      description: 'Promote our all-natural electrolyte energy drink. We need high-energy workout Reels showing pre- and post-workout routines featuring our product.',
      brandId: 'biz_2',
      brandName: 'HydroPure Nutrition',
      brandLogo: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300',
      brandWebsite: 'https://hydropure.fit',
      category: 'Fitness',
      budgetMin: 20000,
      budgetMax: 45000,
      deliverables: ['Instagram Reel', 'Instagram Post', 'YouTube Short'],
      requirements: ['Fitness/Wellness creators', 'Active gym-goers', 'Authentic reviews'],
      guidelines: 'Include brand discount code in caption and swipe-up link in Stories.',
      deadline: DateTime.now().add(const Duration(days: 18)),
      status: 'PUBLISHED',
      applicantCount: 8,
      createdAt: DateTime.now().subtract(const Duration(days: 4)),
    ),
    CampaignModel(
      id: 'camp_3',
      title: 'Eco-Friendly Fashion & Sustainable Daily Wear',
      description: 'Showcase our spring collection crafted from 100% recycled organic cotton. Looking for aesthetic '
          'lookbooks and transition reels that resonate with eco-conscious youth.',
      brandId: 'biz_3',
      brandName: 'Verde Apparel',
      brandLogo: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=300',
      brandWebsite: 'https://verdeapparel.co',
      category: 'Fashion',
      budgetMin: 25000,
      budgetMax: 60000,
      deliverables: ['Instagram Reel', 'Instagram Post', 'Instagram Story'],
      requirements: ['Fashion/Lifestyle niche', 'High production value', '35k+ followers'],
      guidelines: 'Highlight texture, comfort, and sustainable manufacturing credentials.',
      deadline: DateTime.now().add(const Duration(days: 12)),
      status: 'PUBLISHED',
      applicantCount: 15,
      createdAt: DateTime.now().subtract(const Duration(days: 1)),
    ),
    CampaignModel(
      id: 'camp_4',
      title: 'Next-Gen Cloud Gaming Controller Sponsorship',
      description: 'Dedicated YouTube gameplay review testing our Bluetooth gaming controller with low latency mode across AAA mobile titles.',
      brandId: 'biz_4',
      brandName: 'HyperPlay Gaming',
      brandLogo: 'https://images.unsplash.com/photo-1612287233207-68b556efaa03?w=300',
      brandWebsite: 'https://hyperplay.gg',
      category: 'Gaming',
      budgetMin: 40000,
      budgetMax: 85000,
      deliverables: ['YouTube Video', 'YouTube Short', 'Twitter/X Post'],
      requirements: ['Mobile or PC gaming creators', 'Min 50k subscribers', 'Direct gameplay capture'],
      guidelines: 'Demonstrate responsiveness and button mapping features with live FPS counter.',
      deadline: DateTime.now().add(const Duration(days: 20)),
      status: 'PUBLISHED',
      applicantCount: 9,
      createdAt: DateTime.now().subtract(const Duration(days: 3)),
    ),
  ];

  // In-memory stateful bids list
  final List<BidModel> _myBids = [
    BidModel(
      id: 'bid_1',
      campaignId: 'camp_1',
      campaignTitle: 'Flagship Smartphone Launch - Tech Reel & Unboxing',
      brandName: 'Apex Innovations',
      brandLogo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=300',
      creatorId: 'creator_u_1',
      creatorName: 'Aarav Sharma',
      creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
      amount: 48000,
      proposal: 'I can deliver a cinematic 4K unboxing Reel with macro lens shots of the sensor module, followed by an interactive Story Q&A discussing performance. My audience has 82% smartphone interest.',
      deliverables: ['Instagram Reel', 'Instagram Story'],
      estimatedTimeline: '5 days from product delivery',
      status: 'COUNTERED',
      counterAmount: 42000,
      counterNotes: 'We love your content! Can we do ₹42,000 including 1 extra story swipe-up?',
      createdAt: DateTime.now().subtract(const Duration(days: 1)),
      updatedAt: DateTime.now().subtract(const Duration(hours: 4)),
    ),
    BidModel(
      id: 'bid_2',
      campaignId: 'camp_4',
      campaignTitle: 'Next-Gen Cloud Gaming Controller Sponsorship',
      brandName: 'HyperPlay Gaming',
      creatorId: 'creator_u_1',
      creatorName: 'Aarav Sharma',
      amount: 55000,
      proposal: 'Full 8-minute dedicated video segment testing latency on COD Mobile and Genshin Impact with 60fps overlay.',
      deliverables: ['YouTube Video', 'YouTube Short'],
      estimatedTimeline: '7 days',
      status: 'PENDING',
      createdAt: DateTime.now().subtract(const Duration(hours: 18)),
      updatedAt: DateTime.now().subtract(const Duration(hours: 18)),
    ),
  ];

  Future<List<CampaignModel>> getCampaignFeed({
    String? category,
    double? minBudget,
    double? maxBudget,
    String? query,
  }) async {
    try {
      final response = await _apiClient.get(
        '/campaigns/feed',
        queryParameters: {
          if (category != null && category != 'All') 'category': category,
          if (minBudget != null) 'minBudget': minBudget,
          if (maxBudget != null) 'maxBudget': maxBudget,
          if (query != null && query.isNotEmpty) 'q': query,
        },
      );
      if (response.statusCode == 200) {
        final list = response.data as List<dynamic>;
        return list.map((e) => CampaignModel.fromJson(e as Map<String, dynamic>)).toList();
      }
    } catch (_) {}

    var filtered = List<CampaignModel>.from(_campaigns);
    if (category != null && category != 'All') {
      filtered = filtered
          .where((c) => c.category.toLowerCase() == category.toLowerCase())
          .toList();
    }
    if (minBudget != null) {
      filtered = filtered.where((c) => c.budgetMax >= minBudget).toList();
    }
    if (maxBudget != null) {
      filtered = filtered.where((c) => c.budgetMin <= maxBudget).toList();
    }
    if (query != null && query.isNotEmpty) {
      filtered = filtered
          .where((c) =>
              c.title.toLowerCase().contains(query.toLowerCase()) ||
              c.description.toLowerCase().contains(query.toLowerCase()) ||
              c.brandName.toLowerCase().contains(query.toLowerCase()))
          .toList();
    }
    return filtered;
  }

  Future<CampaignModel?> getCampaignById(String id) async {
    try {
      final response = await _apiClient.get('/campaigns/$id');
      if (response.statusCode == 200) {
        return CampaignModel.fromJson(response.data as Map<String, dynamic>);
      }
    } catch (_) {}
    return _campaigns.firstWhere(
      (c) => c.id == id,
      orElse: () => _campaigns.first,
    );
  }

  Future<BidModel> placeBid({
    required String campaignId,
    required double amount,
    required String proposal,
    required List<String> deliverables,
    String? estimatedTimeline,
  }) async {
    final newBid = BidModel(
      id: 'bid_${DateTime.now().millisecondsSinceEpoch}',
      campaignId: campaignId,
      campaignTitle: _campaigns
          .firstWhere((c) => c.id == campaignId, orElse: () => _campaigns.first)
          .title,
      brandName: _campaigns
          .firstWhere((c) => c.id == campaignId, orElse: () => _campaigns.first)
          .brandName,
      creatorId: 'creator_u_1',
      creatorName: 'Aarav Sharma',
      amount: amount,
      proposal: proposal,
      deliverables: deliverables,
      estimatedTimeline: estimatedTimeline,
      status: 'PENDING',
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );

    try {
      final response = await _apiClient.post(
        '/campaigns/$campaignId/bids',
        data: newBid.toJson(),
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        final created = BidModel.fromJson(response.data as Map<String, dynamic>);
        _myBids.insert(0, created);
        return created;
      }
    } catch (_) {}

    _myBids.insert(0, newBid);
    return newBid;
  }

  Future<List<BidModel>> getMyBids() async {
    try {
      final response = await _apiClient.get('/campaigns/my-bids');
      if (response.statusCode == 200) {
        final list = response.data as List<dynamic>;
        return list.map((e) => BidModel.fromJson(e as Map<String, dynamic>)).toList();
      }
    } catch (_) {}
    return _myBids;
  }

  Future<BidModel> respondToCounterOffer({
    required String bidId,
    required bool accept,
    double? newCounterAmount,
    String? notes,
  }) async {
    try {
      final response = await _apiClient.post(
        '/bids/$bidId/respond',
        data: {
          'action': accept ? 'ACCEPT' : (newCounterAmount != null ? 'COUNTER' : 'REJECT'),
          if (newCounterAmount != null) 'amount': newCounterAmount,
          if (notes != null) 'notes': notes,
        },
      );
      if (response.statusCode == 200) {
        return BidModel.fromJson(response.data as Map<String, dynamic>);
      }
    } catch (_) {}

    final index = _myBids.indexWhere((b) => b.id == bidId);
    if (index != -1) {
      final current = _myBids[index];
      final updated = current.copyWith(
        status: accept ? 'ACCEPTED' : (newCounterAmount != null ? 'COUNTERED' : 'REJECTED'),
        amount: accept && current.counterAmount != null
            ? current.counterAmount
            : (newCounterAmount ?? current.amount),
        updatedAt: DateTime.now(),
      );
      _myBids[index] = updated;
      return updated;
    }
    throw Exception('Bid not found');
  }
}
