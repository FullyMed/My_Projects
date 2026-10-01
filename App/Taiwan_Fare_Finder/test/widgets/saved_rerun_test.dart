import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:taiwan_fare_finder/main.dart';
import 'package:taiwan_fare_finder/ui/fare_result_card.dart';

Map<String, dynamic> _arb(String tag) =>
    jsonDecode(File('lib/l10n/app_$tag.arb').readAsStringSync())
        as Map<String, dynamic>;

void main() {
  final zh = _arb('zh_Hant');
  const ts = '2026-10-01T09:00:00.000';

  setUp(() {
    // An existing user with Traditional Chinese selected and one multi-mode
    // history entry (stored with English query tokens, as the app does).
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
        'localeTag': 'zh_Hant',
        'offlineMode': false,
        'dataMode': 'mock',
        'created_at': ts,
        'updated_at': ts
      }),
      'tff_history': jsonEncode([
        {
          'id': 'h1',
          'userId': 'u1',
          'origin': 'Taipei',
          'destination': 'Tainan',
          'modes': ['hsr', 'tra'],
          'ranAt': ts,
          'created_at': ts,
          'updated_at': ts
        },
      ]),
    });
  });

  testWidgets(
      'history shows localized names and re-runs on Compare with the form filled',
      (tester) async {
    tester.view.physicalSize = const Size(800, 1800);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);

    await tester.pumpWidget(const TffApp());
    await tester.pumpAndSettle();

    await tester.tap(find.text(zh['tabSaved'] as String).last);
    await tester.pumpAndSettle();
    await tester.tap(
        find.text(zh['history'] as String).first); // narrow layout: History tab
    await tester.pumpAndSettle();

    expect(find.text('台北 → 台南'), findsOneWidget);
    expect(find.text('Taipei → Tainan'), findsNothing);

    await tester.tap(find.text('台北 → 台南')); // the whole tile re-runs
    await tester.pumpAndSettle();

    // Landed on Compare, form refilled from the re-run query, both modes shown.
    expect(find.text(zh['compareHint'] as String), findsOneWidget);
    expect(find.byType(FareResultCard), findsNWidgets(2));
    expect(find.text('台北'), findsWidgets);
    expect(find.text('台南'), findsWidgets);
  });
}
