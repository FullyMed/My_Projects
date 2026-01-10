import 'package:flutter/material.dart';

enum DataMode { mock, api }

class AppSettings {
  const AppSettings({required this.id, required this.userId, required this.themeMode, required this.localeTag, required this.offlineMode, required this.dataMode, required this.createdAt, required this.updatedAt});

  final String id;
  final String userId;
  final ThemeMode themeMode;
  final String localeTag; // e.g. en, zh_Hant, id
  final bool offlineMode;
  final DataMode dataMode;
  final DateTime createdAt;
  final DateTime updatedAt;

  AppSettings copyWith({String? id, String? userId, ThemeMode? themeMode, String? localeTag, bool? offlineMode, DataMode? dataMode, DateTime? createdAt, DateTime? updatedAt}) => AppSettings(id: id ?? this.id, userId: userId ?? this.userId, themeMode: themeMode ?? this.themeMode, localeTag: localeTag ?? this.localeTag, offlineMode: offlineMode ?? this.offlineMode, dataMode: dataMode ?? this.dataMode, createdAt: createdAt ?? this.createdAt, updatedAt: updatedAt ?? this.updatedAt);

  Map<String, dynamic> toJson() => {"id": id, "userId": userId, "themeMode": themeMode.name, "localeTag": localeTag, "offlineMode": offlineMode, "dataMode": dataMode.name, "created_at": createdAt.toIso8601String(), "updated_at": updatedAt.toIso8601String()};

  static AppSettings fromJson(Map<String, dynamic> json) => AppSettings(
    id: (json["id"] ?? "").toString(),
    userId: (json["userId"] ?? "").toString(),
    themeMode: _themeMode((json["themeMode"] ?? "system").toString()),
    localeTag: (json["localeTag"] ?? "en").toString(),
    offlineMode: (json["offlineMode"] as bool?) ?? false,
    dataMode: _dataMode((json["dataMode"] ?? "mock").toString()),
    createdAt: _dt(json["created_at"]) ?? DateTime.now(),
    updatedAt: _dt(json["updated_at"]) ?? DateTime.now(),
  );

  static ThemeMode _themeMode(String v) => switch (v) { "light" => ThemeMode.light, "dark" => ThemeMode.dark, _ => ThemeMode.system };

  static DataMode _dataMode(String v) => switch (v) { "api" => DataMode.api, _ => DataMode.mock };

  static DateTime? _dt(dynamic v) {
    if (v == null) return null;
    if (v is DateTime) return v;
    if (v is int) return DateTime.fromMillisecondsSinceEpoch(v);
    if (v is String) return DateTime.tryParse(v);
    return null;
  }
}
