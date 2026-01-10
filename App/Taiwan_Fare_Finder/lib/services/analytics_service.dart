import 'package:flutter/foundation.dart';

/// Lightweight analytics hook placeholder.
///
/// This intentionally does NOT send data anywhere yet.
/// TODO: Replace with real analytics provider (and consent UI) before enabling
/// any production tracking.
class AnalyticsService {
  const AnalyticsService();

  void logEvent(String name, {Map<String, Object?> params = const {}}) {
    // Keep it cheap and safe for now.
    debugPrint('Analytics(TODO): $name ${params.isEmpty ? '' : params}');
  }
}
