import 'package:taiwan_fare_finder/models/search_history_entry.dart';
import 'package:taiwan_fare_finder/models/transport_mode.dart';
import 'package:taiwan_fare_finder/services/local_storage_service.dart';
import 'package:taiwan_fare_finder/utils/id_generator.dart';

class HistoryService {
  HistoryService({required this.storage});

  final LocalStorageService storage;

  static const _key = 'tff_history';
  static const int _maxItems = 50;

  Future<List<SearchHistoryEntry>> load({required String userId}) async {
    final list = await storage.readList(_key);
    final out = <SearchHistoryEntry>[];
    for (final item in list) {
      final entry = SearchHistoryEntry.fromJson(item);
      if (entry != null && entry.userId == userId) out.add(entry);
    }
    out.sort((a, b) => b.ranAt.compareTo(a.ranAt));
    return out;
  }

  Future<List<SearchHistoryEntry>> add({required String userId, required String origin, required String destination, required List<TransportMode> modes}) async {
    final current = await load(userId: userId);
    final now = DateTime.now();
    final normalizedKey = _routeKey(origin, destination, modes);
    final deduped = current.where((e) => _routeKey(e.origin, e.destination, e.modes) != normalizedKey).toList();
    final entry = SearchHistoryEntry(id: IdGenerator.next(), userId: userId, origin: origin, destination: destination, modes: modes, ranAt: now, createdAt: now, updatedAt: now);
    final next = [entry, ...deduped];
    final trimmed = next.take(_maxItems).toList();
    await _writeForUser(userId, trimmed);
    return trimmed;
  }

  Future<List<SearchHistoryEntry>> remove({required String userId, required String entryId}) async {
    final current = await load(userId: userId);
    final next = current.where((e) => e.id != entryId).toList();
    await _writeForUser(userId, next);
    return next;
  }

  Future<void> clear({required String userId}) async {
    final all = await storage.readList(_key);
    final kept = <Map<String, dynamic>>[];
    for (final item in all) {
      final entry = SearchHistoryEntry.fromJson(item);
      if (entry == null || entry.userId != userId) kept.add(item);
    }
    await storage.writeList(_key, kept);
  }

  /// Same route regardless of mode order (Compare passes a Set's order).
  static String _routeKey(String origin, String destination, List<TransportMode> modes) {
    final keys = modes.map((m) => m.storageKey).toList()..sort();
    return '${origin.trim().toLowerCase()}__${destination.trim().toLowerCase()}__${keys.join('-')}';
  }

  /// Replaces [userId]'s rows while keeping every other user's rows intact.
  Future<void> _writeForUser(String userId, List<SearchHistoryEntry> items) async {
    final all = await storage.readList(_key);
    final others = <Map<String, dynamic>>[];
    for (final item in all) {
      final parsed = SearchHistoryEntry.fromJson(item);
      if (parsed == null || parsed.userId != userId) others.add(item);
    }
    await storage.writeList(_key, [...items.map((e) => e.toJson()), ...others]);
  }
}
