import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:taiwan_fare_finder/main.dart';
import 'package:taiwan_fare_finder/nav.dart';

// Own file on purpose: AppRouter.router is a static singleton, so each app
// instance under test gets a fresh isolate.

Map<String, dynamic> _arb(String tag) =>
    jsonDecode(File('lib/l10n/app_$tag.arb').readAsStringSync())
        as Map<String, dynamic>;

void main() {
  final en = _arb('en');
  const ts = '2026-10-01T09:00:00.000';

  setUp(() {
    PackageInfo.setMockInitialValues(
        appName: 'Taiwan Fare Finder',
        packageName: 'com.felix.taiwanfarefinder',
        version: '1.0.0',
        buildNumber: '1',
        buildSignature: '');
    // Wide layouts (nav rail + two-column pages), including a short window.
    SharedPreferences.setMockInitialValues({
      'tff_user': jsonEncode({
        'id': 'u1',
        'displayName': 'Local User',
        'created_at': ts,
        'updated_at': ts
      }),
      'tff_settings': jsonEncode({
        'id': 's1',
        'userId': 'u1',
        'themeMode': 'system',
        'localeTag': 'en',
        'offlineMode': false,
        'dataMode': 'mock',
        'created_at': ts,
        'updated_at': ts
      }),
    });
  });

  testWidgets('every page fits a short desktop window', (tester) async {
    tester.view.physicalSize = const Size(1280, 640);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);

    await tester.pumpWidget(const TffApp());
    await tester.pumpAndSettle();

    await tester.tap(find.text(en['tabCompare'] as String).last);
    await tester.pumpAndSettle();

    // A RenderFlex overflow is reported as a test exception.
    expect(tester.takeException(), isNull);
    expect(find.text(en['compareSortLabel'] as String), findsOneWidget);
    expect(find.text(en['selectAll'] as String), findsOneWidget);

    // Every other page at the same width.
    for (final route in [
      AppRoutes.search,
      AppRoutes.saved,
      AppRoutes.settings,
      AppRoutes.terms,
      AppRoutes.privacy,
      '/no-such-page',
    ]) {
      AppRouter.router.go(route);
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull, reason: route);
    }
  });
}
