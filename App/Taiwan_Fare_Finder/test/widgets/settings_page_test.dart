import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:taiwan_fare_finder/main.dart';

// Own file on purpose: AppRouter.router is a static singleton, so each app
// instance under test gets a fresh isolate.

Map<String, dynamic> _arb(String tag) =>
    jsonDecode(File('lib/l10n/app_$tag.arb').readAsStringSync())
        as Map<String, dynamic>;

void main() {
  final en = _arb('en');

  setUp(() {
    SharedPreferences.setMockInitialValues({});
    PackageInfo.setMockInitialValues(
        appName: 'Taiwan Fare Finder',
        packageName: 'com.felix.taiwanfarefinder',
        version: '1.0.0',
        buildNumber: '1',
        buildSignature: '');
  });

  testWidgets('Settings opens and closes, showing cache counts',
      (tester) async {
    tester.view.physicalSize = const Size(800, 1800);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);

    await tester.pumpWidget(const TffApp());
    await tester.pumpAndSettle();

    await tester.tap(find.byTooltip(en['settings'] as String).first);
    await tester.pumpAndSettle();
    expect(find.text(en['manageOfflineData'] as String), findsOneWidget);

    await tester.tap(find.byTooltip(en['cancel'] as String));
    await tester.pumpAndSettle();
    expect(find.text(en['manageOfflineData'] as String), findsNothing);
    expect(find.text(en['searchFares'] as String), findsWidgets);
  });
}
