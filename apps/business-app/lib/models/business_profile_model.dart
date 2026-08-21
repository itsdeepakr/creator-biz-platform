class BusinessProfileModel {
  final String id;
  final String userId;
  final String companyName;
  final String? logoUrl;
  final String? website;
  final String industry;
  final String? description;
  final String? gstin;
  final String? panNumber;
  final String? registrationDocUrl;
  final String contactPersonName;
  final String? contactPhone;
  final bool isGstVerified;
  final String kycStatus; // 'PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED'
  final DateTime createdAt;

  BusinessProfileModel({
    required this.id,
    required this.userId,
    required this.companyName,
    this.logoUrl,
    this.website,
    required this.industry,
    this.description,
    this.gstin,
    this.panNumber,
    this.registrationDocUrl,
    required this.contactPersonName,
    this.contactPhone,
    this.isGstVerified = false,
    this.kycStatus = 'PENDING',
    required this.createdAt,
  });

  factory BusinessProfileModel.fromJson(Map<String, dynamic> json) {
    return BusinessProfileModel(
      id: json['id'] as String? ?? '',
      userId: json['userId'] as String? ?? '',
      companyName: json['companyName'] as String? ?? 'Business Partner',
      logoUrl: json['logoUrl'] as String?,
      website: json['website'] as String?,
      industry: json['industry'] as String? ?? 'Technology',
      description: json['description'] as String?,
      gstin: json['gstin'] as String?,
      panNumber: json['panNumber'] as String?,
      registrationDocUrl: json['registrationDocUrl'] as String?,
      contactPersonName: json['contactPersonName'] as String? ?? 'Brand Manager',
      contactPhone: json['contactPhone'] as String?,
      isGstVerified: json['isGstVerified'] as bool? ?? false,
      kycStatus: json['kycStatus'] as String? ?? 'PENDING',
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'] as String) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'companyName': companyName,
      'logoUrl': logoUrl,
      'website': website,
      'industry': industry,
      'description': description,
      'gstin': gstin,
      'panNumber': panNumber,
      'registrationDocUrl': registrationDocUrl,
      'contactPersonName': contactPersonName,
      'contactPhone': contactPhone,
      'isGstVerified': isGstVerified,
      'kycStatus': kycStatus,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  BusinessProfileModel copyWith({
    String? id,
    String? userId,
    String? companyName,
    String? logoUrl,
    String? website,
    String? industry,
    String? description,
    String? gstin,
    String? panNumber,
    String? registrationDocUrl,
    String? contactPersonName,
    String? contactPhone,
    bool? isGstVerified,
    String? kycStatus,
    DateTime? createdAt,
  }) {
    return BusinessProfileModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      companyName: companyName ?? this.companyName,
      logoUrl: logoUrl ?? this.logoUrl,
      website: website ?? this.website,
      industry: industry ?? this.industry,
      description: description ?? this.description,
      gstin: gstin ?? this.gstin,
      panNumber: panNumber ?? this.panNumber,
      registrationDocUrl: registrationDocUrl ?? this.registrationDocUrl,
      contactPersonName: contactPersonName ?? this.contactPersonName,
      contactPhone: contactPhone ?? this.contactPhone,
      isGstVerified: isGstVerified ?? this.isGstVerified,
      kycStatus: kycStatus ?? this.kycStatus,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
