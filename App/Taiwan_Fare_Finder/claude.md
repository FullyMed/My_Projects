# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Commands

```bash
flutter pub get          # install dependencies
flutter run              # run on connected device/emulator
flutter analyze          # lint (uses flutter_lints)
dart format .            # format all Dart files
flutter test             # run tests
flutter gen-l10n         # regenerate ARB-based localization stubs (rarely needed)
flutter build apk        # build Android
flutter build ios        # build iOS
```

---

## Architecture

### Dependency graph

```
UI (pages, ui/) → Controllers (ChangeNotifier) → Services → LocalStorageService
                                                           → FareService (mock + TDX cache)
                                                           → FavoritesService
                                                           → HistoryService
                                                           → SettingsService
                                                           → TdxAuthService → TdxFareService
                                                           → AnalyticsService (stub)
                                                           → LocationService (static)
```

- **Services** are stateless `const`-constructible classes injected via `Provider`.
- **Controllers** extend `ChangeNotifier` and are exposed via `ChangeNotifierProvider` / `ChangeNotifierProxyProvider2`.
- **Pages** consume controllers with `context.watch<T>()` / `context.read<T>()`.

### User binding pattern

Every user-scoped controller (`FareController`, `FavoritesController`, `HistoryController`, `SettingsController`) implements `bindUser(String? userId)`. In `main.dart`, each is wired as a `ChangeNotifierProxyProvider2<SessionController, XService, XController>`. When `SessionController` emits a new user, the `update` callback calls `Future.microtask(() => controller.bindUser(userId))` to avoid calling `notifyListeners` mid-build. Any new controller that needs per-user data must follow this same pattern.

### Localization — two systems, one in use

The app ships two localization mechanisms:

1. **`TffLocalizations`** (`lib/localization/tff_localizations.dart`) — the system actually used by the app. It loads ARB files from `lib/l10n/app_<tag>.arb` at runtime via `rootBundle`. All UI code calls `TffLocalizations.of(context).someKey`. **This is the source of truth.**
2. **gen-l10n stubs** (`lib/l10n/app_localizations*.dart`) — generated from `l10n.yaml` but not consumed at runtime. Do not mix: never call `AppLocalizations.of(context)` in UI code.

When adding a new string, add it to every ARB file (`app_en.arb`, `app_zh.arb`, `app_zh_Hant.arb`, `app_id.arb`) and add a getter to `TffLocalizations`.

Supported locale tags: `en`, `zh`, `zh_Hant`, `id`.

### Fare data flow

`SearchPage` → `FareController.search(origin, destination, modes, offline, dataMode)` → `FareService.search(...)`:

- **Offline = true**: returns from `shared_preferences` cache only; empty results surface `'offline_no_cache'` error key.
- **DataMode.mock**: calls `_searchMock` which uses a deterministic FNV-1a seed `(queryKey | mode)` so the same route always produces the same fares and duration.
- **DataMode.api**: calls `_searchApi` which delegates HSR and TRA to `TdxFareService`; all other modes fall back to mock. On any failure, the controller falls back to cache and surfaces `'showing_cached_results'` as a snack key (or `'search_failed'` if cache is also empty).
- **Cache**: up to 100 queries, LRU-evicted by `updatedAt`. Cache is per-`userId`.

Error and snack keys (e.g. `'offline_no_cache'`, `'search_failed'`, `'showing_cached_results'`) are raw string keys looked up by the UI via `TffLocalizations`.

### TDX API integration

`TdxAuthService` (`lib/services/tdx_auth_service.dart`) manages OAuth2 `client_credentials` tokens. It caches the token in memory and refreshes 60 s before expiry. Credentials are stored in `lib/config/tdx_credentials.dart` (`tdxClientId` / `tdxClientSecret`).

`TdxFareService` (`lib/services/tdx_fare_service.dart`) fetches real fares from TDX:

- **HSR**: calls `THSR/ODFare` for fare breakdown and `THSR/GeneralTimetable` (cached 12 h in memory) for the minimum direct-service duration. Falls back to the speed-estimate formula if no direct trains are found.
- **TRA**: calls `TRA/ODFare`; parses adult (成自) and child (孩自) Ziqiang fares. Duration uses the speed-estimate formula (TRA train types are too fragmented for reliable timetable parsing).
- All other modes are not supported and throw `ArgumentError`; `FareService._searchApi` handles this by falling back to mock for those modes.

Station name → TDX ID mappings live in `lib/config/tdx_station_map.dart` (`hsrStationId`, `traStationId`).

### Location model

`Location` (`lib/models/location.dart`) is the canonical pickable origin/destination. It carries a stable `id`, localized names (`nameEn`, `nameZhHant`, `nameId`) and city names. `queryToken` returns the English name used as the key into `FareService._cityKm` and `TdxStationMap`.

`LocationService` (`lib/services/location_service.dart`) is a static-only service that provides:
- `starterLocations` — the complete list of 13 supported cities.
- `popular()` — a curated short list shown before the user has history.
- `filter(query)` — case-insensitive search across all name fields.
- `findByAnyName(raw)` — exact-match lookup by any localized name.

### Shared UI components (`lib/ui/`)

A design-system layer of reusable widgets:

| Widget | Purpose |
|---|---|
| `TffPageScaffold` | Standard page wrapper (safe area, consistent padding) |
| `TffCard` | Elevated card with consistent radius and theme |
| `TffButton` | Primary / secondary / text button variants |
| `TffBadge` | Small label chip (e.g. "MOCK", "CACHED") |
| `TffModeChip` | Selectable transport-mode chip |
| `TffFareTable` | Fare breakdown table (adult / student / child / senior) |
| `TffErrorCard` | Inline error display with optional retry action |
| `TffEmptyState` | Full-page or inline empty-state illustration + copy |
| `TffSkeleton` | Shimmer placeholder for loading states |
| `TffSwapButton` | Animated origin ↔ destination swap button |
| `TffAdaptive` | Adaptive layout helper (phone vs. tablet) |
| `LocationField` | Text field for origin/destination input |
| `LocationPickerSheet` | Bottom sheet for picking a `Location` |

### Routes

Defined in `lib/nav.dart` via `go_router`:

| Path | Widget |
|---|---|
| `/search` | `SearchPage` (initial) |
| `/compare` | `ComparePage` |
| `/saved` | `SavedPage` |
| `/settings` | `SettingsPage` (pushed with fade+slide, not in shell) |

`/search`, `/compare`, `/saved` are wrapped in a `StatefulShellRoute.indexedStack` rendered by `ShellPage`. `AppRoutes` holds the path constants.

### Theme & design tokens

`lib/theme.dart` defines:
- `lightTheme` / `darkTheme` (Material 3, Google Fonts Inter)
- `AppSpacing` — spacing scale (`xs` 4 → `xxl` 48)
- `AppRadius` — border radius scale (`sm` 8 → `xl` 24)
- `TextStyleExtensions` — `.bold`, `.semiBold`, `.medium`, etc. on `TextStyle`

### Responsive layout

Tablet breakpoint: `>= 840 dp`. Always preserve `LayoutBuilder` → `ConstrainedBox` → `crossAxisAlignment.stretch` patterns, especially in `settings_page.dart`.

### Utilities

`IdGenerator` (`lib/utils/id_generator.dart`) generates microsecond-timestamp + random-suffix IDs for `RouteQuery` and similar models. Never use `DateTime.now()` alone for IDs.

---

## Key constraints

- **Never break localization**: every new user-facing string needs entries in all four ARB files and a getter in `TffLocalizations`.
- **Never hardcode fare values**: all fares go through the deterministic mock in `FareService._mock` or the TDX API path.
- **Keep mock fallback**: `DataMode.api` falls back to mock for non-HSR/TRA modes; `FareService.search` falls back to cache on any failure. Both paths must remain intact.
- **HSR + TRA are live via TDX**: do not revert them to `UnimplementedError`. Adding a new mode to the API path means adding it to `TdxFareService.fetch` and its station map.
- **Offline always works**: the cache + offline-toggle path must remain functional regardless of API state.
- **Use `Location` for UI inputs**: never pass raw city-name strings from UI to controllers — always resolve through `LocationService` and pass `location.queryToken` for cache keys and station lookups.
- **`AnalyticsService` is a stub**: it only `debugPrint`s. Do not add real tracking without also wiring a consent UI.
