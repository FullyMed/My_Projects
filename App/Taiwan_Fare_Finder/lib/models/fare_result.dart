import 'package:taiwan_fare_finder/models/transport_mode.dart';

class FareBreakdown {
  const FareBreakdown({required this.adult, required this.student, required this.child, required this.senior});

  final int adult;
  final int student;
  final int child;
  final int senior;

  FareBreakdown copyWith({int? adult, int? student, int? child, int? senior}) => FareBreakdown(adult: adult ?? this.adult, student: student ?? this.student, child: child ?? this.child, senior: senior ?? this.senior);

  Map<String, dynamic> toJson() => {"adult": adult, "student": student, "child": child, "senior": senior};

  static FareBreakdown fromJson(Map<String, dynamic> json) => FareBreakdown(adult: _i(json["adult"]) ?? 0, student: _i(json["student"]) ?? 0, child: _i(json["child"]) ?? 0, senior: _i(json["senior"]) ?? 0);

  static int? _i(dynamic v) {
    if (v == null) return null;
    if (v is int) return v;
    return int.tryParse(v.toString());
  }
}

enum FareSource { mock, cache, live }

class FareResult {
  const FareResult({required this.id, required this.userId, required this.queryKey, required this.mode, required this.distanceKm, required this.durationMinutes, required this.transferSummary, required this.fares, required this.source, required this.createdAt, required this.updatedAt});

  final String id;
  final String userId;
  final String queryKey;
  final TransportMode mode;
  final int distanceKm;
  final int durationMinutes;
  final String transferSummary;
  final FareBreakdown fares;
  final FareSource source;
  final DateTime createdAt;
  final DateTime updatedAt;

  /// Compatibility accessor for the spec wording “durationMin”.
  int get durationMin => durationMinutes;

  FareResult copyWith({String? id, String? userId, String? queryKey, TransportMode? mode, int? distanceKm, int? durationMinutes, String? transferSummary, FareBreakdown? fares, FareSource? source, DateTime? createdAt, DateTime? updatedAt}) => FareResult(id: id ?? this.id, userId: userId ?? this.userId, queryKey: queryKey ?? this.queryKey, mode: mode ?? this.mode, distanceKm: distanceKm ?? this.distanceKm, durationMinutes: durationMinutes ?? this.durationMinutes, transferSummary: transferSummary ?? this.transferSummary, fares: fares ?? this.fares, source: source ?? this.source, createdAt: createdAt ?? this.createdAt, updatedAt: updatedAt ?? this.updatedAt);

  Map<String, dynamic> toJson() => {
    "id": id,
    "userId": userId,
    "queryKey": queryKey,
    "mode": mode.storageKey,
    "distanceKm": distanceKm,
    // New canonical key name:
    "durationMin": durationMinutes,
    // Backward compatible key name:
    "durationMinutes": durationMinutes,
    "transferSummary": transferSummary,
    "fares": fares.toJson(),
    "source": source.name,
    "created_at": createdAt.toIso8601String(),
    "updated_at": updatedAt.toIso8601String(),
  };

  static FareResult? fromJson(Map<String, dynamic> json) {
    final mode = TransportModeX.fromStorageKey((json["mode"] ?? "").toString());
    if (mode == null) return null;
    final faresJson = json["fares"];
    if (faresJson is! Map<String, dynamic>) return null;
    return FareResult(
      id: (json["id"] ?? "").toString(),
      userId: (json["userId"] ?? "").toString(),
      queryKey: (json["queryKey"] ?? "").toString(),
      mode: mode,
      distanceKm: _i(json["distanceKm"]) ?? 0,
      durationMinutes: _i(json["durationMin"]) ?? _i(json["durationMinutes"]) ?? 0,
      transferSummary: (json["transferSummary"] ?? "").toString(),
      fares: FareBreakdown.fromJson(faresJson),
      source: _source((json["source"] ?? "cache").toString()),
      createdAt: _dt(json["created_at"]) ?? DateTime.now(),
      updatedAt: _dt(json["updated_at"]) ?? DateTime.now(),
    );
  }

  static FareSource _source(String v) => switch (v) { "mock" => FareSource.mock, "live" => FareSource.live, _ => FareSource.cache };

  static int? _i(dynamic v) {
    if (v == null) return null;
    if (v is int) return v;
    return int.tryParse(v.toString());
  }

  static DateTime? _dt(dynamic v) {
    if (v == null) return null;
    if (v is DateTime) return v;
    if (v is int) return DateTime.fromMillisecondsSinceEpoch(v);
    if (v is String) return DateTime.tryParse(v);
    return null;
  }
}
