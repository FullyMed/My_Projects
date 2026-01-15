import 'package:flutter/foundation.dart';
import 'package:taiwan_fare_finder/models/search_history_entry.dart';
import 'package:taiwan_fare_finder/models/transport_mode.dart';
import 'package:taiwan_fare_finder/services/history_service.dart';

class HistoryController extends ChangeNotifier {
  HistoryController({required this.historyService});

  final HistoryService historyService;

  String? _boundUserId;
  String? get boundUserId => _boundUserId;

  String? _userId;
  bool _loading = true;
  List<SearchHistoryEntry> _history = const [];

  bool get isLoading => _loading;
  List<SearchHistoryEntry> get history => _history;

  String _resolveUserId(String? userId) {
    if (userId == null || userId.isEmpty) return 'local';
    return userId;
  }

  Future<void> bindUser(String? userId) async {
    final resolved = _resolveUserId(userId);

    if (_boundUserId == resolved) return;
    _boundUserId = resolved;

    if (_userId == resolved && !_loading) return;
    _userId = resolved;

    await reload();
  }

  Future<void> reload() async {
    if (_userId == null) return;

    _loading = true;
    notifyListeners();

    try {
      _history = await historyService.load(userId: _userId!);
    } catch (e) {
      debugPrint('HistoryController: load failed: $e');
      _history = const [];
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> add({
    required String origin,
    required String destination,
    required List<TransportMode> modes,
  }) async {
    if (_userId == null) return;

    try {
      _history = await historyService.add(
        userId: _userId!,
        origin: origin,
        destination: destination,
        modes: modes,
      );
    } catch (e) {
      debugPrint('HistoryController: add failed: $e');
    }

    notifyListeners();
  }

  Future<void> remove(String entryId) async {
    if (_userId == null) return;

    try {
      _history = await historyService.remove(
        userId: _userId!,
        entryId: entryId,
      );
    } catch (e) {
      debugPrint('HistoryController: remove failed: $e');
    }

    notifyListeners();
  }

  Future<void> clear() async {
    await historyService.clear();
    _history = const [];
    notifyListeners();
  }
}
