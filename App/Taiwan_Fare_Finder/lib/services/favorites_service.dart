import 'package:flutter/foundation.dart';
import 'package:taiwan_fare_finder/models/favorite_route.dart';
import 'package:taiwan_fare_finder/models/transport_mode.dart';
import 'package:taiwan_fare_finder/services/local_storage_service.dart';
import 'package:taiwan_fare_finder/utils/id_generator.dart';

class FavoritesService {
  FavoritesService({required this.storage});

  final LocalStorageService storage;

  static const _key = 'tff_favorites';
  static const int _maxItems = 100;

  Future<List<FavoriteRoute>> load({required String userId}) async {
    final list = await storage.readList(_key);
    final out = <FavoriteRoute>[];
    for (final item in list) {
      final fav = FavoriteRoute.fromJson(item);
      if (fav != null && fav.userId == userId) out.add(fav);
    }
    return out;
  }

  Future<List<FavoriteRoute>> add({required String userId, required String origin, required String destination, required List<TransportMode> modes, String? label}) async {
    final current = await load(userId: userId);

    // De-duplicate: if the same route already exists, remove it before re-adding
    // at the top (treat as "touch").
    final normalizedKey = '${origin.trim().toLowerCase()}__${destination.trim().toLowerCase()}__${modes.map((e) => e.storageKey).join('-')}';
    final deduped = current.where((f) => '${f.origin.trim().toLowerCase()}__${f.destination.trim().toLowerCase()}__${f.modes.map((m) => m.storageKey).join('-')}' != normalizedKey).toList();

    // Graceful handling: do not exceed max favorites.
    // If already full (and we're not replacing an existing route), keep the
    // existing list and log a debug note.
    if (deduped.length >= _maxItems) {
      debugPrint('FavoritesService: max favorites reached ($_maxItems). Skipping add.');
      return current;
    }

    final now = DateTime.now();
    final fav = FavoriteRoute(id: IdGenerator.next(), userId: userId, label: (label == null || label.trim().isEmpty) ? '$origin → $destination' : label.trim(), origin: origin, destination: destination, modes: modes, createdAt: now, updatedAt: now);
    final next = [fav, ...deduped];
    await storage.writeList(_key, next.map((e) => e.toJson()).toList());
    return next;
  }

  Future<List<FavoriteRoute>> remove({required String userId, required String favoriteId}) async {
    final current = await load(userId: userId);
    final next = current.where((e) => e.id != favoriteId).toList();
    await storage.writeList(_key, next.map((e) => e.toJson()).toList());
    return next;
  }

  Future<void> clear({required String userId}) async {
    final all = await storage.readList(_key);
    final kept = <Map<String, dynamic>>[];
    for (final item in all) {
      final fav = FavoriteRoute.fromJson(item);
      if (fav == null || fav.userId != userId) kept.add(item);
    }
    await storage.writeList(_key, kept);
  }
}
