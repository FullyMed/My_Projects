import 'package:taiwan_fare_finder/models/transport_mode.dart';

class RouteQuery {
  const RouteQuery({required this.id, required this.userId, required this.origin, required this.destination, required this.modes, required this.createdAt, required this.updatedAt});

  final String id;
  final String userId;
  final String origin;
  final String destination;
  final List<TransportMode> modes;
  final DateTime createdAt;
  final DateTime updatedAt;

  String get cacheKey {
    final sorted = [...modes]..sort((a, b) => a.storageKey.compareTo(b.storageKey));
    return "${origin.trim().toLowerCase()}__${destination.trim().toLowerCase()}__${sorted.map((e) => e.storageKey).join('-')}";
  }

  RouteQuery copyWith({String? id, String? userId, String? origin, String? destination, List<TransportMode>? modes, DateTime? createdAt, DateTime? updatedAt}) => RouteQuery(id: id ?? this.id, userId: userId ?? this.userId, origin: origin ?? this.origin, destination: destination ?? this.destination, modes: modes ?? this.modes, createdAt: createdAt ?? this.createdAt, updatedAt: updatedAt ?? this.updatedAt);

  Map<String, dynamic> toJson() => {"id": id, "userId": userId, "origin": origin, "destination": destination, "modes": modes.map((e) => e.storageKey).toList(), "created_at": createdAt.toIso8601String(), "updated_at": updatedAt.toIso8601String()};

  static RouteQuery fromJson(Map<String, dynamic> json) {
    final raw = (json["modes"] as List?)?.map((e) => e.toString()).toList() ?? <String>[];
    final modes = raw.map(TransportModeX.fromStorageKey).whereType<TransportMode>().toList();
    return RouteQuery(id: (json["id"] ?? "").toString(), userId: (json["userId"] ?? "").toString(), origin: (json["origin"] ?? "").toString(), destination: (json["destination"] ?? "").toString(), modes: modes, createdAt: _dt(json["created_at"]) ?? DateTime.now(), updatedAt: _dt(json["updated_at"]) ?? DateTime.now());
  }

  static DateTime? _dt(dynamic v) {
    if (v == null) return null;
    if (v is DateTime) return v;
    if (v is int) return DateTime.fromMillisecondsSinceEpoch(v);
    if (v is String) return DateTime.tryParse(v);
    return null;
  }
}
