import {
  PrismaClient,
  UserRole,
  VerificationStatus,
  CampaignStatus,
  CollaborationStatus,
  PaymentStatus,
  DisputeStatus,
  DisputeOutcome,
  ReviewType,
  DeliverableType,
  ChatReportReason,
  NotificationChannel,
} from '@prisma/client';

const prisma = new PrismaClient();

// Sample bcrypt hash for "Password@123"
const DEFAULT_PASSWORD_HASH =
  '$2b$10$epRswT7vWZk5w/uPqmK9m.lqA6J.u8bJ47rFhF9vDk1l9xP3gY9Y.';

async function main() {
  console.log('🌱 Starting database seed for Creator-Business Platform...');

  // 1. Clean existing records in reverse dependency order
  console.log('🧹 Cleaning existing tables...');
  await prisma.notification.deleteMany();
  await prisma.report.deleteMany();
  await prisma.message.deleteMany();
  await prisma.chatThread.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.review.deleteMany();
  await prisma.platformFee.deleteMany();
  await prisma.escrowTransaction.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.collaboration.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.portfolioItem.deleteMany();
  await prisma.service.deleteMany();
  await prisma.socialConnection.deleteMany();
  await prisma.adminProfile.deleteMany();
  await prisma.creatorProfile.deleteMany();
  await prisma.businessProfile.deleteMany();
  await prisma.user.deleteMany();

  // 2. Seed Users & Profiles
  console.log('👤 Seeding Users & Profiles...');

  // 2.1 Admins
  const adminUser1 = await prisma.user.create({
    data: {
      email: 'admin@creatorbiz.in',
      phone: '+919811001100',
      passwordHash: DEFAULT_PASSWORD_HASH,
      role: UserRole.ADMIN,
      isActive: true,
      isVerified: true,
      adminProfile: {
        create: {
          permissions: {
            all: true,
            manageKyc: true,
            manageDisputes: true,
            manageCampaigns: true,
            manageUsers: true,
            financialAudit: true,
          },
        },
      },
    },
  });

  const adminUser2 = await prisma.user.create({
    data: {
      email: 'moderator@creatorbiz.in',
      phone: '+919811001101',
      passwordHash: DEFAULT_PASSWORD_HASH,
      role: UserRole.ADMIN,
      isActive: true,
      isVerified: true,
      adminProfile: {
        create: {
          permissions: {
            manageKyc: true,
            manageDisputes: true,
            manageCampaigns: true,
          },
        },
      },
    },
  });

  // 2.2 Creators
  const creatorUser1 = await prisma.user.create({
    data: {
      email: 'ananya.style@gmail.com',
      phone: '+919820112233',
      passwordHash: DEFAULT_PASSWORD_HASH,
      role: UserRole.CREATOR,
      isActive: true,
      isVerified: true,
      creatorProfile: {
        create: {
          displayName: 'Ananya Sharma',
          bio: 'Mumbai-based Fashion, Sustainable Styling & Lifestyle Content Creator. Featured in Vogue India 40 under 40.',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
          category: 'Fashion & Style',
          subCategories: ['Sustainable Fashion', 'Luxury Lifestyle', 'Streetwear'],
          location: 'Mumbai, Maharashtra',
          languages: ['English', 'Hindi', 'Marathi'],
          isVerified: true,
          verificationStatus: VerificationStatus.APPROVED,
          verifiedAt: new Date('2025-01-15T10:00:00Z'),
          hourlyRate: 5000,
          minProjectBudget: 25000,
          panNumber: 'ABCPS1234K',
          bankAccountNumber: '918273645544',
          bankIfsc: 'HDFC0000123',
          bankAccountHolderName: 'Ananya Sharma',
          idDocumentUrl: 'https://s3.ap-south-1.amazonaws.com/cbp-kyc/ananya_pan.pdf',
          idDocumentType: 'PAN',
          kycStatus: VerificationStatus.APPROVED,
          socialStats: {
            instagram: {
              username: 'ananya.style',
              followers: 450000,
              following: 620,
              postsCount: 540,
              engagementRate: 4.8,
              avgLikes: 21500,
              avgComments: 890,
              topCities: ['Mumbai', 'Delhi NCR', 'Bengaluru', 'Pune'],
            },
            youtube: {
              channelId: 'UC_ananya_style',
              channelTitle: 'Style With Ananya',
              subscribers: 120000,
              videoCount: 95,
              totalViews: 8500000,
              avgViewsPerVideo: 45000,
              engagementRate: 5.2,
            },
            totalReach: 570000,
            avgEngagementRate: 4.95,
          },
          socialStatsRefreshedAt: new Date(),
        },
      },
    },
    include: { creatorProfile: true },
  });

  const creatorUser2 = await prisma.user.create({
    data: {
      email: 'rohan.tech@gmail.com',
      phone: '+919845223344',
      passwordHash: DEFAULT_PASSWORD_HASH,
      role: UserRole.CREATOR,
      isActive: true,
      isVerified: true,
      creatorProfile: {
        create: {
          displayName: 'Rohan Mehta',
          bio: 'Electronics engineer & tech reviewer based in Bengaluru. Deep dives into smartphones, audio gear, and smart home automation.',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
          category: 'Tech & Gadgets',
          subCategories: ['Smartphones', 'Audio Gear', 'PC Building', 'AI Tech'],
          location: 'Bengaluru, Karnataka',
          languages: ['English', 'Hindi', 'Kannada'],
          isVerified: true,
          verificationStatus: VerificationStatus.APPROVED,
          verifiedAt: new Date('2025-02-01T11:30:00Z'),
          hourlyRate: 8000,
          minProjectBudget: 40000,
          panNumber: 'ABCMR5678L',
          bankAccountNumber: '123456789012',
          bankIfsc: 'ICIC0000456',
          bankAccountHolderName: 'Rohan Mehta',
          idDocumentUrl: 'https://s3.ap-south-1.amazonaws.com/cbp-kyc/rohan_pan.pdf',
          idDocumentType: 'PAN',
          kycStatus: VerificationStatus.APPROVED,
          socialStats: {
            youtube: {
              channelId: 'UC_rohan_tech_in',
              channelTitle: 'Rohan Tech Lab',
              subscribers: 850000,
              videoCount: 320,
              totalViews: 45000000,
              avgViewsPerVideo: 120000,
              engagementRate: 6.5,
            },
            instagram: {
              username: 'rohan_tech_in',
              followers: 210000,
              following: 410,
              postsCount: 420,
              engagementRate: 4.1,
              avgLikes: 14000,
              avgComments: 650,
              topCities: ['Bengaluru', 'Hyderabad', 'Delhi NCR', 'Chennai'],
            },
            totalReach: 1060000,
            avgEngagementRate: 5.8,
          },
          socialStatsRefreshedAt: new Date(),
        },
      },
    },
    include: { creatorProfile: true },
  });

  const creatorUser3 = await prisma.user.create({
    data: {
      email: 'priya.cooks@gmail.com',
      phone: '+919447334455',
      passwordHash: DEFAULT_PASSWORD_HASH,
      role: UserRole.CREATOR,
      isActive: true,
      isVerified: true,
      creatorProfile: {
        create: {
          displayName: 'Priya Nair',
          bio: 'Authentic South Indian & Fusion cuisine chef. Quick 60-second recipe reels and kitchen hacks.',
          avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
          category: 'Food & Culinary',
          subCategories: ['Regional Indian Food', 'Quick Recipes', 'Healthy Cooking'],
          location: 'Chennai, Tamil Nadu',
          languages: ['English', 'Tamil', 'Malayalam', 'Hindi'],
          isVerified: true,
          verificationStatus: VerificationStatus.APPROVED,
          verifiedAt: new Date('2025-01-20T14:00:00Z'),
          hourlyRate: 4500,
          minProjectBudget: 20000,
          panNumber: 'ABCPN9012M',
          bankAccountNumber: '987654321098',
          bankIfsc: 'SBIN0001234',
          bankAccountHolderName: 'Priya Nair',
          idDocumentUrl: 'https://s3.ap-south-1.amazonaws.com/cbp-kyc/priya_pan.pdf',
          idDocumentType: 'PAN',
          kycStatus: VerificationStatus.APPROVED,
          socialStats: {
            instagram: {
              username: 'priyacooks',
              followers: 320000,
              following: 380,
              postsCount: 680,
              engagementRate: 5.4,
              avgLikes: 18000,
              avgComments: 1100,
              topCities: ['Chennai', 'Bengaluru', 'Kochi', 'Hyderabad'],
            },
            youtube: {
              channelId: 'UC_priyacooks',
              channelTitle: 'Priya Kitchen Stories',
              subscribers: 180000,
              videoCount: 140,
              totalViews: 12000000,
              avgViewsPerVideo: 60000,
              engagementRate: 5.1,
            },
            totalReach: 500000,
            avgEngagementRate: 5.3,
          },
          socialStatsRefreshedAt: new Date(),
        },
      },
    },
    include: { creatorProfile: true },
  });

  const creatorUser4 = await prisma.user.create({
    data: {
      email: 'kabir.fitness@gmail.com',
      phone: '+919910445566',
      passwordHash: DEFAULT_PASSWORD_HASH,
      role: UserRole.CREATOR,
      isActive: true,
      isVerified: true,
      creatorProfile: {
        create: {
          displayName: 'Kabir Varma',
          bio: 'Certified strength & conditioning coach. Transforming lives with evidence-based training, diet plans, and workout challenges.',
          avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
          category: 'Fitness & Health',
          subCategories: ['Calisthenics', 'Bodybuilding', 'Nutrition', 'HIIT'],
          location: 'Delhi NCR',
          languages: ['English', 'Hindi', 'Punjabi'],
          isVerified: true,
          verificationStatus: VerificationStatus.APPROVED,
          verifiedAt: new Date('2025-01-25T16:00:00Z'),
          hourlyRate: 6000,
          minProjectBudget: 30000,
          panNumber: 'ABCPK3456P',
          bankAccountNumber: '456789123456',
          bankIfsc: 'KKBK0000789',
          bankAccountHolderName: 'Kabir Varma',
          idDocumentUrl: 'https://s3.ap-south-1.amazonaws.com/cbp-kyc/kabir_pan.pdf',
          idDocumentType: 'PAN',
          kycStatus: VerificationStatus.APPROVED,
          socialStats: {
            instagram: {
              username: 'fitwithkabir',
              followers: 550000,
              following: 290,
              postsCount: 480,
              engagementRate: 6.2,
              avgLikes: 35000,
              avgComments: 1450,
              topCities: ['Delhi NCR', 'Chandigarh', 'Mumbai', 'Jaipur'],
            },
            youtube: {
              channelId: 'UC_fitwithkabir',
              channelTitle: 'Kabir Varma Fitness',
              subscribers: 95000,
              videoCount: 80,
              totalViews: 5200000,
              avgViewsPerVideo: 40000,
              engagementRate: 6.0,
            },
            totalReach: 645000,
            avgEngagementRate: 6.15,
          },
          socialStatsRefreshedAt: new Date(),
        },
      },
    },
    include: { creatorProfile: true },
  });

  const creatorUser5 = await prisma.user.create({
    data: {
      email: 'sneha.beauty@gmail.com',
      phone: '+919712556677',
      passwordHash: DEFAULT_PASSWORD_HASH,
      role: UserRole.CREATOR,
      isActive: true,
      isVerified: false,
      creatorProfile: {
        create: {
          displayName: 'Sneha Patel',
          bio: 'Dermatology enthusiast & skincare reviewer. Focus on clean beauty, affordable skincare routines, and makeup swatches.',
          avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
          category: 'Beauty & Skincare',
          subCategories: ['Clean Beauty', 'Skincare Routines', 'Drugstore Makeup'],
          location: 'Ahmedabad, Gujarat',
          languages: ['English', 'Hindi', 'Gujarati'],
          isVerified: false,
          verificationStatus: VerificationStatus.PENDING,
          verificationSubmittedAt: new Date(),
          hourlyRate: 3500,
          minProjectBudget: 15000,
          panNumber: 'ABCPS7890R',
          bankAccountNumber: '789123456789',
          bankIfsc: 'AXIS0000321',
          bankAccountHolderName: 'Sneha Patel',
          idDocumentUrl: 'https://s3.ap-south-1.amazonaws.com/cbp-kyc/sneha_pan.pdf',
          idDocumentType: 'PAN',
          kycStatus: VerificationStatus.PENDING,
          socialStats: {
            instagram: {
              username: 'glowbysneha',
              followers: 180000,
              following: 450,
              postsCount: 310,
              engagementRate: 5.8,
              avgLikes: 10500,
              avgComments: 720,
              topCities: ['Ahmedabad', 'Surat', 'Mumbai', 'Vadodara'],
            },
            totalReach: 180000,
            avgEngagementRate: 5.8,
          },
          socialStatsRefreshedAt: new Date(),
        },
      },
    },
    include: { creatorProfile: true },
  });

  // 2.3 Businesses
  const businessUser1 = await prisma.user.create({
    data: {
      email: 'partnerships@zestyorganics.in',
      phone: '+919820998877',
      passwordHash: DEFAULT_PASSWORD_HASH,
      role: UserRole.BUSINESS,
      isActive: true,
      isVerified: true,
      businessProfile: {
        create: {
          companyName: 'Zesty Organics Pvt Ltd',
          companyType: 'D2C Brand',
          industry: 'Food & Beverages',
          description: 'Fast-growing Indian D2C brand crafting 100% clean-label roasted snacks, trail mixes, and organic cold-pressed juices.',
          logoUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300',
          websiteUrl: 'https://zestyorganics.in',
          address: 'Plot 42, Marol Industrial Area, Andheri East',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400093',
          country: 'India',
          verificationStatus: VerificationStatus.APPROVED,
          verifiedAt: new Date('2025-01-10T09:00:00Z'),
          gstNumber: '27AABCZ1234F1Z5',
          gstCertificateUrl: 'https://s3.ap-south-1.amazonaws.com/cbp-kyc/zesty_gst.pdf',
          businessLicenseUrl: 'https://s3.ap-south-1.amazonaws.com/cbp-kyc/zesty_fssai.pdf',
          panNumber: 'AABCZ1234F',
          ownerName: 'Vikram Malhotra',
          ownerIdDocumentUrl: 'https://s3.ap-south-1.amazonaws.com/cbp-kyc/vikram_pan.pdf',
          allowDirectInquiries: true,
          showInSearch: true,
        },
      },
    },
    include: { businessProfile: true },
  });

  const businessUser2 = await prisma.user.create({
    data: {
      email: 'influencers@urbanthread.co',
      phone: '+919845887766',
      passwordHash: DEFAULT_PASSWORD_HASH,
      role: UserRole.BUSINESS,
      isActive: true,
      isVerified: true,
      businessProfile: {
        create: {
          companyName: 'UrbanThread Apparels Ltd',
          companyType: 'Fashion Brand',
          industry: 'Apparel & Lifestyle',
          description: 'Contemporary sustainable fashion brand using organic cotton and natural dyes for modern Indian youth.',
          logoUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300',
          websiteUrl: 'https://urbanthread.co',
          address: '77, 100ft Road, Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560038',
          country: 'India',
          verificationStatus: VerificationStatus.APPROVED,
          verifiedAt: new Date('2025-01-12T10:00:00Z'),
          gstNumber: '29AABCU5678G1Z2',
          gstCertificateUrl: 'https://s3.ap-south-1.amazonaws.com/cbp-kyc/urban_gst.pdf',
          businessLicenseUrl: 'https://s3.ap-south-1.amazonaws.com/cbp-kyc/urban_cin.pdf',
          panNumber: 'AABCU5678G',
          ownerName: 'Tara Sen',
          ownerIdDocumentUrl: 'https://s3.ap-south-1.amazonaws.com/cbp-kyc/tara_aadhaar.pdf',
          allowDirectInquiries: true,
          showInSearch: true,
        },
      },
    },
    include: { businessProfile: true },
  });

  const businessUser3 = await prisma.user.create({
    data: {
      email: 'collab@fitpulse.in',
      phone: '+919910887766',
      passwordHash: DEFAULT_PASSWORD_HASH,
      role: UserRole.BUSINESS,
      isActive: true,
      isVerified: true,
      businessProfile: {
        create: {
          companyName: 'FitPulse Nutrition India',
          companyType: 'Health & Wellness D2C',
          industry: 'Nutraceuticals',
          description: 'Premium sports nutrition supplements, whey isolates, plant proteins, and multivitamin gummies designed for Indian athletes.',
          logoUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300',
          websiteUrl: 'https://fitpulse.in',
          address: 'Tower B, Cyber City, DLF Phase 2',
          city: 'Gurugram',
          state: 'Haryana',
          pincode: '122002',
          country: 'India',
          verificationStatus: VerificationStatus.APPROVED,
          verifiedAt: new Date('2025-01-18T12:00:00Z'),
          gstNumber: '07AABCF9012H1Z8',
          gstCertificateUrl: 'https://s3.ap-south-1.amazonaws.com/cbp-kyc/fitpulse_gst.pdf',
          businessLicenseUrl: 'https://s3.ap-south-1.amazonaws.com/cbp-kyc/fitpulse_license.pdf',
          panNumber: 'AABCF9012H',
          ownerName: 'Aman Deep Singh',
          ownerIdDocumentUrl: 'https://s3.ap-south-1.amazonaws.com/cbp-kyc/aman_pan.pdf',
          allowDirectInquiries: true,
          showInSearch: true,
        },
      },
    },
    include: { businessProfile: true },
  });

  const businessUser4 = await prisma.user.create({
    data: {
      email: 'marketing@nexatech.co.in',
      phone: '+919440776655',
      passwordHash: DEFAULT_PASSWORD_HASH,
      role: UserRole.BUSINESS,
      isActive: true,
      isVerified: true,
      businessProfile: {
        create: {
          companyName: 'NexaTech Consumer Electronics',
          companyType: 'Hardware Startup',
          industry: 'Consumer Technology',
          description: 'Innovative audio gear, smart wearable gadgets, and ultra-fast GaN charging accessories.',
          logoUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300',
          websiteUrl: 'https://nexatech.co.in',
          address: 'HITEC City, Madhapur',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500081',
          country: 'India',
          verificationStatus: VerificationStatus.APPROVED,
          verifiedAt: new Date('2025-02-02T15:00:00Z'),
          gstNumber: '36AABCN3456J1Z1',
          gstCertificateUrl: 'https://s3.ap-south-1.amazonaws.com/cbp-kyc/nexatech_gst.pdf',
          businessLicenseUrl: 'https://s3.ap-south-1.amazonaws.com/cbp-kyc/nexatech_cin.pdf',
          panNumber: 'AABCN3456J',
          ownerName: 'Siddharth Rao',
          ownerIdDocumentUrl: 'https://s3.ap-south-1.amazonaws.com/cbp-kyc/siddharth_pan.pdf',
          allowDirectInquiries: true,
          showInSearch: true,
        },
      },
    },
    include: { businessProfile: true },
  });

  // 3. Seed Social Connections for Creators
  console.log('📱 Seeding Social Connections...');
  await prisma.socialConnection.createMany({
    data: [
      {
        creatorId: creatorUser1.creatorProfile!.id,
        platform: 'INSTAGRAM',
        platformUserId: 'ig_ananya_style_101',
        username: 'ananya.style',
        accessToken: 'mock_ig_token_ananya',
        followerCount: 450000,
        followingCount: 620,
        engagementRate: 4.8,
        avgViews: 85000,
        audienceTopCities: ['Mumbai', 'Delhi NCR', 'Bengaluru', 'Pune'],
        lastSyncedAt: new Date(),
        isActive: true,
      },
      {
        creatorId: creatorUser1.creatorProfile!.id,
        platform: 'YOUTUBE',
        platformUserId: 'yt_style_with_ananya_102',
        username: 'Style With Ananya',
        accessToken: 'mock_yt_token_ananya',
        followerCount: 120000,
        followingCount: 45,
        engagementRate: 5.2,
        avgViews: 45000,
        audienceTopCities: ['Mumbai', 'Delhi NCR', 'Bengaluru', 'Ahmedabad'],
        lastSyncedAt: new Date(),
        isActive: true,
      },
      {
        creatorId: creatorUser2.creatorProfile!.id,
        platform: 'YOUTUBE',
        platformUserId: 'yt_rohan_tech_lab_201',
        username: 'Rohan Tech Lab',
        accessToken: 'mock_yt_token_rohan',
        followerCount: 850000,
        followingCount: 80,
        engagementRate: 6.5,
        avgViews: 120000,
        audienceTopCities: ['Bengaluru', 'Hyderabad', 'Delhi NCR', 'Chennai'],
        lastSyncedAt: new Date(),
        isActive: true,
      },
      {
        creatorId: creatorUser2.creatorProfile!.id,
        platform: 'INSTAGRAM',
        platformUserId: 'ig_rohan_tech_202',
        username: 'rohan_tech_in',
        accessToken: 'mock_ig_token_rohan',
        followerCount: 210000,
        followingCount: 410,
        engagementRate: 4.1,
        avgViews: 65000,
        audienceTopCities: ['Bengaluru', 'Hyderabad', 'Delhi NCR', 'Mumbai'],
        lastSyncedAt: new Date(),
        isActive: true,
      },
      {
        creatorId: creatorUser3.creatorProfile!.id,
        platform: 'INSTAGRAM',
        platformUserId: 'ig_priya_cooks_301',
        username: 'priyacooks',
        accessToken: 'mock_ig_token_priya',
        followerCount: 320000,
        followingCount: 380,
        engagementRate: 5.4,
        avgViews: 95000,
        audienceTopCities: ['Chennai', 'Bengaluru', 'Kochi', 'Hyderabad'],
        lastSyncedAt: new Date(),
        isActive: true,
      },
      {
        creatorId: creatorUser4.creatorProfile!.id,
        platform: 'INSTAGRAM',
        platformUserId: 'ig_fit_kabir_401',
        username: 'fitwithkabir',
        accessToken: 'mock_ig_token_kabir',
        followerCount: 550000,
        followingCount: 290,
        engagementRate: 6.2,
        avgViews: 140000,
        audienceTopCities: ['Delhi NCR', 'Chandigarh', 'Mumbai', 'Jaipur'],
        lastSyncedAt: new Date(),
        isActive: true,
      },
    ],
  });

  // 4. Seed Services / Rate Cards for Creators
  console.log('💼 Seeding Creator Services...');
  await prisma.service.createMany({
    data: [
      {
        creatorId: creatorUser1.creatorProfile!.id,
        title: 'Dedicated Instagram Reel (60s with styling tips)',
        description: 'High-production 4K reel highlighting fashion brand styling with 3 look transitions and pinned comment.',
        deliverableTypes: [DeliverableType.INSTAGRAM_REEL],
        price: 35000,
        currency: 'INR',
        isActive: true,
      },
      {
        creatorId: creatorUser1.creatorProfile!.id,
        title: 'Instagram Story Set (3 Stories with direct link sticker)',
        description: 'Story unboxing & try-on haul with brand discount code and link swipe-up sticker.',
        deliverableTypes: [DeliverableType.INSTAGRAM_STORY],
        price: 15000,
        currency: 'INR',
        isActive: true,
      },
      {
        creatorId: creatorUser2.creatorProfile!.id,
        title: 'Dedicated YouTube Product Deep-Dive & Review (8-10 mins)',
        description: 'In-depth benchmark testing, camera/audio sample comparison, and pros/cons summary.',
        deliverableTypes: [DeliverableType.YOUTUBE_VIDEO],
        price: 65000,
        currency: 'INR',
        isActive: true,
      },
      {
        creatorId: creatorUser2.creatorProfile!.id,
        title: 'Integrated YouTube Segment (60-90s mid-roll shoutout)',
        description: 'Seamless contextual integration into weekly tech review video with description links.',
        deliverableTypes: [DeliverableType.YOUTUBE_VIDEO],
        price: 30000,
        currency: 'INR',
        isActive: true,
      },
      {
        creatorId: creatorUser3.creatorProfile!.id,
        title: 'Recipe Creation Reel featuring Brand Product',
        description: 'Original recipe development, step-by-step cooking reel, ingredient highlight, and recipe card in caption.',
        deliverableTypes: [DeliverableType.INSTAGRAM_REEL],
        price: 28000,
        currency: 'INR',
        isActive: true,
      },
      {
        creatorId: creatorUser4.creatorProfile!.id,
        title: 'Fitness Transformation Challenge Reel & Story',
        description: 'Product usage during high-intensity workout with genuine fitness trainer testimonial.',
        deliverableTypes: [DeliverableType.INSTAGRAM_REEL, DeliverableType.INSTAGRAM_STORY],
        price: 45000,
        currency: 'INR',
        isActive: true,
      },
    ],
  });

  // 5. Seed Portfolio Items
  console.log('🎨 Seeding Creator Portfolios...');
  await prisma.portfolioItem.createMany({
    data: [
      {
        creatorId: creatorUser1.creatorProfile!.id,
        title: 'Diwali Festive Glam Campaign with FabIndia',
        description: 'Generated 1.2M views and 48K likes showcasing handcrafted silk sarees.',
        mediaUrls: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600'],
        tags: ['Festive', 'EthnicWear', 'Handloom'],
        deliverableType: DeliverableType.INSTAGRAM_REEL,
      },
      {
        creatorId: creatorUser2.creatorProfile!.id,
        title: 'Nothing Phone 2 In-depth Battery & Performance Review',
        description: '350K organic views with 15K comments and high viewer retention.',
        mediaUrls: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600'],
        tags: ['Smartphones', 'Unboxing', 'Benchmarks'],
        deliverableType: DeliverableType.YOUTUBE_VIDEO,
      },
      {
        creatorId: creatorUser3.creatorProfile!.id,
        title: 'Millet Dosa & Organic Chutney Reel with ConsciousFood',
        description: 'Over 800K views promoting healthy superfoods for breakfast.',
        mediaUrls: ['https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600'],
        tags: ['Millets', 'HealthyFood', 'SouthIndian'],
        deliverableType: DeliverableType.INSTAGRAM_REEL,
      },
      {
        creatorId: creatorUser4.creatorProfile!.id,
        title: '100-Day Calisthenics Progression with MuscleBlaze',
        description: 'Inspiring journey reel with 2.1M views and viral audio track.',
        mediaUrls: ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600'],
        tags: ['Calisthenics', 'MuscleBlaze', 'Transformation'],
        deliverableType: DeliverableType.INSTAGRAM_REEL,
      },
    ],
  });

  // 6. Seed Campaigns
  console.log('📢 Seeding Campaigns...');
  const campaign1 = await prisma.campaign.create({
    data: {
      businessId: businessUser1.businessProfile!.id,
      title: 'Summer Festive Clean-Snack Launch 2026',
      description: 'Promote our newly launched roasted peri-peri makhana and vacuum-fried beetroot chips for healthy snacking.',
      status: CampaignStatus.ACTIVE,
      budgetType: 'range',
      budgetMin: 25000,
      budgetMax: 50000,
      budgetCurrency: 'INR',
      deliverableTypes: [DeliverableType.INSTAGRAM_REEL, DeliverableType.INSTAGRAM_STORY],
      deliverableDetails: [
        {
          type: DeliverableType.INSTAGRAM_REEL,
          count: 1,
          durationSeconds: 60,
          description: 'Fun snacking reel with taste test reaction and nutritional benefits callout.',
        },
        {
          type: DeliverableType.INSTAGRAM_STORY,
          count: 2,
          description: 'Product unpackaging with special 15% discount code link sticker.',
        },
      ],
      creatorCount: 3,
      creatorCategories: ['Food & Culinary', 'Fitness & Health', 'Lifestyle'],
      requiredPlatforms: ['INSTAGRAM'],
      requiredLocation: 'Pan India (Metro preferred)',
      minFollowers: 100000,
      maxFollowers: 1000000,
      minEngagementRate: 3.5,
      startDate: new Date('2026-03-01T00:00:00Z'),
      endDate: new Date('2026-04-15T00:00:00Z'),
      applicationDeadline: new Date('2026-03-20T00:00:00Z'),
      autoCloseAfterHire: false,
      allowNegotiation: true,
      maxRevisions: 2,
      autoApproveAfterDays: 7,
    },
  });

  const campaign2 = await prisma.campaign.create({
    data: {
      businessId: businessUser4.businessProfile!.id,
      title: 'NexaTech SoundPro ANC Wireless Earbuds Launch',
      description: 'Comprehensive review and unboxing highlighting 45dB Active Noise Cancellation and 60hr battery life.',
      status: CampaignStatus.ACTIVE,
      budgetType: 'fixed',
      budgetMin: 40000,
      budgetMax: 40000,
      budgetCurrency: 'INR',
      deliverableTypes: [DeliverableType.YOUTUBE_VIDEO, DeliverableType.INSTAGRAM_REEL],
      deliverableDetails: [
        {
          type: DeliverableType.YOUTUBE_VIDEO,
          count: 1,
          description: 'Dedicated or 3-minute integrated segment testing ANC in noisy cafe / metro.',
        },
      ],
      creatorCount: 2,
      creatorCategories: ['Tech & Gadgets', 'Gaming & Esports'],
      requiredPlatforms: ['YOUTUBE', 'INSTAGRAM'],
      requiredLocation: 'Bengaluru / Hyderabad / Mumbai',
      minFollowers: 200000,
      minEngagementRate: 4.0,
      startDate: new Date('2026-03-10T00:00:00Z'),
      endDate: new Date('2026-04-30T00:00:00Z'),
      applicationDeadline: new Date('2026-03-25T00:00:00Z'),
      allowNegotiation: true,
      maxRevisions: 2,
      autoApproveAfterDays: 5,
    },
  });

  const campaign3 = await prisma.campaign.create({
    data: {
      businessId: businessUser2.businessProfile!.id,
      title: 'Monsoon Organic Cotton Kurti & Co-ord Collection',
      description: 'Showcase comfortable everyday styling and breathable fabrics for working women and college students.',
      status: CampaignStatus.COMPLETED,
      budgetType: 'fixed',
      budgetMin: 30000,
      budgetMax: 30000,
      budgetCurrency: 'INR',
      deliverableTypes: [DeliverableType.INSTAGRAM_REEL],
      deliverableDetails: [
        {
          type: DeliverableType.INSTAGRAM_REEL,
          count: 1,
          description: '3 everyday looks styling video with upbeat audio.',
        },
      ],
      creatorCount: 1,
      creatorCategories: ['Fashion & Style'],
      requiredPlatforms: ['INSTAGRAM'],
      minFollowers: 300000,
      minEngagementRate: 4.5,
      startDate: new Date('2025-08-01T00:00:00Z'),
      endDate: new Date('2025-09-15T00:00:00Z'),
      applicationDeadline: new Date('2025-08-15T00:00:00Z'),
      allowNegotiation: false,
      maxRevisions: 2,
      autoApproveAfterDays: 7,
    },
  });

  const campaign4 = await prisma.campaign.create({
    data: {
      businessId: businessUser3.businessProfile!.id,
      title: 'FitPulse 100% Plant Protein 30-Day Fitness Challenge',
      description: 'Authentic fitness creators sharing daily post-workout shake recipes and digestion benefits.',
      status: CampaignStatus.ACTIVE,
      budgetType: 'range',
      budgetMin: 35000,
      budgetMax: 60000,
      budgetCurrency: 'INR',
      deliverableTypes: [DeliverableType.INSTAGRAM_REEL, DeliverableType.INSTAGRAM_STORY],
      deliverableDetails: [
        {
          type: DeliverableType.INSTAGRAM_REEL,
          count: 2,
          description: 'Week 1 kickoff reel and Week 4 results & review reel.',
        },
      ],
      creatorCount: 2,
      creatorCategories: ['Fitness & Health'],
      requiredPlatforms: ['INSTAGRAM'],
      minFollowers: 250000,
      minEngagementRate: 5.0,
      startDate: new Date('2026-03-01T00:00:00Z'),
      endDate: new Date('2026-04-30T00:00:00Z'),
      applicationDeadline: new Date('2026-03-20T00:00:00Z'),
      allowNegotiation: true,
      maxRevisions: 2,
      autoApproveAfterDays: 7,
    },
  });

  // 7. Seed Collaborations covering all state machine stages
  console.log('🤝 Seeding Collaborations across state machine stages...');

  // Collab 1: COMPLETED & PAID (Ananya Sharma + UrbanThread)
  const collab1 = await prisma.collaboration.create({
    data: {
      campaignId: campaign3.id,
      creatorId: creatorUser1.creatorProfile!.id,
      businessId: businessUser2.businessProfile!.id,
      bidAmount: 30000,
      bidMessage: 'Would love to style your organic cotton co-ords for my office & weekend lookbook!',
      agreedAmount: 30000,
      status: CollaborationStatus.APPROVED,
      revisionCount: 0,
      deliverableLinks: [
        {
          type: DeliverableType.INSTAGRAM_REEL,
          title: '3 Ways to Style UrbanThread Organic Co-ords',
          liveUrl: 'https://instagram.com/reel/C1UrbanThreadSample',
          proofUrl: 'https://s3.ap-south-1.amazonaws.com/cbp-proofs/ananya_urbanthread_analytics.png',
          submittedAt: '2025-08-25T14:30:00Z',
        },
      ],
      deliverableNotes: 'Reel is live with high engagement. Brand tag and discount code pinned.',
      appliedAt: new Date('2025-08-05T10:00:00Z'),
      acceptedAt: new Date('2025-08-07T11:00:00Z'),
      startedAt: new Date('2025-08-08T12:00:00Z'),
      deliveredAt: new Date('2025-08-25T14:30:00Z'),
      approvedAt: new Date('2025-08-27T16:00:00Z'),
      paidAt: new Date('2025-08-28T10:00:00Z'),
    },
  });

  // Collab 2: IN_PROGRESS with Escrow Held (Ananya Sharma + Zesty Organics)
  const collab2 = await prisma.collaboration.create({
    data: {
      campaignId: campaign1.id,
      creatorId: creatorUser1.creatorProfile!.id,
      businessId: businessUser1.businessProfile!.id,
      bidAmount: 38000,
      bidMessage: 'I can create a high-aesthetic evening snack routine reel and 2 stories.',
      counterOfferAmount: 35000,
      counterOfferMessage: 'Can we settle on ₹35,000 for 1 Reel + 2 Stories?',
      counterOfferBy: 'business',
      agreedAmount: 35000,
      status: CollaborationStatus.IN_PROGRESS,
      revisionCount: 0,
      appliedAt: new Date('2026-03-02T10:00:00Z'),
      offeredAt: new Date('2026-03-03T11:00:00Z'),
      acceptedAt: new Date('2026-03-04T12:00:00Z'),
      startedAt: new Date('2026-03-05T15:00:00Z'),
    },
  });

  // Collab 3: DELIVERABLE_SUBMITTED awaiting business review (Kabir Varma + FitPulse)
  const collab3 = await prisma.collaboration.create({
    data: {
      campaignId: campaign4.id,
      creatorId: creatorUser4.creatorProfile!.id,
      businessId: businessUser3.businessProfile!.id,
      bidAmount: 50000,
      bidMessage: 'I will do 2 dedicated workout reels demonstrating muscle recovery with FitPulse Plant Protein.',
      agreedAmount: 50000,
      status: CollaborationStatus.DELIVERABLE_SUBMITTED,
      revisionCount: 0,
      deliverableLinks: [
        {
          type: DeliverableType.INSTAGRAM_REEL,
          title: 'Post-Workout Recovery Shake Reel',
          previewUrl: 'https://s3.ap-south-1.amazonaws.com/cbp-previews/kabir_fitpulse_reel1.mp4',
          submittedAt: '2026-03-12T18:00:00Z',
          notes: 'Please review before I publish live on Instagram.',
        },
      ],
      deliverableNotes: 'Draft video uploaded for brand compliance check.',
      appliedAt: new Date('2026-03-02T11:00:00Z'),
      acceptedAt: new Date('2026-03-04T14:00:00Z'),
      startedAt: new Date('2026-03-06T09:00:00Z'),
      deliveredAt: new Date('2026-03-12T18:00:00Z'),
    },
  });

  // Collab 4: REVISION_REQUESTED (Sneha Patel + Zesty Organics)
  const collab4 = await prisma.collaboration.create({
    data: {
      campaignId: campaign1.id,
      creatorId: creatorUser5.creatorProfile!.id,
      businessId: businessUser1.businessProfile!.id,
      bidAmount: 25000,
      bidMessage: 'Healthy snack review for skincare enthusiasts!',
      agreedAmount: 25000,
      status: CollaborationStatus.REVISION_REQUESTED,
      revisionCount: 1,
      deliverableLinks: [
        {
          type: DeliverableType.INSTAGRAM_REEL,
          title: 'Snack Draft v1',
          previewUrl: 'https://s3.ap-south-1.amazonaws.com/cbp-previews/sneha_zesty_v1.mp4',
          submittedAt: '2026-03-10T15:00:00Z',
        },
      ],
      revisionRequest: {
        requestedBy: 'business',
        requestedAt: '2026-03-11T11:00:00Z',
        feedback: 'Please ensure the nutritional facts label is in focus for at least 3 seconds.',
        specificChangesRequired: ['Zoom in on roasted non-fried badge', 'Adjust background music volume'],
        deadline: '2026-03-16T18:00:00Z',
      },
      appliedAt: new Date('2026-03-02T12:00:00Z'),
      acceptedAt: new Date('2026-03-05T10:00:00Z'),
      startedAt: new Date('2026-03-06T11:00:00Z'),
      deliveredAt: new Date('2026-03-10T15:00:00Z'),
      revisionRequestedBy: 'businessUser1',
      revisionDeadline: new Date('2026-03-16T18:00:00Z'),
    },
  });

  // Collab 5: NEGOTIATING state (Rohan Mehta + NexaTech)
  const collab5 = await prisma.collaboration.create({
    data: {
      campaignId: campaign2.id,
      creatorId: creatorUser2.creatorProfile!.id,
      businessId: businessUser4.businessProfile!.id,
      bidAmount: 55000,
      bidMessage: 'My audience is 850k hardcore tech enthusiasts. ₹55,000 for dedicated 10-min unboxing + latency testing.',
      counterOfferAmount: 48000,
      counterOfferMessage: 'We love your work Rohan. Can we do ₹48,000 all inclusive?',
      counterOfferBy: 'business',
      agreedAmount: 48000,
      status: CollaborationStatus.NEGOTIATING,
      appliedAt: new Date('2026-03-11T10:00:00Z'),
      offeredAt: new Date('2026-03-12T14:00:00Z'),
    },
  });

  // Collab 6: APPLIED / PENDING bid (Priya Nair + Zesty Organics)
  const collab6 = await prisma.collaboration.create({
    data: {
      campaignId: campaign1.id,
      creatorId: creatorUser3.creatorProfile!.id,
      businessId: businessUser1.businessProfile!.id,
      bidAmount: 28000,
      bidMessage: 'Can prepare a chaat recipe using your peri-peri roasted makhana as a crunch element!',
      agreedAmount: 28000,
      status: CollaborationStatus.APPLIED,
      appliedAt: new Date('2026-03-12T16:00:00Z'),
    },
  });

  // Collab 7: DISPUTED (Rohan Mehta + NexaTech previous campaign)
  const collab7 = await prisma.collaboration.create({
    data: {
      campaignId: campaign2.id,
      creatorId: creatorUser2.creatorProfile!.id,
      businessId: businessUser4.businessProfile!.id,
      bidAmount: 40000,
      agreedAmount: 40000,
      status: CollaborationStatus.DISPUTED,
      appliedAt: new Date('2026-02-10T10:00:00Z'),
      acceptedAt: new Date('2026-02-12T11:00:00Z'),
      startedAt: new Date('2026-02-13T12:00:00Z'),
      deliveredAt: new Date('2026-02-28T18:00:00Z'),
    },
  });

  // 8. Seed Payments & Escrow Transactions
  console.log('💳 Seeding Payments & Escrow Transactions...');

  // Payment 1 for Collab 1 (Released)
  const payment1 = await prisma.payment.create({
    data: {
      collaborationId: collab1.id,
      businessId: businessUser2.businessProfile!.id,
      creatorId: creatorUser1.creatorProfile!.id,
      grossAmount: 30000,
      platformFeeAmount: 3000,
      platformFeePercent: 10.0,
      netAmountToCreator: 27000,
      currency: 'INR',
      razorpayOrderId: 'order_N9zSample001',
      razorpayPaymentId: 'pay_N9zSample001',
      razorpayReleaseId: 'pout_N9zSample001',
      escrowStatus: PaymentStatus.RELEASED,
      releasedAt: new Date('2025-08-28T10:00:00Z'),
      platformFee: {
        create: {
          feeType: 'COLLABORATION_COMMISSION',
          amount: 3000,
          percentage: 10.0,
          netRevenue: 3000,
          settlementStatus: 'SETTLED',
          settledAt: new Date('2025-08-28T10:00:00Z'),
        },
      },
      escrowTransactions: {
        create: [
          {
            type: 'FUND',
            amount: 30000,
            gatewayEventId: 'evt_fund_001',
            status: PaymentStatus.HELD,
            createdAt: new Date('2025-08-08T12:00:00Z'),
          },
          {
            type: 'RELEASE',
            amount: 27000,
            gatewayEventId: 'evt_release_001',
            status: PaymentStatus.RELEASED,
            createdAt: new Date('2025-08-28T10:00:00Z'),
          },
          {
            type: 'FEE_DEDUCTION',
            amount: 3000,
            gatewayEventId: 'evt_fee_001',
            status: PaymentStatus.RELEASED,
            createdAt: new Date('2025-08-28T10:00:00Z'),
          },
        ],
      },
    },
  });

  // Payment 2 for Collab 2 (Held in Escrow)
  const payment2 = await prisma.payment.create({
    data: {
      collaborationId: collab2.id,
      businessId: businessUser1.businessProfile!.id,
      creatorId: creatorUser1.creatorProfile!.id,
      grossAmount: 35000,
      platformFeeAmount: 3500,
      platformFeePercent: 10.0,
      netAmountToCreator: 31500,
      currency: 'INR',
      razorpayOrderId: 'order_N9zSample002',
      razorpayPaymentId: 'pay_N9zSample002',
      escrowStatus: PaymentStatus.HELD,
      platformFee: {
        create: {
          feeType: 'COLLABORATION_COMMISSION',
          amount: 3500,
          percentage: 10.0,
          netRevenue: 3500,
          settlementStatus: 'PENDING',
        },
      },
      escrowTransactions: {
        create: [
          {
            type: 'FUND',
            amount: 35000,
            gatewayEventId: 'evt_fund_002',
            status: PaymentStatus.HELD,
            createdAt: new Date('2026-03-05T15:00:00Z'),
          },
        ],
      },
    },
  });

  // Payment 3 for Collab 3 (Held in Escrow)
  const payment3 = await prisma.payment.create({
    data: {
      collaborationId: collab3.id,
      businessId: businessUser3.businessProfile!.id,
      creatorId: creatorUser4.creatorProfile!.id,
      grossAmount: 50000,
      platformFeeAmount: 5000,
      platformFeePercent: 10.0,
      netAmountToCreator: 45000,
      currency: 'INR',
      razorpayOrderId: 'order_N9zSample003',
      razorpayPaymentId: 'pay_N9zSample003',
      escrowStatus: PaymentStatus.HELD,
      platformFee: {
        create: {
          feeType: 'COLLABORATION_COMMISSION',
          amount: 5000,
          percentage: 10.0,
          netRevenue: 5000,
          settlementStatus: 'PENDING',
        },
      },
      escrowTransactions: {
        create: [
          {
            type: 'FUND',
            amount: 50000,
            gatewayEventId: 'evt_fund_003',
            status: PaymentStatus.HELD,
            createdAt: new Date('2026-03-06T09:00:00Z'),
          },
        ],
      },
    },
  });

  // Payment 7 for Collab 7 (Disputed / Held)
  const payment7 = await prisma.payment.create({
    data: {
      collaborationId: collab7.id,
      businessId: businessUser4.businessProfile!.id,
      creatorId: creatorUser2.creatorProfile!.id,
      grossAmount: 40000,
      platformFeeAmount: 4000,
      platformFeePercent: 10.0,
      netAmountToCreator: 36000,
      currency: 'INR',
      razorpayOrderId: 'order_N9zSample007',
      razorpayPaymentId: 'pay_N9zSample007',
      escrowStatus: PaymentStatus.HELD,
      escrowTransactions: {
        create: [
          {
            type: 'FUND',
            amount: 40000,
            gatewayEventId: 'evt_fund_007',
            status: PaymentStatus.HELD,
            createdAt: new Date('2026-02-13T12:00:00Z'),
          },
        ],
      },
    },
  });

  // 9. Seed Chat Threads & Messages
  console.log('💬 Seeding Chat Threads & Messages...');
  const chatThread1 = await prisma.chatThread.create({
    data: {
      creatorId: creatorUser1.creatorProfile!.id,
      businessId: businessUser1.businessProfile!.id,
      campaignId: campaign1.id,
      isActive: true,
      messages: {
        create: [
          {
            senderId: creatorUser1.id,
            content: 'Hi Vikram! Super excited about the Summer Festive Clean-Snack launch. I reviewed the brief.',
            messageType: 'text',
            createdAt: new Date('2026-03-02T10:05:00Z'),
          },
          {
            senderId: businessUser1.id,
            content: 'Hello Ananya! Glad to have you on board. We have sent the samples via Bluedart. Expected delivery tomorrow.',
            messageType: 'text',
            createdAt: new Date('2026-03-02T10:30:00Z'),
          },
          {
            senderId: creatorUser1.id,
            content: 'Received the pack! The peri-peri makhana tastes fantastic. Scripting the reel concept today.',
            messageType: 'text',
            createdAt: new Date('2026-03-03T16:00:00Z'),
          },
          {
            senderId: businessUser1.id,
            content: 'Sounds awesome! Please make sure to highlight the zero-palm-oil message.',
            messageType: 'text',
            createdAt: new Date('2026-03-03T16:45:00Z'),
          },
        ],
      },
    },
  });

  const chatThread2 = await prisma.chatThread.create({
    data: {
      creatorId: creatorUser2.creatorProfile!.id,
      businessId: businessUser4.businessProfile!.id,
      campaignId: campaign2.id,
      isActive: true,
      messages: {
        create: [
          {
            senderId: creatorUser2.id,
            content: 'Hey Siddharth, I have tested the SoundPro earbuds in the metro. The ANC mic performance is very solid.',
            messageType: 'text',
            createdAt: new Date('2026-03-11T10:15:00Z'),
          },
          {
            senderId: businessUser4.id,
            content: 'Great to hear Rohan! Looking forward to your benchmark comparisons with the Sony XM5.',
            messageType: 'text',
            createdAt: new Date('2026-03-11T11:00:00Z'),
          },
        ],
      },
    },
  });

  // 10. Seed Reviews
  console.log('⭐ Seeding Reviews...');
  // Business reviews creator for Collab 1
  await prisma.review.create({
    data: {
      collaborationId: collab1.id,
      reviewerId: businessUser2.id,
      revieweeId: creatorUser1.id,
      type: ReviewType.BUSINESS_TO_CREATOR,
      overallRating: 5,
      criteriaRatings: {
        qualityOfWork: 5,
        communication: 5,
        adherenceToDeadlines: 5,
        professionalism: 5,
      },
      comment: 'Ananya was exceptional to work with! The reel quality was top-notch and drove immense traffic to our website.',
      isPublic: true,
      businessResponse: 'Thank you Tara! Loved working with UrbanThread team.',
    },
  });

  // Creator reviews business for Collab 1
  await prisma.review.create({
    data: {
      collaborationId: collab1.id,
      reviewerId: creatorUser1.id,
      revieweeId: businessUser2.id,
      type: ReviewType.CREATOR_TO_BUSINESS,
      overallRating: 5,
      criteriaRatings: {
        clarityOfBrief: 5,
        paymentPromptness: 5,
        communication: 5,
      },
      comment: 'Clear creative brief, fast approvals, and prompt escrow payment release. Highly recommend UrbanThread!',
      isPublic: true,
    },
  });

  // 11. Seed Disputes
  console.log('⚖️ Seeding Disputes...');
  await prisma.dispute.create({
    data: {
      collaborationId: collab7.id,
      campaignId: campaign2.id,
      initiatedBy: businessUser4.id,
      assignedTo: adminUser2.id,
      reason: 'Creator delivered video 10 days after agreed campaign launch deadline causing loss of festive window.',
      category: 'MISSED_DEADLINE',
      status: DisputeStatus.UNDER_REVIEW,
      businessEvidence: [
        {
          submittedBy: businessUser4.id,
          description: 'Chat screenshots confirming promised delivery date of Feb 18.',
          mediaUrls: ['https://s3.ap-south-1.amazonaws.com/cbp-disputes/evidence_chat_deadline.png'],
        },
      ],
      creatorEvidence: [
        {
          submittedBy: creatorUser2.id,
          description: 'Courier delivery of testing unit was delayed by 6 days by business vendor.',
          mediaUrls: ['https://s3.ap-south-1.amazonaws.com/cbp-disputes/evidence_courier_slip.png'],
        },
      ],
      resolutionNotes: 'Under review by moderator Meera. Investigating courier tracking timeline.',
    },
  });

  // 12. Seed Reports
  console.log('🚨 Seeding Moderation Reports...');
  await prisma.report.create({
    data: {
      reporterId: businessUser1.id,
      chatThreadId: chatThread1.id,
      reason: ChatReportReason.OTHER,
      description: 'Test report checking moderation queue functionality.',
      status: 'RESOLVED',
      resolvedAt: new Date(),
    },
  });

  // 13. Seed Notifications
  console.log('🔔 Seeding Notifications...');
  await prisma.notification.createMany({
    data: [
      {
        userId: creatorUser1.id,
        type: 'PAYMENT_RELEASED',
        title: 'Payout of ₹27,000 Transferred',
        body: 'Your payment for UrbanThread Monsoon Campaign has been released to your bank account.',
        channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH, NotificationChannel.EMAIL],
        readAt: new Date(),
        data: { collaborationId: collab1.id, amount: 27000 },
      },
      {
        userId: creatorUser1.id,
        type: 'PAYMENT_HELD',
        title: 'Escrow Funded for Zesty Organics',
        body: '₹35,000 has been secured in platform escrow. You can now begin work on the deliverables.',
        channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
        readAt: null,
        data: { collaborationId: collab2.id },
      },
      {
        userId: businessUser3.id,
        type: 'DELIVERABLE_SUBMITTED',
        title: 'Kabir Varma Submitted Deliverables',
        body: 'New draft video submitted for FitPulse Plant Protein campaign. Please review.',
        channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        readAt: null,
        data: { collaborationId: collab3.id },
      },
      {
        userId: creatorUser5.id,
        type: 'REVISION_REQUESTED',
        title: 'Revision Requested on Zesty Organics Collab',
        body: 'Zesty Organics requested edits on your draft reel. Check feedback notes.',
        channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
        readAt: null,
        data: { collaborationId: collab4.id },
      },
      {
        userId: adminUser1.id,
        type: 'KYC_SUBMITTED',
        title: 'New KYC Verification Request',
        body: 'Creator Sneha Patel submitted PAN card for identity verification.',
        channels: [NotificationChannel.IN_APP],
        readAt: null,
        data: { creatorId: creatorUser5.creatorProfile!.id },
      },
    ],
  });

  console.log('✅ Database seed completed successfully with all 16 models populated!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
