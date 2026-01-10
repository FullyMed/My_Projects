import 'package:flutter/widgets.dart';

/// A pickable origin/destination location.
///
/// v1 ships with a static starter dataset, but this model is designed to
/// later be backed by an API (id + localized names + optional coordinates).
class Location {
  const Location({
    required this.id,
    required this.nameEn,
    required this.nameZhHant,
    required this.nameId,
    required this.cityEn,
    required this.cityZhHant,
    required this.cityId,
    this.lat,
    this.lng,
  });

  final String id;
  final String nameEn;
  final String nameZhHant;
  final String nameId;
  final String cityEn;
  final String cityZhHant;
  final String cityId;
  final double? lat;
  final double? lng;

  String nameForLocale(Locale locale) {
    if (locale.languageCode == 'zh') return nameZhHant;
    if (locale.languageCode == 'id') return nameId;
    return nameEn;
  }

  String cityForLocale(Locale locale) {
    if (locale.languageCode == 'zh') return cityZhHant;
    if (locale.languageCode == 'id') return cityId;
    return cityEn;
  }

  /// Stable query token to pass into the v1 offline mock service.
  ///
  /// Today this maps to English city/stop names (to match the mock dataset).
  /// In the future, this can be replaced with an API id.
  String get queryToken => nameEn;
}
