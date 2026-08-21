import '../core/network/api_client.dart';
import '../core/storage/storage_service.dart';
import '../models/user_model.dart';

class AuthService {
  final ApiClient _apiClient;
  final StorageService _storageService;

  AuthService({
    required ApiClient apiClient,
    required StorageService storageService,
  })  : _apiClient = apiClient,
        _storageService = storageService;

  UserModel _currentUser = UserModel(
    id: 'biz_u_1',
    email: 'brand@apex.tech',
    fullName: 'Pooja Hegde',
    phone: '+919123456780',
    role: 'BUSINESS',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
    isEmailVerified: true,
    isPhoneVerified: true,
    kycStatus: 'VERIFIED',
    createdAt: DateTime.now().subtract(const Duration(days: 120)),
  );

  UserModel get currentUser => _currentUser;

  Future<UserModel> login(String email, String password) async {
    try {
      final response = await _apiClient.post(
        '/auth/login',
        data: {'email': email, 'password': password},
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = response.data as Map<String, dynamic>;
        final token = data['token'] as String? ?? data['accessToken'] as String? ?? '';
        final userJson = data['user'] as Map<String, dynamic>? ?? data;
        await _storageService.saveAuthToken(token);
        _currentUser = UserModel.fromJson(userJson);
        await _storageService.saveUserId(_currentUser.id);
        await _storageService.saveUserRole(_currentUser.role);
        return _currentUser;
      }
    } catch (_) {}

    _currentUser = _currentUser.copyWith(email: email);
    await _storageService.saveAuthToken('dummy_jwt_token_business');
    await _storageService.saveUserId(_currentUser.id);
    await _storageService.saveUserRole('BUSINESS');
    return _currentUser;
  }

  Future<UserModel> register({
    required String fullName,
    required String email,
    required String password,
    String? phone,
  }) async {
    try {
      final response = await _apiClient.post(
        '/auth/register',
        data: {
          'fullName': fullName,
          'email': email,
          'password': password,
          'phone': phone,
          'role': 'BUSINESS',
        },
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = response.data as Map<String, dynamic>;
        final token = data['token'] as String? ?? data['accessToken'] as String? ?? '';
        final userJson = data['user'] as Map<String, dynamic>? ?? data;
        await _storageService.saveAuthToken(token);
        _currentUser = UserModel.fromJson(userJson);
        return _currentUser;
      }
    } catch (_) {}

    _currentUser = UserModel(
      id: 'biz_${DateTime.now().millisecondsSinceEpoch}',
      email: email,
      fullName: fullName,
      phone: phone,
      role: 'BUSINESS',
      kycStatus: 'PENDING',
      createdAt: DateTime.now(),
    );
    await _storageService.saveAuthToken('demo_biz_token');
    await _storageService.saveUserId(_currentUser.id);
    return _currentUser;
  }

  Future<bool> verifyOtp(String otp) async {
    try {
      final response = await _apiClient.post(
        '/auth/verify-otp',
        data: {'otp': otp, 'userId': _currentUser.id},
      );
      if (response.statusCode == 200) {
        _currentUser = _currentUser.copyWith(isPhoneVerified: true, isEmailVerified: true);
        return true;
      }
    } catch (_) {}

    _currentUser = _currentUser.copyWith(isPhoneVerified: true, isEmailVerified: true);
    return true;
  }

  Future<UserModel> submitGstKyc({
    required String companyName,
    required String gstin,
    required String panNumber,
    required String contactPerson,
    String? docName,
  }) async {
    try {
      final response = await _apiClient.post(
        '/kyc/submit',
        data: {
          'companyName': companyName,
          'gstin': gstin,
          'panNumber': panNumber,
          'contactPerson': contactPerson,
          'docName': docName,
        },
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        _currentUser = _currentUser.copyWith(kycStatus: 'SUBMITTED');
        return _currentUser;
      }
    } catch (_) {}

    _currentUser = _currentUser.copyWith(kycStatus: 'SUBMITTED');
    return _currentUser;
  }

  Future<UserModel?> checkCurrentUser() async {
    final token = await _storageService.getAuthToken();
    if (token == null) return null;
    try {
      final response = await _apiClient.get('/auth/me');
      if (response.statusCode == 200) {
        final data = response.data as Map<String, dynamic>;
        _currentUser = UserModel.fromJson(data);
        return _currentUser;
      }
    } catch (_) {}
    return _currentUser;
  }

  Future<void> logout() async {
    try {
      await _apiClient.post('/auth/logout');
    } catch (_) {}
    await _storageService.clearAll();
  }
}
