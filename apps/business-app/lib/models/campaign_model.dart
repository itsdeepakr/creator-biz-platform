class CampaignModel {
  final String id;
  final String title;
  final String description;
  final String businessId;
  final String companyName;
  final String? brandLogo;
  final String category;
  final double budgetMin;
  final double budgetMax;
  final List<String> deliverables;
  final List<String> requirements;
  final String? guidelines;
  final DateTime deadline;
  final String status; // 'DRAFT', 'PUBLISHED', 'ACTIVE', 'COMPLETED', 'PAUSED'
  final int bidsCount;
  final int activeDealsCount;
  final DateTime createdAt;

  CampaignModel({
    required this.id,
    required this.title,
    required this.description,
    required this.businessId,
    required this.companyName,
    this.brandLogo,
    required this.category,
    required this.budgetMin,
    required this.budgetMax,
    this.deliverables = const [],
    this.requirements = const [],
    this.guidelines,
    required this.deadline,
    this.status = 'PUBLISHED',
    this.bidsCount = 0,
    this.activeDealsCount = 0,
    required this.createdAt,
  });

  factory CampaignModel.fromJson(Map<String, dynamic> json) {
    return CampaignModel(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      description: json['description'] as String? ?? '',
      businessId: json['businessId'] as String? ?? json['brandId'] as String? ?? '',
      companyName: json['companyName'] as String? ??
          (json['business'] as Map<String, dynamic>?)?['companyName'] as String? ??
          'My Brand',
      brandLogo: json['brandLogo'] as String? ??
          (json['business'] as Map<String, dynamic>?)?['logoUrl'] as String?,
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
      bidsCount: (json['bidsCount'] as num?)?.toInt() ??
          (json['applicantCount'] as num?)?.toInt() ??
          0,
      activeDealsCount: (json['activeDealsCount'] as num?)?.toInt() ?? 0,
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
      'businessId': businessId,
      'companyName': companyName,
      'brandLogo': brandLogo,
      'category': category,
      'budgetMin': budgetMin,
      'budgetMax': budgetMax,
      'deliverables': deliverables,
      'requirements': requirements,
      'guidelines': guidelines,
      'deadline': deadline.toIso8601String(),
      'status': status,
      'bidsCount': bidsCount,
      'activeDealsCount': activeDealsCount,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  CampaignModel copyWith({
    String? id,
    String? title,
    String? description,
    String? businessId,
    String? companyName,
    String? brandLogo,
    String? category,
    double? budgetMin,
    double? budgetMax,
    List<String>? deliverables,
    List<String>? requirements,
    String? guidelines,
    DateTime? deadline,
    String? status,
    int? bidsCount,
    int? activeDealsCount,
    DateTime? createdAt,
  }) {
    return CampaignModel(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      businessId: businessId ?? this.businessId,
      companyName: companyName ?? this.companyName,
      brandLogo: brandLogo ?? this.brandLogo,
      category: category ?? this.category,
      budgetMin: budgetMin ?? this.budgetMin,
      budgetMax: budgetMax ?? this.budgetMax,
      deliverables: deliverables ?? this.deliverables,
      requirements: requirements ?? this.requirements,
      guidelines: guidelines ?? this.guidelines,
      deadline: deadline ?? this.deadline,
      status: status ?? this.status,
      bidsCount: bidsCount ?? this.bidsCount,
      activeDealsCount: activeDealsCount ?? this.activeDealsCount,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
