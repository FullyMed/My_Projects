import 'dart:math';

import 'package:taiwan_fare_finder/models/transport_mode.dart';

/// Speed + boarding estimate for a given transport mode and distance.
///
/// Used by both [FareService] (mock path) and [TdxFareService] (API fallback).
/// Keep the two callers in sync by updating only this file.
int estimateTravelMinutes({required TransportMode mode, required int distanceKm}) {
  final speedKmh = switch (mode) {
    TransportMode.hsr => 235,
    TransportMode.tra => 105,
    TransportMode.mrt => 36,
    TransportMode.bus => 22,
    TransportMode.youBike => 14,
  };
  final boardingMin = switch (mode) {
    TransportMode.hsr => 18,
    TransportMode.tra => 14,
    TransportMode.mrt => 10,
    TransportMode.bus => 8,
    TransportMode.youBike => 4,
  };
  return max(6, max(1, (distanceKm / speedKmh * 60).round()) + boardingMin);
}
