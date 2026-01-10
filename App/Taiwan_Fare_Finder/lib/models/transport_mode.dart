enum TransportMode { hsr, tra, mrt, bus, youBike }

extension TransportModeX on TransportMode {
  String get storageKey => switch (this) { TransportMode.hsr => "hsr", TransportMode.tra => "tra", TransportMode.mrt => "mrt", TransportMode.bus => "bus", TransportMode.youBike => "youbike" };

  static TransportMode? fromStorageKey(String key) {
    return switch (key) {
      "hsr" => TransportMode.hsr,
      "tra" => TransportMode.tra,
      "mrt" => TransportMode.mrt,
      "bus" => TransportMode.bus,
      "youbike" => TransportMode.youBike,
      _ => null
    };
  }
}
