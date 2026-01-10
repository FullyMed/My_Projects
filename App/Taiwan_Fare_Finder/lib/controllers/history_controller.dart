import 'package:flutter/foundation.dart';
import 'package:taiwan_fare_finder/models/search_history_entry.dart';
import 'package:taiwan_fare_finder/models/transport_mode.dart';
import 'package:taiwan_fare_finder/services/history_service.dart';

class HistoryController extends ChangeNotifier {
  HistoryController({required this.historyService});

  final HistoryService historyService;

  String? _userId;
  bool _loading = true;
  List<SearchHistoryEntry> _history = const [];

  bool get isLoading => _loading;
  List<SearchHistoryEntry> get history => _history;

  Future<void> bindUser(String? userId) async {
    if (userId == null || userId.isEmpty) return;
    if (_userId == userId && !_loading) return;
    _userId = userId;
    await reload();
  }

  Future<void> reload() async {
    if (_userId == null) return;
    _loading = true;
    notifyListeners();
    try {
      _history = await historyService.load(userId: _userId!);
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> add({required String origin, required String destination, required List<TransportMode> modes}) async {
    if (_userId == null) return;
    _history = await historyService.add(userId: _userId!, origin: origin, destination: destination, modes: modes);
    notifyListeners();
  }

  Future<void> remove(String entryId) async {
    if (_userId == null) return;
    _history = await historyService.remove(userId: _userId!, entryId: entryId);
    notifyListeners();
  }

  Future<void> clear() async {
    await historyService.clear();
    _history = const [];
    notifyListeners();
  }
}
