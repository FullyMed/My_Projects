import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:taiwan_fare_finder/models/fare_result.dart';
import 'package:taiwan_fare_finder/models/route_query.dart';
import 'package:taiwan_fare_finder/models/transport_mode.dart';
import 'package:taiwan_fare_finder/services/tdx_auth_service.dart';
import 'package:taiwan_fare_finder/services/tdx_fare_service.dart';

// Fixtures are real TDX responses captured through the proxy on 2026-10-01
// (THSR Taipei→Zuoying, TRA Taipei→Kaohsiung, and three THSR timetable rows:
// the fastest and slowest southbound Taipei→Zuoying trains plus one
// northbound train that must be ignored).
List<int> _fixture(String name) =>
    File('test/fixtures/$name').readAsBytesSync();

const _proxy = 'https://proxy.example/api/basic/v2';

RouteQuery _query(String origin, String destination, TransportMode mode) {
  final now = DateTime(2026, 10, 1);
  return RouteQuery(
      id: 'q',
      userId: 'u',
      origin: origin,
      destination: destination,
      modes: [mode],
      createdAt: now,
      updatedAt: now);
}

/// Serves fixtures by path and records every request. No charset header on
/// purpose: the service must decode JSON as UTF-8 regardless.
MockClient _tdxMock(List<http.Request> seen) => MockClient((req) async {
      seen.add(req);
      final path = req.url.path;
      final fixture = switch (path) {
        _ when path.endsWith('/Rail/THSR/ODFare') =>
          'thsr_odfare_1000_1070.json',
        _ when path.endsWith('/Rail/THSR/GeneralTimetable') =>
          'thsr_timetable_sample.json',
        _ when path.endsWith('/Rail/TRA/ODFare') => 'tra_odfare_1000_4400.json',
        _ => null,
      };
      if (fixture == null) return http.Response('not found', 404);
      return http.Response.bytes(_fixture(fixture), 200);
    });

void main() {
  group('TdxFareService (proxy mode)', () {
    late List<http.Request> seen;
    late TdxFareService service;

    setUp(() {
      seen = [];
      service = TdxFareService(
          authService: TdxAuthService(),
          proxyBaseUrl: _proxy,
          client: _tdxMock(seen));
    });

    test(
        'HSR: real adult fare, real concession for child + senior, estimated student',
        () async {
      final r = await service.fetch(
          query: _query('Taipei', 'Kaohsiung', TransportMode.hsr),
          mode: TransportMode.hsr,
          distanceKm: 340);

      expect(r.source, FareSource.live);
      expect(r.fares.adult, 1490);
      expect(r.fares.child, 745);
      expect(r.fares.senior, 745);
      expect(r.fares.student, 1267); // 85% estimate
      expect(r.fares.studentEstimated, isTrue);
    });

    test('HSR: duration is the fastest southbound train, northbound ignored',
        () async {
      final r = await service.fetch(
          query: _query('Taipei', 'Kaohsiung', TransportMode.hsr),
          mode: TransportMode.hsr,
          distanceKm: 340);
      expect(r.durationMinutes, 94);
    });

    test('TRA: adult/child from 成自/孩自, senior from 愛孩自', () async {
      final r = await service.fetch(
          query: _query('Taipei', 'Kaohsiung', TransportMode.tra),
          mode: TransportMode.tra,
          distanceKm: 340);

      expect(r.source, FareSource.live);
      expect(r.fares.adult, 994);
      expect(r.fares.child, 497);
      expect(r.fares.senior, 497);
      expect(r.fares.studentEstimated, isTrue);
    });

    test('proxy mode sends no Authorization header and uses the proxy base',
        () async {
      await service.fetch(
          query: _query('Taipei', 'Kaohsiung', TransportMode.tra),
          mode: TransportMode.tra,
          distanceKm: 340);

      expect(seen, isNotEmpty);
      for (final req in seen) {
        expect(req.url.toString(), startsWith(_proxy));
        expect(req.headers.containsKey('Authorization'), isFalse);
      }
      expect(seen.first.url.queryParameters[r'$filter'],
          "OriginStationID eq '1000' and DestinationStationID eq '4400'");
    });

    test('New Taipei resolves to Banqiao for HSR and TRA', () async {
      await service.fetch(
          query: _query('New Taipei', 'Kaohsiung', TransportMode.hsr),
          mode: TransportMode.hsr,
          distanceKm: 335);
      await service.fetch(
          query: _query('New Taipei', 'Kaohsiung', TransportMode.tra),
          mode: TransportMode.tra,
          distanceKm: 335);

      final filters = seen
          .map((r) => r.url.queryParameters[r'$filter'])
          .whereType<String>()
          .toList();
      expect(
          filters,
          contains(
              "OriginStationID eq '1010' and DestinationStationID eq '1070'"));
      expect(
          filters,
          contains(
              "OriginStationID eq '1020' and DestinationStationID eq '4400'"));
    });

    test('Keelung has no HSR: RouteNotServedException, no request sent',
        () async {
      await expectLater(
        service.fetch(
            query: _query('Keelung', 'Taipei', TransportMode.hsr),
            mode: TransportMode.hsr,
            distanceKm: 20),
        throwsA(isA<RouteNotServedException>()
            .having((e) => e.mode, 'mode', TransportMode.hsr)),
      );
      expect(seen, isEmpty);
    });

    test('non-HSR/TRA modes are rejected', () {
      expect(
          () => service.fetch(
              query: _query('Taipei', 'Taichung', TransportMode.bus),
              mode: TransportMode.bus,
              distanceKm: 150),
          throwsArgumentError);
    });

    test('HTTP error surfaces as an exception (caller falls back to cache)',
        () async {
      final failing = TdxFareService(
          authService: TdxAuthService(),
          proxyBaseUrl: _proxy,
          client: MockClient(
              (_) async => http.Response('{"error":"tdx_error"}', 502)));
      await expectLater(
        failing.fetch(
            query: _query('Taipei', 'Kaohsiung', TransportMode.tra),
            mode: TransportMode.tra,
            distanceKm: 340),
        throwsA(isA<Exception>()),
      );
    });

    test('malformed JSON surfaces as an exception', () async {
      final bad = TdxFareService(
          authService: TdxAuthService(),
          proxyBaseUrl: _proxy,
          client: MockClient((_) async => http.Response('<html>', 200)));
      await expectLater(
        bad.fetch(
            query: _query('Taipei', 'Kaohsiung', TransportMode.tra),
            mode: TransportMode.tra,
            distanceKm: 340),
        throwsA(isA<Exception>()),
      );
    });
  });

  test('direct mode without credentials fails instead of calling TDX',
      () async {
    final seen = <http.Request>[];
    final direct =
        TdxFareService(authService: TdxAuthService(), client: _tdxMock(seen));
    await expectLater(
      direct.fetch(
          query: _query('Taipei', 'Kaohsiung', TransportMode.tra),
          mode: TransportMode.tra,
          distanceKm: 340),
      throwsA(isA<StateError>()),
    );
    expect(seen, isEmpty);
  });
}
