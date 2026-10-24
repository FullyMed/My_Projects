# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

---

## Commands

```bash
flutter pub get          # install dependencies
flutter run              # run on a connected device or emulator
flutter analyze          # lint (flutter_lints)
flutter test             # unit + widget tests (test/, 32 tests, real TDX fixtures)
flutter gen-l10n         # regenerate the ARB localization stubs (rarely needed)
flutter build apk        # build Android
flutter build ios        # build iOS
dart format <file>       # format NEW files only (see Key constraints)
python scripts/gen_fonts.py  # regenerate the static font weights (needs fontTools)
cd proxy && npm test     # Worker tests (Node's built-in runner, fakes only, no network)
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

- Services are stateless, `const`-constructible classes injected with `Provider`.
- Controllers extend `ChangeNotifier` and are exposed with `ChangeNotifierProvider` / `ChangeNotifierProxyProvider2`.
- Pages read controllers with `context.watch<T>()` / `context.read<T>()`.

### User binding pattern

Every user-scoped controller (`FareController`, `CompareFareController`, `FavoritesController`, `HistoryController`, `SettingsController`) implements `bindUser(String? userId)` and exposes a `boundUserId` getter. In `main.dart`, each one is a `ChangeNotifierProxyProvider2<SessionController, XService, XController>`. When `SessionController` emits a new user, the `update` callback checks `if (next.boundUserId != userId)` and then calls `Future.microtask(() => controller.bindUser(userId))`, so `notifyListeners` never runs mid-build. A new controller that needs per-user data must follow the same pattern, including the `boundUserId` guard against redundant re-binds.

These providers use `lazy: false`, so every controller binds at startup. A lazy provider binds only when a page first reads it. That's how a re-run started from the Saved page once reached an unbound controller whose `search()` returned without doing anything (fixed 2026-10-01). Keep `lazy: false` on any new user-bound controller.

Search and Compare have separate fare state. `SearchPage` watches `FareController` and `ComparePage` watches `CompareFareController`, an empty subclass in `fare_controller.dart` that exists so `Provider` can expose both types. Both share one `FareService` and so one on-device cache. The shell keeps both pages alive (`indexedStack`), and with a single shared controller a comparison overwrote what Search showed, and the other way round. Settings' "clear offline data" clears the cache through `FareController` and then calls `CompareFareController.clearResults()`. Settings also calls `reloadCacheStats()` when it opens, because the other controller may have written to the cache.

Each page refills its form from its controller's `lastQuery` whenever a new query id appears (`_syncFormWith`), so a re-run from Saved shows the right origin, destination and modes. The result card, favorite button and retry act on `lastQuery` (the route that was searched), not on whatever the form holds now. `FareController.search` tags each call with a sequence number and drops responses from superseded searches.

### Localization: two systems, one in use

1. `TffLocalizations` (`lib/localization/tff_localizations.dart`) is what the app uses. It loads `lib/l10n/app_<tag>.arb` at runtime through `rootBundle`, and all UI code calls `TffLocalizations.of(context).someKey`. This is the source of truth.
2. The gen-l10n stubs (`lib/l10n/app_localizations*.dart`) are generated from `l10n.yaml` but never used at runtime. Don't call `AppLocalizations.of(context)` in UI code. A build regenerates them when the ARB files change, so they show up in diffs.

To add a string, add it to all four ARB files (`app_en.arb`, `app_zh.arb`, `app_zh_Hant.arb`, `app_id.arb`) and add a getter to `TffLocalizations`. A missing locale file falls back to `app_en.arb`.

Locale tags: `en`, `zh`, `zh_Hant`, `id`. There is no Simplified Chinese. `app_zh.arb` holds the same Traditional text as `app_zh_Hant.arb` (a fallback for a bare `zh` locale), and Settings offers only English / 繁體中文 / Bahasa Indonesia. The app always uses the locale picked in Settings (default `en`), never the device locale.

Use `l10n.modeLabel(mode)` / `l10n.modesLabel(modes)` for transport-mode names, and `LocationService.routeLabel(origin, destination, l10n.locale)` to show a stored route. History and favorites store English query tokens like `"Taipei"`; never display those raw.

### Writing style

All user-facing text (the ARB strings in every language, the store listings, the web metadata, `pubspec.yaml`'s description) and the human docs (`README.md`, `SECURITY.md`, `proxy/README.md`) went through the Humanizer and Stop Slop skills on 2026-10-15. Keep new copy in the same voice:

- Plain and friendly, like a local who knows the trains. Talk to "you", keep sentences short, and say what happens in concrete terms ("Search it once while you're online and it'll be here offline too").
- Be honest about the data. MRT, bus and YouBike prices are estimates, and so is the student fare for HSR and TRA. Never call them real fares, and never say the app works "fully offline": offline mode shows only the last 100 searches.
- No em dashes (use commas, periods or parentheses), no curly quotes or apostrophes, no hype words ("seamless", "vibrant", "ultimate", "in seconds"), no "-ly" filler adverbs, and no "not X, it's Y" contrasts.
- Sentence-case headings and section titles. Keep proper names capitalized: "Terms of Use", "Privacy Policy", "HSR", "YouBike".
- One name per thing. A bookmarked route is a "saved route" (`favorites` in code, 收藏路線 in Chinese, "rute tersimpan" in Indonesian). The offline cache counts are "saved searches" and "saved fares". Buttons use verbs ("Compare fares", not "Fare comparison").
- UI verbs: "Pick" or "Choose" for selections, "Tap" for buttons.
- Chinese uses 你 in UI strings and 您 in the legal pages. Indonesian uses "Anda" throughout.
- Indonesian: the Live badge is "Terkini", because "Langsung" already means a direct train (no transfer) on the same card. The Saved tab is "Tersimpan" (a noun, not the verb "Simpan").
- The legal pages keep standard legal wording where it matters ("as is", "fitness for a particular purpose"). When you change their text, bump `termsLastUpdated` / `privacyLastUpdated` in all four ARB files.

### Fare data flow

`SearchPage` → `FareController.search(origin, destination, modes, offline, dataMode)` → `FareService.search(...)`. `ComparePage` does the same through `CompareFareController`.

- Offline on: returns cached results only. An empty result surfaces the `'offline_no_cache'` error key.
- `DataMode.mock`: `_searchMock` seeds a deterministic FNV-1a hash with `(queryKey | mode)`, so the same route always gets the same fares and duration.
- `DataMode.api`: `_searchApi` sends HSR and TRA to `TdxFareService` and uses the mock for every other mode. A mode with no station on the route (Keelung has no HSR) makes `TdxFareService` throw `RouteNotServedException`. `_searchApi` catches it per mode, skips that mode and returns it in `FareSearchResponse.unservedModes` → `FareController.unservedModes`. The UI shows "Not served on this route: HSR" above the other results on Compare, or a "No service on this route" empty state on Search. Any other failure aborts the whole search and falls back to cache with the `'showing_cached_results'` snack key, or `'search_failed'` if the cache is empty too. It never falls back to mock.
- Cache: up to 100 queries, evicted least-recently-used by `updatedAt`, kept per `userId`.
- `FareSource`: `mock` (deterministic fake, "Mock data" badge), `live` (fresh from TDX, teal "Live" badge), `cache` (from local storage, grey "Saved" badge). `upsertCache` always stores `live` results as `cache`.

Error and snack keys (`'offline_no_cache'`, `'search_failed'`, `'showing_cached_results'`) are raw strings the UI looks up through `TffLocalizations`.

### TDX API integration

`AppConfig.tdxProxyBaseUrl` (`lib/config/app_config.dart`, from `--dart-define=TFF_PROXY_BASE_URL`) picks one of two ways in:

- Proxy mode (set): `TdxFareService` prefixes every request with the proxy URL and sends no `Authorization` header. The Cloudflare Worker in `proxy/` holds the secret and adds the token. This is the only supported release setup. Web builds refuse a direct call, so the secret can never land in `main.dart.js`.
- Direct mode (unset): `TdxAuthService` (`lib/services/tdx_auth_service.dart`) runs the OAuth2 `client_credentials` flow with `AppConfig.tdxClientId` / `tdxClientSecret` (from the `TDX_CLIENT_ID` / `TDX_CLIENT_SECRET` defines, usually in a gitignored `tdx.env.json`) and keeps the token in memory, refreshing it 60 s before expiry. No secret is stored in source. Without credentials, `getToken()` throws and the search falls back to cache. Local development only.

Station IDs must match `^[0-9A-Za-z]{2,10}$` before they go into the OData `$filter`. The app decodes TDX responses as UTF-8 from the raw bytes and checks their shape; any mismatch throws and the caller falls back to cache. Never use `resp.body`: without a charset header it decodes as Latin-1, which breaks the `成自` matching. `TdxFareService` takes an optional `http.Client` (passed through `FareService(httpClient:)`) so tests can serve fixtures, and creates its default client on first use.

What `TdxFareService` (`lib/services/tdx_fare_service.dart`) fetches:

- HSR: `THSR/ODFare`, plus `THSR/GeneralTimetable` (cached 12 h in memory) for the shortest direct-train duration. With no direct trains it falls back to the speed estimate. Adult = `TicketType 1 / FareClass 1 / CabinClass 1`. Child and senior both use the concession fare `FareClass 9 / CabinClass 1` (half price, e.g. Taipei→Zuoying 1490 / 745), with 50% as a fallback.
- TRA: `TRA/ODFare`. Adult = `成自`, child = `孩自`, senior = `愛孩自` (the concession fare for seniors 65+, disabled passengers and children), all Ziqiang. Duration uses the speed estimate, because TRA's many train types make timetable parsing unreliable.
- Student fares are estimates on both railways, since neither sells a fixed student ticket. The student price is 85% of adult, flagged with `FareBreakdown.studentEstimated = true` (kept in the cache) and shown as "Student (est.)". Mock results don't set the flag, because the whole card already carries the Mock badge.
- `fetch` throws `ArgumentError` for any other mode. `_searchApi` never sends other modes to it.

Station name → TDX ID maps live in `lib/config/tdx_station_map.dart` (`hsrStationId`, `traStationId`). All IDs were re-checked against the live `Rail/THSR/Station` and `Rail/TRA/Station` endpoints on 2026-10-01. `New Taipei` maps to Banqiao (HSR `1010`, TRA `1020`). Keelung is left out of the HSR map on purpose, because it has no HSR station, so it shows up as "not served".

Tests (`test/`):
- `services/tdx_fare_service_test.dart` parses real TDX responses captured through the proxy on 2026-10-01 (`test/fixtures/`), served by a `MockClient` with no charset header.
- `services/fare_service_test.dart` covers mock determinism, not-served, cache fallback, offline mode, LRU (100) and per-user clearing.
- `services/saved_routes_test.dart` covers de-duplication that ignores mode order, and keeping other users' rows.
- `controllers/fare_controller_test.dart` covers the stale-response guard and Search/Compare independence.
- `widgets/` drives the real `TffApp`: the search → compare → favorite → Saved flow, Settings open/close, a zh_Hant history re-run onto Compare, overflow checks of every page at 375 dp in Indonesian and in a 1280×640 desktop window, every page with real content at 375 dp with 200% system text in Indonesian, with no price or route name cut off (`large_text_layout_test.dart`), and keyboard Tab/Space on the Settings choices with a visible focus ring (`keyboard_focus_test.dart`).

`AppRouter.router` is a static singleton that a second `TffApp` in the same isolate can't reuse, so each widget test file pumps the app exactly once (one `testWidgets` per file).

### Location model

`Location` (`lib/models/location.dart`) is the canonical origin/destination. It carries a stable `id`, localized names (`nameEn`, `nameZhHant`, `nameId`) and city names. `queryToken` returns the English name, which is the key into `FareService._cityKm` and the TDX station maps.

`Location.fromRaw(String raw)` wraps an unresolved name as a `Location`. History and favorites use it when `LocationService.findByAnyName` can't resolve a stored name any more (after a rename, say). The result is display-only, and its `queryToken` is the raw string.

`LocationService` (`lib/services/location_service.dart`) is static-only:
- `starterLocations`: all 13 locations (12 cities, plus Banqiao as a separate New Taipei stop).
- `popular()`: a short curated list shown before the user has any history.
- `filter(query)`: case-insensitive search across all name fields.
- `findByAnyName(raw)`: exact match on any localized name.
- `displayName(raw, locale)` / `routeLabel(origin, destination, locale)`: localized names for stored query tokens (history, favorites, result subtitles).
- `groupByCityEn(locations)`: groups locations into a `Map<String, List<Location>>` keyed by English city name, for the grouped sections in `LocationPickerSheet`.

### Shared UI components (`lib/ui/`)

| Widget | Purpose |
|---|---|
| `TffPageScaffold` | Standard page wrapper (safe area, padding) |
| `TffCard` | Solid surface card (white on the tinted page in light mode, lifted charcoal in dark). Its child sits on a transparent `Material`, so `InkWell` ripples inside it are visible |
| `TffButton` | `TffPrimaryButton` (presses scale to 0.97) and `TffTextButton` (48 dp minimum, label can shrink) |
| `TffBadge` | Small solid label chip ("Live", "Mock data", "Saved") |
| `TffModeChip` | Selectable transport-mode chip with a 48 dp tap target |
| `TffFocusRing` | Draws a 2 dp primary outline around an `InkWell` control while it has keyboard focus |
| `FareResultCard` | One fare result: mode title + source badge (they wrap onto two lines when space runs out), the route on its own line, the adult price, then student/child/senior as label-and-price rows with tabular figures ("Student (est.)" when estimated) |
| `TffErrorCard` | Inline error with an optional retry action |
| `TffEmptyState` | Empty state with an icon and short copy |
| `TffSkeleton` | Shimmer placeholders: `FareResultSkeletonCard` / `CompareResultsSkeletonList` (Search, Compare) and `RouteTileSkeleton` / `RouteTileSkeletonList` (Saved) |
| `TffSwapButton` | Animated origin ↔ destination swap button |
| `TffAdaptive` | Breakpoints (phone / tablet / desktop) and navigation helpers (`useNavRail`, `isWide`, …) |
| `LocationField` | Origin/destination field |
| `LocationPickerSheet` | Bottom sheet for picking a `Location` |
| `LegalSection` | Titled paragraph block for the Terms of Use and Privacy Policy pages |

### Routes

Defined in `lib/nav.dart` with `go_router`:

| Path | Widget |
|---|---|
| `/search` | `SearchPage` (initial) |
| `/compare` | `ComparePage` |
| `/saved` | `SavedPage` |
| `/settings` | `SettingsPage` (pushed with fade+slide, outside the shell) |
| `/terms` | `TermsPage` (pushed with fade+slide, outside the shell) |
| `/privacy` | `PrivacyPolicyPage` (pushed with fade+slide, outside the shell) |

`/search`, `/compare` and `/saved` sit in a `StatefulShellRoute.indexedStack` that `ShellPage` renders. `AppRoutes` holds the path constants. Settings, Terms and Privacy close with `closePushedPage(context)` (in `nav.dart`), which pops when it can and otherwise goes to Search. On web you can open these pages straight from a URL with nothing to pop, and `context.pop()` threw there. `GoRouter.errorBuilder` renders `NotFoundPage` (`lib/pages/not_found_page.dart`) for unknown routes. It reuses `TffPageScaffold`, `TffEmptyState` and `TffPrimaryButton` and links back to `AppRoutes.search`; its strings (`notFoundTitle`, `notFoundBody`, `notFoundBackToSearch`) follow the normal ARB + getter pattern.

`TermsPage` (`lib/pages/terms_page.dart`) and `PrivacyPolicyPage` (`lib/pages/privacy_page.dart`) are scrollable legal pages built from `LegalSection` blocks. You reach them from Settings: the "Terms of Use" row in `AboutCard` and the "Read more" button in `PrivacyCard`. Their text lives only in the ARB files (`terms*` / `privacy*` keys). The Contact sections use `maxfelix05@gmail.com` as a stand-in support address; swap it for a dedicated one before a wide release. The store listing files cover the matching Privacy Policy URL requirement.

### Theme and design tokens

`lib/theme.dart` defines:
- `lightTheme` / `darkTheme` (Material 3). `ThemeData.fontFamily` is Plus Jakarta Sans, so every Material component uses it, not only the text theme. Both themes add a 2 dp focus outline to every Material button (`_withFocusRings`).
- `AppSpacing`: spacing scale (`xs` 4 → `xxl` 48)
- `AppRadius`: radius scale (`sm` 8 → `xl` 24)
- `TffMotion`: duration tokens (`press` 100 ms, `fast` 160 ms, `medium` 220 ms), a strong ease-out curve, and `TffMotion.of(context, d)`, which returns zero when the OS asks for reduced motion
- `TextStyleExtensions`: `.bold`, `.semiBold`, `.medium`, … on `TextStyle`

Fonts: `pubspec.yaml` declares five static weights (`PlusJakartaSans-Regular/Medium/SemiBold/Bold/ExtraBold.ttf`). Flutter doesn't map `FontWeight` onto a variable font's `wght` axis: with only the variable file bundled, every weight rendered as Regular (measured, 2026-10-22). `scripts/gen_fonts.py` cuts the static files from `PlusJakartaSans-VariableFont_wght.ttf`, which stays in `assets/fonts/` as the source but isn't bundled. If you need a new weight, add it to the script and to `pubspec.yaml`.

### Responsive layout

`TffAdaptive` (`lib/ui/tff_adaptive.dart`) is the single source of truth for breakpoints:

| Helper | Condition | Use for |
|---|---|---|
| `isPhone` | `< 600 dp` | Compact-only styling |
| `isMedium` | `600–840 dp` | Large phone / small tablet |
| `isExpanded` | `840–1200 dp` | Tablet / small laptop |
| `isLarge` | `>= 1200 dp` | Laptop / desktop |
| `useBottomNav` | `< 840 dp` | Show `BottomNavigationBar` |
| `useNavRail` | `>= 840 dp` | Show `NavigationRail` |
| `useExtendedNavRail` | `>= 1200 dp` | Show the labelled `NavigationRail` |
| `isWide` | `>= 840 dp` | Switch to a two-column layout |

Navigation shell (`ShellPage`): below 840 dp a `BottomNavigationBar`, 840–1200 dp a compact `NavigationRail`, from 1200 dp an extended `NavigationRail` with labels.

Content pages use `TffAdaptive.isWide(context)` rather than raw `constraints.maxWidth`, so the content breakpoint stays in step with navigation. Keep the `LayoutBuilder` → `ConstrainedBox` → `crossAxisAlignment.stretch` pattern, especially in `settings_page.dart`.

`SavedPage` (`/saved`) uses tabs (Saved routes / History) below 840 dp and two side-by-side panels from 840 dp.
- It creates its `TabController` in `initState`, not with a lazy `late final` initializer. Wide layouts never build the tab bar, so a lazy one first ran inside `dispose()` and threw.
- Re-running a saved route (`_rerunSaved`) navigates first (one mode → Search, several → Compare), then searches on that page's controller and adds a history entry.
- Tapping anywhere on a tile re-runs it. Below 480 dp the "Search again" button shrinks to an icon so the route name has room.
- Removing a saved route or history entry updates the list before the storage write finishes, because a swiped `Dismissible` must leave the tree on the next build.

Narrow-width rules, learned from real overflows:
- Don't give a dropdown a fixed width next to a label. Share the row with `Expanded`/`Flexible`: Compare's sort row splits 2:3, with the dropdown capped at 220 and `isExpanded: true`.
- Put button groups that sit next to text in a `Wrap`, so they can drop to the next line.
- Indonesian labels are the longest, and the phone layout test covers them.

### Design rules

A design pass on 2026-10-22 used the UI/UX Pro Max, taste-skill (redesign-existing-projects), Frontend Design and Emil Kowalski design-engineering skills. It fixed problems rather than redesigning. Keep these rules:

- Color: one accent. Teal (`primary`) is the brand and means "trustworthy / live". Amber (`tertiary`, `tertiaryContainer`) is used only to flag estimates (the "Mock data" badge). Sky blue (`secondary`) is defined but not used for anything that matters. Don't add more accents.
- Surfaces: the page is a flat tinted grey (`#EEF3F4` light, `#111617` dark, `scaffoldBackgroundColor`). Cards are solid `surface` (white / `#1C2325`) with a hairline border, plus a soft teal shadow in light mode only. No page gradient and no `BackdropFilter` blur: there's nothing behind a card to blur, and the blur cost frames.
- Badges use solid container colors, never a color with opacity over the card, so their contrast doesn't depend on what's underneath. Live = `primaryContainer`, Mock data = `tertiaryContainer`, Saved = `surfaceContainerHighest`.
- Contrast: every text pair passes WCAG AA (4.5:1) in both themes, and icons and control fills pass 3:1. Checked with a script that composites the real colors. Recheck when you change a color token.
- Touch: interactive elements are at least 48 dp. Chips use `MaterialTapTargetSize.padded` (so the `Wrap` around them uses `runSpacing: 2`), `TffTextButton` has `minimumSize: 48`, Settings choices have `minHeight: 48`, and the swap button is a 48 dp `IconButton`.
- Feedback: anything tappable inside a `TffCard` uses `InkWell` (never a bare `GestureDetector`). Use `Ink` instead of `Container` when the tappable thing has its own background, so the ripple paints above it.
- Keyboard: Material buttons and chips get a 2 dp outline when focused (from the theme). Custom `InkWell` controls are wrapped in `TffFocusRing`. Filled controls (the primary button, a selected chip) use an `onSurface` ring, because a teal ring disappears into a teal fill. The ring shows only in keyboard highlight mode.
- Screen readers: Settings choices announce `selected` in a mutually exclusive group; the offline switch is merged with its label; location fields read as a button with their value ("Origin, Taipei"); fare tier rows read as one item ("Child, NT$745"); city groups announce `expanded`; picker items announce `selected`. A `Semantics(excludeSemantics: true)` drops its child's tap action, so give it its own `onTap` (as `LocationField` does). Without it the location fields weren't clickable for TalkBack (found on the emulator, 2026-10-24).
- Bottom sheets use `useRootNavigator: true`. On a tab's own navigator the sheet sat above the shell's bottom bar, and the nav tabs stayed tappable under it.
- Type: tabular figures (`FontFeature.tabularFigures()`) on every price and count so digits line up. The adult price is `displaySmall` ExtraBold. Section titles use `titleLarge` SemiBold.
- Motion: use `TffMotion` tokens with `TffMotion.of(context, …)`. Presses take 100 ms; small state changes 160–220 ms with the strong ease-out; pushed pages 260 ms in and 180 ms out. With reduced motion, pushed pages only fade (no slide), the swap icon doesn't turn, the skeleton holds still, and the button press doesn't scale. Mode chips don't scale on selection, because you switch them many times a session.
- Large text: don't put fixed-ratio grids or fixed-height boxes around text. Rows that pair a label with a button or value need `Expanded`/`Flexible` on the text side; a `TffTextButton` inside a `Row` goes in `Flexible` (plus `Align` to keep it at the end). `large_text_layout_test.dart` renders every page at 200% text in Indonesian.
- Prices and route names never end in "…". The adult price sits in a `FittedBox(scaleDown)` so it shrinks instead; the student/child/senior rows are a `Wrap`, so the price drops under the label; and Saved tiles move their buttons under the route above 150% text. The Saved page's tab labels sit in a `FittedBox(scaleDown)` too, since a `Tab` is one line and "Rute tersimpan" was clipped at 200%. On the emulator at 200%, NT$1,490 showed as "NT$1.4…" and a saved route as "Taipei → Ka…". The large-text test now fails if any `NT$…` or `A → B` text is cut off (an ellipsis is not an overflow error, so `takeException()` missed it).
- Wide screens: Search and Compare cap their two columns at 1200 px. In the Saved page's two-column layout, both column headers have the same 48 dp minimum height so the lists start level.

### Utilities

`IdGenerator` (`lib/utils/id_generator.dart`) makes microsecond-timestamp + random-suffix IDs for `RouteQuery` and similar models. Never use `DateTime.now()` alone for an ID.

`estimateTravelMinutes` (`lib/utils/travel_duration.dart`) is the single source of truth for the speed + boarding-time formula. Both `FareService._durationByMode` (mock) and `TdxFareService._durationFallback` (API fallback) call it, so tune the values only there.

### App icon

`assets/icons/app_icon.png` (1024×1024) is a fare-ticket glyph in the app's teal and blue, drawn by `scripts/gen_icon.py` with plain Pillow shapes. `flutter_launcher_icons` reads it for Android, iOS and web, driven by its block in `pubspec.yaml`. Regenerate every platform's icons with:

```bash
dart run flutter_launcher_icons
```

To change the design, edit `scripts/gen_icon.py`, then run it and the command above.

---

## Key constraints

- Never break localization. Every new user-facing string needs an entry in all four ARB files and a getter in `TffLocalizations`, written in the voice described in "Writing style".
- Follow "Design rules": one accent, solid cards, 48 dp targets, `InkWell` + `TffFocusRing` for custom controls, `TffMotion` for every animation.
- Never hardcode fare values. All fares go through the mock in `FareService._mock` or the TDX path.
- Keep the fallbacks. `DataMode.api` uses mock for non-HSR/TRA modes, `FareService.search` falls back to cache on any failure, and a missing station makes only that mode "not served", never the whole search. All three must keep working.
- Search and Compare state stay separate. Never make both pages watch the same fare controller again.
- HSR and TRA are live through TDX. Don't revert them to `UnimplementedError`. Adding a mode to the API path means adding it to `TdxFareService.fetch` and to a station map.
- Offline must always work. The cache and the offline toggle have to function whatever the API is doing.
- Use `Location` for UI inputs. Never pass raw city-name strings from the UI to controllers; resolve them through `LocationService` and pass `location.queryToken` for cache keys and station lookups. To display a stored token, go through `LocationService.routeLabel` / `displayName` so it's localized.
- Run `flutter analyze` and `flutter test` before calling a change done. Both were clean on 2026-10-24 (32 tests).
- Keep `<uses-permission android:name="android.permission.INTERNET"/>` in `android/app/src/main/AndroidManifest.xml`. Flutter's template puts it only in the debug and profile manifests, so until 2026-10-24 every release build failed every live search with "Failed host lookup" (debug runs and the web build hid it).
- Don't run `dart format .` across the repo in an unrelated change. Most files predate the formatter, and it rewraps about 50 of them, which buries the real diff. Format only new files.
- `AnalyticsService` is a stub that only calls `debugPrint`. Don't add real tracking without a consent UI.
- Keep the store copy in sync. `store_listing/app_store.md` and `store_listing/play_store.md` hold the App Store Connect and Play Console copy for en, zh-Hant and id. When features, cities or languages change, update them in the same change and recheck the character limits.
- Loading states use shimmer skeletons, not spinners. Every list or card that loads async data (fare results, saved routes, history) shows a `TffSkeleton` shaped like the real content while its controller's `isLoading` is true. A small inline spinner is fine only for a short busy state on a button or row the user just tapped (like `_DangerAction` in `settings_page.dart`), never for a page or list load.

---

## Open items

Carried over between sessions. Read this before assuming the project is finished.

### Next chat: start here (updated 2026-10-24)

The fix pass (`7b9e6f6`), the writing pass (`8b7f424`) and the design pass (`a385eb7`) are all committed by Felix. The 2026-10-24 emulator run and its fixes are not committed yet.

Done 2026-10-24: item 1, the Android emulator run (Pixel 6, Android 14, release APK built with `--dart-define-from-file=tdx.env.json`). It checked the five font weights, 48 dp targets (measured from the accessibility tree), light and dark mode, live HSR/TRA fares through the proxy, "not served" (Keelung + HSR), offline mode with and without a cached route, cache fallback with the network off, en / zh_Hant / id, and 200% system text. It found and fixed:
- No `INTERNET` permission in the main Android manifest, so every release build failed every live search. This would have shipped to the Play Store.
- `LocationField` wasn't clickable for TalkBack (`excludeSemantics` with no `onTap`).
- The location picker sheet opened on the tab's navigator, so the bottom nav stayed visible and tappable under it.
- At 200% text the adult price was cut to "NT$1.4…" and saved routes to "Taipei → Ka…". The large-text test now checks for this.
- Indonesian used "Langsung" for both Live and Direct on the same card, and "Favorit" / "Simpan" where the rest of the copy says "rute tersimpan".

Small things seen on the device and left alone (Felix's call):
- Settings has both a back arrow and a close ✕ in the app bar; they do the same thing.
- Tapping the "Offline mode" label doesn't toggle the switch (only the switch does; TalkBack gets the merged row).
- `TffEmptyState` adds its own 16 dp padding, so inside Search/Compare it's narrower than the cards around it.
- Picker rows repeat the city as a subtitle ("Taipei / Taipei"); only Banqiao / New Taipei differs.
- A fresh install defaults to Mock data, while the store listings say HSR and TRA come from TDX. Consider defaulting to API when a proxy URL is set.
- Right after a cold emulator boot the first lookup can fail with "Failed host lookup" even with the permission; Retry works once the emulator's network is up.

Claude can do these (ask Felix first, then follow the rules in this file):
1. ~~Run the app on the Android emulator~~ (done 2026-10-24, see above). A real phone is still worth a look before release.
2. ~~Add rate limiting to the proxy~~ (written 2026-10-24, not deployed or committed yet). The Worker uses two `[[ratelimits]]` bindings: `IP_LIMITER` (60 per minute per `CF-Connecting-IP`, on every proxied request) and `UPSTREAM_LIMITER` (120 per minute on one shared key, only on edge-cache misses, so it caps TDX calls whatever the IP or query). Over a limit the Worker answers 429 with `Retry-After: 60`. A missing binding lets requests through, and `/health` then shows `"rateLimit": false`. Wrangler went from 3 to 4 (`proxy/package.json`), because Wrangler 3 drops `[[ratelimits]]` with only a warning. `proxy/package.json` is now `"type": "module"`, and `npm test` runs `proxy/test/worker.test.js` (6 tests). Checked with a `wrangler deploy --dry-run` (both bindings listed) and with `wrangler dev`, where the 61st request from one IP got a 429. A WAF rule can't do this job, because WAF rules belong to a zone and the Worker runs on `workers.dev`. Felix deploys: `cd proxy`, `npm install`, `npx wrangler deploy`, then `curl .../health`. The app shows a 429 like any failed search ("Couldn't get fares", or saved fares if it has them); a person searching won't hit 60 a minute. `npm audit` flags `undici` inside Miniflare, which only runs for `wrangler dev` and doesn't ship; `npm audit fix --force` would downgrade Wrangler to 4.35, so leave it.
3. ~~Clean up dead code and stale docs~~ (done 2026-10-24, not committed yet). Deleted `lib/ui/tff_fare_table.dart`, the `api_not_ready` error (its branches in `search_page.dart` and `compare_page.dart`, the `UnimplementedError` check in `fare_controller.dart`, the `errorApiNotReady` string and getter) and the stale `architecture.md`, `design_system.md` and `ui_components_notes.md`. A scan for strings nothing reads also removed six more from all four ARB files and `TffLocalizations`: `noResultsBody`, `offlineDataBadge`, `duration`, `transfers`, `fareByCategory`, `selectAtLeastOneMode`. Every remaining file in `lib/` is imported somewhere. Analyze and 32 tests pass. All of it is in git history if a piece is ever wanted back.

Only Felix can do these (Claude can explain the steps):
4. Create the Android upload keystore and fill in `android/key.properties` (passwords).
5. Host the Privacy Policy and a Support page at public URLs, then add them to both store listing files.
6. Confirm category, age rating and price (suggested: Travel, Everyone/4+, Free).
7. Register the iOS App ID `com.felix.taiwanfarefinder` (needs the Apple Developer account; an iOS build needs a Mac).
8. Rotate the TDX client secret in the TDX portal, then `npx wrangler secret put TDX_CLIENT_SECRET` (see `SECURITY.md`).
9. Run `git rm --cached .flutter-plugins-dependencies` and commit it.

### Details

- Register the iOS App ID. The bundle ID is `com.felix.taiwanfarefinder` (tests: `.RunnerTests`), matching Android; it changed from the template's `com.mycompany.CounterApp` on 2026-10-01. The App ID and provisioning profile still need creating in the Apple Developer account before an App Store Connect record. Nobody has built it in Xcode (this machine runs Windows).
- The store listings need real public URLs. Both stores require a Privacy Policy URL, and Apple also wants a Support URL; an in-app screen doesn't count. The text to host is ready in `lib/pages/privacy_page.dart` and the `privacy*` ARB keys, and each store listing file lists the fields still empty.
- Category, age rating and price are still only suggestions in both store listing files (Travel, Everyone/4+, Free). Felix needs to confirm them before submission.
- Android release signing isn't set up. `android/key.properties` still holds `CHANGE_ME` placeholders and points at a keystore that doesn't exist, so release builds fall back to debug signing and can't go to the Play Store. Felix has to create the keystore himself, since it involves passwords.
- The proxy's rate limits are written but not deployed yet (see item 2), and its CORS still allows `*`. See the checklist in `SECURITY.md`; that file also tracks rotating the old TDX secret.
- Stopping a background `wrangler dev` from Claude's shell leaves `workerd.exe` (and the `node` wrangler process) running and still serving port 8787. Stop them by PID afterwards (check `Get-NetTCPConnection -LocalPort 8787`).
- Run on the Android emulator (Pixel 6, Android 14) on 2026-10-24 as a release build; not yet on a real phone or on iOS. Driving it without a screen: `adb exec-out screencap -p` for screenshots, `adb shell uiautomator dump` for the accessibility tree (node bounds in px, density 420 → divide by 2.625 for dp), `adb shell input tap x y` to tap, `adb shell settings put system font_scale 2.0` for large text (set it back to 1.0 after), `adb shell svc wifi disable` / `svc data disable` to test the cache fallback. In Git Bash set `MSYS_NO_PATHCONV=1` so `/sdcard/...` paths aren't rewritten. `adb` lives in `%LOCALAPPDATA%\Android\Sdk\platform-tools`, not on PATH.
- A release rebuild can reuse stale Dart and asset output: on 2026-10-24 a 22-second `flutter build apk --release` shipped the old ARB strings and widgets. Before trusting an APK, check it, e.g. `unzip -p build/app/outputs/flutter-apk/app-release.apk assets/flutter_assets/lib/l10n/app_id.arb | grep tabSaved`. If it's stale, delete `.dart_tool/flutter_build` and `build/app/intermediates/flutter` and build again.
- Reviewing the web build in the desktop app's browser pane: after changing the viewport size, Flutter sometimes keeps laying out at the old size, so screenshots come back cropped or tiled. Reload the page after resizing. To see populated screens, seed `localStorage` keys `flutter.tff_user`, `flutter.tff_settings`, `flutter.tff_favorites`, `flutter.tff_history` (each value is a JSON string of the JSON object).
- Mock data is coarse. Distance comes from a one-dimensional west-coast km table (`FareService._cityKm`), so MRT or YouBike between distant cities gives believable-looking but meaningless numbers. In Mock mode Keelung + HSR also gets a mock fare; only API mode reports "not served". Fine for a demo mode, but it isn't real data.
- `.flutter-plugins-dependencies` is committed even though `.gitignore` lists it. Remove it from the index with `git rm --cached .flutter-plugins-dependencies` when convenient.
- Not a TODO: the Terms and Privacy contact sections use `maxfelix05@gmail.com` on purpose. It's Felix's own address, approved as a stand-in until a dedicated support address exists.
