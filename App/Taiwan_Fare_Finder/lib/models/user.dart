class User {
  const User({required this.id, required this.displayName, required this.createdAt, required this.updatedAt});

  final String id;
  final String displayName;
  final DateTime createdAt;
  final DateTime updatedAt;

  User copyWith({String? id, String? displayName, DateTime? createdAt, DateTime? updatedAt}) => User(id: id ?? this.id, displayName: displayName ?? this.displayName, createdAt: createdAt ?? this.createdAt, updatedAt: updatedAt ?? this.updatedAt);

  Map<String, dynamic> toJson() => {"id": id, "displayName": displayName, "created_at": createdAt.toIso8601String(), "updated_at": updatedAt.toIso8601String()};

  static User fromJson(Map<String, dynamic> json) => User(id: (json["id"] ?? "").toString(), displayName: (json["displayName"] ?? "").toString(), createdAt: _dt(json["created_at"]) ?? DateTime.now(), updatedAt: _dt(json["updated_at"]) ?? DateTime.now());

  static DateTime? _dt(dynamic v) {
    if (v == null) return null;
    if (v is DateTime) return v;
    if (v is int) return DateTime.fromMillisecondsSinceEpoch(v);
    if (v is String) return DateTime.tryParse(v);
    return null;
  }
}
