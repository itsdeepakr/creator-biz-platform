import '../core/network/api_client.dart';
import '../models/dispute_model.dart';

class DisputeService {
  final ApiClient _apiClient;

  DisputeService({required ApiClient apiClient}) : _apiClient = apiClient;

  final List<DisputeModel> _disputes = [
    DisputeModel(
      id: 'disp_1',
      collaborationId: 'collab_99',
      campaignTitle: 'Audio Gear YouTube Review',
      creatorName: 'Demo Creator',
      reason: 'Content does not match agreed brief & guidelines',
      evidenceNotes: 'Video did not include the required brand tags and omitted 2 key product features.',
      status: 'UNDER_REVIEW',
      adminNotes: 'Admin moderator is reviewing the submitted video and chat logs.',
      createdAt: DateTime.now().subtract(const Duration(days: 3)),
    ),
  ];

  Future<List<DisputeModel>> getDisputes() async {
    try {
      final response = await _apiClient.get('/disputes');
      if (response.statusCode == 200) {
        final list = response.data as List<dynamic>;
        return list.map((e) => DisputeModel.fromJson(e as Map<String, dynamic>)).toList();
      }
    } catch (_) {}
    return _disputes;
  }

  Future<DisputeModel> fileDispute({
    required String collaborationId,
    required String campaignTitle,
    required String creatorName,
    required String reason,
    required String evidenceNotes,
  }) async {
    final newDispute = DisputeModel(
      id: 'disp_${DateTime.now().millisecondsSinceEpoch}',
      collaborationId: collaborationId,
      campaignTitle: campaignTitle,
      creatorName: creatorName,
      reason: reason,
      evidenceNotes: evidenceNotes,
      status: 'OPEN',
      createdAt: DateTime.now(),
    );

    try {
      final response = await _apiClient.post(
        '/disputes',
        data: newDispute.toJson(),
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        final created = DisputeModel.fromJson(response.data as Map<String, dynamic>);
        _disputes.insert(0, created);
        return created;
      }
    } catch (_) {}

    _disputes.insert(0, newDispute);
    return newDispute;
  }
}
