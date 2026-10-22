import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:taiwan_fare_finder/pages/compare_page.dart';
import 'package:taiwan_fare_finder/pages/not_found_page.dart';
import 'package:taiwan_fare_finder/pages/privacy_page.dart';
import 'package:taiwan_fare_finder/pages/saved_page.dart';
import 'package:taiwan_fare_finder/pages/search_page.dart';
import 'package:taiwan_fare_finder/pages/settings_page.dart';
import 'package:taiwan_fare_finder/pages/shell_page.dart';
import 'package:taiwan_fare_finder/pages/terms_page.dart';
import 'package:taiwan_fare_finder/theme.dart';

class AppRouter {
  static final GoRouter router = GoRouter(
    initialLocation: AppRoutes.search,
    errorBuilder: (context, state) => const NotFoundPage(),
    routes: [
      GoRoute(path: AppRoutes.root, redirect: (_, __) => AppRoutes.search),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) => ShellPage(navigationShell: navigationShell),
        branches: [
          StatefulShellBranch(routes: [GoRoute(path: AppRoutes.search, pageBuilder: (context, state) => const NoTransitionPage(child: SearchPage()))]),
          StatefulShellBranch(routes: [GoRoute(path: AppRoutes.compare, pageBuilder: (context, state) => const NoTransitionPage(child: ComparePage()))]),
          StatefulShellBranch(routes: [GoRoute(path: AppRoutes.saved, pageBuilder: (context, state) => const NoTransitionPage(child: SavedPage()))]),
        ],
      ),
      GoRoute(
        path: AppRoutes.settings,
        pageBuilder: (context, state) => _pushedPage(context, const SettingsPage()),
      ),
      GoRoute(
        path: AppRoutes.terms,
        pageBuilder: (context, state) => _pushedPage(context, const TermsPage()),
      ),
      GoRoute(
        path: AppRoutes.privacy,
        pageBuilder: (context, state) => _pushedPage(context, const PrivacyPolicyPage()),
      ),
    ],
  );
}

class AppRoutes {
  static const String root = '/';
  static const String search = '/search';
  static const String compare = '/compare';
  static const String saved = '/saved';
  static const String settings = '/settings';
  static const String terms = '/terms';
  static const String privacy = '/privacy';
}

/// Closes a pushed full-screen page (Settings / Terms / Privacy). When there is
/// nothing to pop — e.g. the page was opened directly by URL on web — goes to
/// Search instead of throwing.
void closePushedPage(BuildContext context) {
  if (context.canPop()) {
    context.pop();
  } else {
    context.go(AppRoutes.search);
  }
}

/// Transition for pages pushed over the shell (Settings / Terms / Privacy):
/// a short fade with a small rise (4% of the height), ease-out in and a
/// quicker exit. With reduced motion it's a plain fade, no movement.
CustomTransitionPage<void> _pushedPage(BuildContext context, Widget child) {
  final reduced = TffMotion.reduced(context);
  return CustomTransitionPage<void>(
    child: child,
    transitionDuration: const Duration(milliseconds: 260),
    reverseTransitionDuration: const Duration(milliseconds: 180),
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      final curved = CurvedAnimation(parent: animation, curve: TffMotion.easeOut, reverseCurve: Curves.easeIn);
      final faded = FadeTransition(opacity: curved, child: child);
      if (reduced) return faded;
      return SlideTransition(
        position: Tween<Offset>(begin: const Offset(0, 0.04), end: Offset.zero).animate(curved),
        child: faded,
      );
    },
  );
}
