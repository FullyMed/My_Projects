import 'package:flutter/foundation.dart';
import 'package:taiwan_fare_finder/models/app_settings.dart';
import 'package:taiwan_fare_finder/models/fare_result.dart';
import 'package:taiwan_fare_finder/models/route_query.dart';
import 'package:taiwan_fare_finder/models/transport_mode.dart';
import 'package:taiwan_fare_finder/services/fare_service.dart';
import 'package:taiwan_fare_finder/utils/id_generator.dart';

/// Search state for the Search page (single mode).
///
/// The Compare page uses its own [CompareFareController] instance so a compare
/// run never overwrites what the Search page is showing, and vice versa. Both
/// share the same [FareService] (and therefore the same on-device cache).
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
  List<TransportMode> _unservedModes = const [];
  String? _error;
  String? _snackMessage;
  int _cachedQueries = 0;
  int _cachedResults = 0;

  /// Incremented per search; a response is applied only if it belongs to the
  /// latest search, so a slow earlier request can't overwrite a newer one.
  int _searchSeq = 0;

  bool get isLoading => _loading;
  bool get hasSearched => _hasSearched;
  RouteQuery? get lastQuery => _lastQuery;
  List<FareResult> get results => _results;

  /// Modes from the last search that don't serve the route (API mode only).
  List<TransportMode> get unservedModes => _unservedModes;

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
    _searchSeq++;
    _loading = false;
    _hasSearched = false;
    _lastQuery = null;
    _results = const [];
    _unservedModes = const [];
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

    final seq = ++_searchSeq;
    final now = DateTime.now();
    final query = RouteQuery(
      id: IdGenerator.next(),
      userId: _userId!,
      origin: origin,
      destination: destination,
      modes: List.unmodifiable(modes),
      createdAt: now,
      updatedAt: now,
    );

    _hasSearched = true;
    _loading = true;
    _lastQuery = query;
    _results = const [];
    _unservedModes = const [];
    _error = null;
    _snackMessage = null;
    notifyListeners();

    List<FareResult> results = const [];
    List<TransportMode> unserved = const [];
    String? error;
    String? snack;
    try {
      final res = await fareService.search(
        query: query,
        offline: offline,
        dataMode: dataMode,
      );

      results = res.results;
      unserved = res.unservedModes;

      if (offline && res.results.isEmpty) {
        error = 'offline_no_cache';
      }

      if (!offline && res.warningCode == FareService.warningShowingCached) {
        snack = 'showing_cached_results';
      }
    } catch (e) {
      debugPrint('FareController: search failed: $e');
      error = e is UnimplementedError ? 'api_not_ready' : 'search_failed';
    }

    await refreshCacheStats();
    if (seq != _searchSeq) return; // superseded by a newer search

    _results = results;
    _unservedModes = unserved;
    _error = error;
    _snackMessage = snack;
    _loading = false;
    notifyListeners();
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

  /// Re-reads cache stats and notifies (e.g. when Settings opens, since the
  /// other page's controller may have written to the shared cache).
  Future<void> reloadCacheStats() async {
    await refreshCacheStats();
    notifyListeners();
  }

  void consumeSnackMessage() {
    if (_snackMessage == null) return;
    _snackMessage = null;
  }

  /// Drops the displayed results (cache untouched) — used after the shared
  /// cache was cleared through another controller.
  Future<void> clearResults() async {
    _searchSeq++;
    _loading = false;
    _results = const [];
    _unservedModes = const [];
    _error = null;
    _hasSearched = false;
    _lastQuery = null;
    await refreshCacheStats();
    notifyListeners();
  }

  Future<void> clearCache() async {
    if (_userId == null) return;
    await fareService.clearCache(userId: _userId!);
    await clearResults();
  }
}

/// Independent search state for the Compare page (multi-mode). Same behavior
/// as [FareController]; a distinct type so `Provider` can expose both.
class CompareFareController extends FareController {
  CompareFareController({required super.fareService});
}
