class AppConstants {
  // API Configuration
  static const String apiBaseUrl = 'https://api.creatorbiz.io/v1';
  static const String wsBaseUrl = 'wss://ws.creatorbiz.io';

  // Endpoints
  static const String authLogin = '/auth/login';
  static const String authRegister = '/auth/register';
  static const String authVerifyOtp = '/auth/verify-otp';
  static const String authRefresh = '/auth/refresh';
  static const String authLogout = '/auth/logout';

  static const String campaignsFeed = '/campaigns/feed';
  static const String campaignDetail = '/campaigns';
  static const String campaignApply = '/campaigns/apply';
  static const String campaignMyBids = '/campaigns/my-bids';

  static const String discoverCreators = '/discover/creators';
  static const String creatorProfile = '/creators';
  static const String creatorFollow = '/creators/follow';
  static const String creatorUnfollow = '/creators/unfollow';

  static const String collaborations = '/collaborations';
  static const String collaborationDetail = '/collaborations/detail';
  static const String collaborationAccept = '/collaborations/accept';
  static const String collaborationDeliver = '/collaborations/deliver';
  static const String collaborationComplete = '/collaborations/complete';

  static const String messagesThreads = '/messages/threads';
  static const String messagesSend = '/messages/send';
  static const String messagesReport = '/messages/report';

  static const String portfolioItems = '/portfolio';
  static const String portfolioServices = '/portfolio/services';
  static const String portfolioUpload = '/portfolio/upload';

  static const String paymentsEarnings = '/payments/earnings';
  static const String paymentsEscrow = '/payments/escrow';
  static const String paymentsPayouts = '/payments/payouts';
  static const String paymentsRequest = '/payments/request';

  static const String kycSubmit = '/kyc/submit';
  static const String kycStatus = '/kyc/status';

  static const String notifications = '/notifications';
  static const String notificationsRegister = '/notifications/register';

  static const String socialConnect = '/social/connect';
  static const String socialAccounts = '/social/accounts';

  static const String search = '/search';

  // App Config
  static const String appName = 'CreatorBiz';
  static const String appVersion = '1.0.0';
  static const int connectionTimeout = 30000; // ms
  static const int receiveTimeout = 30000; // ms

  // Pagination
  static const int defaultPageSize = 20;

  // Supported Categories
  static const List<String> creatorCategories = [
    'Fashion',
    'Beauty',
    'Tech',
    'Food',
    'Travel',
    'Fitness',
    'Gaming',
    'Education',
    'Music',
    'Comedy',
    'Lifestyle',
    'Business',
    'Photography',
    'Art',
    'Sports',
  ];

  // Deliverable Types
  static const List<String> deliverableTypes = [
    'Instagram Post',
    'Instagram Reel',
    'Instagram Story',
    'YouTube Video',
    'YouTube Short',
    'Twitter/X Post',
    'LinkedIn Post',
    'TikTok Video',
    'Blog Post',
    'Podcast Episode',
    'Brand Mention',
    'Event Appearance',
  ];
}
