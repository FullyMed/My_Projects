# Taiwan Fare Finder

A cross-platform Flutter app for searching and comparing public transportation fares across Taiwan. Supports HSR, TRA, MRT, Bus, and YouBike — with real-time TDX API data, offline caching, and a multilingual interface.

---

## Features

- **Fare search** — look up fares between 13 cities by selecting origin, destination, and transport mode
- **Fare comparison** — compare multiple modes side-by-side on the Compare page
- **Passenger tiers** — adult, student, child, and senior fares where available
- **Saved routes** — bookmark frequently used routes for quick access
- **Search history** — automatically tracks recent searches per user
- **Offline support** — LRU cache (up to 100 queries) stored in `shared_preferences`; works without a connection
- **Responsive layout** — adapts from phone to tablet to desktop (bottom nav → nav rail → extended nav rail)
- **Multilingual** — English, Traditional Chinese, Simplified Chinese, and Indonesian

---

## Supported Cities

Taipei, New Taipei (Banqiao), Taoyuan, Hsinchu, Miaoli, Taichung, Changhua, Yunlin, Chiayi, Tainan, Kaohsiung, Keelung

---

## Transport Modes

| Mode | Data Source |
|---|---|
| HSR (高鐵) | TDX live API |
| TRA (台鐵) | TDX live API |
| MRT | Deterministic mock |
| Bus | Deterministic mock |
| YouBike | Deterministic mock |

HSR and TRA fares are fetched from Taiwan's [TDX platform](https://tdx.transportdata.tw/). All other modes use a seeded mock that produces consistent results for a given route. On any API failure, the app falls back to the local cache.

---

## Getting Started

### Prerequisites

- Flutter SDK `^3.6.0`
- Dart SDK `^3.6.0`
- A TDX API account (free) for live HSR/TRA fares

### Install & run

```bash
flutter pub get
flutter run
```

### TDX credentials

Live HSR and TRA fares require a TDX client ID and secret. Add them to `lib/config/tdx_credentials.dart`:

```dart
const String tdxClientId = 'YOUR_CLIENT_ID';
const String tdxClientSecret = 'YOUR_CLIENT_SECRET';
```

Without credentials the app falls back to mock data for all modes.

---

## Project Structure

```
lib/
├── config/          # TDX credentials and station ID maps
├── controllers/     # ChangeNotifier controllers (Fare, Favorites, History, Settings, Session)
├── l10n/            # ARB locale files (en, zh, zh_Hant, id)
├── localization/    # TffLocalizations — runtime ARB loader (source of truth for i18n)
├── models/          # Data classes (Location, FareResult, RouteQuery, …)
├── nav.dart         # go_router route definitions
├── pages/           # Search, Compare, Saved, Settings, Shell
├── services/        # Business logic (FareService, TdxFareService, TdxAuthService, …)
├── theme.dart       # Material 3 theme, AppSpacing, AppRadius tokens
├── ui/              # Reusable design-system widgets (TffCard, TffButton, TffSkeleton, …)
└── utils/           # IdGenerator and other helpers
```

---

## Tech Stack

| Concern | Library |
|---|---|
| UI framework | Flutter (Material 3) |
| Fonts | Google Fonts — Plus Jakarta Sans |
| State management | `provider` |
| Navigation | `go_router` |
| Local storage | `shared_preferences` |
| HTTP | `http` |
| Localization | `flutter_localizations` + custom `TffLocalizations` |

---

## Localization

The app uses a custom `TffLocalizations` class that loads ARB files from `lib/l10n/` at runtime. To add a new string:

1. Add the key/value to all four ARB files: `app_en.arb`, `app_zh.arb`, `app_zh_Hant.arb`, `app_id.arb`
2. Add a getter to `lib/localization/tff_localizations.dart`

Do not use the generated `AppLocalizations` class — it is not wired to the app.

---

## Useful Commands

```bash
flutter pub get       # install dependencies
flutter run           # run on connected device/emulator
flutter analyze       # lint
dart format .         # format all Dart files
flutter test          # run tests
flutter gen-l10n      # regenerate ARB stubs (rarely needed)
flutter build apk     # build Android release
flutter build ios     # build iOS release
```
