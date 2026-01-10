import 'package:taiwan_fare_finder/models/transport_mode.dart';

class SearchHistoryEntry {
  const SearchHistoryEntry({required this.id, required this.userId, required this.origin, required this.destination, required this.modes, required this.ranAt, required this.createdAt, required this.updatedAt});

  final String id;
  final String userId;
  final String origin;
  final String destination;
  final List<TransportMode> modes;
  final DateTime ranAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  SearchHistoryEntry copyWith({String? id, String? userId, String? origin, String? destination, List<TransportMode>? modes, DateTime? ranAt, DateTime? createdAt, DateTime? updatedAt}) => SearchHistoryEntry(id: id ?? this.id, userId: userId ?? this.userId, origin: origin ?? this.origin, destination: destination ?? this.destination, modes: modes ?? this.modes, ranAt: ranAt ?? this.ranAt, createdAt: createdAt ?? this.createdAt, updatedAt: updatedAt ?? this.updatedAt);

  Map<String, dynamic> toJson() => {"id": id, "userId": userId, "origin": origin, "destination": destination, "modes": modes.map((e) => e.storageKey).toList(), "ranAt": ranAt.toIso8601String(), "created_at": createdAt.toIso8601String(), "updated_at": updatedAt.toIso8601String()};

  static SearchHistoryEntry? fromJson(Map<String, dynamic> json) {
    final raw = (json["modes"] as List?)?.map((e) => e.toString()).toList() ?? <String>[];
    final modes = raw.map(TransportModeX.fromStorageKey).whereType<TransportMode>().toList();
    if (modes.isEmpty) return null;
    final ranAt = _dt(json["ranAt"]) ?? _dt(json["created_at"]) ?? DateTime.now();
    return SearchHistoryEntry(id: (json["id"] ?? "").toString(), userId: (json["userId"] ?? "").toString(), origin: (json["origin"] ?? "").toString(), destination: (json["destination"] ?? "").toString(), modes: modes, ranAt: ranAt, createdAt: _dt(json["created_at"]) ?? DateTime.now(), updatedAt: _dt(json["updated_at"]) ?? DateTime.now());
  }

  static DateTime? _dt(dynamic v) {
    if (v == null) return null;
    if (v is DateTime) return v;
    if (v is int) return DateTime.fromMillisecondsSinceEpoch(v);
    if (v is String) return DateTime.tryParse(v);
    return null;
  }
}
