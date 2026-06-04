import 'dart:convert';
import 'dart:math';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:taiwan_fare_finder/config/tdx_station_map.dart';
import 'package:taiwan_fare_finder/models/fare_result.dart';
import 'package:taiwan_fare_finder/models/route_query.dart';
import 'package:taiwan_fare_finder/models/transport_mode.dart';
import 'package:taiwan_fare_finder/services/tdx_auth_service.dart';
import 'package:taiwan_fare_finder/utils/travel_duration.dart';

class TdxFareService {
  TdxFareService({required this.authService});

  final TdxAuthService authService;

  static const _base = 'https://tdx.transportdata.tw/api/basic/v2';

  // In-memory timetable cache — refreshed every 12 hours.
  List<dynamic>? _timetable;
  DateTime? _timetableCachedAt;
  static const _timetableTtl = Duration(hours: 12);

  /// Fetches a real [FareResult] for [mode] from TDX.
  ///
  /// Only [TransportMode.hsr] and [TransportMode.tra] are supported.
  /// Throws [ArgumentError] for unsupported modes or missing station mappings.
  Future<FareResult> fetch({
    required RouteQuery query,
    required TransportMode mode,
    required int distanceKm,
  }) {
    return switch (mode) {
      TransportMode.hsr => _fetchHsr(query: query, distanceKm: distanceKm),
      TransportMode.tra => _fetchTra(query: query, distanceKm: distanceKm),
      _ => throw ArgumentError('TdxFareService.fetch does not support $mode'),
    };
  }

  // ---------------------------------------------------------------------------
  // HSR
  // ---------------------------------------------------------------------------

  Future<FareResult> _fetchHsr({
    required RouteQuery query,
    required int distanceKm,
  }) async {
    final originId = hsrStationId[query.origin] ??
        (throw ArgumentError(
            'No HSR station ID for origin "${query.origin}"'));
    final destId = hsrStationId[query.destination] ??
        (throw ArgumentError(
            'No HSR station ID for destination "${query.destination}"'));

    final token = await authService.getToken();

    final fares = await _fetchHsrFare(
        token: token, originId: originId, destId: destId);

    int duration;
    try {
      duration = await _fetchHsrDuration(
          token: token, originId: originId, destId: destId);
    } catch (e) {
      debugPrint('TdxFareService: HSR duration fetch failed, using mock: $e');
      duration = _durationFallback(mode: TransportMode.hsr, distanceKm: distanceKm);
    }

    final now = DateTime.now();
    return FareResult(
      id: 'api_hsr_${originId}_$destId',
      userId: query.userId,
      queryKey: query.cacheKey,
      mode: TransportMode.hsr,
      distanceKm: distanceKm,
      durationMinutes: duration,
      transferSummary: 'transfer_direct',
      fares: fares,
      source: FareSource.live,
      createdAt: now,
      updatedAt: now,
    );
  }

  Future<FareBreakdown> _fetchHsrFare({
    required String token,
    required String originId,
    required String destId,
  }) async {
    final uri = Uri.parse('$_base/Rail/THSR/ODFare').replace(queryParameters: {
      '\$format': 'JSON',
      '\$filter':
          "OriginStationID eq '$originId' and DestinationStationID eq '$destId'",
    });

    final resp =
        await http.get(uri, headers: {'Authorization': 'Bearer $token'});
    if (resp.statusCode != 200) {
      throw Exception(
          'THSR ODFare ${resp.statusCode} for $originId→$destId: ${resp.body}');
    }

    final list = jsonDecode(resp.body) as List<dynamic>;
    if (list.isEmpty) {
      throw Exception('THSR ODFare: no data for $originId→$destId');
    }

    final fares = ((list.first as Map<String, dynamic>)['Fares'] as List<dynamic>)
        .cast<Map<String, dynamic>>();

    // Standard adult seat: TicketType=1 (full price), FareClass=1 (standard),
    // CabinClass=1 (standard car).
    final adultEntry = fares.firstWhere(
      (f) => f['TicketType'] == 1 && f['FareClass'] == 1 && f['CabinClass'] == 1,
      orElse: () =>
          throw Exception('THSR ODFare: adult standard fare entry not found'),
    );

    final adult = adultEntry['Price'] as int;
    return FareBreakdown(
      adult: adult,
      student: max(10, (adult * 0.85).round()),
      child: max(10, (adult * 0.50).round()),
      senior: max(10, (adult * 0.80).round()),
    );
  }

  Future<int> _fetchHsrDuration({
    required String token,
    required String originId,
    required String destId,
  }) async {
    await _ensureTimetable(token);

    int? minMinutes;

    for (final entry in _timetable!) {
      final tt = (entry as Map<String, dynamic>)['GeneralTimetable']
          as Map<String, dynamic>?;
      if (tt == null) continue;
      final stops = (tt['StopTimes'] as List<dynamic>?)
          ?.cast<Map<String, dynamic>>();
      if (stops == null) continue;

      // Walk the stop list once, in order — origin must come before destination.
      Map<String, dynamic>? originStop;
      Map<String, dynamic>? destStop;
      for (final s in stops) {
        if (s['StationID'] == originId && originStop == null) {
          originStop = s;
        } else if (s['StationID'] == destId && originStop != null) {
          destStop = s;
          break;
        }
      }
      if (originStop == null || destStop == null) continue;

      final dep = _parseHhmm(originStop['DepartureTime'] as String?);
      final arr = _parseHhmm(destStop['ArrivalTime'] as String?);
      if (dep == null || arr == null) continue;

      var minutes = arr.inMinutes - dep.inMinutes;
      if (minutes <= 0) minutes += 24 * 60; // crosses midnight

      if (minMinutes == null || minutes < minMinutes) minMinutes = minutes;
    }

    if (minMinutes == null) {
      throw Exception(
          'THSR timetable: no direct trains found for $originId→$destId');
    }
    return minMinutes;
  }

  Future<void> _ensureTimetable(String token) async {
    final cached = _timetableCachedAt;
    if (_timetable != null &&
        cached != null &&
        DateTime.now().difference(cached) < _timetableTtl) {
      return;
    }

    final uri = Uri.parse('$_base/Rail/THSR/GeneralTimetable')
        .replace(queryParameters: {'\$format': 'JSON'});

    final resp =
        await http.get(uri, headers: {'Authorization': 'Bearer $token'});
    if (resp.statusCode != 200) {
      throw Exception(
          'THSR GeneralTimetable ${resp.statusCode}: ${resp.body}');
    }

    _timetable = jsonDecode(resp.body) as List<dynamic>;
    _timetableCachedAt = DateTime.now();
  }

  Duration? _parseHhmm(String? s) {
    if (s == null) return null;
    final parts = s.split(':');
    if (parts.length != 2) return null;
    final h = int.tryParse(parts[0]);
    final m = int.tryParse(parts[1]);
    if (h == null || m == null) return null;
    return Duration(hours: h, minutes: m);
  }

  // ---------------------------------------------------------------------------
  // TRA
  // ---------------------------------------------------------------------------

  Future<FareResult> _fetchTra({
    required RouteQuery query,
    required int distanceKm,
  }) async {
    final originId = traStationId[query.origin] ??
        (throw ArgumentError(
            'No TRA station ID for origin "${query.origin}"'));
    final destId = traStationId[query.destination] ??
        (throw ArgumentError(
            'No TRA station ID for destination "${query.destination}"'));

    final token = await authService.getToken();

    final fares = await _fetchTraFare(
        token: token, originId: originId, destId: destId);

    // TRA timetables are too fragmented across train types to compute a reliable
    // minimum duration; use the same speed-based estimate as the mock path.
    final duration =
        _durationFallback(mode: TransportMode.tra, distanceKm: distanceKm);

    final now = DateTime.now();
    return FareResult(
      id: 'api_tra_${originId}_$destId',
      userId: query.userId,
      queryKey: query.cacheKey,
      mode: TransportMode.tra,
      distanceKm: distanceKm,
      durationMinutes: duration,
      transferSummary: 'transfer_direct',
      fares: fares,
      source: FareSource.live,
      createdAt: now,
      updatedAt: now,
    );
  }

  Future<FareBreakdown> _fetchTraFare({
    required String token,
    required String originId,
    required String destId,
  }) async {
    final uri = Uri.parse('$_base/Rail/TRA/ODFare').replace(queryParameters: {
      '\$format': 'JSON',
      '\$filter':
          "OriginStationID eq '$originId' and DestinationStationID eq '$destId'",
    });

    final resp =
        await http.get(uri, headers: {'Authorization': 'Bearer $token'});
    if (resp.statusCode != 200) {
      throw Exception(
          'TRA ODFare ${resp.statusCode} for $originId→$destId: ${resp.body}');
    }

    final list = jsonDecode(resp.body) as List<dynamic>;
    if (list.isEmpty) {
      throw Exception('TRA ODFare: no data for $originId→$destId');
    }

    final fares = ((list.first as Map<String, dynamic>)['Fares'] as List<dynamic>)
        .cast<Map<String, dynamic>>();

    // TRA TicketType is a Chinese string. The API returns fares by train class
    // (Ziqiang 自強, Juguang 莒光, Fuhsing 復興, Puyama 普快) × passenger type
    // (成=adult, 孩=child). No explicit student or senior ticket type is present
    // in the v2 response — those are computed below.
    int? adult;
    int? child;

    for (final f in fares) {
      final type = f['TicketType'] as String?;
      final price = f['Price'] as int?;
      if (type == null || price == null) continue;
      // '成自' = adult Ziqiang (fastest class, full-price baseline).
      if (type == '成自') adult = price;
      // '孩自' = child Ziqiang.
      if (type == '孩自') child = price;
    }

    if (adult == null) {
      throw Exception(
          'TRA ODFare: adult Ziqiang fare (成自) not found for $originId→$destId');
    }
    child ??= max(10, (adult * 0.50).round());

    return FareBreakdown(
      adult: adult,
      student: max(10, (adult * 0.85).round()),
      child: child,
      senior: max(10, (adult * 0.80).round()),
    );
  }

  // ---------------------------------------------------------------------------
  // Shared helpers
  // ---------------------------------------------------------------------------

  int _durationFallback({required TransportMode mode, required int distanceKm}) =>
      estimateTravelMinutes(mode: mode, distanceKm: distanceKm);
}
