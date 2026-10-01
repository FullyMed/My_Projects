import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:taiwan_fare_finder/models/app_settings.dart';
import 'package:taiwan_fare_finder/models/fare_result.dart';
import 'package:taiwan_fare_finder/models/route_query.dart';
import 'package:taiwan_fare_finder/models/transport_mode.dart';
import 'package:taiwan_fare_finder/services/fare_service.dart';
import 'package:taiwan_fare_finder/services/local_storage_service.dart';
import 'package:taiwan_fare_finder/services/tdx_auth_service.dart';

RouteQuery _q(String origin, String destination, List<TransportMode> modes,
    {String userId = 'u1'}) {
  final now = DateTime.now();
  return RouteQuery(
      id: 'q',
      userId: userId,
      origin: origin,
      destination: destination,
      modes: modes,
      createdAt: now,
      updatedAt: now);
}

FareService _service({http.Client? client}) => FareService(
      storage: const LocalStorageService(),
      authService: TdxAuthService(),
      proxyBaseUrl: 'https://proxy.example/api/basic/v2',
      httpClient: client,
    );

final _traOk = MockClient((req) async {
  if (req.url.path.endsWith('/Rail/TRA/ODFare')) {
    return http.Response.bytes(
        File('test/fixtures/tra_odfare_1000_4400.json').readAsBytesSync(), 200);
  }
  return http.Response('nope', 404);
});

final _offline =
    MockClient((_) async => throw const SocketException('no network'));

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));

  test('mock data is deterministic for the same route and mode', () async {
    final s = _service();
    final a = await s.search(
        query: _q('Taipei', 'Kaohsiung', [TransportMode.bus]),
        offline: false,
        dataMode: DataMode.mock);
    final b = await s.search(
        query: _q('Taipei', 'Kaohsiung', [TransportMode.bus]),
        offline: false,
        dataMode: DataMode.mock);

    expect(a.results.single.fares.adult, b.results.single.fares.adult);
    expect(a.results.single.durationMinutes, b.results.single.durationMinutes);
    expect(a.results.single.source, FareSource.mock);
    expect(a.unservedModes, isEmpty);
  });

  test('API mode: unserved mode is skipped, other modes still returned',
      () async {
    // Keelung has no HSR; TRA is live (fixture), Bus is mock.
    final s = _service(client: _traOk);
    final res = await s.search(
        query: _q('Keelung', 'Kaohsiung',
            [TransportMode.hsr, TransportMode.tra, TransportMode.bus]),
        offline: false,
        dataMode: DataMode.api);

    expect(res.unservedModes, [TransportMode.hsr]);
    expect(
        res.results.map((r) => r.mode), [TransportMode.tra, TransportMode.bus]);
    expect(res.results.firstWhere((r) => r.mode == TransportMode.tra).source,
        FareSource.live);
    expect(res.results.firstWhere((r) => r.mode == TransportMode.bus).source,
        FareSource.mock);
  });

  test('API failure falls back to cache with a warning', () async {
    final q = _q('Taipei', 'Kaohsiung', [TransportMode.tra]);
    await _service(client: _traOk)
        .search(query: q, offline: false, dataMode: DataMode.api);

    final res = await _service(client: _offline)
        .search(query: q, offline: false, dataMode: DataMode.api);
    expect(res.usedCache, isTrue);
    expect(res.warningCode, FareService.warningShowingCached);
    expect(res.results.single.source, FareSource.cache);
    expect(res.results.single.fares.adult, 994);
    expect(res.results.single.fares.studentEstimated, isTrue,
        reason: 'flag survives the cache round-trip');
  });

  test('API failure without cache throws (controller shows search_failed)',
      () async {
    await expectLater(
      _service(client: _offline).search(
          query: _q('Taipei', 'Tainan', [TransportMode.tra]),
          offline: false,
          dataMode: DataMode.api),
      throwsA(anything),
    );
  });

  test('offline mode reads cache only', () async {
    final s = _service();
    final q = _q('Taipei', 'Taichung', [TransportMode.mrt]);

    final empty =
        await s.search(query: q, offline: true, dataMode: DataMode.mock);
    expect(empty.results, isEmpty);

    await s.search(query: q, offline: false, dataMode: DataMode.mock);
    final cached =
        await s.search(query: q, offline: true, dataMode: DataMode.mock);
    expect(cached.results.single.source, FareSource.cache);
  });

  test('cache keeps at most 100 queries (LRU)', () async {
    final s = _service();
    final cities = [
      'Keelung',
      'Taipei',
      'New Taipei',
      'Banqiao',
      'Taoyuan',
      'Hsinchu',
      'Miaoli',
      'Taichung',
      'Changhua',
      'Yunlin',
      'Chiayi',
      'Tainan',
      'Kaohsiung'
    ];
    var n = 0;
    for (final a in cities) {
      for (final b in cities) {
        if (a == b) continue;
        await s.search(
            query: _q(a, b, [TransportMode.bus]),
            offline: false,
            dataMode: DataMode.mock);
        n++;
      }
    }
    expect(n, greaterThan(100));
    final stats = await s.getCacheStats(userId: 'u1');
    expect(stats.cachedQueries, 100);
  });

  test('clearCache only removes the given user', () async {
    final s = _service();
    await s.search(
        query: _q('Taipei', 'Tainan', [TransportMode.bus], userId: 'u1'),
        offline: false,
        dataMode: DataMode.mock);
    await s.search(
        query: _q('Taipei', 'Tainan', [TransportMode.bus], userId: 'u2'),
        offline: false,
        dataMode: DataMode.mock);

    await s.clearCache(userId: 'u1');
    expect((await s.getCacheStats(userId: 'u1')).cachedQueries, 0);
    expect((await s.getCacheStats(userId: 'u2')).cachedQueries, 1);
  });
}
