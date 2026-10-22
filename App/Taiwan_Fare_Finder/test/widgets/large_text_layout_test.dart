import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:taiwan_fare_finder/main.dart';
import 'package:taiwan_fare_finder/nav.dart';
import 'package:taiwan_fare_finder/ui/fare_result_card.dart';

// Own file on purpose: AppRouter.router is a static singleton, so each app
// instance under test gets a fresh isolate.
//
// Large system text at phone width, in the longest language (Indonesian), with
// real content on every page: saved routes, history, a Search result and a
// three-mode comparison. Any RenderFlex overflow fails the test.

Map<String, dynamic> _arb(String tag) =>
    jsonDecode(File('lib/l10n/app_$tag.arb').readAsStringSync())
        as Map<String, dynamic>;

void main() {
  final id = _arb('id');
  const ts = '2026-10-22T09:00:00.000';

  setUp(() {
    PackageInfo.setMockInitialValues(
        appName: 'Taiwan Fare Finder',
        packageName: 'com.felix.taiwanfarefinder',
        version: '1.0.0',
        buildNumber: '1',
        buildSignature: '');
    SharedPreferences.setMockInitialValues({
      'tff_user': jsonEncode({'id': 'u1', 'displayName': 'Local User', 'created_at': ts, 'updated_at': ts}),
      'tff_settings': jsonEncode({'id': 's1', 'userId': 'u1', 'themeMode': 'light', 'localeTag': 'id', 'offlineMode': false, 'dataMode': 'mock', 'created_at': ts, 'updated_at': ts}),
      'tff_favorites': jsonEncode([
        {'id': 'f1', 'userId': 'u1', 'label': '', 'origin': 'New Taipei', 'destination': 'Kaohsiung', 'modes': ['hsr'], 'created_at': ts, 'updated_at': ts},
      ]),
      'tff_history': jsonEncode([
        {'id': 'h1', 'userId': 'u1', 'origin': 'Taoyuan', 'destination': 'Changhua', 'modes': ['hsr', 'tra', 'youbike'], 'ranAt': ts, 'created_at': ts, 'updated_at': ts},
      ]),
    });
  });

  testWidgets('every page fits at 375 dp with 200% text in Indonesian', (tester) async {
    tester.view.physicalSize = const Size(375, 2400);
    tester.view.devicePixelRatio = 1;
    tester.platformDispatcher.textScaleFactorTestValue = 2.0;
    addTearDown(tester.view.reset);
    addTearDown(tester.platformDispatcher.clearTextScaleFactorTestValue);

    await tester.pumpWidget(const TffApp());
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull, reason: 'search, empty');

    // Saved page: favorite tab and history tab.
    await tester.tap(find.text(id['tabSaved'] as String).last);
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull, reason: 'saved routes');
    await tester.tap(find.text(id['history'] as String).first);
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull, reason: 'history');

    // Re-run the three-mode history entry: lands on Compare with 3 results.
    await tester.tap(find.byTooltip(id['rerun'] as String).first);
    await tester.pumpAndSettle();
    expect(find.byType(FareResultCard), findsNWidgets(3));
    expect(tester.takeException(), isNull, reason: 'compare results');

    // Re-run the single-mode favorite: lands on Search with a result.
    await tester.tap(find.text(id['tabSaved'] as String).last);
    await tester.pumpAndSettle();
    await tester.tap(find.text(id['favorites'] as String).first);
    await tester.pumpAndSettle();
    await tester.tap(find.byTooltip(id['rerun'] as String).first);
    await tester.pumpAndSettle();
    expect(find.byType(FareResultCard), findsOneWidget);
    expect(tester.takeException(), isNull, reason: 'search result');

    for (final route in [AppRoutes.settings, AppRoutes.terms, AppRoutes.privacy, '/no-such-page']) {
      AppRouter.router.go(route);
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull, reason: route);
    }
  });
}
