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
      'Mock data is stable and offline-friendly. API mode fetches real HSR and TRA fares; other modes use mock data.';

  @override
  String get dataModeMock => 'Mock';

  @override
  String get dataModeApi => 'API (HSR & TRA)';

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

  @override
  String get notFoundTitle => 'Page not found';

  @override
  String get notFoundBody =>
      'The page you’re looking for doesn’t exist or may have moved.';

  @override
  String get notFoundBackToSearch => 'Back to search';

  @override
  String get termsOfUse => 'Terms of Use';

  @override
  String get termsLastUpdated => 'Last updated: September 21, 2026';

  @override
  String get termsIntro =>
      'These Terms of Use (\"Terms\") govern your use of Taiwan Fare Finder (the \"App\"). By using the App, you agree to these Terms. If you don\'t agree, please don\'t use the App.';

  @override
  String get termsSection1Title => 'Acceptance of These Terms';

  @override
  String get termsSection1Body =>
      'By downloading, installing, or using Taiwan Fare Finder, you accept these Terms in full. We may update these Terms from time to time; continuing to use the App after an update means you accept the revised Terms.';

  @override
  String get termsSection2Title => 'The Service';

  @override
  String get termsSection2Body =>
      'Taiwan Fare Finder is an informational tool for searching, comparing, and saving public transportation fares across Taiwan. It does not sell tickets, process payments, or connect to any transit operator\'s booking system.';

  @override
  String get termsSection3Title => 'Fare Accuracy & Data Sources';

  @override
  String get termsSection3Body =>
      'High Speed Rail (HSR) and Taiwan Railway (TRA) fares are retrieved from Taiwan\'s official TDX open-data platform when API mode is enabled. MRT, Bus, and YouBike fares use a consistent internal estimate, not official pricing. In all cases, fares and travel times may be outdated, cached, or inaccurate. Always confirm the actual fare with the relevant transit operator before you travel.';

  @override
  String get termsSection4Title => 'Acceptable Use';

  @override
  String get termsSection4Body =>
      'The App is for your personal, non-commercial use. You agree not to misuse the App or its backend services — for example, by sending an excessive volume of automated requests, attempting to extract API credentials, or interfering with the App\'s normal operation.';

  @override
  String get termsSection5Title => 'No Warranty & Limitation of Liability';

  @override
  String get termsSection5Body =>
      'The App is provided \"as is\" and \"as available,\" without warranties of any kind, express or implied, including accuracy, reliability, or fitness for a particular purpose. To the fullest extent permitted by law, we are not liable for any loss or damage arising from your use of the App, including missed trips or fare discrepancies.';

  @override
  String get termsSection6Title => 'Third-Party Services';

  @override
  String get termsSection6Body =>
      'Live HSR and TRA fare data is sourced from Taiwan\'s TDX (Transport Data eXchange) open-data platform, operated by Taiwan\'s Ministry of Transportation and Communications (tdx.transportdata.tw). Use of that data is subject to TDX\'s own terms, which we do not control.';

  @override
  String get termsSection7Title => 'Changes to These Terms';

  @override
  String get termsSection7Body =>
      'We may revise these Terms as the App evolves. The \"Last updated\" date above reflects the most recent revision. We encourage you to review these Terms periodically.';

  @override
  String get termsSection8Title => 'Contact';

  @override
  String get termsSection8Body =>
      'Questions about these Terms can be sent to maxfelix05@gmail.com.';

  @override
  String get privacyPolicyTitle => 'Privacy Policy';

  @override
  String get privacyLastUpdated => 'Last updated: September 21, 2026';

  @override
  String get privacyPolicyIntro =>
      'Taiwan Fare Finder does not require an account, does not have a login, and does not operate a backend server of its own. This policy explains the little data the App does handle, and where it goes.';

  @override
  String get privacySection1Title => 'Information We Store On Your Device';

  @override
  String get privacySection1Body =>
      'Your search history, saved (favorite) routes, cached fare results, and app settings (language, theme, offline mode) are stored locally on your device using standard app storage. This data is never uploaded to a server we operate — we don\'t have one.';

  @override
  String get privacySection2Title => 'Information Sent To Third Parties';

  @override
  String get privacySection2Body =>
      'In Mock data mode, nothing you search ever leaves your device. In API data mode, the origin and destination station identifiers for High Speed Rail and Taiwan Railway searches are sent — through our proxy server — to Taiwan\'s official TDX open-data platform to retrieve real fares. No name, account, or device identifier is attached to that request, because the App has none to send.';

  @override
  String get privacySection3Title => 'Analytics';

  @override
  String get privacySection3Body =>
      'The App currently logs a few event names locally for debugging purposes only (visible in developer logs on your own device) and does not transmit them anywhere. If we ever add real analytics or tracking, we will ask for your consent first.';

  @override
  String get privacySection4Title => 'Children\'s Privacy';

  @override
  String get privacySection4Body =>
      'The App does not knowingly collect personal information from anyone, including children, because it does not collect personal information from anyone. It is suitable for a general audience.';

  @override
  String get privacySection5Title => 'Your Choices & Data Deletion';

  @override
  String get privacySection5Body =>
      'You can clear your cached fares, search history, or favorites at any time from Settings → Data management. Uninstalling the App removes all data it stored on your device.';

  @override
  String get privacySection6Title => 'Changes to This Policy';

  @override
  String get privacySection6Body =>
      'We may update this Privacy Policy as the App evolves. The \"Last updated\" date above reflects the most recent revision.';

  @override
  String get privacySection7Title => 'Contact';

  @override
  String get privacySection7Body =>
      'Questions about this Privacy Policy can be sent to maxfelix05@gmail.com.';
}
