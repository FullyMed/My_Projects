import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:taiwan_fare_finder/models/transport_mode.dart';
import 'package:taiwan_fare_finder/services/favorites_service.dart';
import 'package:taiwan_fare_finder/services/history_service.dart';
import 'package:taiwan_fare_finder/services/local_storage_service.dart';

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));

  group('HistoryService', () {
    final history = HistoryService(storage: const LocalStorageService());

    test('same route in a different mode order is de-duplicated', () async {
      await history.add(
          userId: 'u1',
          origin: 'Taipei',
          destination: 'Tainan',
          modes: [TransportMode.hsr, TransportMode.tra]);
      final list = await history.add(
          userId: 'u1',
          origin: 'Taipei',
          destination: 'Tainan',
          modes: [TransportMode.tra, TransportMode.hsr]);
      expect(list, hasLength(1));
    });

    test('adding/removing for one user keeps other users\' entries', () async {
      await history.add(
          userId: 'u2',
          origin: 'Keelung',
          destination: 'Taipei',
          modes: [TransportMode.tra]);
      final mine = await history.add(
          userId: 'u1',
          origin: 'Taipei',
          destination: 'Tainan',
          modes: [TransportMode.hsr]);
      await history.remove(userId: 'u1', entryId: mine.first.id);

      expect(await history.load(userId: 'u1'), isEmpty);
      expect(await history.load(userId: 'u2'), hasLength(1));
    });

    test('keeps the 50 most recent entries', () async {
      final cities = [
        'Keelung',
        'Taipei',
        'Taoyuan',
        'Hsinchu',
        'Miaoli',
        'Taichung',
        'Changhua',
        'Yunlin'
      ];
      for (final a in cities) {
        for (final b in cities) {
          if (a == b) continue;
          await history.add(
              userId: 'u1',
              origin: a,
              destination: b,
              modes: [TransportMode.bus]);
        }
      }
      expect(await history.load(userId: 'u1'), hasLength(50));
    });
  });

  group('FavoritesService', () {
    final favorites = FavoritesService(storage: const LocalStorageService());

    test('toggle semantics: same route + modes is one favorite', () async {
      await favorites.add(
          userId: 'u1',
          origin: 'Taipei',
          destination: 'Tainan',
          modes: [TransportMode.bus, TransportMode.mrt]);
      final list = await favorites.add(
          userId: 'u1',
          origin: 'Taipei',
          destination: 'Tainan',
          modes: [TransportMode.mrt, TransportMode.bus]);
      expect(list, hasLength(1));
    });

    test('other users\' favorites survive add/remove/clear', () async {
      await favorites.add(
          userId: 'u2',
          origin: 'Keelung',
          destination: 'Taipei',
          modes: [TransportMode.tra]);
      final mine = await favorites.add(
          userId: 'u1',
          origin: 'Taipei',
          destination: 'Tainan',
          modes: [TransportMode.hsr]);
      await favorites.remove(userId: 'u1', favoriteId: mine.first.id);
      await favorites.add(
          userId: 'u1',
          origin: 'Taipei',
          destination: 'Chiayi',
          modes: [TransportMode.hsr]);
      await favorites.clear(userId: 'u1');

      expect(await favorites.load(userId: 'u1'), isEmpty);
      expect(await favorites.load(userId: 'u2'), hasLength(1));
    });
  });
}
