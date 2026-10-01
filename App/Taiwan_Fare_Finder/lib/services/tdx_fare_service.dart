import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:taiwan_fare_finder/config/tdx_station_map.dart';
import 'package:taiwan_fare_finder/models/fare_result.dart';
import 'package:taiwan_fare_finder/models/route_query.dart';
import 'package:taiwan_fare_finder/models/transport_mode.dart';
import 'package:taiwan_fare_finder/services/tdx_auth_service.dart';
import 'package:taiwan_fare_finder/utils/travel_duration.dart';

/// Thrown when a city has no station for the requested mode (e.g. Keelung has
/// no HSR). Not a failure: [FareService] reports the mode as "not served"
/// instead of failing the whole search.
class RouteNotServedException implements Exception {
  const RouteNotServedException(this.mode, this.city);

  final TransportMode mode;
  final String city;

  @override
  String toString() => 'RouteNotServedException: ${mode.storageKey} does not serve "$city"';
}

class TdxFareService {
  TdxFareService({required this.authService, this.proxyBaseUrl = '', http.Client? client}) : _injectedClient = client;

  final TdxAuthService authService;
  final http.Client? _injectedClient;
  http.Client? _defaultClient;

  /// Created on first use, so mock-only sessions never open a connection pool.
  http.Client get _client => _injectedClient ?? (_defaultClient ??= http.Client());

  /// When non-empty, all TDX traffic is routed through this base URL (a proxy
  /// that injects the bearer token server-side). Should point at the proxy's
  /// equivalent of `https://tdx.transportdata.tw/api/basic/v2`.
  final String proxyBaseUrl;

  static const _directBase = 'https://tdx.transportdata.tw/api/basic/v2';

  bool get _useProxy => proxyBaseUrl.isNotEmpty;

  String get _base => _useProxy ? proxyBaseUrl : _directBase;

  /// Valid TDX station IDs are short alphanumeric strings (e.g. `1000`, `0900`).
  /// Guards the OData `$filter` interpolation below against anything unexpected
  /// if the station maps ever become dynamic / API-backed.
  static final RegExp _stationIdPattern = RegExp(r'^[0-9A-Za-z]{2,10}$');

  // In-memory timetable cache — refreshed every 12 hours.
  List<dynamic>? _timetable;
  DateTime? _timetableCachedAt;
  static const _timetableTtl = Duration(hours: 12);

  /// Fetches a real [FareResult] for [mode] from TDX (directly or via proxy).
  ///
  /// Only [TransportMode.hsr] and [TransportMode.tra] are supported.
  /// Throws [RouteNotServedException] when origin or destination has no station
  /// for [mode], [ArgumentError] for unsupported modes or malformed station
  /// IDs, and [StateError] when a direct call would leak the baked-in secret
  /// (web build with no proxy configured).
  Future<FareResult> fetch({
    required RouteQuery query,
    required TransportMode mode,
    required int distanceKm,
  }) {
    if (kIsWeb && !_useProxy) {
      throw StateError(
          'TdxFareService: refusing a direct TDX call from a web build — '
          'configure TFF_PROXY_BASE_URL so the client secret is not shipped.');
    }
    return switch (mode) {
      TransportMode.hsr => _fetchHsr(query: query, distanceKm: distanceKm),
      TransportMode.tra => _fetchTra(query: query, distanceKm: distanceKm),
      _ => throw ArgumentError('TdxFareService.fetch does not support $mode'),
    };
  }

  /// Auth header for a TDX request. Empty when proxying (the proxy adds it).
  Future<Map<String, String>> _authHeaders() async {
    if (_useProxy) return const {};
    final token = await authService.getToken();
    return {'Authorization': 'Bearer $token'};
  }

  String _requireStationId(Map<String, String> map, String city,
      {required TransportMode mode}) {
    final id = map[city];
    if (id == null) throw RouteNotServedException(mode, city);
    if (!_stationIdPattern.hasMatch(id)) {
      throw ArgumentError(
          'TdxFareService: invalid ${mode.storageKey} station id for "$city"');
    }
    return id;
  }

  // ---------------------------------------------------------------------------
  // HSR
  // ---------------------------------------------------------------------------

  Future<FareResult> _fetchHsr({
    required RouteQuery query,
    required int distanceKm,
  }) async {
    final originId =
        _requireStationId(hsrStationId, query.origin, mode: TransportMode.hsr);
    final destId = _requireStationId(hsrStationId, query.destination,
        mode: TransportMode.hsr);

    final headers = await _authHeaders();

    final fares = await _fetchHsrFare(
        headers: headers, originId: originId, destId: destId);

    int duration;
    try {
      duration = await _fetchHsrDuration(
          headers: headers, originId: originId, destId: destId);
    } catch (e) {
      debugPrint(
          'TdxFareService: HSR duration fetch failed, using estimate: $e');
      duration =
          _durationFallback(mode: TransportMode.hsr, distanceKm: distanceKm);
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
    required Map<String, String> headers,
    required String originId,
    required String destId,
  }) async {
    final uri = Uri.parse('$_base/Rail/THSR/ODFare').replace(queryParameters: {
      '\$format': 'JSON',
      '\$filter':
          "OriginStationID eq '$originId' and DestinationStationID eq '$destId'",
    });

    final resp = await _client.get(uri, headers: headers);
    if (resp.statusCode != 200) {
      throw Exception(
          'THSR ODFare HTTP ${resp.statusCode} for $originId→$destId');
    }

    final list = _asJsonList(utf8.decode(resp.bodyBytes), context: 'THSR ODFare');
    if (list.isEmpty) {
      throw Exception('THSR ODFare: no data for $originId→$destId');
    }

    final first = list.first;
    if (first is! Map<String, dynamic>) {
      throw Exception(
          'THSR ODFare: unexpected row shape for $originId→$destId');
    }
    final rawFares = first['Fares'];
    if (rawFares is! List) {
      throw Exception('THSR ODFare: missing Fares for $originId→$destId');
    }
    final fares = rawFares.whereType<Map<String, dynamic>>().toList();

    // Standard adult seat: TicketType=1 (full price), FareClass=1 (standard),
    // CabinClass=1 (standard car).
    final adultEntry = fares.firstWhere(
      (f) =>
          f['TicketType'] == 1 && f['FareClass'] == 1 && f['CabinClass'] == 1,
      orElse: () =>
          throw Exception('THSR ODFare: adult standard fare entry not found'),
    );

    final adult =
        _asPositiveInt(adultEntry['Price'], context: 'THSR adult Price');

    // FareClass=9 is the concession fare (children, seniors 65+, disabled) —
    // half price. Fall back to 50% if TDX ever omits it.
    final concessionEntry = fares.where((f) =>
        f['TicketType'] == 1 && f['FareClass'] == 9 && f['CabinClass'] == 1);
    final concessionPrice = concessionEntry.isEmpty
        ? null
        : int.tryParse('${concessionEntry.first['Price']}');
    final concession = (concessionPrice != null && concessionPrice > 0)
        ? concessionPrice
        : _pct(adult, 0.50);

    // THSR has no fixed student ticket (student discounts vary by train), so
    // the student tier is an estimate and flagged as such.
    return FareBreakdown(
      adult: adult,
      student: _pct(adult, 0.85),
      child: concession,
      senior: concession,
      studentEstimated: true,
    );
  }

  Future<int> _fetchHsrDuration({
    required Map<String, String> headers,
    required String originId,
    required String destId,
  }) async {
    await _ensureTimetable(headers);

    int? minMinutes;

    for (final entry in _timetable!) {
      if (entry is! Map<String, dynamic>) continue;
      final tt = entry['GeneralTimetable'];
      if (tt is! Map<String, dynamic>) continue;
      final stops = tt['StopTimes'];
      if (stops is! List) continue;

      // Walk the stop list once, in order — origin must come before destination.
      Map<String, dynamic>? originStop;
      Map<String, dynamic>? destStop;
      for (final s in stops) {
        if (s is! Map<String, dynamic>) continue;
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

  Future<void> _ensureTimetable(Map<String, String> headers) async {
    final cached = _timetableCachedAt;
    if (_timetable != null &&
        cached != null &&
        DateTime.now().difference(cached) < _timetableTtl) {
      return;
    }

    final uri = Uri.parse('$_base/Rail/THSR/GeneralTimetable')
        .replace(queryParameters: {'\$format': 'JSON'});

    final resp = await _client.get(uri, headers: headers);
    if (resp.statusCode != 200) {
      throw Exception('THSR GeneralTimetable HTTP ${resp.statusCode}');
    }

    _timetable = _asJsonList(utf8.decode(resp.bodyBytes), context: 'THSR GeneralTimetable');
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
    final originId =
        _requireStationId(traStationId, query.origin, mode: TransportMode.tra);
    final destId = _requireStationId(traStationId, query.destination,
        mode: TransportMode.tra);

    final headers = await _authHeaders();

    final fares = await _fetchTraFare(
        headers: headers, originId: originId, destId: destId);

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
    required Map<String, String> headers,
    required String originId,
    required String destId,
  }) async {
    final uri = Uri.parse('$_base/Rail/TRA/ODFare').replace(queryParameters: {
      '\$format': 'JSON',
      '\$filter':
          "OriginStationID eq '$originId' and DestinationStationID eq '$destId'",
    });

    final resp = await _client.get(uri, headers: headers);
    if (resp.statusCode != 200) {
      throw Exception(
          'TRA ODFare HTTP ${resp.statusCode} for $originId→$destId');
    }

    final list = _asJsonList(utf8.decode(resp.bodyBytes), context: 'TRA ODFare');
    if (list.isEmpty) {
      throw Exception('TRA ODFare: no data for $originId→$destId');
    }

    final first = list.first;
    if (first is! Map<String, dynamic>) {
      throw Exception('TRA ODFare: unexpected row shape for $originId→$destId');
    }
    final rawFares = first['Fares'];
    if (rawFares is! List) {
      throw Exception('TRA ODFare: missing Fares for $originId→$destId');
    }
    final fares = rawFares.whereType<Map<String, dynamic>>().toList();

    // TRA TicketType is a Chinese string. The API returns fares by train class
    // (Ziqiang 自強, Juguang 莒光, Fuhsing 復興, Puyama 普快) × passenger type
    // (成=adult, 孩=child, 愛孩=concession: seniors 65+ / disabled / children).
    // No student ticket type exists — that tier is estimated below.
    int? adult;
    int? child;
    int? concession;

    for (final f in fares) {
      final type = f['TicketType'];
      final price = f['Price'];
      if (type is! String || price is! int) continue;
      // '成自' = adult Ziqiang (fastest class, full-price baseline).
      if (type == '成自') adult = price;
      // '孩自' = child Ziqiang.
      if (type == '孩自') child = price;
      // '愛孩自' = concession Ziqiang (what seniors pay).
      if (type == '愛孩自') concession = price;
    }

    if (adult == null || adult <= 0) {
      throw Exception(
          'TRA ODFare: adult Ziqiang fare (成自) not found for $originId→$destId');
    }
    final adultFare = adult;
    final childFare =
        (child != null && child > 0) ? child : _pct(adultFare, 0.50);
    final seniorFare =
        (concession != null && concession > 0) ? concession : childFare;

    return FareBreakdown(
      adult: adultFare,
      student: _pct(adultFare, 0.85),
      child: childFare,
      senior: seniorFare,
      studentEstimated: true,
    );
  }

  // ---------------------------------------------------------------------------
  // Shared helpers
  // ---------------------------------------------------------------------------

  List<dynamic> _asJsonList(String body, {required String context}) {
    final Object? decoded;
    try {
      decoded = jsonDecode(body);
    } catch (_) {
      throw Exception('$context: response was not valid JSON');
    }
    if (decoded is! List) {
      throw Exception('$context: expected a JSON array');
    }
    return decoded;
  }

  int _asPositiveInt(Object? value, {required String context}) {
    final n = value is int ? value : int.tryParse('$value');
    if (n == null || n <= 0) {
      throw Exception('$context: expected a positive integer, got "$value"');
    }
    return n;
  }

  int _pct(int base, double factor) {
    final v = (base * factor).round();
    return v < 10 ? 10 : v;
  }

  int _durationFallback(
          {required TransportMode mode, required int distanceKm}) =>
      estimateTravelMinutes(mode: mode, distanceKm: distanceKm);
}
