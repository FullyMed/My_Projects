# Taiwan Fare Finder — Architecture (Clean-ish: UI → Domain → Data)

## MVP + Feature Set (max 10)
1. Fare Search (origin/destination + single mode) with passenger-category pricing, duration, transfer info.
2. Fare Comparison (multi-mode) in a readable compare layout.
3. Multilingual UI (EN, zh-Hant, id) using Flutter gen-l10n (ARB).
4. Favorites (save routes; quick rerun).
5. Search History (recent queries; quick rerun; swipe-to-delete).
6. Offline-friendly cache (previous fare results stored locally; offline toggle to simulate no-network; graceful fallback).
7. Settings: language, theme (light/dark/system), offline toggle.
8. Data management: clear cache / history / favorites.
9. Responsive layouts (phone/tablet rules) + polished micro-interactions.

## Tech choices
- Navigation: `go_router` with `StatefulShellRoute.indexedStack` for bottom navigation.
- State: `provider` + `ChangeNotifier` controllers.
- Local storage: `shared_preferences` (JSON).
- Localization: `flutter gen-l10n` with ARB files.
- Data source: mock fare generator + cache; abstracted for future REST.

## Folder structure
- `lib/models/*` — immutable data models (+ `toJson/fromJson/copyWith`) including required `User`.
- `lib/services/*` — storage + data operations. No UI logic.
- `lib/controllers/*` — app state (settings, search, favorites, history).
- `lib/pages/*` — screens.
- `lib/ui/*` — reusable components (atoms/molecules).
- `lib/l10n/*` — ARB localization.

## Data models
- `User`: `id`, `displayName`, `createdAt`, `updatedAt`.
- `RouteQuery`: `id`, `userId`, `origin`, `destination`, `modes`, `createdAt`, `updatedAt`.
- `FareResult`: `id`, `userId`, `queryId`, `mode`, `durationMinutes`, `transferSummary`, `fares` (adult/student/child/senior), `source` (mock/cache), `createdAt`, `updatedAt`.
- `FavoriteRoute`: `id`, `userId`, `origin`, `destination`, `modes`, `label`, `createdAt`, `updatedAt`.
- `SearchHistoryEntry`: `id`, `userId`, `origin`, `destination`, `modes`, `ranAt`, `createdAt`, `updatedAt`.
- `AppSettings`: `id`, `userId`, `themeMode`, `localeTag`, `offlineMode`, `createdAt`, `updatedAt`.

## Services
- `LocalStorageService`: typed JSON read/write helpers with sanitization.
- `UserService`: creates/loads the local user.
- `SettingsService`: load/save settings.
- `FavoritesService`: CRUD favorites.
- `HistoryService`: manage history list.
- `FareService`: mock fare generation, local cache read/write, and comparison.

## Controllers (ChangeNotifier)
- `SettingsController`: theme + locale + offline mode; exposes `locale`, `themeMode`.
- `FareController`: current query + results + comparison; consults cache when offline.
- `FavoritesController`: favorites list + actions.
- `HistoryController`: recent searches list + actions.

## Routing
- Shell: `/search`, `/compare`, `/saved` tabs.
- Settings pushed as `/settings`.

## Responsive rules
- Breakpoint: `>= 840dp` treat as tablet.
- Tablet: two-column layouts for forms/results; compare uses grid.

## Debug step
- Run `compile_project` at the end and fix all analyzer errors.
