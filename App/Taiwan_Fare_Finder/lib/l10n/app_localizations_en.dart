// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'Taiwan Fare Finder';

  @override
  String get tabSearch => 'Search';

  @override
  String get tabCompare => 'Compare';

  @override
  String get tabSaved => 'Saved routes';

  @override
  String get settings => 'Settings';

  @override
  String get origin => 'Origin';

  @override
  String get destination => 'Destination';

  @override
  String get swap => 'Swap';

  @override
  String get transportMode => 'Mode';

  @override
  String get transportModes => 'Modes';

  @override
  String get searchFares => 'Search fares';

  @override
  String get compareFares => 'Fare comparison';

  @override
  String get results => 'Fare results';

  @override
  String get noResults => 'No results yet';

  @override
  String get noResultsBody =>
      'Select an origin, destination, and mode to see fares.';

  @override
  String get searchEmptyPickTitle => 'Select a route';

  @override
  String get searchEmptyPickBody =>
      'Select an origin, destination, and mode to continue.';

  @override
  String get searchEmptyReadyTitle => 'Ready to search';

  @override
  String get searchEmptyReadyBody =>
      'Select Search fares to see prices and travel time.';

  @override
  String get searchEmptyNoResultsTitle => 'No results found';

  @override
  String get searchEmptyNoResultsBody =>
      'Try a different route or review your selections.';

  @override
  String get offlineNoCache =>
      'No saved results yet. Search while online to make results available offline.';

  @override
  String get offlineDataBadge => 'Saved offline';

  @override
  String get showingCachedResults => 'Showing saved results.';

  @override
  String get manageOfflineData => 'Manage offline data';

  @override
  String get manageOfflineDataBody =>
      'Review what’s saved for offline use and clear it anytime.';

  @override
  String get cachedQueries => 'Saved routes';

  @override
  String get cachedResults => 'Saved results';

  @override
  String get clearOfflineData => 'Clear offline data';

  @override
  String get duration => 'Duration';

  @override
  String get transfers => 'Transfers';

  @override
  String get fareByCategory => 'Fare breakdown';

  @override
  String get adult => 'Adult';

  @override
  String get student => 'Student';

  @override
  String get child => 'Child';

  @override
  String get senior => 'Senior';

  @override
  String get minutesShort => 'min';

  @override
  String get kmShort => 'km';

  @override
  String get favorite => 'Save';

  @override
  String get unfavorite => 'Remove';

  @override
  String get favorites => 'Saved routes';

  @override
  String get history => 'History';

  @override
  String get emptyFavorites => 'No favorites yet';

  @override
  String get emptyFavoritesBody => 'Save a route to access it quickly.';

  @override
  String get emptyHistory => 'No history yet';

  @override
  String get emptyHistoryBody =>
      'No history yet. Your searches will appear here.';

  @override
  String get rerun => 'Search again';

  @override
  String get delete => 'Delete';

  @override
  String get clear => 'Clear';

  @override
  String get clearAll => 'Clear all';

  @override
  String get language => 'Language';

  @override
  String get theme => 'Theme';

  @override
  String get themeSystem => 'System';

  @override
  String get themeLight => 'Light';

  @override
  String get themeDark => 'Dark';

  @override
  String get dataMode => 'Data source';

  @override
  String get dataModeBody =>
      'Mock data is stable and offline-friendly. API mode will be added in a future update.';

  @override
  String get dataModeMock => 'Mock';

  @override
  String get dataModeApi => 'API (soon)';

  @override
  String get offlineMode => 'Offline mode';

  @override
  String get offlineModeBody =>
      'Show saved results only. New searches won’t generate mock results.';

  @override
  String get dataManagement => 'Data management';

  @override
  String get clearCache => 'Clear cached fares';

  @override
  String get clearHistory => 'Clear history';

  @override
  String get clearFavorites => 'Clear favorites';

  @override
  String get cancel => 'Cancel';

  @override
  String get confirm => 'Confirm';

  @override
  String get confirmDialogBody => 'Are you sure? This can’t be undone.';

  @override
  String get cleared => 'Cleared';

  @override
  String get settingsLanguageEnglish => 'English';

  @override
  String get settingsLanguageChineseHant => '繁體中文';

  @override
  String get settingsLanguageIndonesian => 'Bahasa Indonesia';

  @override
  String get modesHSR => 'HSR';

  @override
  String get modesTRA => 'TRA';

  @override
  String get modesMRT => 'MRT';

  @override
  String get modesBus => 'Bus';

  @override
  String get modesYouBike => 'YouBike';

  @override
  String get compareHint =>
      'Select multiple modes to compare price and time side-by-side.';

  @override
  String get selectAtLeastOneMode => 'Select at least one mode';

  @override
  String get pickRouteFirst => 'Select a route first';

  @override
  String get searchDisabledHelper =>
      'Select an origin, destination, and mode to search.';

  @override
  String get compareDisabledHelper =>
      'Select an origin, destination, and at least one mode to compare.';

  @override
  String get locationPickerSearchTitle => 'Find locations';

  @override
  String get locationPickerCtaChoose => 'Select a location';

  @override
  String get locationPickerRecentTitle => 'Recent';

  @override
  String get locationPickerPopularTitle => 'Popular';

  @override
  String get locationPickerBrowseByCity => 'Browse by city';

  @override
  String get locationPickerNoResultsTitle => 'No locations found';

  @override
  String get locationPickerNoResultsBody => 'Try a different name or city.';

  @override
  String get lastUpdated => 'Last updated';

  @override
  String get sourceMock => 'Mock data';

  @override
  String get sourceCached => 'Saved';

  @override
  String get sourceLive => 'Live';

  @override
  String get transferDirect => 'Direct';

  @override
  String get transferOne => '1 transfer';

  @override
  String get transferOneToTwo => '1–2 transfers';

  @override
  String get transferDockSwap => 'Dock swap recommended';

  @override
  String get errorTitle => 'Something went wrong';

  @override
  String get errorSearchFailed =>
      'We couldn’t load fares right now. Please try again.';

  @override
  String get errorApiNotReady =>
      'API mode isn’t available yet. Switch back to Mock in Settings.';

  @override
  String get retry => 'Retry';

  @override
  String compareSelectedCountLabel(Object count) {
    return 'Selected: $count';
  }

  @override
  String get selectAll => 'Select all';

  @override
  String get compareSortLabel => 'Sort by';

  @override
  String get compareSortCheapest => 'Cheapest';

  @override
  String get compareSortFastest => 'Fastest';

  @override
  String get compareSortFewestTransfers => 'Fewest transfers';

  @override
  String get privacy => 'Privacy';

  @override
  String get privacyBody =>
      'Your searches, saved routes, history, and offline data are stored locally on your device. No account required. No tracking by default.';

  @override
  String get privacyReadMore => 'Read more';

  @override
  String get about => 'About';

  @override
  String get aboutVersion => 'Version';

  @override
  String get aboutDataSource => 'Data source';
}
