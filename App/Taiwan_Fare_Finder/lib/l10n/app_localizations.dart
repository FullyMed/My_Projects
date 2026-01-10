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
  /// **'Mock data is stable and offline-friendly. API mode will be added in a future update.'**
  String get dataModeBody;

  /// No description provided for @dataModeMock.
  ///
  /// In en, this message translates to:
  /// **'Mock'**
  String get dataModeMock;

  /// No description provided for @dataModeApi.
  ///
  /// In en, this message translates to:
  /// **'API (soon)'**
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
