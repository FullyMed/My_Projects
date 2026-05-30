import 'package:flutter/foundation.dart';
import 'package:taiwan_fare_finder/models/app_settings.dart';
import 'package:taiwan_fare_finder/models/fare_result.dart';
import 'package:taiwan_fare_finder/models/route_query.dart';
import 'package:taiwan_fare_finder/models/transport_mode.dart';
import 'package:taiwan_fare_finder/services/fare_service.dart';
import 'package:taiwan_fare_finder/utils/id_generator.dart';

class FareController extends ChangeNotifier {
  FareController({required this.fareService});

  final FareService fareService;

  String? _boundUserId;
  String? get boundUserId => _boundUserId;

  String? _userId;
  bool _loading = false;
  bool _hasSearched = false;
  RouteQuery? _lastQuery;
  List<FareResult> _results = const [];
  String? _error;
  String? _snackMessage;
  int _cachedQueries = 0;
  int _cachedResults = 0;

  bool get isLoading => _loading;
  bool get hasSearched => _hasSearched;
  RouteQuery? get lastQuery => _lastQuery;
  List<FareResult> get results => _results;

  /// Error message key (localized in UI).
  ///
  /// Known values:
  /// - `offline_no_cache`
  /// - `search_failed`
  /// - `api_not_ready`
  String? get errorMessage => _error;

  /// Snack message key (localized in UI).
  String? get snackMessage => _snackMessage;

  int get cachedQueries => _cachedQueries;
  int get cachedResults => _cachedResults;

  String _resolveUserId(String? userId) {
    if (userId == null || userId.isEmpty) return 'local';
    return userId;
  }

  Future<void> bindUser(String? userId) async {
    final resolved = _resolveUserId(userId);

    // Guard to avoid repeated rebinds on rebuilds.
    if (_boundUserId == resolved) return;
    _boundUserId = resolved;

    // If already bound internally, nothing to do.
    if (_userId == resolved) return;

    _userId = resolved;

    // Reset state for the new user context.
    _hasSearched = false;
    _lastQuery = null;
    _results = const [];
    _error = null;
    _snackMessage = null;

    await refreshCacheStats();
    notifyListeners(); // optional but useful so UI updates immediately (stats reset)
  }

  Future<void> search({
    required String origin,
    required String destination,
    required List<TransportMode> modes,
    required bool offline,
    required DataMode dataMode,
  }) async {
    if (_userId == null) return; // should never happen now, but keep safe.

    _hasSearched = true;
    _loading = true;
    _error = null;
    _snackMessage = null;
    notifyListeners();

    try {
      final now = DateTime.now();
      final query = RouteQuery(
        id: IdGenerator.next(),
        userId: _userId!,
        origin: origin,
        destination: destination,
        modes: modes,
        createdAt: now,
        updatedAt: now,
      );

      _lastQuery = query;

      final res = await fareService.search(
        query: query,
        offline: offline,
        dataMode: dataMode,
      );

      _results = res.results;

      if (offline && res.results.isEmpty) {
        _error = 'offline_no_cache';
      }

      if (!offline && res.warningCode == FareService.warningShowingCached) {
        _snackMessage = 'showing_cached_results';
      }

      await refreshCacheStats();
    } catch (e) {
      debugPrint('FareController: search failed: $e');
      _error = e is UnimplementedError ? 'api_not_ready' : 'search_failed';
      _results = const [];
      await refreshCacheStats();
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  bool get canRetry => _lastQuery != null && !_loading;

  Future<void> retryLast({
    required bool offline,
    required DataMode dataMode,
  }) async {
    final q = _lastQuery;
    if (q == null) return;

    await search(
      origin: q.origin,
      destination: q.destination,
      modes: q.modes,
      offline: offline,
      dataMode: dataMode,
    );
  }

  Future<void> refreshCacheStats() async {
    if (_userId == null) return;
    final stats = await fareService.getCacheStats(userId: _userId!);
    _cachedQueries = stats.cachedQueries;
    _cachedResults = stats.cachedResults;
  }

  void consumeSnackMessage() {
    if (_snackMessage == null) return;
    _snackMessage = null;
  }

  Future<void> clearCache() async {
    if (_userId == null) return;
    await fareService.clearCache(userId: _userId!);
    _results = const [];
    _hasSearched = false;
    _lastQuery = null;
    await refreshCacheStats();
    notifyListeners();
  }
}
