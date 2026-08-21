import '../core/network/api_client.dart';
import '../models/campaign_model.dart';
import '../models/bid_model.dart';

class CampaignService {
  final ApiClient _apiClient;

  CampaignService({required ApiClient apiClient}) : _apiClient = apiClient;

  final List<CampaignModel> _campaigns = [
    CampaignModel(
      id: 'camp_1',
      title: 'Flagship Smartphone Launch - Tech Reel & Unboxing',
      description: 'Looking for tech creators to create 1 dedicated unboxing Reel and 2 Story posts highlighting the AI camera features and ultra-fast charging capabilities of our next-gen flagship phone.',
      businessId: 'biz_u_1',
      companyName: 'Apex Innovations Pvt Ltd',
      brandLogo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=300',
      category: 'Tech',
      budgetMin: 35000,
      budgetMax: 70000,
      deliverables: ['Instagram Reel', 'Instagram Story', 'Brand Mention'],
      requirements: ['Minimum 50k followers', 'Tech/Gadget niche', '4%+ engagement rate', '4K video resolution'],
      guidelines: 'Focus on camera low-light performance and 120W charging demonstration in real-world scenarios.',
      deadline: DateTime.now().add(const Duration(days: 10)),
      status: 'ACTIVE',
      bidsCount: 4,
      activeDealsCount: 1,
      createdAt: DateTime.now().subtract(const Duration(days: 2)),
    ),
    CampaignModel(
      id: 'camp_2',
      title: 'Wireless Gaming Earbuds Sound Test & Review',
      description: 'Promote our ultra-low latency earbuds designed specifically for mobile esports and spatial gaming audio.',
      businessId: 'biz_u_1',
      companyName: 'Apex Innovations Pvt Ltd',
      brandLogo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=300',
      category: 'Gaming',
      budgetMin: 25000,
      budgetMax: 50000,
      deliverables: ['Instagram Reel', 'YouTube Short'],
      requirements: ['Mobile gaming creators', 'Active BGMI/FreeFire players', '30k+ followers'],
      guidelines: 'Demonstrate latency testing with Bluetooth 5.4 gaming mode.',
      deadline: DateTime.now().add(const Duration(days: 15)),
      status: 'PUBLISHED',
      bidsCount: 2,
      activeDealsCount: 0,
      createdAt: DateTime.now().subtract(const Duration(days: 5)),
    ),
  ];

  final Map<String, List<BidModel>> _campaignBids = {
    'camp_1': [
      BidModel(
        id: 'bid_1',
        campaignId: 'camp_1',
        campaignTitle: 'Flagship Smartphone Launch - Tech Reel & Unboxing',
        creatorId: 'creator_u_1',
        creatorName: 'Aarav Sharma',
        creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
        creatorRating: 4.9,
        creatorFollowers: 125000,
        amount: 48000,
        proposal: 'I can deliver a cinematic 4K unboxing Reel with macro lens shots of the sensor module, followed by an interactive Story Q&A discussing performance.',
        deliverables: ['Instagram Reel', 'Instagram Story'],
        estimatedTimeline: '5 days from product delivery',
        status: 'COUNTERED',
        counterAmount: 42000,
        counterNotes: 'We love your content! Can we do ₹42,000 including 1 extra story swipe-up?',
        createdAt: DateTime.now().subtract(const Duration(days: 1)),
      ),
      BidModel(
        id: 'bid_3',
        campaignId: 'camp_1',
        campaignTitle: 'Flagship Smartphone Launch - Tech Reel & Unboxing',
        creatorId: 'creator_u_5',
        creatorName: 'Vikram Joshi (TechGuy)',
        creatorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
        creatorRating: 4.7,
        creatorFollowers: 85000,
        amount: 38000,
        proposal: 'Will create an engaging side-by-side camera comparison vs iPhone 15 in low light settings.',
        deliverables: ['Instagram Reel', 'YouTube Short'],
        estimatedTimeline: '4 days',
        status: 'PENDING',
        createdAt: DateTime.now().subtract(const Duration(hours: 12)),
      ),
    ],
    'camp_2': [
      BidModel(
        id: 'bid_4',
        campaignId: 'camp_2',
        campaignTitle: 'Wireless Gaming Earbuds Sound Test & Review',
        creatorId: 'creator_u_6',
        creatorName: 'Kunal Gamer',
        creatorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
        creatorRating: 4.8,
        creatorFollowers: 62000,
        amount: 30000,
        proposal: 'Live stream gameplay testing latency and audio cues in tournament matches.',
        deliverables: ['YouTube Short', 'Instagram Reel'],
        estimatedTimeline: '3 days',
        status: 'PENDING',
        createdAt: DateTime.now().subtract(const Duration(days: 1)),
      ),
    ],
  };

  Future<List<CampaignModel>> getMyCampaigns({String? status}) async {
    try {
      final response = await _apiClient.get(
        '/campaigns/my-campaigns',
        queryParameters: {
          if (status != null && status != 'ALL') 'status': status,
        },
      );
      if (response.statusCode == 200) {
        final list = response.data as List<dynamic>;
        return list.map((e) => CampaignModel.fromJson(e as Map<String, dynamic>)).toList();
      }
    } catch (_) {}

    if (status != null && status != 'ALL') {
      return _campaigns
          .where((c) => c.status.toUpperCase() == status.toUpperCase())
          .toList();
    }
    return _campaigns;
  }

  Future<CampaignModel> createCampaign({
    required String title,
    required String description,
    required String category,
    required double budgetMin,
    required double budgetMax,
    required List<String> deliverables,
    required List<String> requirements,
    String? guidelines,
    required DateTime deadline,
  }) async {
    final newCampaign = CampaignModel(
      id: 'camp_${DateTime.now().millisecondsSinceEpoch}',
      title: title,
      description: description,
      businessId: 'biz_u_1',
      companyName: 'Apex Innovations Pvt Ltd',
      brandLogo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=300',
      category: category,
      budgetMin: budgetMin,
      budgetMax: budgetMax,
      deliverables: deliverables,
      requirements: requirements,
      guidelines: guidelines,
      deadline: deadline,
      status: 'PUBLISHED',
      bidsCount: 0,
      activeDealsCount: 0,
      createdAt: DateTime.now(),
    );

    try {
      final response = await _apiClient.post(
        '/campaigns',
        data: newCampaign.toJson(),
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        final created = CampaignModel.fromJson(response.data as Map<String, dynamic>);
        _campaigns.insert(0, created);
        return created;
      }
    } catch (_) {}

    _campaigns.insert(0, newCampaign);
    return newCampaign;
  }

  Future<List<BidModel>> getBidsForCampaign(String campaignId) async {
    try {
      final response = await _apiClient.get('/campaigns/$campaignId/bids');
      if (response.statusCode == 200) {
        final list = response.data as List<dynamic>;
        return list.map((e) => BidModel.fromJson(e as Map<String, dynamic>)).toList();
      }
    } catch (_) {}
    return _campaignBids[campaignId] ?? [];
  }

  Future<BidModel> acceptBid(String campaignId, String bidId) async {
    try {
      final response = await _apiClient.post('/bids/$bidId/accept');
      if (response.statusCode == 200) {
        return BidModel.fromJson(response.data as Map<String, dynamic>);
      }
    } catch (_) {}

    final bids = _campaignBids[campaignId] ?? [];
    final index = bids.indexWhere((b) => b.id == bidId);
    if (index != -1) {
      final updated = bids[index].copyWith(status: 'ACCEPTED');
      bids[index] = updated;
      return updated;
    }
    throw Exception('Bid not found');
  }

  Future<BidModel> counterBid({
    required String campaignId,
    required String bidId,
    required double counterAmount,
    required String counterNotes,
  }) async {
    try {
      final response = await _apiClient.post(
        '/bids/$bidId/counter',
        data: {
          'counterAmount': counterAmount,
          'counterNotes': counterNotes,
        },
      );
      if (response.statusCode == 200) {
        return BidModel.fromJson(response.data as Map<String, dynamic>);
      }
    } catch (_) {}

    final bids = _campaignBids[campaignId] ?? [];
    final index = bids.indexWhere((b) => b.id == bidId);
    if (index != -1) {
      final updated = bids[index].copyWith(
        status: 'COUNTERED',
        counterAmount: counterAmount,
        counterNotes: counterNotes,
      );
      bids[index] = updated;
      return updated;
    }
    throw Exception('Bid not found');
  }

  Future<BidModel> rejectBid(String campaignId, String bidId) async {
    try {
      await _apiClient.post('/bids/$bidId/reject');
    } catch (_) {}
    final bids = _campaignBids[campaignId] ?? [];
    final index = bids.indexWhere((b) => b.id == bidId);
    if (index != -1) {
      final updated = bids[index].copyWith(status: 'REJECTED');
      bids[index] = updated;
      return updated;
    }
    throw Exception('Bid not found');
  }
}
