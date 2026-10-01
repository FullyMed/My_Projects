# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Commands

```bash
flutter pub get          # install dependencies
flutter run              # run on connected device/emulator
flutter analyze          # lint (uses flutter_lints)
dart format .            # format all Dart files
flutter test             # run unit + widget tests (test/, ~30 tests, real TDX fixtures)
flutter gen-l10n         # regenerate ARB-based localization stubs (rarely needed)
flutter build apk        # build Android
flutter build ios        # build iOS
```

---

## Architecture

### Dependency graph

```
UI (pages, ui/) → Controllers (ChangeNotifier) → Services → LocalStorageService
                  SessionController             → UserService
                                                           → FareService (mock + TDX cache)
                                                                └─ TdxFareService (internal) → TdxAuthService
                                                           → FavoritesService
                                                           → HistoryService
                                                           → SettingsService
                                                           → AnalyticsService (stub)
                                                           → LocationService (static)
```

- **Services** are stateless `const`-constructible classes injected via `Provider`.
- **Controllers** extend `ChangeNotifier` and are exposed via `ChangeNotifierProvider` / `ChangeNotifierProxyProvider2`.
- **Pages** consume controllers with `context.watch<T>()` / `context.read<T>()`.

### User binding pattern

Every user-scoped controller (`FareController`, `CompareFareController`, `FavoritesController`, `HistoryController`, `SettingsController`) implements `bindUser(String? userId)` and exposes a `boundUserId` getter. In `main.dart`, each is wired as a `ChangeNotifierProxyProvider2<SessionController, XService, XController>`. When `SessionController` emits a new user, the `update` callback checks `if (next.boundUserId != userId)` then calls `Future.microtask(() => controller.bindUser(userId))` to avoid calling `notifyListeners` mid-build. Any new controller that needs per-user data must follow this same pattern, including the `boundUserId` guard to prevent redundant re-binds. These providers are created with **`lazy: false`** so every controller binds at startup. A lazily created one is only bound the first time a page reads it, so a re-run started from the Saved page reached an unbound controller whose `search()` silently returned (real bug, fixed 2026-10-01). Keep `lazy: false` on any new user-bound controller.

**Search and Compare have separate fare state.** `SearchPage` watches `FareController`; `ComparePage` watches `CompareFareController` (an empty subclass in `fare_controller.dart`, a distinct type so `Provider` can expose both). Both share one `FareService` and therefore one on-device cache. The shell keeps both pages alive (`indexedStack`), so a single shared controller let a comparison overwrite what Search showed and vice versa. Settings' "clear offline data" clears the cache through `FareController` and calls `CompareFareController.clearResults()`. Settings also calls `reloadCacheStats()` on open, because the other controller may have written to the cache.

Each page refills its form from its controller's `lastQuery` whenever a new query id appears (`_syncFormWith`), so a re-run from Saved shows the right origin, destination and modes. The result card, favorite button and retry act on `lastQuery` (the route actually searched), not on whatever the form currently holds. `FareController.search` tags each call with a sequence number and drops responses from superseded searches.

### Localization — two systems, one in use

The app ships two localization mechanisms:

1. **`TffLocalizations`** (`lib/localization/tff_localizations.dart`) — the system actually used by the app. It loads ARB files from `lib/l10n/app_<tag>.arb` at runtime via `rootBundle`. All UI code calls `TffLocalizations.of(context).someKey`. **This is the source of truth.**
2. **gen-l10n stubs** (`lib/l10n/app_localizations*.dart`) — generated from `l10n.yaml` but not consumed at runtime. Do not mix: never call `AppLocalizations.of(context)` in UI code.

When adding a new string, add it to every ARB file (`app_en.arb`, `app_zh.arb`, `app_zh_Hant.arb`, `app_id.arb`) and add a getter to `TffLocalizations`. A missing locale file falls back to `app_en.arb`.

Supported locale tags: `en`, `zh`, `zh_Hant`, `id`. **There is no Simplified Chinese:** `app_zh.arb` is also written in Traditional characters (a fallback for a bare `zh` locale), and Settings only offers English / 繁體中文 / Bahasa Indonesia. The app always uses the locale chosen in Settings (default `en`), never the device locale.

Use `l10n.modeLabel(mode)` / `l10n.modesLabel(modes)` for transport-mode names, and `LocationService.routeLabel(origin, destination, l10n.locale)` to show a stored route. History and favorites store English query tokens like `"Taipei"`; never display those raw.

### Fare data flow

`SearchPage` → `FareController.search(origin, destination, modes, offline, dataMode)` → `FareService.search(...)` (`ComparePage` does the same through `CompareFareController`):

- **Offline = true**: returns from `shared_preferences` cache only; empty results surface `'offline_no_cache'` error key.
- **DataMode.mock**: calls `_searchMock` which uses a deterministic FNV-1a seed `(queryKey | mode)` so the same route always produces the same fares and duration.
- **DataMode.api**: calls `_searchApi`, which delegates HSR and TRA to `TdxFareService`; all other modes use the mock. A mode with **no station** for the route (Keelung has no HSR) throws `RouteNotServedException`. `_searchApi` catches it per mode, skips that mode and returns it in `FareSearchResponse.unservedModes` → `FareController.unservedModes`. The UI shows "Not served on this route: HSR" above the other results (Compare) or a "No service on this route" empty state (Search). Any **other** failure aborts the whole search and falls back to cache with `'showing_cached_results'` as a snack key, or `'search_failed'` if the cache is also empty. It does **not** fall back to mock.
- **Cache**: up to 100 queries, LRU-evicted by `updatedAt`. Cache is per-`userId`.
- **`FareSource` enum**: `mock` (deterministic fake), `live` (fresh from TDX API — shown with a teal "Live" badge), `cache` (loaded from local storage — shown with a grey "Saved" badge). `upsertCache` always downgrades `live` results to `cache` when storing them.

Error and snack keys (e.g. `'offline_no_cache'`, `'search_failed'`, `'showing_cached_results'`) are raw string keys looked up by the UI via `TffLocalizations`.

### TDX API integration

Two ways in, chosen by `AppConfig.tdxProxyBaseUrl` (`lib/config/app_config.dart`, from `--dart-define=TFF_PROXY_BASE_URL`):

- **Proxy mode (set)** — `TdxFareService` prefixes every request with the proxy base URL and sends **no** `Authorization` header. The Cloudflare Worker in `proxy/` holds the secret and injects the token. This is the only supported release configuration. Web builds hard-fail a direct call, so the secret can never ship in `main.dart.js`.
- **Direct mode (unset)** — `TdxAuthService` (`lib/services/tdx_auth_service.dart`) runs the OAuth2 `client_credentials` flow with `AppConfig.tdxClientId` / `tdxClientSecret` (from `--dart-define` `TDX_CLIENT_ID` / `TDX_CLIENT_SECRET`, typically via a gitignored `tdx.env.json`), caching the token in memory (refreshed 60 s before expiry). No secret is stored in source. `getToken()` throws when credentials are absent, so the caller falls back to cache then mock. Local development only.

Station IDs are validated against `^[0-9A-Za-z]{2,10}$` before entering the OData `$filter`. TDX responses are decoded as UTF-8 from the raw bytes and parsed defensively; any shape mismatch throws and the caller falls back to cache. Never use `resp.body`: without a charset header it decodes as Latin-1, which would break the `成自` matching. `TdxFareService` takes an optional `http.Client` (passed through `FareService(httpClient:)`) so tests can serve fixtures; the default client is created on first use.

`TdxFareService` (`lib/services/tdx_fare_service.dart`) fetches real fares from TDX:

- **HSR**: calls `THSR/ODFare`, plus `THSR/GeneralTimetable` (cached 12 h in memory) for the minimum direct-service duration; falls back to the speed-estimate formula if no direct trains are found. Adult = `TicketType 1 / FareClass 1 / CabinClass 1`. Child **and** senior = the concession fare `FareClass 9 / CabinClass 1` (half price, e.g. Taipei→Zuoying 1490 / 745), falling back to 50%.
- **TRA**: calls `TRA/ODFare`; adult = `成自`, child = `孩自`, senior = `愛孩自` (concession: seniors 65+ / disabled / children), all Ziqiang. Duration uses the speed-estimate formula (TRA train types are too fragmented for reliable timetable parsing).
- **Student fares are estimates** on both railways, since neither has a fixed student ticket. The student price is 85% of adult, flagged with `FareBreakdown.studentEstimated = true` (persisted in the cache) and shown as "Student (est.)". Mock results don't set the flag, because the whole card already carries the Mock badge.
- All other modes are not supported and throw `ArgumentError`; `FareService._searchApi` handles this by falling back to mock for those modes.

Station name → TDX ID mappings live in `lib/config/tdx_station_map.dart` (`hsrStationId`, `traStationId`). All IDs were re-checked against the live `Rail/THSR/Station` and `Rail/TRA/Station` endpoints on 2026-10-01. `New Taipei` maps to Banqiao (HSR `1010`, TRA `1020`). Keelung is intentionally absent from the HSR map (there's no HSR there), so it's reported as "not served".

**Tests** (`test/`):
- `services/tdx_fare_service_test.dart` parses real TDX responses captured through the proxy on 2026-10-01 (`test/fixtures/`), served by a `MockClient` with no charset header.
- `services/fare_service_test.dart` covers mock determinism, not-served, cache fallback, offline mode, LRU (100) and per-user clear.
- `services/saved_routes_test.dart` covers mode-order-insensitive dedupe and per-user row preservation.
- `controllers/fare_controller_test.dart` covers the stale-response guard and Search/Compare independence.
- `widgets/` drives the real `TffApp`: the search → compare → favorite → Saved flow, Settings open/close, a zh_Hant history re-run onto Compare, and **no-overflow checks of every page** at 375 dp in Indonesian and in a 1280×640 desktop window.

`AppRouter.router` is a static singleton that can't be reused by a second `TffApp` in the same isolate, so **each widget test file pumps the app exactly once** (one `testWidgets` per file).

### Location model

`Location` (`lib/models/location.dart`) is the canonical pickable origin/destination. It carries a stable `id`, localized names (`nameEn`, `nameZhHant`, `nameId`) and city names. `queryToken` returns the English name used as the key into `FareService._cityKm` and `TdxStationMap`.

`Location.fromRaw(String raw)` is a static factory that wraps an unresolved city-name string as a `Location` — used when history/favorites reference a name that `LocationService.findByAnyName` can no longer resolve (e.g. after a rename). The resulting `Location` is display-only; its `queryToken` equals the raw string.

`LocationService` (`lib/services/location_service.dart`) is a static-only service that provides:
- `starterLocations` — the complete list of 13 locations (12 cities, plus Banqiao as a separate New Taipei stop).
- `popular()` — a curated short list shown before the user has history.
- `filter(query)` — case-insensitive search across all name fields.
- `findByAnyName(raw)` — exact-match lookup by any localized name.
- `displayName(raw, locale)` / `routeLabel(origin, destination, locale)` — localized names for stored query tokens (history, favorites, result subtitles).
- `groupByCityEn(locations)` — groups a location list into a `Map<String, List<Location>>` keyed by English city name; used by `LocationPickerSheet` to render grouped sections.

### Shared UI components (`lib/ui/`)

A design-system layer of reusable widgets:

| Widget | Purpose |
|---|---|
| `TffPageScaffold` | Standard page wrapper (safe area, consistent padding) |
| `TffCard` | Elevated card with consistent radius and theme |
| `TffButton` | Primary / secondary / text button variants |
| `TffBadge` | Small label chip (e.g. "MOCK", "CACHED") |
| `TffModeChip` | Selectable transport-mode chip |
| `TffFareTable` | Fare breakdown table (adult / student / child / senior) — currently unused; `FareResultCard` has its own tier grid |
| `FareResultCard` | One fare result: mode title, optional route `subtitle`, source badge (Mock / Live / Saved), adult price, tier grid ("Student (est.)" when estimated) |
| `TffErrorCard` | Inline error display with optional retry action |
| `TffEmptyState` | Full-page or inline empty-state illustration + copy |
| `TffSkeleton` | Shimmer placeholders for loading states — `FareResultSkeletonCard`/`CompareResultsSkeletonList` (Search/Compare) and `RouteTileSkeleton`/`RouteTileSkeletonList` (Saved page favorites/history) |
| `TffSwapButton` | Animated origin ↔ destination swap button |
| `TffAdaptive` | Adaptive layout helper — 3-tier breakpoints (phone / tablet / desktop) and navigation helpers (`useNavRail`, `isWide`, etc.) |
| `LocationField` | Text field for origin/destination input |
| `LocationPickerSheet` | Bottom sheet for picking a `Location` |
| `LegalSection` | Titled paragraph block used to compose the Terms of Use / Privacy Policy pages |

### Routes

Defined in `lib/nav.dart` via `go_router`:

| Path | Widget |
|---|---|
| `/search` | `SearchPage` (initial) |
| `/compare` | `ComparePage` |
| `/saved` | `SavedPage` |
| `/settings` | `SettingsPage` (pushed with fade+slide, not in shell) |
| `/terms` | `TermsPage` (pushed with fade+slide, not in shell) |
| `/privacy` | `PrivacyPolicyPage` (pushed with fade+slide, not in shell) |

`/search`, `/compare`, `/saved` are wrapped in a `StatefulShellRoute.indexedStack` rendered by `ShellPage`. `AppRoutes` holds the path constants. Settings, Terms and Privacy close with `closePushedPage(context)` (in `nav.dart`), which pops when possible and otherwise goes to Search. On web these pages can be opened directly by URL with nothing to pop, and `context.pop()` threw there. `GoRouter.errorBuilder` renders `NotFoundPage` (`lib/pages/not_found_page.dart`) for any unmatched route — reuses `TffPageScaffold` + `TffEmptyState` + `TffPrimaryButton` and routes back to `AppRoutes.search`. Its strings (`notFoundTitle`, `notFoundBody`, `notFoundBackToSearch`) follow the normal ARB + `TffLocalizations` getter pattern.

`TermsPage` (`lib/pages/terms_page.dart`) and `PrivacyPolicyPage` (`lib/pages/privacy_page.dart`) are full-page, scrollable legal documents built from `LegalSection` blocks, reached from Settings (`AboutCard`'s "Terms of Use" row, `PrivacyCard`'s "Read more" button). Their copy lives entirely in the ARB files (`terms*` / `privacy*` keys) like any other UI string — there is no separate content-management layer. Their Contact sections use `maxfelix05@gmail.com` as the support address (placeholder for now — swap for a dedicated address before wide release); see `store_listing/app_store.md` / `store_listing/play_store.md` for the matching Privacy Policy URL requirement.

### Theme & design tokens

`lib/theme.dart` defines:
- `lightTheme` / `darkTheme` (Material 3, bundled Plus Jakarta Sans variable font from `assets/fonts/` — no runtime download)
- `AppSpacing` — spacing scale (`xs` 4 → `xxl` 48)
- `AppRadius` — border radius scale (`sm` 8 → `xl` 24)
- `TextStyleExtensions` — `.bold`, `.semiBold`, `.medium`, etc. on `TextStyle`

### Responsive layout

`TffAdaptive` (`lib/ui/tff_adaptive.dart`) is the single source of truth for all breakpoints:

| Helper | Condition | Use for |
|---|---|---|
| `isPhone` | `< 600 dp` | Compact-only styling |
| `isMedium` | `600–840 dp` | Large phone / small tablet |
| `isExpanded` | `840–1200 dp` | Tablet / small laptop |
| `isLarge` | `>= 1200 dp` | Laptop / desktop |
| `useBottomNav` | `< 840 dp` | Show `BottomNavigationBar` |
| `useNavRail` | `>= 840 dp` | Show `NavigationRail` |
| `useExtendedNavRail` | `>= 1200 dp` | Show extended (labelled) `NavigationRail` |
| `isWide` | `>= 840 dp` | Switch to two-column content layout |

**Navigation shell** (`ShellPage`): `< 840 dp` → `BottomNavigationBar`; `840–1200 dp` → compact `NavigationRail`; `>= 1200 dp` → extended `NavigationRail` (always-visible labels).

**Content pages** use `TffAdaptive.isWide(context)` (not raw `constraints.maxWidth`) so the content breakpoint stays in sync with the navigation breakpoint. Always preserve `LayoutBuilder` → `ConstrainedBox` → `crossAxisAlignment.stretch` patterns, especially in `settings_page.dart`.

**SavedPage** (`/saved`): `< 840 dp` → tabbed (Favorites / History tabs); `>= 840 dp` → two-column side-by-side panels.
- Its `TabController` is created in `initState`, not as a lazy `late final` initializer. On wide layouts the tab bar is never built, so the lazy one first ran inside `dispose()` and threw.
- Re-running a saved route (`_rerunSaved`) navigates first (single-mode → Search, multi-mode → Compare), then searches on that page's controller and adds a history entry.
- Tapping anywhere on a tile re-runs it. Under 480 dp the "Search again" button is icon-only so the route name isn't squeezed to a few letters.
- Removing a favorite or history entry updates the list synchronously before the storage write, because a swiped `Dismissible` must leave the tree on the next build.

**Narrow-width rules learned the hard way**:
- Don't give a dropdown a fixed width next to a label; share the row with `Expanded`/`Flexible`. Compare's sort row is 2:3, with the dropdown capped at 220 and `isExpanded: true`.
- Put button groups that sit next to text in a `Wrap` so they can drop to the next line.
- Indonesian labels are the longest; the phone layout test covers them.

### Utilities

`IdGenerator` (`lib/utils/id_generator.dart`) generates microsecond-timestamp + random-suffix IDs for `RouteQuery` and similar models. Never use `DateTime.now()` alone for IDs.

`estimateTravelMinutes` (`lib/utils/travel_duration.dart`) is the single source of truth for the speed + boarding-time duration formula. Both `FareService._durationByMode` (mock path) and `TdxFareService._durationFallback` (API fallback) delegate to it. Tune values only here.

### App icon

`assets/icons/app_icon.png` (1024×1024, generated by `scripts/gen_icon.py` — a fare-ticket glyph in the app's teal/blue brand colors, not a checked-in design tool asset) is the single source `flutter_launcher_icons` reads for Android, iOS, and web. The `flutter_launcher_icons` block in `pubspec.yaml` drives all three; regenerate every platform's icon files with:

```bash
dart run flutter_launcher_icons
```

To tweak the design, edit `scripts/gen_icon.py` (pure Pillow shape drawing, no external assets) and rerun both that script and the command above.

---

## Key constraints

- **Never break localization**: every new user-facing string needs entries in all four ARB files and a getter in `TffLocalizations`.
- **Never hardcode fare values**: all fares go through the deterministic mock in `FareService._mock` or the TDX API path.
- **Keep mock fallback**: `DataMode.api` uses mock for non-HSR/TRA modes, and `FareService.search` falls back to cache on any failure. A missing station is "not served" for that mode only, never a whole-search failure. All three paths must remain intact.
- **Search and Compare state stay separate**: never make both pages watch the same fare controller again.
- **HSR + TRA are live via TDX**: do not revert them to `UnimplementedError`. Adding a new mode to the API path means adding it to `TdxFareService.fetch` and its station map.
- **Offline always works**: the cache + offline-toggle path must remain functional regardless of API state.
- **Use `Location` for UI inputs**: never pass raw city-name strings from UI to controllers — always resolve through `LocationService` and pass `location.queryToken` for cache keys and station lookups. When *displaying* a stored token, go through `LocationService.routeLabel` / `displayName` so it's localized.
- **Run `flutter analyze` and `flutter test` before calling a change done**; both were clean as of 2026-10-01.
- **Don't run `dart format .` across the repo** as part of an unrelated change. Most files predate the formatter, and it rewraps ~50 of them, which buries the real diff. Format only new files.
- **`AnalyticsService` is a stub**: it only `debugPrint`s. Do not add real tracking without also wiring a consent UI.
- **Keep store listing copy in sync**: `store_listing/app_store.md` and `store_listing/play_store.md` hold per-locale (en, zh-Hant, id) title/description/keyword copy for App Store Connect and Play Console. When features, supported cities, or supported languages change, update these files in the same change.
- **Loading states are shimmer skeletons, not spinners**: every list/card that loads async data (fare results, favorites, history) shows a `TffSkeleton` placeholder shaped like the real content while its controller's `isLoading` is true — not a bare `CircularProgressIndicator`. A small inline spinner (e.g. `_DangerAction` in `settings_page.dart`) is only appropriate for a short, in-place busy state on a button/row triggered by the user's own tap, not for initial page/list loads.

---

## Known TODOs / Open Items

Carried over between chat sessions — read this before assuming the project is "done." Pick any of these up without needing prior conversation context:

- **Register the iOS App ID.** The bundle ID is now `com.felix.taiwanfarefinder` (tests: `.RunnerTests`), matching Android; it was changed from the template's `com.mycompany.CounterApp` on 2026-10-01. The matching App ID and provisioning profile still have to be created in the Apple Developer account before an App Store Connect record. This hasn't been verified with an Xcode build (this machine runs Windows).
- **Store listings need real hosted URLs, not just in-app pages.** `store_listing/app_store.md` and `store_listing/play_store.md` each have a "Fields not filled in" list — Privacy Policy URL (required by both stores) and Support URL (Apple) need to be real public URLs. Content to host is already written: `lib/pages/privacy_page.dart` + the `privacy*` ARB keys.
- **Category / age rating / price are still just suggestions** in both `store_listing/*.md` files (Travel category, Everyone/4+, Free) — need explicit confirmation from Felix, not just left as-is, before submission.
- **Not run on a real Android/iOS device or emulator in the 2026-10-01 pass.** It was verified with `flutter analyze`, the test suite, and a release **web** build clicked through against the live proxy (mock and API mode, not-served, re-run, en / zh_Hant / id). A device run is still worth doing before release.
- **Mock data is coarse.** Distance comes from a 1-D west-coast km table (`FareService._cityKm`), so MRT or YouBike between distant cities produce plausible-looking but meaningless numbers. Keelung + HSR also shows a mock fare in Mock mode; only API mode reports "not served". Fine for a demo mode, but it isn't real data.
- `.flutter-plugins-dependencies` is committed even though `.gitignore` lists it. Remove it from the index with `git rm --cached .flutter-plugins-dependencies` when convenient.
- `architecture.md` is an early design note (it still says gen-l10n and three languages). `design_system.md` and `ui_components_notes.md` are one-line design prompts, not documentation. This file and `README.md` are the up-to-date references.
- Not a TODO, just a note: the Terms/Privacy "Contact" sections intentionally use `maxfelix05@gmail.com` (Felix's own address, explicitly approved as a stand-in) — not a leftover placeholder to chase down, just something to eventually swap for a dedicated support address.
