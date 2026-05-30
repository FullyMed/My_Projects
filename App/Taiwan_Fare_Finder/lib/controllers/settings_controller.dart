import 'package:flutter/material.dart';
import 'package:taiwan_fare_finder/models/app_settings.dart';
import 'package:taiwan_fare_finder/services/settings_service.dart';

class SettingsController extends ChangeNotifier {
  SettingsController({required this.settingsService});

  final SettingsService settingsService;

  AppSettings? _settings;
  bool _loading = true;
  String? _userId;
  String? _boundUserId;
  String? get boundUserId => _boundUserId;

  static const String _localUserId = 'local';

  String _resolveUserId(String? userId) =>
      (userId == null || userId.isEmpty) ? _localUserId : userId;

  bool get isLoading => _loading;
  AppSettings? get settings => _settings;
  ThemeMode get themeMode => _settings?.themeMode ?? ThemeMode.system;
  bool get offlineMode => _settings?.offlineMode ?? false;
  DataMode get dataMode => _settings?.dataMode ?? DataMode.mock;

  Locale? get locale {
    final tag = _settings?.localeTag ?? 'en';
    if (tag == 'zh_Hant' || tag == 'zh-Hant')
      return const Locale.fromSubtags(languageCode: 'zh', scriptCode: 'Hant');
    if (tag == 'zh') return const Locale('zh');
    if (tag == 'id') return const Locale('id');
    return const Locale('en');
  }

  Future<void> bindUser(String? userId) async {
    final resolved = _resolveUserId(userId);

    if (_boundUserId == resolved) return;
    _boundUserId = resolved;

    if (_userId == resolved && _settings != null) return;
    _userId = resolved;

    await _load();
  }

  Future<void> _load() async {
    _loading = true;
    notifyListeners();
    try {
      final loaded =
          await settingsService.load(userId: _userId ?? _localUserId);
      _settings = loaded;
    } catch (e) {
      debugPrint('SettingsController: load failed: $e');
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    if (_settings == null) {
      // Ensure the UI isn't "dead" if this gets tapped before initial load completes.
      await bindUser(_userId);
      if (_settings == null) return;
    }
    _settings = _settings!.copyWith(themeMode: mode);
    notifyListeners();
    await settingsService.save(_settings!);
  }

  Future<void> setLocaleTag(String tag) async {
    if (_settings == null) {
      await bindUser(_userId);
      if (_settings == null) return;
    }
    _settings = _settings!.copyWith(localeTag: tag);
    notifyListeners();
    await settingsService.save(_settings!);
  }

  Future<void> setOfflineMode(bool v) async {
    if (_settings == null) {
      await bindUser(_userId);
      if (_settings == null) return;
    }
    _settings = _settings!.copyWith(offlineMode: v);
    notifyListeners();
    await settingsService.save(_settings!);
  }

  Future<void> setDataMode(DataMode v) async {
    if (_settings == null) {
      await bindUser(_userId);
      if (_settings == null) return;
    }
    _settings = _settings!.copyWith(dataMode: v);
    notifyListeners();
    await settingsService.save(_settings!);
  }
}
