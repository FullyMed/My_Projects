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
                                                           → FareService (mock + cache)
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
- **DataMode.api**: throws `UnimplementedError` (the stub for future TDX integration); the controller maps this to the `'api_not_ready'` error key.
- **Cache**: up to 100 queries, LRU-evicted by `updatedAt`. Cache is per-`userId`.

Error and snack keys (e.g. `'offline_no_cache'`, `'api_not_ready'`) are raw string keys looked up by the UI via `TffLocalizations`.

### Routes

Defined in `lib/nav.dart` via `go_router`:

| Path | Widget |
|---|---|
| `/search` | `SearchPage` (initial) |
| `/compare` | `ComparePage` |
| `/saved` | `SavedPage` |
| `/settings` | `SettingsPage` (pushed, not in shell) |

`/search`, `/compare`, `/saved` are wrapped in a `StatefulShellRoute.indexedStack` rendered by `ShellPage`.

### Theme & design tokens

`lib/theme.dart` defines:
- `lightTheme` / `darkTheme` (Material 3, Google Fonts Inter)
- `AppSpacing` — spacing scale (`xs` 4 → `xxl` 48)
- `AppRadius` — border radius scale (`sm` 8 → `xl` 24)
- `TextStyleExtensions` — `.bold`, `.semiBold`, `.medium`, etc. on `TextStyle`

### Responsive layout

Tablet breakpoint: `>= 840 dp`. Always preserve `LayoutBuilder` → `ConstrainedBox` → `crossAxisAlignment.stretch` patterns, especially in `settings_page.dart`.

---

## Key constraints

- **Never break localization**: every new user-facing string needs entries in all four ARB files and a getter in `TffLocalizations`.
- **Never hardcode fare values**: all fares go through the deterministic mock in `FareService._mock` or the future API path.
- **Keep mock fallback**: `DataMode.api` must still fall back to cache on failure; the cache path in `FareService.search` handles this.
- **One API at a time**: when implementing TDX, wire only TRA first (`FareService._searchApi`), keep mock for all other modes.
- **Offline always works**: the cache + offline-toggle path must remain functional regardless of API state.
