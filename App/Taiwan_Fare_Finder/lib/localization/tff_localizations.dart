import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class TffLocalizations {
  const TffLocalizations(this.locale, this._strings);

  final Locale locale;
  final Map<String, String> _strings;

  static TffLocalizations of(BuildContext context) => Localizations.of<TffLocalizations>(context, TffLocalizations)!;

  static const LocalizationsDelegate<TffLocalizations> delegate = _TffLocalizationsDelegate();

  String _t(String key) {
    final v = _strings[key] ?? _strings['$key'] ?? key;
    assert(() {
      final looksLikeKey = v == key || v.startsWith('compare') || v.startsWith('search') || v.startsWith('locationPicker') || v.startsWith('settings');
      if (looksLikeKey) {
        debugPrint('TffLocalizations: possible key leak: key="$key" value="$v" locale=${locale.toLanguageTag()}');
      }
      return true;
    }());
    return v;
  }

  String get appTitle => _t('appTitle');
  String get tabSearch => _t('tabSearch');
  String get tabCompare => _t('tabCompare');
  String get tabSaved => _t('tabSaved');
  String get settings => _t('settings');
  String get origin => _t('origin');
  String get destination => _t('destination');
  String get swap => _t('swap');
  String get transportMode => _t('transportMode');
  String get transportModes => _t('transportModes');
  String get searchFares => _t('searchFares');
  String get compareFares => _t('compareFares');
  String get results => _t('results');
  String get noResults => _t('noResults');
  String get noResultsBody => _t('noResultsBody');
  String get searchEmptyPickTitle => _t('searchEmptyPickTitle');
  String get searchEmptyPickBody => _t('searchEmptyPickBody');
  String get searchEmptyReadyTitle => _t('searchEmptyReadyTitle');
  String get searchEmptyReadyBody => _t('searchEmptyReadyBody');
  String get searchEmptyNoResultsTitle => _t('searchEmptyNoResultsTitle');
  String get searchEmptyNoResultsBody => _t('searchEmptyNoResultsBody');
  String get offlineNoCache => _t('offlineNoCache');
  String get offlineDataBadge => _t('offlineDataBadge');
  String get showingCachedResults => _t('showingCachedResults');
  String get duration => _t('duration');
  String get transfers => _t('transfers');
  String get fareByCategory => _t('fareByCategory');
  String get adult => _t('adult');
  String get student => _t('student');
  String get child => _t('child');
  String get senior => _t('senior');
  String get minutesShort => _t('minutesShort');
  String get kmShort => _t('kmShort');
  String get favorite => _t('favorite');
  String get unfavorite => _t('unfavorite');
  String get favorites => _t('favorites');
  String get history => _t('history');
  String get emptyFavorites => _t('emptyFavorites');
  String get emptyFavoritesBody => _t('emptyFavoritesBody');
  String get emptyHistory => _t('emptyHistory');
  String get emptyHistoryBody => _t('emptyHistoryBody');
  String get rerun => _t('rerun');
  String get delete => _t('delete');
  String get clear => _t('clear');
  String get clearAll => _t('clearAll');
  String get language => _t('language');
  String get theme => _t('theme');
  String get themeSystem => _t('themeSystem');
  String get themeLight => _t('themeLight');
  String get themeDark => _t('themeDark');

  // Data mode / future API
  String get dataMode => _t('dataMode');
  String get dataModeBody => _t('dataModeBody');
  String get dataModeMock => _t('dataModeMock');
  String get dataModeApi => _t('dataModeApi');
  String get offlineMode => _t('offlineMode');
  String get offlineModeBody => _t('offlineModeBody');
  String get manageOfflineData => _t('manageOfflineData');
  String get manageOfflineDataBody => _t('manageOfflineDataBody');
  String get cachedQueries => _t('cachedQueries');
  String get cachedResults => _t('cachedResults');
  String get clearOfflineData => _t('clearOfflineData');
  String get dataManagement => _t('dataManagement');
  String get clearCache => _t('clearCache');
  String get clearHistory => _t('clearHistory');
  String get clearFavorites => _t('clearFavorites');
  String get cancel => _t('cancel');
  String get confirm => _t('confirm');
  String get confirmDialogBody => _t('confirmDialogBody');
  String get cleared => _t('cleared');

  // Settings: language names (shown inside the language selector)
  String get settingsLanguageEnglish => _t('settingsLanguageEnglish');
  String get settingsLanguageChineseHant => _t('settingsLanguageChineseHant');
  String get settingsLanguageIndonesian => _t('settingsLanguageIndonesian');
  String get modesHSR => _t('modesHSR');
  String get modesTRA => _t('modesTRA');
  String get modesMRT => _t('modesMRT');
  String get modesBus => _t('modesBus');
  String get modesYouBike => _t('modesYouBike');
  String get compareHint => _t('compareHint');
  String get selectAtLeastOneMode => _t('selectAtLeastOneMode');
  String get pickRouteFirst => _t('pickRouteFirst');

  // Passive validation helper text
  String get searchDisabledHelper => _t('searchDisabledHelper');
  String get compareDisabledHelper => _t('compareDisabledHelper');

  // Location picker
  String get locationPickerSearchTitle => _t('locationPickerSearchTitle');
  String get locationPickerCtaChoose => _t('locationPickerCtaChoose');
  String get locationPickerRecentTitle => _t('locationPickerRecentTitle');
  String get locationPickerPopularTitle => _t('locationPickerPopularTitle');
  String get locationPickerBrowseByCity => _t('locationPickerBrowseByCity');
  String get locationPickerNoResultsTitle => _t('locationPickerNoResultsTitle');
  String get locationPickerNoResultsBody => _t('locationPickerNoResultsBody');

  // Results UI
  String get lastUpdated => _t('lastUpdated');
  String get sourceMock => _t('sourceMock');
  String get sourceCached => _t('sourceCached');

  // Transfers
  String get transferDirect => _t('transferDirect');
  String get transferOne => _t('transferOne');
  String get transferOneToTwo => _t('transferOneToTwo');
  String get transferDockSwap => _t('transferDockSwap');

  // Errors / retry
  String get errorTitle => _t('errorTitle');
  String get errorSearchFailed => _t('errorSearchFailed');
  String get retry => _t('retry');

  // Data mode errors
  String get errorApiNotReady => _t('errorApiNotReady');

  // Compare: selection + sorting
  String compareSelectedCountLabel(int count) => _t('compareSelectedCountLabel').replaceAll('{count}', '$count');
  String get selectAll => _t('selectAll');
  String get compareSortLabel => _t('compareSortLabel');
  String get compareSortCheapest => _t('compareSortCheapest');
  String get compareSortFastest => _t('compareSortFastest');
  String get compareSortFewestTransfers => _t('compareSortFewestTransfers');

  // Publish checklist: privacy + about
  String get privacy => _t('privacy');
  String get privacyBody => _t('privacyBody');
  String get privacyReadMore => _t('privacyReadMore');
  String get about => _t('about');
  String get aboutVersion => _t('aboutVersion');
  String get aboutDataSource => _t('aboutDataSource');
}

class _TffLocalizationsDelegate extends LocalizationsDelegate<TffLocalizations> {
  const _TffLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) => locale.languageCode == 'en' || locale.languageCode == 'id' || locale.languageCode == 'zh';

  @override
  Future<TffLocalizations> load(Locale locale) async {
    final tag = _tag(locale);
    final asset = 'lib/l10n/app_${tag}.arb';
    final fallback = 'lib/l10n/app.arb';

    Map<String, dynamic> decoded;
    try {
      final raw = await rootBundle.loadString(asset);
      decoded = jsonDecode(raw) as Map<String, dynamic>;
    } catch (e) {
      debugPrint('TffLocalizations: failed to load $asset ($e). Falling back.');
      final raw = await rootBundle.loadString(fallback);
      decoded = jsonDecode(raw) as Map<String, dynamic>;
    }

    final strings = <String, String>{};
    for (final entry in decoded.entries) {
      if (entry.key.startsWith('@@')) continue;
      final v = entry.value;
      if (v is String) strings[entry.key] = v;
    }

    return TffLocalizations(locale, strings);
  }

  String _tag(Locale locale) {
    if (locale.languageCode == 'zh') {
      if (locale.scriptCode == 'Hant') return 'zh_Hant';
      return 'zh';
    }
    if (locale.languageCode == 'id') return 'id';
    return 'en';
  }

  @override
  bool shouldReload(covariant LocalizationsDelegate<TffLocalizations> old) => false;
}
