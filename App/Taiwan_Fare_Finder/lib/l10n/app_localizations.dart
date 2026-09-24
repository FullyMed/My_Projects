import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_id.dart';
import 'app_localizations_zh.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
      : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
    delegate,
    GlobalMaterialLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
  ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('zh'),
    Locale.fromSubtags(languageCode: 'zh', scriptCode: 'Hant'),
    Locale('id')
  ];

  /// No description provided for @appTitle.
  ///
  /// In en, this message translates to:
  /// **'Taiwan Fare Finder'**
  String get appTitle;

  /// No description provided for @tabSearch.
  ///
  /// In en, this message translates to:
  /// **'Search'**
  String get tabSearch;

  /// No description provided for @tabCompare.
  ///
  /// In en, this message translates to:
  /// **'Compare'**
  String get tabCompare;

  /// No description provided for @tabSaved.
  ///
  /// In en, this message translates to:
  /// **'Saved routes'**
  String get tabSaved;

  /// No description provided for @settings.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get settings;

  /// No description provided for @origin.
  ///
  /// In en, this message translates to:
  /// **'Origin'**
  String get origin;

  /// No description provided for @destination.
  ///
  /// In en, this message translates to:
  /// **'Destination'**
  String get destination;

  /// No description provided for @swap.
  ///
  /// In en, this message translates to:
  /// **'Swap'**
  String get swap;

  /// No description provided for @transportMode.
  ///
  /// In en, this message translates to:
  /// **'Mode'**
  String get transportMode;

  /// No description provided for @transportModes.
  ///
  /// In en, this message translates to:
  /// **'Modes'**
  String get transportModes;

  /// No description provided for @searchFares.
  ///
  /// In en, this message translates to:
  /// **'Search fares'**
  String get searchFares;

  /// No description provided for @compareFares.
  ///
  /// In en, this message translates to:
  /// **'Fare comparison'**
  String get compareFares;

  /// No description provided for @results.
  ///
  /// In en, this message translates to:
  /// **'Fare results'**
  String get results;

  /// No description provided for @noResults.
  ///
  /// In en, this message translates to:
  /// **'No results yet'**
  String get noResults;

  /// No description provided for @noResultsBody.
  ///
  /// In en, this message translates to:
  /// **'Select an origin, destination, and mode to see fares.'**
  String get noResultsBody;

  /// No description provided for @searchEmptyPickTitle.
  ///
  /// In en, this message translates to:
  /// **'Select a route'**
  String get searchEmptyPickTitle;

  /// No description provided for @searchEmptyPickBody.
  ///
  /// In en, this message translates to:
  /// **'Select an origin, destination, and mode to continue.'**
  String get searchEmptyPickBody;

  /// No description provided for @searchEmptyReadyTitle.
  ///
  /// In en, this message translates to:
  /// **'Ready to search'**
  String get searchEmptyReadyTitle;

  /// No description provided for @searchEmptyReadyBody.
  ///
  /// In en, this message translates to:
  /// **'Select Search fares to see prices and travel time.'**
  String get searchEmptyReadyBody;

  /// No description provided for @searchEmptyNoResultsTitle.
  ///
  /// In en, this message translates to:
  /// **'No results found'**
  String get searchEmptyNoResultsTitle;

  /// No description provided for @searchEmptyNoResultsBody.
  ///
  /// In en, this message translates to:
  /// **'Try a different route or review your selections.'**
  String get searchEmptyNoResultsBody;

  /// No description provided for @offlineNoCache.
  ///
  /// In en, this message translates to:
  /// **'No saved results yet. Search while online to make results available offline.'**
  String get offlineNoCache;

  /// No description provided for @offlineDataBadge.
  ///
  /// In en, this message translates to:
  /// **'Saved offline'**
  String get offlineDataBadge;

  /// No description provided for @showingCachedResults.
  ///
  /// In en, this message translates to:
  /// **'Showing saved results.'**
  String get showingCachedResults;

  /// No description provided for @manageOfflineData.
  ///
  /// In en, this message translates to:
  /// **'Manage offline data'**
  String get manageOfflineData;

  /// No description provided for @manageOfflineDataBody.
  ///
  /// In en, this message translates to:
  /// **'Review what’s saved for offline use and clear it anytime.'**
  String get manageOfflineDataBody;

  /// No description provided for @cachedQueries.
  ///
  /// In en, this message translates to:
  /// **'Saved routes'**
  String get cachedQueries;

  /// No description provided for @cachedResults.
  ///
  /// In en, this message translates to:
  /// **'Saved results'**
  String get cachedResults;

  /// No description provided for @clearOfflineData.
  ///
  /// In en, this message translates to:
  /// **'Clear offline data'**
  String get clearOfflineData;

  /// No description provided for @duration.
  ///
  /// In en, this message translates to:
  /// **'Duration'**
  String get duration;

  /// No description provided for @transfers.
  ///
  /// In en, this message translates to:
  /// **'Transfers'**
  String get transfers;

  /// No description provided for @fareByCategory.
  ///
  /// In en, this message translates to:
  /// **'Fare breakdown'**
  String get fareByCategory;

  /// No description provided for @adult.
  ///
  /// In en, this message translates to:
  /// **'Adult'**
  String get adult;

  /// No description provided for @student.
  ///
  /// In en, this message translates to:
  /// **'Student'**
  String get student;

  /// No description provided for @child.
  ///
  /// In en, this message translates to:
  /// **'Child'**
  String get child;

  /// No description provided for @senior.
  ///
  /// In en, this message translates to:
  /// **'Senior'**
  String get senior;

  /// No description provided for @minutesShort.
  ///
  /// In en, this message translates to:
  /// **'min'**
  String get minutesShort;

  /// No description provided for @kmShort.
  ///
  /// In en, this message translates to:
  /// **'km'**
  String get kmShort;

  /// No description provided for @favorite.
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get favorite;

  /// No description provided for @unfavorite.
  ///
  /// In en, this message translates to:
  /// **'Remove'**
  String get unfavorite;

  /// No description provided for @favorites.
  ///
  /// In en, this message translates to:
  /// **'Saved routes'**
  String get favorites;

  /// No description provided for @history.
  ///
  /// In en, this message translates to:
  /// **'History'**
  String get history;

  /// No description provided for @emptyFavorites.
  ///
  /// In en, this message translates to:
  /// **'No favorites yet'**
  String get emptyFavorites;

  /// No description provided for @emptyFavoritesBody.
  ///
  /// In en, this message translates to:
  /// **'Save a route to access it quickly.'**
  String get emptyFavoritesBody;

  /// No description provided for @emptyHistory.
  ///
  /// In en, this message translates to:
  /// **'No history yet'**
  String get emptyHistory;

  /// No description provided for @emptyHistoryBody.
  ///
  /// In en, this message translates to:
  /// **'No history yet. Your searches will appear here.'**
  String get emptyHistoryBody;

  /// No description provided for @rerun.
  ///
  /// In en, this message translates to:
  /// **'Search again'**
  String get rerun;

  /// No description provided for @delete.
  ///
  /// In en, this message translates to:
  /// **'Delete'**
  String get delete;

  /// No description provided for @clear.
  ///
  /// In en, this message translates to:
  /// **'Clear'**
  String get clear;

  /// No description provided for @clearAll.
  ///
  /// In en, this message translates to:
  /// **'Clear all'**
  String get clearAll;

  /// No description provided for @language.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get language;

  /// No description provided for @theme.
  ///
  /// In en, this message translates to:
  /// **'Theme'**
  String get theme;

  /// No description provided for @themeSystem.
  ///
  /// In en, this message translates to:
  /// **'System'**
  String get themeSystem;

  /// No description provided for @themeLight.
  ///
  /// In en, this message translates to:
  /// **'Light'**
  String get themeLight;

  /// No description provided for @themeDark.
  ///
  /// In en, this message translates to:
  /// **'Dark'**
  String get themeDark;

  /// No description provided for @dataMode.
  ///
  /// In en, this message translates to:
  /// **'Data source'**
  String get dataMode;

  /// No description provided for @dataModeBody.
  ///
  /// In en, this message translates to:
  /// **'Mock data is stable and offline-friendly. API mode fetches real HSR and TRA fares; other modes use mock data.'**
  String get dataModeBody;

  /// No description provided for @dataModeMock.
  ///
  /// In en, this message translates to:
  /// **'Mock'**
  String get dataModeMock;

  /// No description provided for @dataModeApi.
  ///
  /// In en, this message translates to:
  /// **'API (HSR & TRA)'**
  String get dataModeApi;

  /// No description provided for @offlineMode.
  ///
  /// In en, this message translates to:
  /// **'Offline mode'**
  String get offlineMode;

  /// No description provided for @offlineModeBody.
  ///
  /// In en, this message translates to:
  /// **'Show saved results only. New searches won’t generate mock results.'**
  String get offlineModeBody;

  /// No description provided for @dataManagement.
  ///
  /// In en, this message translates to:
  /// **'Data management'**
  String get dataManagement;

  /// No description provided for @clearCache.
  ///
  /// In en, this message translates to:
  /// **'Clear cached fares'**
  String get clearCache;

  /// No description provided for @clearHistory.
  ///
  /// In en, this message translates to:
  /// **'Clear history'**
  String get clearHistory;

  /// No description provided for @clearFavorites.
  ///
  /// In en, this message translates to:
  /// **'Clear favorites'**
  String get clearFavorites;

  /// No description provided for @cancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get cancel;

  /// No description provided for @confirm.
  ///
  /// In en, this message translates to:
  /// **'Confirm'**
  String get confirm;

  /// No description provided for @confirmDialogBody.
  ///
  /// In en, this message translates to:
  /// **'Are you sure? This can’t be undone.'**
  String get confirmDialogBody;

  /// No description provided for @cleared.
  ///
  /// In en, this message translates to:
  /// **'Cleared'**
  String get cleared;

  /// No description provided for @settingsLanguageEnglish.
  ///
  /// In en, this message translates to:
  /// **'English'**
  String get settingsLanguageEnglish;

  /// No description provided for @settingsLanguageChineseHant.
  ///
  /// In en, this message translates to:
  /// **'繁體中文'**
  String get settingsLanguageChineseHant;

  /// No description provided for @settingsLanguageIndonesian.
  ///
  /// In en, this message translates to:
  /// **'Bahasa Indonesia'**
  String get settingsLanguageIndonesian;

  /// No description provided for @modesHSR.
  ///
  /// In en, this message translates to:
  /// **'HSR'**
  String get modesHSR;

  /// No description provided for @modesTRA.
  ///
  /// In en, this message translates to:
  /// **'TRA'**
  String get modesTRA;

  /// No description provided for @modesMRT.
  ///
  /// In en, this message translates to:
  /// **'MRT'**
  String get modesMRT;

  /// No description provided for @modesBus.
  ///
  /// In en, this message translates to:
  /// **'Bus'**
  String get modesBus;

  /// No description provided for @modesYouBike.
  ///
  /// In en, this message translates to:
  /// **'YouBike'**
  String get modesYouBike;

  /// No description provided for @compareHint.
  ///
  /// In en, this message translates to:
  /// **'Select multiple modes to compare price and time side-by-side.'**
  String get compareHint;

  /// No description provided for @selectAtLeastOneMode.
  ///
  /// In en, this message translates to:
  /// **'Select at least one mode'**
  String get selectAtLeastOneMode;

  /// No description provided for @pickRouteFirst.
  ///
  /// In en, this message translates to:
  /// **'Select a route first'**
  String get pickRouteFirst;

  /// No description provided for @searchDisabledHelper.
  ///
  /// In en, this message translates to:
  /// **'Select an origin, destination, and mode to search.'**
  String get searchDisabledHelper;

  /// No description provided for @compareDisabledHelper.
  ///
  /// In en, this message translates to:
  /// **'Select an origin, destination, and at least one mode to compare.'**
  String get compareDisabledHelper;

  /// No description provided for @locationPickerSearchTitle.
  ///
  /// In en, this message translates to:
  /// **'Find locations'**
  String get locationPickerSearchTitle;

  /// No description provided for @locationPickerCtaChoose.
  ///
  /// In en, this message translates to:
  /// **'Select a location'**
  String get locationPickerCtaChoose;

  /// No description provided for @locationPickerRecentTitle.
  ///
  /// In en, this message translates to:
  /// **'Recent'**
  String get locationPickerRecentTitle;

  /// No description provided for @locationPickerPopularTitle.
  ///
  /// In en, this message translates to:
  /// **'Popular'**
  String get locationPickerPopularTitle;

  /// No description provided for @locationPickerBrowseByCity.
  ///
  /// In en, this message translates to:
  /// **'Browse by city'**
  String get locationPickerBrowseByCity;

  /// No description provided for @locationPickerNoResultsTitle.
  ///
  /// In en, this message translates to:
  /// **'No locations found'**
  String get locationPickerNoResultsTitle;

  /// No description provided for @locationPickerNoResultsBody.
  ///
  /// In en, this message translates to:
  /// **'Try a different name or city.'**
  String get locationPickerNoResultsBody;

  /// No description provided for @lastUpdated.
  ///
  /// In en, this message translates to:
  /// **'Last updated'**
  String get lastUpdated;

  /// No description provided for @sourceMock.
  ///
  /// In en, this message translates to:
  /// **'Mock data'**
  String get sourceMock;

  /// No description provided for @sourceCached.
  ///
  /// In en, this message translates to:
  /// **'Saved'**
  String get sourceCached;

  /// No description provided for @sourceLive.
  ///
  /// In en, this message translates to:
  /// **'Live'**
  String get sourceLive;

  /// No description provided for @transferDirect.
  ///
  /// In en, this message translates to:
  /// **'Direct'**
  String get transferDirect;

  /// No description provided for @transferOne.
  ///
  /// In en, this message translates to:
  /// **'1 transfer'**
  String get transferOne;

  /// No description provided for @transferOneToTwo.
  ///
  /// In en, this message translates to:
  /// **'1–2 transfers'**
  String get transferOneToTwo;

  /// No description provided for @transferDockSwap.
  ///
  /// In en, this message translates to:
  /// **'Dock swap recommended'**
  String get transferDockSwap;

  /// No description provided for @errorTitle.
  ///
  /// In en, this message translates to:
  /// **'Something went wrong'**
  String get errorTitle;

  /// No description provided for @errorSearchFailed.
  ///
  /// In en, this message translates to:
  /// **'We couldn’t load fares right now. Please try again.'**
  String get errorSearchFailed;

  /// No description provided for @errorApiNotReady.
  ///
  /// In en, this message translates to:
  /// **'API mode isn’t available yet. Switch back to Mock in Settings.'**
  String get errorApiNotReady;

  /// No description provided for @retry.
  ///
  /// In en, this message translates to:
  /// **'Retry'**
  String get retry;

  /// No description provided for @compareSelectedCountLabel.
  ///
  /// In en, this message translates to:
  /// **'Selected: {count}'**
  String compareSelectedCountLabel(Object count);

  /// No description provided for @selectAll.
  ///
  /// In en, this message translates to:
  /// **'Select all'**
  String get selectAll;

  /// No description provided for @compareSortLabel.
  ///
  /// In en, this message translates to:
  /// **'Sort by'**
  String get compareSortLabel;

  /// No description provided for @compareSortCheapest.
  ///
  /// In en, this message translates to:
  /// **'Cheapest'**
  String get compareSortCheapest;

  /// No description provided for @compareSortFastest.
  ///
  /// In en, this message translates to:
  /// **'Fastest'**
  String get compareSortFastest;

  /// No description provided for @compareSortFewestTransfers.
  ///
  /// In en, this message translates to:
  /// **'Fewest transfers'**
  String get compareSortFewestTransfers;

  /// No description provided for @privacy.
  ///
  /// In en, this message translates to:
  /// **'Privacy'**
  String get privacy;

  /// No description provided for @privacyBody.
  ///
  /// In en, this message translates to:
  /// **'Your searches, saved routes, history, and offline data are stored locally on your device. No account required. No tracking by default.'**
  String get privacyBody;

  /// No description provided for @privacyReadMore.
  ///
  /// In en, this message translates to:
  /// **'Read more'**
  String get privacyReadMore;

  /// No description provided for @about.
  ///
  /// In en, this message translates to:
  /// **'About'**
  String get about;

  /// No description provided for @aboutVersion.
  ///
  /// In en, this message translates to:
  /// **'Version'**
  String get aboutVersion;

  /// No description provided for @aboutDataSource.
  ///
  /// In en, this message translates to:
  /// **'Data source'**
  String get aboutDataSource;

  /// No description provided for @notFoundTitle.
  ///
  /// In en, this message translates to:
  /// **'Page not found'**
  String get notFoundTitle;

  /// No description provided for @notFoundBody.
  ///
  /// In en, this message translates to:
  /// **'The page you’re looking for doesn’t exist or may have moved.'**
  String get notFoundBody;

  /// No description provided for @notFoundBackToSearch.
  ///
  /// In en, this message translates to:
  /// **'Back to search'**
  String get notFoundBackToSearch;

  /// No description provided for @termsOfUse.
  ///
  /// In en, this message translates to:
  /// **'Terms of Use'**
  String get termsOfUse;

  /// No description provided for @termsLastUpdated.
  ///
  /// In en, this message translates to:
  /// **'Last updated: September 21, 2026'**
  String get termsLastUpdated;

  /// No description provided for @termsIntro.
  ///
  /// In en, this message translates to:
  /// **'These Terms of Use (\"Terms\") govern your use of Taiwan Fare Finder (the \"App\"). By using the App, you agree to these Terms. If you don\'t agree, please don\'t use the App.'**
  String get termsIntro;

  /// No description provided for @termsSection1Title.
  ///
  /// In en, this message translates to:
  /// **'Acceptance of These Terms'**
  String get termsSection1Title;

  /// No description provided for @termsSection1Body.
  ///
  /// In en, this message translates to:
  /// **'By downloading, installing, or using Taiwan Fare Finder, you accept these Terms in full. We may update these Terms from time to time; continuing to use the App after an update means you accept the revised Terms.'**
  String get termsSection1Body;

  /// No description provided for @termsSection2Title.
  ///
  /// In en, this message translates to:
  /// **'The Service'**
  String get termsSection2Title;

  /// No description provided for @termsSection2Body.
  ///
  /// In en, this message translates to:
  /// **'Taiwan Fare Finder is an informational tool for searching, comparing, and saving public transportation fares across Taiwan. It does not sell tickets, process payments, or connect to any transit operator\'s booking system.'**
  String get termsSection2Body;

  /// No description provided for @termsSection3Title.
  ///
  /// In en, this message translates to:
  /// **'Fare Accuracy & Data Sources'**
  String get termsSection3Title;

  /// No description provided for @termsSection3Body.
  ///
  /// In en, this message translates to:
  /// **'High Speed Rail (HSR) and Taiwan Railway (TRA) fares are retrieved from Taiwan\'s official TDX open-data platform when API mode is enabled. MRT, Bus, and YouBike fares use a consistent internal estimate, not official pricing. In all cases, fares and travel times may be outdated, cached, or inaccurate. Always confirm the actual fare with the relevant transit operator before you travel.'**
  String get termsSection3Body;

  /// No description provided for @termsSection4Title.
  ///
  /// In en, this message translates to:
  /// **'Acceptable Use'**
  String get termsSection4Title;

  /// No description provided for @termsSection4Body.
  ///
  /// In en, this message translates to:
  /// **'The App is for your personal, non-commercial use. You agree not to misuse the App or its backend services — for example, by sending an excessive volume of automated requests, attempting to extract API credentials, or interfering with the App\'s normal operation.'**
  String get termsSection4Body;

  /// No description provided for @termsSection5Title.
  ///
  /// In en, this message translates to:
  /// **'No Warranty & Limitation of Liability'**
  String get termsSection5Title;

  /// No description provided for @termsSection5Body.
  ///
  /// In en, this message translates to:
  /// **'The App is provided \"as is\" and \"as available,\" without warranties of any kind, express or implied, including accuracy, reliability, or fitness for a particular purpose. To the fullest extent permitted by law, we are not liable for any loss or damage arising from your use of the App, including missed trips or fare discrepancies.'**
  String get termsSection5Body;

  /// No description provided for @termsSection6Title.
  ///
  /// In en, this message translates to:
  /// **'Third-Party Services'**
  String get termsSection6Title;

  /// No description provided for @termsSection6Body.
  ///
  /// In en, this message translates to:
  /// **'Live HSR and TRA fare data is sourced from Taiwan\'s TDX (Transport Data eXchange) open-data platform, operated by Taiwan\'s Ministry of Transportation and Communications (tdx.transportdata.tw). Use of that data is subject to TDX\'s own terms, which we do not control.'**
  String get termsSection6Body;

  /// No description provided for @termsSection7Title.
  ///
  /// In en, this message translates to:
  /// **'Changes to These Terms'**
  String get termsSection7Title;

  /// No description provided for @termsSection7Body.
  ///
  /// In en, this message translates to:
  /// **'We may revise these Terms as the App evolves. The \"Last updated\" date above reflects the most recent revision. We encourage you to review these Terms periodically.'**
  String get termsSection7Body;

  /// No description provided for @termsSection8Title.
  ///
  /// In en, this message translates to:
  /// **'Contact'**
  String get termsSection8Title;

  /// No description provided for @termsSection8Body.
  ///
  /// In en, this message translates to:
  /// **'Questions about these Terms can be sent to maxfelix05@gmail.com.'**
  String get termsSection8Body;

  /// No description provided for @privacyPolicyTitle.
  ///
  /// In en, this message translates to:
  /// **'Privacy Policy'**
  String get privacyPolicyTitle;

  /// No description provided for @privacyLastUpdated.
  ///
  /// In en, this message translates to:
  /// **'Last updated: September 21, 2026'**
  String get privacyLastUpdated;

  /// No description provided for @privacyPolicyIntro.
  ///
  /// In en, this message translates to:
  /// **'Taiwan Fare Finder does not require an account, does not have a login, and does not operate a backend server of its own. This policy explains the little data the App does handle, and where it goes.'**
  String get privacyPolicyIntro;

  /// No description provided for @privacySection1Title.
  ///
  /// In en, this message translates to:
  /// **'Information We Store On Your Device'**
  String get privacySection1Title;

  /// No description provided for @privacySection1Body.
  ///
  /// In en, this message translates to:
  /// **'Your search history, saved (favorite) routes, cached fare results, and app settings (language, theme, offline mode) are stored locally on your device using standard app storage. This data is never uploaded to a server we operate — we don\'t have one.'**
  String get privacySection1Body;

  /// No description provided for @privacySection2Title.
  ///
  /// In en, this message translates to:
  /// **'Information Sent To Third Parties'**
  String get privacySection2Title;

  /// No description provided for @privacySection2Body.
  ///
  /// In en, this message translates to:
  /// **'In Mock data mode, nothing you search ever leaves your device. In API data mode, the origin and destination station identifiers for High Speed Rail and Taiwan Railway searches are sent — through our proxy server — to Taiwan\'s official TDX open-data platform to retrieve real fares. No name, account, or device identifier is attached to that request, because the App has none to send.'**
  String get privacySection2Body;

  /// No description provided for @privacySection3Title.
  ///
  /// In en, this message translates to:
  /// **'Analytics'**
  String get privacySection3Title;

  /// No description provided for @privacySection3Body.
  ///
  /// In en, this message translates to:
  /// **'The App currently logs a few event names locally for debugging purposes only (visible in developer logs on your own device) and does not transmit them anywhere. If we ever add real analytics or tracking, we will ask for your consent first.'**
  String get privacySection3Body;

  /// No description provided for @privacySection4Title.
  ///
  /// In en, this message translates to:
  /// **'Children\'s Privacy'**
  String get privacySection4Title;

  /// No description provided for @privacySection4Body.
  ///
  /// In en, this message translates to:
  /// **'The App does not knowingly collect personal information from anyone, including children, because it does not collect personal information from anyone. It is suitable for a general audience.'**
  String get privacySection4Body;

  /// No description provided for @privacySection5Title.
  ///
  /// In en, this message translates to:
  /// **'Your Choices & Data Deletion'**
  String get privacySection5Title;

  /// No description provided for @privacySection5Body.
  ///
  /// In en, this message translates to:
  /// **'You can clear your cached fares, search history, or favorites at any time from Settings → Data management. Uninstalling the App removes all data it stored on your device.'**
  String get privacySection5Body;

  /// No description provided for @privacySection6Title.
  ///
  /// In en, this message translates to:
  /// **'Changes to This Policy'**
  String get privacySection6Title;

  /// No description provided for @privacySection6Body.
  ///
  /// In en, this message translates to:
  /// **'We may update this Privacy Policy as the App evolves. The \"Last updated\" date above reflects the most recent revision.'**
  String get privacySection6Body;

  /// No description provided for @privacySection7Title.
  ///
  /// In en, this message translates to:
  /// **'Contact'**
  String get privacySection7Title;

  /// No description provided for @privacySection7Body.
  ///
  /// In en, this message translates to:
  /// **'Questions about this Privacy Policy can be sent to maxfelix05@gmail.com.'**
  String get privacySection7Body;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['en', 'id', 'zh'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when language+script codes are specified.
  switch (locale.languageCode) {
    case 'zh':
      {
        switch (locale.scriptCode) {
          case 'Hant':
            return AppLocalizationsZhHant();
        }
        break;
      }
  }

  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return AppLocalizationsEn();
    case 'id':
      return AppLocalizationsId();
    case 'zh':
      return AppLocalizationsZh();
  }

  throw FlutterError(
      'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
      'an issue with the localizations generation tool. Please file an issue '
      'on GitHub with a reproducible sample app and the gen-l10n configuration '
      'that was used.');
}
