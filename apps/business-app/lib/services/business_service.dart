import '../core/network/api_client.dart';
import '../models/business_profile_model.dart';

class BusinessService {
  final ApiClient _apiClient;

  BusinessService({required ApiClient apiClient}) : _apiClient = apiClient;

  late BusinessProfileModel _myProfile = BusinessProfileModel(
    id: 'biz_prof_1',
    userId: 'biz_u_1',
    companyName: 'Apex Innovations Pvt Ltd',
    logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=300',
    website: 'https://apexinnovations.tech',
    industry: 'Consumer Electronics & Smart Devices',
    description: 'Leading smart technology & mobile devices OEM in India, bringing high-performance devices to young consumers.',
    gstin: '29ABCDE1234F1Z5',
    panNumber: 'ABCDE1234F',
    contactPersonName: 'Pooja Hegde (Brand Marketing Lead)',
    contactPhone: '+91 91234 56780',
    isGstVerified: true,
    kycStatus: 'VERIFIED',
    createdAt: DateTime.now().subtract(const Duration(days: 120)),
  );

  BusinessProfileModel get myProfile => _myProfile;

  Future<BusinessProfileModel> getMyProfile() async {
    try {
      final response = await _apiClient.get('/businesses/profile/me');
      if (response.statusCode == 200) {
        _myProfile = BusinessProfileModel.fromJson(response.data as Map<String, dynamic>);
        return _myProfile;
      }
    } catch (_) {}
    return _myProfile;
  }

  Future<BusinessProfileModel> updateProfile({
    String? companyName,
    String? website,
    String? industry,
    String? description,
    String? contactPersonName,
    String? contactPhone,
    String? logoUrl,
  }) async {
    try {
      final response = await _apiClient.patch(
        '/businesses/profile/me',
        data: {
          if (companyName != null) 'companyName': companyName,
          if (website != null) 'website': website,
          if (industry != null) 'industry': industry,
          if (description != null) 'description': description,
          if (contactPersonName != null) 'contactPersonName': contactPersonName,
          if (contactPhone != null) 'contactPhone': contactPhone,
          if (logoUrl != null) 'logoUrl': logoUrl,
        },
      );
      if (response.statusCode == 200) {
        _myProfile = BusinessProfileModel.fromJson(response.data as Map<String, dynamic>);
        return _myProfile;
      }
    } catch (_) {}

    _myProfile = _myProfile.copyWith(
      companyName: companyName,
      website: website,
      industry: industry,
      description: description,
      contactPersonName: contactPersonName,
      contactPhone: contactPhone,
      logoUrl: logoUrl,
    );
    return _myProfile;
  }
}
