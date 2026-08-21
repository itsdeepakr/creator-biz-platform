class CampaignModel {
  final String id;
  final String title;
  final String description;
  final String brandId;
  final String brandName;
  final String? brandLogo;
  final String? brandWebsite;
  final String category;
  final double budgetMin;
  final double budgetMax;
  final List<String> deliverables;
  final List<String> requirements;
  final String? guidelines;
  final DateTime deadline;
  final String status; // 'DRAFT', 'PUBLISHED', 'ACTIVE', 'COMPLETED'
  final int applicantCount;
  final bool hasApplied;
  final String? userBidStatus; // 'PENDING', 'ACCEPTED', 'REJECTED', 'COUNTERED'
  final DateTime createdAt;

  CampaignModel({
    required this.id,
    required this.title,
    required this.description,
    required this.brandId,
    required this.brandName,
    this.brandLogo,
    this.brandWebsite,
    required this.category,
    required this.budgetMin,
    required this.budgetMax,
    this.deliverables = const [],
    this.requirements = const [],
    this.guidelines,
    required this.deadline,
    this.status = 'PUBLISHED',
    this.applicantCount = 0,
    this.hasApplied = false,
    this.userBidStatus,
    required this.createdAt,
  });

  factory CampaignModel.fromJson(Map<String, dynamic> json) {
    return CampaignModel(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      description: json['description'] as String? ?? '',
      brandId: json['brandId'] as String? ?? json['businessId'] as String? ?? '',
      brandName: json['brandName'] as String? ??
          (json['business'] as Map<String, dynamic>?)?['companyName'] as String? ??
          'Brand',
      brandLogo: json['brandLogo'] as String? ??
          (json['business'] as Map<String, dynamic>?)?['logoUrl'] as String?,
      brandWebsite: json['brandWebsite'] as String? ??
          (json['business'] as Map<String, dynamic>?)?['website'] as String?,
      category: json['category'] as String? ?? 'General',
      budgetMin: (json['budgetMin'] as num?)?.toDouble() ?? 0.0,
      budgetMax: (json['budgetMax'] as num?)?.toDouble() ??
          (json['budget'] as num?)?.toDouble() ??
          0.0,
      deliverables: (json['deliverables'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      requirements: (json['requirements'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      guidelines: json['guidelines'] as String?,
      deadline: json['deadline'] != null
          ? DateTime.tryParse(json['deadline'] as String) ??
              DateTime.now().add(const Duration(days: 14))
          : DateTime.now().add(const Duration(days: 14)),
      status: json['status'] as String? ?? 'PUBLISHED',
      applicantCount: (json['applicantCount'] as num?)?.toInt() ??
          (json['bidsCount'] as num?)?.toInt() ??
          0,
      hasApplied: json['hasApplied'] as bool? ?? false,
      userBidStatus: json['userBidStatus'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'] as String) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'brandId': brandId,
      'brandName': brandName,
      'brandLogo': brandLogo,
      'brandWebsite': brandWebsite,
      'category': category,
      'budgetMin': budgetMin,
      'budgetMax': budgetMax,
      'deliverables': deliverables,
      'requirements': requirements,
      'guidelines': guidelines,
      'deadline': deadline.toIso8601String(),
      'status': status,
      'applicantCount': applicantCount,
      'hasApplied': hasApplied,
      'userBidStatus': userBidStatus,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
