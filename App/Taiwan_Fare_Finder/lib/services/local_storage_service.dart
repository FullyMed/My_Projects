import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LocalStorageService {
  const LocalStorageService();

  Future<SharedPreferences?> _prefs() async {
    try {
      return await SharedPreferences.getInstance();
    } catch (e) {
      debugPrint('LocalStorageService: failed to init prefs: $e');
      return null;
    }
  }

  Future<Map<String, dynamic>?> readMap(String key) async {
    try {
      final prefs = await _prefs();
      final raw = prefs?.getString(key);
      if (raw == null || raw.trim().isEmpty) return null;
      final decoded = jsonDecode(raw);
      return decoded is Map<String, dynamic> ? decoded : null;
    } catch (e) {
      debugPrint('LocalStorageService: readMap($key) failed: $e');
      return null;
    }
  }

  Future<void> writeMap(String key, Map<String, dynamic> value) async {
    try {
      final prefs = await _prefs();
      await prefs?.setString(key, jsonEncode(value));
    } catch (e) {
      debugPrint('LocalStorageService: writeMap($key) failed: $e');
    }
  }

  Future<List<Map<String, dynamic>>> readList(String key) async {
    try {
      final prefs = await _prefs();
      final raw = prefs?.getString(key);
      if (raw == null || raw.trim().isEmpty) return <Map<String, dynamic>>[];
      final decoded = jsonDecode(raw);
      if (decoded is! List) return <Map<String, dynamic>>[];
      final out = <Map<String, dynamic>>[];
      for (final item in decoded) {
        if (item is Map<String, dynamic>) out.add(item);
      }
      if (out.length != decoded.length) {
        await writeList(key, out);
      }
      return out;
    } catch (e) {
      debugPrint('LocalStorageService: readList($key) failed: $e');
      return <Map<String, dynamic>>[];
    }
  }

  Future<void> writeList(String key, List<Map<String, dynamic>> value) async {
    try {
      final prefs = await _prefs();
      await prefs?.setString(key, jsonEncode(value));
    } catch (e) {
      debugPrint('LocalStorageService: writeList($key) failed: $e');
    }
  }

  Future<void> remove(String key) async {
    try {
      final prefs = await _prefs();
      await prefs?.remove(key);
    } catch (e) {
      debugPrint('LocalStorageService: remove($key) failed: $e');
    }
  }
}
