import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:taiwan_fare_finder/main.dart';
import 'package:taiwan_fare_finder/ui/fare_result_card.dart';
import 'package:taiwan_fare_finder/ui/location_picker_sheet.dart';

Map<String, dynamic> _arb(String tag) =>
    jsonDecode(File('lib/l10n/app_$tag.arb').readAsStringSync())
        as Map<String, dynamic>;

/// Opens the next empty location field and picks [name] from Popular.
Future<void> _pick(WidgetTester tester, String cta, String name) async {
  final field = find.text(cta).first;
  await tester.ensureVisible(field);
  await tester.tap(field);
  await tester.pumpAndSettle();
  // First match inside the sheet = Recent/Popular list (collapsed city groups
  // further down also contain the name but ignore taps).
  await tester.tap(find
      .descendant(
          of: find.byType(LocationPickerSheet), matching: find.text(name))
      .first);
  await tester.pumpAndSettle();
}

Future<void> _tapButton(WidgetTester tester, String label) async {
  final button = find.widgetWithText(ElevatedButton, label);
  await tester.ensureVisible(button);
  await tester.tap(button);
  await tester.pumpAndSettle();
}

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

  testWidgets('Search and Compare keep their own results (mock mode)',
      (tester) async {
    tester.view.physicalSize = const Size(800, 1800);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);

    await tester.pumpWidget(const TffApp());
    await tester.pumpAndSettle();

    // ── Search: Taipei → Kaohsiung by HSR (HSR is preselected) ──
    expect(find.text(en['searchEmptyPickTitle'] as String), findsOneWidget);
    await _pick(tester, en['locationPickerCtaChoose'] as String, 'Taipei');
    await _pick(tester, en['locationPickerCtaChoose'] as String, 'Kaohsiung');
    await _tapButton(tester, en['searchFares'] as String);

    expect(find.byType(FareResultCard), findsOneWidget);
    expect(find.text('Taipei → Kaohsiung'), findsOneWidget);
    expect(find.text(en['sourceMock'] as String), findsOneWidget);

    // ── Compare: Taoyuan → Tainan with the default HSR + TRA + MRT ──
    await tester.tap(find.text(en['tabCompare'] as String).last);
    await tester.pumpAndSettle();
    await _pick(tester, en['locationPickerCtaChoose'] as String, 'Taoyuan');
    await _pick(tester, en['locationPickerCtaChoose'] as String, 'Tainan');
    await _tapButton(tester, en['compareFares'] as String);

    expect(find.byType(FareResultCard), findsNWidgets(3));
    expect(find.text('Taoyuan → Tainan'), findsNWidgets(3));

    // ── Back on Search, the earlier result is untouched ──
    await tester.tap(find.text(en['tabSearch'] as String).last);
    await tester.pumpAndSettle();
    expect(find.byType(FareResultCard), findsOneWidget);
    expect(find.text('Taipei → Kaohsiung'), findsOneWidget);

    // ── Favorite it, then find it on the Saved tab ──
    await tester.tap(find.byTooltip(en['favorite'] as String));
    await tester.pumpAndSettle();
    expect(find.byTooltip(en['unfavorite'] as String), findsOneWidget);

    await tester.tap(find.text(en['tabSaved'] as String).last);
    await tester.pumpAndSettle();
    expect(find.text('Taipei → Kaohsiung'), findsOneWidget);
    expect(find.text(en['modesHSR'] as String), findsOneWidget);
  });
}
