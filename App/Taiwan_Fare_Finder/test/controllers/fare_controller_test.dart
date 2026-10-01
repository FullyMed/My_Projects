import 'dart:async';

import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:taiwan_fare_finder/controllers/fare_controller.dart';
import 'package:taiwan_fare_finder/models/app_settings.dart';
import 'package:taiwan_fare_finder/models/fare_result.dart';
import 'package:taiwan_fare_finder/models/route_query.dart';
import 'package:taiwan_fare_finder/models/transport_mode.dart';
import 'package:taiwan_fare_finder/services/fare_service.dart';
import 'package:taiwan_fare_finder/services/local_storage_service.dart';
import 'package:taiwan_fare_finder/services/tdx_auth_service.dart';

/// FareService whose responses resolve only when the test says so.
class _ControlledFareService extends FareService {
  _ControlledFareService()
      : super(
            storage: const LocalStorageService(),
            authService: TdxAuthService());

  final pending = <RouteQuery, Completer<FareSearchResponse>>{};

  @override
  Future<FareSearchResponse> search(
      {required RouteQuery query,
      required bool offline,
      required DataMode dataMode}) {
    final c = Completer<FareSearchResponse>();
    pending[query] = c;
    return c.future;
  }

  FareSearchResponse responseFor(RouteQuery q) {
    final now = DateTime.now();
    return FareSearchResponse(usedCache: false, results: [
      FareResult(
          id: q.origin,
          userId: q.userId,
          queryKey: q.cacheKey,
          mode: q.modes.first,
          distanceKm: 10,
          durationMinutes: 20,
          transferSummary: 'transfer_direct',
          fares: const FareBreakdown(
              adult: 100, student: 85, child: 50, senior: 50),
          source: FareSource.mock,
          createdAt: now,
          updatedAt: now),
    ]);
  }
}

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));

  test('a slow earlier search cannot overwrite a newer one', () async {
    final service = _ControlledFareService();
    final c = FareController(fareService: service);
    await c.bindUser('u1');

    final first = c.search(
        origin: 'Taipei',
        destination: 'Tainan',
        modes: [TransportMode.bus],
        offline: false,
        dataMode: DataMode.mock);
    final second = c.search(
        origin: 'Keelung',
        destination: 'Taichung',
        modes: [TransportMode.bus],
        offline: false,
        dataMode: DataMode.mock);
    final q1 = service.pending.keys.firstWhere((q) => q.origin == 'Taipei');
    final q2 = service.pending.keys.firstWhere((q) => q.origin == 'Keelung');

    service.pending[q2]!.complete(service.responseFor(q2));
    await second;
    service.pending[q1]!.complete(service.responseFor(q1));
    await first;

    expect(c.isLoading, isFalse);
    expect(c.lastQuery!.origin, 'Keelung');
    expect(c.results.single.id, 'Keelung');
  });

  test('Search and Compare controllers keep independent results', () async {
    final service = FareService(
        storage: const LocalStorageService(), authService: TdxAuthService());
    final search = FareController(fareService: service);
    final compare = CompareFareController(fareService: service);
    await search.bindUser('u1');
    await compare.bindUser('u1');

    await search.search(
        origin: 'Taipei',
        destination: 'Tainan',
        modes: [TransportMode.hsr],
        offline: false,
        dataMode: DataMode.mock);
    await compare.search(
        origin: 'Keelung',
        destination: 'Taichung',
        modes: [TransportMode.bus, TransportMode.tra],
        offline: false,
        dataMode: DataMode.mock);

    expect(search.results, hasLength(1));
    expect(search.lastQuery!.origin, 'Taipei');
    expect(compare.results, hasLength(2));

    // Clearing the shared cache through one controller + resetting the other.
    await search.clearCache();
    await compare.clearResults();
    expect(search.results, isEmpty);
    expect(compare.results, isEmpty);
    expect(compare.cachedQueries, 0);
  });

  test('offline with nothing cached reports offline_no_cache', () async {
    final c = FareController(
        fareService: FareService(
            storage: const LocalStorageService(),
            authService: TdxAuthService()));
    await c.bindUser('u1');
    await c.search(
        origin: 'Taipei',
        destination: 'Tainan',
        modes: [TransportMode.hsr],
        offline: true,
        dataMode: DataMode.mock);
    expect(c.errorMessage, 'offline_no_cache');
  });
}
