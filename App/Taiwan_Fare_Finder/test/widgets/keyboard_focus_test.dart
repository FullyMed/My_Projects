import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:taiwan_fare_finder/main.dart';
import 'package:taiwan_fare_finder/nav.dart';
import 'package:taiwan_fare_finder/ui/tff_focus_ring.dart';

// Own file on purpose: AppRouter.router is a static singleton, so each app
// instance under test gets a fresh isolate.

Map<String, dynamic> _arb(String tag) =>
    jsonDecode(File('lib/l10n/app_$tag.arb').readAsStringSync())
        as Map<String, dynamic>;

/// A TffFocusRing currently drawing its outline.
final _visibleRing = find.descendant(
  of: find.byType(TffFocusRing),
  matching: find.byWidgetPredicate((w) =>
      w is DecoratedBox &&
      w.position == DecorationPosition.foreground &&
      (w.decoration as BoxDecoration).border != null),
);

void main() {
  final en = _arb('en');
  final id = _arb('id');

  setUp(() {
    SharedPreferences.setMockInitialValues({});
    PackageInfo.setMockInitialValues(
        appName: 'Taiwan Fare Finder',
        packageName: 'com.felix.taiwanfarefinder',
        version: '1.0.0',
        buildNumber: '1',
        buildSignature: '');
  });

  testWidgets('Tab reaches the Settings choices, shows a ring, and Space picks one', (tester) async {
    tester.view.physicalSize = const Size(1280, 900);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);

    await tester.pumpWidget(const TffApp());
    await tester.pumpAndSettle();
    AppRouter.router.go(AppRoutes.settings);
    await tester.pumpAndSettle();

    expect(_visibleRing, findsNothing, reason: 'no ring before keyboard use');

    // Tab until focus lands on the "Bahasa Indonesia" choice.
    final indonesian = find.text(en['settingsLanguageIndonesian'] as String);
    var reached = false;
    for (var i = 0; i < 20 && !reached; i++) {
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pumpAndSettle();
      final focusContext = FocusManager.instance.primaryFocus?.context;
      reached = focusContext != null &&
          find.descendant(of: find.byWidget(focusContext.widget), matching: indonesian).evaluate().isNotEmpty;
    }
    expect(reached, isTrue, reason: 'keyboard focus reaches the language choices');
    expect(_visibleRing, findsOneWidget, reason: 'the focused choice draws its ring');

    // Space activates it: the whole UI switches to Indonesian.
    await tester.sendKeyEvent(LogicalKeyboardKey.space);
    await tester.pumpAndSettle();
    expect(find.text(id['settings'] as String), findsWidgets);
  });
}
