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
  String get compareFares => 'Compare fares';

  @override
  String get results => 'Fare results';

  @override
  String get noResults => 'No results yet';

  @override
  String get searchEmptyPickTitle => 'Pick a route';

  @override
  String get searchEmptyPickBody =>
      'Choose where you\'re leaving from, where you\'re going, and how.';

  @override
  String get searchEmptyReadyTitle => 'Ready to search';

  @override
  String get searchEmptyReadyBody =>
      'Tap Search fares to see the price and travel time.';

  @override
  String get searchEmptyNoResultsTitle => 'Nothing found';

  @override
  String get searchEmptyNoResultsBody => 'Try another route or mode.';

  @override
  String get offlineNoCache =>
      'Nothing saved for this route yet. Search it once while you\'re online and it\'ll be here offline too.';

  @override
  String get showingCachedResults =>
      'Couldn\'t reach the server. These are your saved results.';

  @override
  String get manageOfflineData => 'Manage offline data';

  @override
  String get manageOfflineDataBody =>
      'See what\'s saved for offline use, and clear it whenever you like.';

  @override
  String get cachedQueries => 'Saved searches';

  @override
  String get cachedResults => 'Saved fares';

  @override
  String get clearOfflineData => 'Clear offline data';

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
  String get emptyFavorites => 'No saved routes yet';

  @override
  String get emptyFavoritesBody =>
      'Tap the bookmark on a search result to keep that route here.';

  @override
  String get emptyHistory => 'No history yet';

  @override
  String get emptyHistoryBody => 'Routes you search will show up here.';

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
      'Mock shows made-up but consistent fares and works offline. API gets real HSR and TRA fares from TDX; the other modes still use mock data.';

  @override
  String get dataModeMock => 'Mock';

  @override
  String get dataModeApi => 'API (HSR & TRA)';

  @override
  String get offlineMode => 'Offline mode';

  @override
  String get offlineModeBody =>
      'Only show fares you\'ve already looked up. The app won\'t fetch or make up anything new.';

  @override
  String get dataManagement => 'Data management';

  @override
  String get clearCache => 'Clear cached fares';

  @override
  String get clearHistory => 'Clear history';

  @override
  String get clearFavorites => 'Clear saved routes';

  @override
  String get cancel => 'Cancel';

  @override
  String get confirm => 'Confirm';

  @override
  String get confirmDialogBody => 'You can\'t undo this.';

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
      'Pick a few modes to see their prices and times next to each other.';

  @override
  String get pickRouteFirst => 'Pick a route first';

  @override
  String get searchDisabledHelper =>
      'Pick an origin, a destination and a mode to search.';

  @override
  String get compareDisabledHelper =>
      'Pick an origin, a destination and at least one mode to compare.';

  @override
  String get locationPickerSearchTitle => 'Search for a place';

  @override
  String get locationPickerCtaChoose => 'Choose a place';

  @override
  String get locationPickerRecentTitle => 'Recent';

  @override
  String get locationPickerPopularTitle => 'Popular';

  @override
  String get locationPickerBrowseByCity => 'Browse by city';

  @override
  String get locationPickerNoResultsTitle => 'No matches';

  @override
  String get locationPickerNoResultsBody =>
      'Try another spelling, or the Chinese name.';

  @override
  String get lastUpdated => 'Last updated';

  @override
  String get sourceMock => 'Mock data';

  @override
  String get sourceCached => 'Saved';

  @override
  String get sourceLive => 'Live';

  @override
  String get routeNotServedTitle => 'No service on this route';

  @override
  String routeNotServedBody(Object mode) {
    return '$mode has no station at your origin or destination. Try another mode.';
  }

  @override
  String routeNotServedList(Object modes) {
    return 'Not served on this route: $modes';
  }

  @override
  String get estimatedShort => 'est.';

  @override
  String get transferDirect => 'Direct';

  @override
  String get transferOne => '1 transfer';

  @override
  String get transferOneToTwo => '1–2 transfers';

  @override
  String get transferDockSwap => 'Swap bikes midway';

  @override
  String get errorTitle => 'Couldn\'t get fares';

  @override
  String get errorSearchFailed =>
      'Check your internet connection and try again.';

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
      'Everything you search and save stays on this device. You don\'t need an account, and the app doesn\'t track you.';

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
  String get notFoundBody => 'We couldn\'t find that page.';

  @override
  String get notFoundBackToSearch => 'Back to search';

  @override
  String get termsOfUse => 'Terms of Use';

  @override
  String get termsLastUpdated => 'Last updated: October 15, 2026';

  @override
  String get termsIntro =>
      'These terms cover your use of Taiwan Fare Finder (the \"App\"). By using the App, you agree to them. If you don\'t agree, please don\'t use it.';

  @override
  String get termsSection1Title => 'Accepting these terms';

  @override
  String get termsSection1Body =>
      'By downloading, installing or using the App, you accept these terms. We may update them. If you keep using the App after an update, you accept the new version.';

  @override
  String get termsSection2Title => 'What the App does';

  @override
  String get termsSection2Body =>
      'Taiwan Fare Finder helps you look up, compare and save public transport fares in Taiwan. It doesn\'t sell tickets, take payments or connect to any operator\'s booking system.';

  @override
  String get termsSection3Title => 'Fare accuracy and data sources';

  @override
  String get termsSection3Body =>
      'With API mode on, the App gets High Speed Rail (HSR) and Taiwan Railway (TRA) fares from Taiwan\'s official TDX open-data platform. MRT, bus and YouBike fares are the App\'s own estimates, not official prices, and so is the student fare for HSR and TRA. Any fare or travel time can be out of date or wrong, so check with the operator before you travel.';

  @override
  String get termsSection4Title => 'Acceptable use';

  @override
  String get termsSection4Body =>
      'The App is for personal, non-commercial use. Please don\'t misuse it or the server behind it, for example by sending large volumes of automated requests, trying to extract API credentials, or interfering with how the App works.';

  @override
  String get termsSection5Title => 'No warranty and limitation of liability';

  @override
  String get termsSection5Body =>
      'We provide the App \"as is\" and \"as available\", without warranties of any kind, express or implied, including accuracy, reliability or fitness for a particular purpose. To the fullest extent the law allows, we are not liable for any loss or damage from your use of the App, including missed trips or fare differences.';

  @override
  String get termsSection6Title => 'Third-party services';

  @override
  String get termsSection6Body =>
      'Live HSR and TRA fares come from TDX (Transport Data eXchange), the open-data platform run by Taiwan\'s Ministry of Transportation and Communications (tdx.transportdata.tw). TDX\'s own terms apply to that data, and we don\'t control them.';

  @override
  String get termsSection7Title => 'Changes to these terms';

  @override
  String get termsSection7Body =>
      'We may revise these terms as the App changes. The \"Last updated\" date at the top shows the latest revision.';

  @override
  String get termsSection8Title => 'Contact';

  @override
  String get termsSection8Body =>
      'Questions about these terms? Email maxfelix05@gmail.com.';

  @override
  String get privacyPolicyTitle => 'Privacy Policy';

  @override
  String get privacyLastUpdated => 'Last updated: October 15, 2026';

  @override
  String get privacyPolicyIntro =>
      'Taiwan Fare Finder has no accounts or logins, and we don\'t keep any of your data on a server. This policy covers the little data the App handles and where it goes.';

  @override
  String get privacySection1Title => 'What stays on your device';

  @override
  String get privacySection1Body =>
      'The App keeps your search history, saved routes, cached fares and settings (language, theme, offline mode, data source) in normal app storage on your device. It never uploads any of it.';

  @override
  String get privacySection2Title => 'What gets sent, and to whom';

  @override
  String get privacySection2Body =>
      'In Mock mode, nothing you search leaves your device. In API mode, the App sends the origin and destination station codes of HSR and TRA searches to our small relay server, a proxy hosted on Cloudflare. The relay passes them to Taiwan\'s official TDX open-data platform to get real fares. The relay holds the TDX access key, so the key never ships inside the App. It caches fare data for a few hours to stay fast, but it doesn\'t record who asked. The requests carry no name, account or device ID, because the App doesn\'t have any. Like any internet request, they reveal your IP address to the networks that carry them.';

  @override
  String get privacySection3Title => 'Analytics';

  @override
  String get privacySection3Body =>
      'The App writes a few event names to the developer log on your own device, for debugging. It doesn\'t send them anywhere. If we ever add real analytics, we\'ll ask for your consent first.';

  @override
  String get privacySection4Title => 'Children\'s privacy';

  @override
  String get privacySection4Body =>
      'The App doesn\'t collect personal information from anyone, children included, and it\'s suitable for all ages.';

  @override
  String get privacySection5Title => 'Your choices and deleting your data';

  @override
  String get privacySection5Body =>
      'You can clear cached fares (Settings → Manage offline data) and your history or saved routes (Settings → Data management) at any time. Uninstalling the App deletes everything it stored on your device.';

  @override
  String get privacySection6Title => 'Changes to this policy';

  @override
  String get privacySection6Body =>
      'We may update this policy as the App changes. The \"Last updated\" date at the top shows the latest revision.';

  @override
  String get privacySection7Title => 'Contact';

  @override
  String get privacySection7Body =>
      'Questions about this policy? Email maxfelix05@gmail.com.';
}
