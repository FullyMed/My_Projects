import 'package:flutter/widgets.dart';

/// Breakpoints aligned with Material 3 window size classes.
///
/// Compact  < 600dp  → phone portrait
/// Medium   600–840  → large phone / small tablet
/// Expanded 840–1200 → tablet / small laptop
/// Large    ≥ 1200   → laptop / desktop
class TffAdaptive {
  const TffAdaptive._();

  static const double _compactMax = 600.0;
  static const double _mediumMax = 840.0;
  static const double _expandedMax = 1200.0;

  // ── Window size class checks ─────────────────────────────────────────────

  /// Phone portrait: < 600dp
  static bool isPhone(BuildContext context) =>
      MediaQuery.sizeOf(context).width < _compactMax;

  /// Large phone / small tablet: 600–840dp
  static bool isMedium(BuildContext context) {
    final w = MediaQuery.sizeOf(context).width;
    return w >= _compactMax && w < _mediumMax;
  }

  /// Tablet / small laptop: 840–1200dp
  static bool isExpanded(BuildContext context) {
    final w = MediaQuery.sizeOf(context).width;
    return w >= _mediumMax && w < _expandedMax;
  }

  /// Laptop / desktop: >= 1200dp
  static bool isLarge(BuildContext context) =>
      MediaQuery.sizeOf(context).width >= _expandedMax;

  // ── Navigation layout helpers ────────────────────────────────────────────

  /// Use BottomNavigationBar: screen width < 840dp
  static bool useBottomNav(BuildContext context) =>
      MediaQuery.sizeOf(context).width < _mediumMax;

  /// Use NavigationRail: screen width >= 840dp
  static bool useNavRail(BuildContext context) =>
      MediaQuery.sizeOf(context).width >= _mediumMax;

  /// Use extended (always-labelled) NavigationRail: screen width >= 1200dp
  static bool useExtendedNavRail(BuildContext context) =>
      MediaQuery.sizeOf(context).width >= _expandedMax;

  // ── Content layout helper ────────────────────────────────────────────────

  /// Switch to two-column / side-by-side content layout.
  /// Matches useNavRail so navigation and content breakpoints are in sync.
  static bool isWide(BuildContext context) =>
      MediaQuery.sizeOf(context).width >= _mediumMax;

  // ── Legacy aliases ───────────────────────────────────────────────────────
  static bool isTablet(BuildContext context) => useNavRail(context);
  static bool isCompact(BuildContext context) => isPhone(context);
}
