import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:taiwan_fare_finder/pages/compare_page.dart';
import 'package:taiwan_fare_finder/pages/saved_page.dart';
import 'package:taiwan_fare_finder/pages/search_page.dart';
import 'package:taiwan_fare_finder/pages/settings_page.dart';
import 'package:taiwan_fare_finder/pages/shell_page.dart';

class AppRouter {
  static final GoRouter router = GoRouter(
    initialLocation: AppRoutes.search,
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
        pageBuilder: (context, state) => CustomTransitionPage(
          child: const SettingsPage(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            final curved = CurvedAnimation(parent: animation, curve: Curves.easeOutCubic);
            return FadeTransition(opacity: curved, child: SlideTransition(position: Tween<Offset>(begin: const Offset(0, 0.06), end: Offset.zero).animate(curved), child: child));
          },
        ),
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
}
