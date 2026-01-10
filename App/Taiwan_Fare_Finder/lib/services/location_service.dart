import 'package:flutter/foundation.dart';
import 'package:taiwan_fare_finder/models/location.dart';

class LocationService {
  static const List<Location> starterLocations = [
    Location(
      id: 'city_taipei',
      nameEn: 'Taipei',
      nameZhHant: '台北',
      nameId: 'Taipei',
      cityEn: 'Taipei',
      cityZhHant: '台北',
      cityId: 'Taipei',
    ),
    Location(
      id: 'city_new_taipei',
      nameEn: 'New Taipei',
      nameZhHant: '新北',
      nameId: 'New Taipei',
      cityEn: 'New Taipei',
      cityZhHant: '新北',
      cityId: 'New Taipei',
    ),
    Location(
      id: 'city_taoyuan',
      nameEn: 'Taoyuan',
      nameZhHant: '桃園',
      nameId: 'Taoyuan',
      cityEn: 'Taoyuan',
      cityZhHant: '桃園',
      cityId: 'Taoyuan',
    ),
    Location(
      id: 'city_hsinchu',
      nameEn: 'Hsinchu',
      nameZhHant: '新竹',
      nameId: 'Hsinchu',
      cityEn: 'Hsinchu',
      cityZhHant: '新竹',
      cityId: 'Hsinchu',
    ),
    Location(
      id: 'city_taichung',
      nameEn: 'Taichung',
      nameZhHant: '台中',
      nameId: 'Taichung',
      cityEn: 'Taichung',
      cityZhHant: '台中',
      cityId: 'Taichung',
    ),
    Location(
      id: 'city_tainan',
      nameEn: 'Tainan',
      nameZhHant: '台南',
      nameId: 'Tainan',
      cityEn: 'Tainan',
      cityZhHant: '台南',
      cityId: 'Tainan',
    ),
    Location(
      id: 'city_kaohsiung',
      nameEn: 'Kaohsiung',
      nameZhHant: '高雄',
      nameId: 'Kaohsiung',
      cityEn: 'Kaohsiung',
      cityZhHant: '高雄',
      cityId: 'Kaohsiung',
    ),
    Location(
      id: 'city_keelung',
      nameEn: 'Keelung',
      nameZhHant: '基隆',
      nameId: 'Keelung',
      cityEn: 'Keelung',
      cityZhHant: '基隆',
      cityId: 'Keelung',
    ),
    Location(
      id: 'city_banqiao',
      nameEn: 'Banqiao',
      nameZhHant: '板橋',
      nameId: 'Banqiao',
      cityEn: 'New Taipei',
      cityZhHant: '新北',
      cityId: 'New Taipei',
    ),
    Location(
      id: 'city_chiayi',
      nameEn: 'Chiayi',
      nameZhHant: '嘉義',
      nameId: 'Chiayi',
      cityEn: 'Chiayi',
      cityZhHant: '嘉義',
      cityId: 'Chiayi',
    ),
    Location(
      id: 'city_changhua',
      nameEn: 'Changhua',
      nameZhHant: '彰化',
      nameId: 'Changhua',
      cityEn: 'Changhua',
      cityZhHant: '彰化',
      cityId: 'Changhua',
    ),
    Location(
      id: 'city_yunlin',
      nameEn: 'Yunlin',
      nameZhHant: '雲林',
      nameId: 'Yunlin',
      cityEn: 'Yunlin',
      cityZhHant: '雲林',
      cityId: 'Yunlin',
    ),
    Location(
      id: 'city_miaoli',
      nameEn: 'Miaoli',
      nameZhHant: '苗栗',
      nameId: 'Miaoli',
      cityEn: 'Miaoli',
      cityZhHant: '苗栗',
      cityId: 'Miaoli',
    ),
  ];

  /// Curated list that should feel helpful even before the user has history.
  static List<Location> popular() {
    final ids = {
      'city_taipei',
      'city_banqiao',
      'city_taoyuan',
      'city_hsinchu',
      'city_taichung',
      'city_tainan',
      'city_kaohsiung',
    };
    return starterLocations.where((l) => ids.contains(l.id)).toList();
  }

  static List<Location> filter(String query) {
    final q = query.trim().toLowerCase();
    if (q.isEmpty) return const [];
    return starterLocations.where((l) {
      return l.nameEn.toLowerCase().contains(q) ||
          l.nameZhHant.toLowerCase().contains(q) ||
          l.nameId.toLowerCase().contains(q) ||
          l.cityEn.toLowerCase().contains(q) ||
          l.cityZhHant.toLowerCase().contains(q) ||
          l.cityId.toLowerCase().contains(q);
    }).toList();
  }

  static Location? findByAnyName(String raw) {
    final q = raw.trim().toLowerCase();
    if (q.isEmpty) return null;
    try {
      return starterLocations.firstWhere((l) {
        return l.nameEn.trim().toLowerCase() == q || l.nameZhHant.trim().toLowerCase() == q || l.nameId.trim().toLowerCase() == q;
      });
    } catch (_) {
      debugPrint('LocationService: could not map "$raw" to a starter location.');
      return null;
    }
  }

  static Map<String, List<Location>> groupByCityEn(Iterable<Location> locations) {
    final map = <String, List<Location>>{};
    for (final l in locations) {
      map.putIfAbsent(l.cityEn, () => <Location>[]).add(l);
    }
    for (final entry in map.entries) {
      entry.value.sort((a, b) => a.nameEn.compareTo(b.nameEn));
    }
    return map;
  }
}
