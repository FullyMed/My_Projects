import 'dart:convert';
import 'dart:math';

import 'package:flutter/foundation.dart';
import 'package:taiwan_fare_finder/models/app_settings.dart';
import 'package:taiwan_fare_finder/models/fare_result.dart';
import 'package:taiwan_fare_finder/models/route_query.dart';
import 'package:taiwan_fare_finder/models/transport_mode.dart';
import 'package:taiwan_fare_finder/services/local_storage_service.dart';
import 'package:taiwan_fare_finder/services/tdx_auth_service.dart';
import 'package:taiwan_fare_finder/services/tdx_fare_service.dart';

class FareSearchResponse {
  const FareSearchResponse({required this.results, required this.usedCache, this.warningCode});

  final List<FareResult> results;
  final bool usedCache;

  /// Optional warning code to be surfaced non-blockingly by the UI.
  final String? warningCode;
}

class FareCacheStats {
  const FareCacheStats({required this.cachedQueries, required this.cachedResults});

  final int cachedQueries;
  final int cachedResults;
}

class FareService {
  FareService({required this.storage, required TdxAuthService authService})
      : _tdx = TdxFareService(authService: authService);

  final LocalStorageService storage;
  final TdxFareService _tdx;

  static const _cacheKey = 'tff_fare_cache';
  static const int _maxCachedQueries = 100;

  /// Returned by [search] to indicate whether results came from cache, and
  /// whether cache was used as a fallback after an online failure.
  ///
  /// When offline mode is enabled, [usedCache] will always be true.
  /// When offline mode is disabled, [usedCacheFallback] can become true if the
  /// online operation fails and cached results exist.
  static const String warningShowingCached = 'showing_cached_results';

  static const Map<String, int> _cityKm = {
    'Keelung': 0,
    'Taipei': 20,
    'New Taipei': 25,
    'Banqiao': 25,
    'Taoyuan': 45,
    'Hsinchu': 80,
    'Miaoli': 120,
    'Taichung': 170,
    'Changhua': 200,
    'Yunlin': 240,
    'Chiayi': 280,
    'Tainan': 320,
    'Kaohsiung': 360,
  };

  static const List<String> suggestedStops = [
    'Taipei',
    'Banqiao',
    'Taoyuan',
    'Hsinchu',
    'Taichung',
    'Chiayi',
    'Tainan',
    'Kaohsiung'
  ];

  // NOTE: We intentionally do not seed mock cache anymore.
  // Offline mode should be truthful: if the user hasn't searched online yet,
  // there should be no offline data.

  Future<List<FareResult>> getCachedForQueryKey(String queryKey, {required String userId}) async {
    final all = await _readAll(userId: userId);
    final matched = all.where((e) => e.queryKey == queryKey).toList();
    // LRU touch: cache reads should keep the query "recent".
    if (matched.isNotEmpty) {
      await _touchQueryKey(userId: userId, queryKey: queryKey);
    }
    return matched;
  }

  Future<FareSearchResponse> search({required RouteQuery query, required bool offline, required DataMode dataMode}) async {
    final queryKey = query.cacheKey;

    // 1) Strict cache-only when offline.
    if (offline) {
      final cached = await getCachedForQueryKey(queryKey, userId: query.userId);
      return FareSearchResponse(results: cached.map((e) => e.copyWith(source: FareSource.cache)).toList(), usedCache: true);
    }

    // 2) "Online" path.
    try {
      final results = switch (dataMode) {
        DataMode.api => await _searchApi(query: query),
        DataMode.mock => _searchMock(query: query),
      };
      await upsertCache(userId: query.userId, results: results);
      return FareSearchResponse(results: results, usedCache: false);
    } catch (e) {
      debugPrint('FareService: online search failed, attempting cache fallback: $e');
      final cached = await getCachedForQueryKey(queryKey, userId: query.userId);
      if (cached.isNotEmpty) {
        return FareSearchResponse(
          results: cached.map((e) => e.copyWith(source: FareSource.cache)).toList(),
          usedCache: true,
          warningCode: warningShowingCached,
        );
      }
      rethrow;
    }
  }

  List<FareResult> _searchMock({required RouteQuery query}) {
    final distanceKm = _estimateDistanceKm(query.origin, query.destination);
    final now = DateTime.now();
    final out = <FareResult>[];
    for (final mode in query.modes) {
      out.add(_mock(userId: query.userId, queryKey: query.cacheKey, mode: mode, distanceKm: distanceKm, now: now));
    }
    return out;
  }

  Future<List<FareResult>> _searchApi({required RouteQuery query}) async {
    final distanceKm = _estimateDistanceKm(query.origin, query.destination);
    final now = DateTime.now();
    final results = <FareResult>[];

    for (final mode in query.modes) {
      final result = switch (mode) {
        TransportMode.hsr || TransportMode.tra =>
          await _tdx.fetch(query: query, mode: mode, distanceKm: distanceKm),
        _ => _mock(
            userId: query.userId,
            queryKey: query.cacheKey,
            mode: mode,
            distanceKm: distanceKm,
            now: now,
          ),
      };
      results.add(result);
    }
    return results;
  }

  Future<FareCacheStats> getCacheStats({required String userId}) async {
    try {
      final all = await _readAll(userId: userId);
      final queryKeys = <String>{};
      for (final r in all) {
        if (r.queryKey.isNotEmpty) queryKeys.add(r.queryKey);
      }
      return FareCacheStats(cachedQueries: queryKeys.length, cachedResults: all.length);
    } catch (e) {
      debugPrint('FareService: getCacheStats failed: $e');
      return const FareCacheStats(cachedQueries: 0, cachedResults: 0);
    }
  }

  Future<void> upsertCache({required String userId, required List<FareResult> results}) async {
    try {
      final all = await _readAll(userId: userId);
      final map = <String, FareResult>{for (final r in all) '${r.queryKey}__${r.mode.storageKey}': r};
      for (final r in results) {
        map['${r.queryKey}__${r.mode.storageKey}'] = r.copyWith(source: FareSource.cache, updatedAt: DateTime.now());
      }

      final trimmed = _evictLruQueries(map.values.toList());
      await _writeAll(trimmed);
    } catch (e) {
      debugPrint('FareService: upsertCache failed: $e');
    }
  }

  /// Evict least-recently-used query keys to keep storage bounded.
  ///
  /// LRU signal: max(updatedAt) across results within the same queryKey.
  List<FareResult> _evictLruQueries(List<FareResult> all) {
    final lastTouched = <String, DateTime>{};
    for (final r in all) {
      final t = lastTouched[r.queryKey];
      if (t == null || r.updatedAt.isAfter(t)) lastTouched[r.queryKey] = r.updatedAt;
    }
    if (lastTouched.length <= _maxCachedQueries) return all;

    final keepKeys = lastTouched.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));
    final allowed = keepKeys.take(_maxCachedQueries).map((e) => e.key).toSet();
    final trimmed = all.where((r) => allowed.contains(r.queryKey)).toList();
    debugPrint('FareService: evicted cache queries. Kept ${allowed.length}/${lastTouched.length} queries.');
    return trimmed;
  }

  Future<void> _touchQueryKey({required String userId, required String queryKey}) async {
    try {
      final all = await _readAll(userId: userId);
      final now = DateTime.now();
      var changed = false;
      final next = <FareResult>[];
      for (final r in all) {
        if (r.queryKey == queryKey) {
          changed = true;
          next.add(r.copyWith(updatedAt: now));
        } else {
          next.add(r);
        }
      }
      if (!changed) return;
      await _writeAll(_evictLruQueries(next));
    } catch (e) {
      debugPrint('FareService: touchQueryKey failed: $e');
    }
  }

  Future<void> clearCache({required String userId}) async {
    final all = await storage.readList(_cacheKey);
    final kept = <Map<String, dynamic>>[];
    for (final item in all) {
      final r = FareResult.fromJson(item);
      if (r == null || r.userId != userId) kept.add(item);
    }
    await storage.writeList(_cacheKey, kept);
  }

  Future<List<FareResult>> _readAll({required String userId}) async {
    final list = await storage.readList(_cacheKey);
    final out = <FareResult>[];
    for (final item in list) {
      final r = FareResult.fromJson(item);
      if (r != null && r.userId == userId) out.add(r);
    }
    return out;
  }

  Future<void> _writeAll(List<FareResult> all) => storage.writeList(_cacheKey, all.map((e) => e.toJson()).toList());

  int _estimateDistanceKm(String origin, String destination) {
    final a = _cityKm[origin] ?? 0;
    final b = _cityKm[destination] ?? 0;
    final d = (a - b).abs();
    return max(3, d);
  }

  FareResult _mock({required String userId, required String queryKey, required TransportMode mode, required int distanceKm, required DateTime now}) {
    // Deterministic mock rules:
    // - Use a stable seed derived from (queryKey, mode)
    // - Same route + mode => same duration / transfers / price tweaks every time
    final seed = _fnv1a32(utf8.encode('tff|$queryKey|${mode.storageKey}'));
    final rng = Random(seed);

    final baseAdult = _adultFareByBand(mode: mode, distanceKm: distanceKm);
    final adult = _applyStablePctJitter(baseAdult, rng, minPct: -0.03, maxPct: 0.03);
    final student = max(10, (adult * 0.85).round());
    final child = max(10, (adult * 0.5).round());
    final senior = max(10, (adult * 0.8).round());

    final baseMinutes = _durationByMode(mode: mode, distanceKm: distanceKm);
    final minutes = max(6, _applyStablePctJitter(baseMinutes, rng, minPct: -0.06, maxPct: 0.08));

    // Store transfer summaries as stable keys so the UI can localize them.
    final transfers = _transferKeyForMock(mode: mode, distanceKm: distanceKm, rng: rng);

    return FareResult(
      id: _stableIdForMock(userId: userId, queryKey: queryKey, mode: mode),
      userId: userId,
      queryKey: queryKey,
      mode: mode,
      distanceKm: distanceKm,
      durationMinutes: minutes,
      transferSummary: transfers,
      fares: FareBreakdown(adult: adult, student: student, child: child, senior: senior),
      source: FareSource.mock,
      createdAt: now,
      updatedAt: now,
    );
  }

  int _applyStablePctJitter(int base, Random rng, {required double minPct, required double maxPct}) {
    final pct = minPct + (maxPct - minPct) * rng.nextDouble();
    return max(1, (base * (1 + pct)).round());
  }

  String _transferKeyForMock({required TransportMode mode, required int distanceKm, required Random rng}) {
    final threshold = switch (mode) {
      TransportMode.hsr => 250,
      TransportMode.tra => 220,
      TransportMode.mrt => 18,
      TransportMode.bus => 12,
      TransportMode.youBike => 6,
    };

    // If we're near the threshold (within ~10%), allow a seeded variation so
    // routes at the boundary look less "binary" but stay stable per queryKey.
    final nearBoundary = (distanceKm - threshold).abs() <= max(2, (threshold * 0.10).round());

    if (mode == TransportMode.youBike) {
      if (distanceKm > threshold && !nearBoundary) return 'transfer_dock_swap';
      if (distanceKm <= threshold && !nearBoundary) return 'transfer_direct';
      return rng.nextBool() ? 'transfer_dock_swap' : 'transfer_direct';
    }

    if (distanceKm > threshold && !nearBoundary) return 'transfer_one';
    if (distanceKm <= threshold && !nearBoundary) return 'transfer_direct';

    final roll = rng.nextDouble();
    return switch (mode) {
      TransportMode.mrt => roll < 0.33 ? 'transfer_direct' : (roll < 0.80 ? 'transfer_one' : 'transfer_one_to_two'),
      _ => roll < 0.55 ? 'transfer_direct' : 'transfer_one',
    };
  }

  int _durationByMode({required TransportMode mode, required int distanceKm}) {
    final speedKmh = switch (mode) {
      TransportMode.hsr => 235,
      TransportMode.tra => 105,
      TransportMode.mrt => 36,
      TransportMode.bus => 22,
      TransportMode.youBike => 14,
    };
    // Light padding for boarding/wait time per mode (still deterministic).
    final boardingMin = switch (mode) {
      TransportMode.hsr => 18,
      TransportMode.tra => 14,
      TransportMode.mrt => 10,
      TransportMode.bus => 8,
      TransportMode.youBike => 4,
    };
    final ride = max(1, (distanceKm / speedKmh * 60).round());
    return max(6, ride + boardingMin);
  }

  int _adultFareByBand({required TransportMode mode, required int distanceKm}) {
    final band = _distanceBand(distanceKm);
    // Publish-ready “believable” band tables.
    // Bands: 0-10, 11-30, 31-80, 81-200, 201+
    return switch (mode) {
      TransportMode.bus => [15, 22, 35, 55, 75][band],
      TransportMode.mrt => [20, 32, 48, 65, 88][band],
      TransportMode.youBike => [10, 10, 16, 28, 40][band],
      TransportMode.tra => [60, 92, 138, 198, 285][band],
      TransportMode.hsr => [120, 260, 420, 720, 1080][band],
    };
  }

  int _distanceBand(int distanceKm) {
    if (distanceKm <= 10) return 0;
    if (distanceKm <= 30) return 1;
    if (distanceKm <= 80) return 2;
    if (distanceKm <= 200) return 3;
    return 4;
  }

  String _stableIdForMock({required String userId, required String queryKey, required TransportMode mode}) {
    final bytes = utf8.encode('tff|$userId|$queryKey|${mode.storageKey}');
    final h = _fnv1a32(bytes);
    return 'mock_${h.toRadixString(16).padLeft(8, '0')}';
  }

  int _fnv1a32(List<int> bytes) {
    const int offsetBasis = 0x811C9DC5;
    const int prime = 0x01000193;
    var hash = offsetBasis;
    for (final b in bytes) {
      hash ^= b;
      hash = (hash * prime) & 0xFFFFFFFF;
    }
    return hash;
  }
}
