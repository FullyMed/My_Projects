import 'package:flutter/material.dart';
import 'package:taiwan_fare_finder/models/app_settings.dart';
import 'package:taiwan_fare_finder/services/local_storage_service.dart';
import 'package:taiwan_fare_finder/utils/id_generator.dart';

class SettingsService {
  SettingsService({required this.storage});

  final LocalStorageService storage;

  static const _key = 'tff_settings';

  Future<AppSettings> load({required String userId}) async {
    try {
      final existing = await storage.readMap(_key);
      if (existing != null) {
        final settings = AppSettings.fromJson(existing);
        if (settings.userId == userId && settings.id.isNotEmpty) return settings;
      }
    } catch (e) {
      debugPrint('SettingsService: load failed: $e');
    }

    final now = DateTime.now();
    final created = AppSettings(id: IdGenerator.next(), userId: userId, themeMode: ThemeMode.system, localeTag: 'en', offlineMode: false, dataMode: DataMode.mock, createdAt: now, updatedAt: now);
    await save(created);
    return created;
  }

  Future<void> save(AppSettings settings) async {
    try {
      await storage.writeMap(_key, settings.copyWith(updatedAt: DateTime.now()).toJson());
    } catch (e) {
      debugPrint('SettingsService: save failed: $e');
    }
  }

  Future<void> clear() => storage.remove(_key);
}
