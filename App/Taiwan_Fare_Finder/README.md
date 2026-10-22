# Taiwan Fare Finder

A Flutter app that shows what a trip across Taiwan costs before you go. You pick an origin, a destination and a way to travel (HSR, TRA, MRT, bus or YouBike), and it shows the fare for adults, students, children and seniors with a rough travel time. HSR and TRA fares come live from Taiwan's TDX open-data platform; the other modes are estimates.

---

## What it does

- Search one mode between 13 locations in 12 cities, or compare several modes side by side on the Compare page. Search and Compare keep their own results, so running one never wipes the other.
- Show four passenger fares. For live HSR and TRA results, child and senior are the real concession fares. Neither railway has a fixed student ticket, so the student price is an estimate and the app labels it "est.".
- Save routes you take often, and keep a history of recent searches. Re-running a saved route opens it on Search (one mode) or Compare (several modes) with the form filled in.
- Work offline. The app caches your last 100 searches in `shared_preferences`, and offline mode shows only those.
- Speak English, Traditional Chinese and Indonesian, including the city names in saved routes.
- Fit phones, tablets and desktops: a bottom bar on narrow screens, a side rail on wide ones, and two-column pages from 840 dp.
- Show shimmer placeholders shaped like the real content while results load, and a themed 404 page for unknown routes.
- Work for everyone: every text passes WCAG AA contrast in light and dark mode, tap targets are at least 48 dp, layouts hold up at 200% system text, keyboard users on web and desktop get a visible focus ring, screen readers hear what each control is and whether it's selected, and the OS "reduce motion" setting turns off movement.
- Include a Terms of Use and a Privacy Policy, both translated, that say what the app stores and what it sends in API mode.

---

## Cities

Taipei, New Taipei (Banqiao), Taoyuan, Hsinchu, Miaoli, Taichung, Changhua, Yunlin, Chiayi, Tainan, Kaohsiung and Keelung. That's 12 cities. Banqiao is also listed as its own stop, which makes 13 locations to pick from.

---

## Where the fares come from

| Mode | Source |
|---|---|
| HSR (高鐵) | TDX, live |
| TRA (台鐵) | TDX, live |
| MRT | Mock estimate |
| Bus | Mock estimate |
| YouBike | Mock estimate |

The app fetches HSR and TRA fares from Taiwan's [TDX platform](https://tdx.transportdata.tw/). The other modes use a seeded mock, so the same route always gets the same numbers. If a live request fails, the app falls back to the results it cached earlier.

When a city has no station for a mode, the app marks that mode as not served on this route and still shows the others. Keelung has no HSR station, for example. New Taipei uses Banqiao station.

---

## Getting started

You need Flutter and Dart `^3.6.0`. Live HSR and TRA fares also need a free TDX account.

```bash
flutter pub get
flutter run
```

### TDX access

Nothing secret lives in the source code. The app reads its settings from `--dart-define` at build time, which you keep in a gitignored `tdx.env.json` at the project root:

```json
{
  "TFF_PROXY_BASE_URL": "https://<your-worker>.workers.dev/api/basic/v2"
}
```

```bash
flutter run --dart-define-from-file=tdx.env.json
```

Use the proxy for anything you ship. Deploy the Cloudflare Worker in [`proxy/`](proxy/README.md), which keeps the TDX secret on the server, and set only `TFF_PROXY_BASE_URL` as above. A secret baked into the app is a plain string anyone can pull out of the binary (R8 and Dart obfuscation don't hide string constants), and web builds refuse to call TDX directly.

For local development without the proxy, put the raw credentials in the same file instead:

```json
{
  "TDX_CLIENT_ID": "your-client-id",
  "TDX_CLIENT_SECRET": "your-client-secret"
}
```

With neither a proxy URL nor credentials, every mode uses mock data. [`SECURITY.md`](SECURITY.md) covers the threat model.

---

## Store listings

[`store_listing/app_store.md`](store_listing/app_store.md) and [`store_listing/play_store.md`](store_listing/play_store.md) hold the App Store Connect and Play Console copy for each language: name, subtitle, descriptions, keywords and release notes. Update them whenever features, cities or languages change, so the store page matches the app.

---

## Project structure

```
lib/
├── config/          # build-time settings and TDX station ID maps
├── controllers/     # ChangeNotifier controllers (Fare, CompareFare, Favorites, History, Settings, Session)
├── l10n/            # ARB string files (en, zh_Hant, id; zh is a Traditional-character fallback)
├── localization/    # TffLocalizations, which loads the ARB files at runtime
├── models/          # data classes (Location, FareResult, RouteQuery, …)
├── nav.dart         # go_router routes
├── pages/           # Search, Compare, Saved, Settings, Terms, Privacy, Shell, 404
├── services/        # FareService, TdxFareService, TdxAuthService, storage, …
├── theme.dart       # Material 3 theme, spacing and radius tokens
├── ui/              # shared widgets (TffCard, TffButton, TffSkeleton, …)
└── utils/           # IdGenerator, travel_duration (the speed and boarding-time estimate)

test/
├── fixtures/        # real TDX responses (THSR and TRA fares, a timetable sample), captured 2026-10-01
├── services/        # TDX parsing, FareService (mock, API, cache, offline, LRU), favorites and history
├── controllers/     # stale-response guard, Search and Compare staying separate
└── widgets/         # full-app flows, overflow checks (phone, desktop, 200% text), keyboard focus
```

---

## Tech stack

| Concern | Library |
|---|---|
| UI | Flutter (Material 3) |
| Font | Plus Jakarta Sans, five static weights bundled in `assets/fonts/` (SIL OFL), cut from the variable font by `scripts/gen_fonts.py` |
| State | `provider` |
| Navigation | `go_router` |
| Local storage | `shared_preferences` |
| HTTP | `http` |
| Localization | `flutter_localizations` plus the custom `TffLocalizations` |

---

## Adding a string

`TffLocalizations` loads the ARB files in `lib/l10n/` at runtime. To add a string:

1. Add the key and its text to all four ARB files: `app_en.arb`, `app_zh.arb`, `app_zh_Hant.arb` and `app_id.arb`.
2. Add a getter for it in `lib/localization/tff_localizations.dart`.

Leave the generated `AppLocalizations` class alone. The app doesn't use it.

The app's copy follows a plain, friendly style: short sentences, written to "you", no hype, and honest about which fares are estimates. "Writing style" in [`CLAUDE.md`](CLAUDE.md) lists the rules, and "Design rules" there covers color, touch targets, focus, motion and large text.

---

## Commands

```bash
flutter pub get       # install dependencies
flutter run           # run on a connected device or emulator
flutter analyze       # lint
flutter test          # unit and widget tests (32, no network needed)
python scripts/gen_fonts.py      # regenerate the static font weights (needs fontTools)
flutter gen-l10n      # regenerate the ARB stubs (rarely needed)
dart run flutter_launcher_icons  # regenerate Android, iOS and web icons from assets/icons/app_icon.png

# Release builds: pass the proxy settings and obfuscate the Dart code
flutter build apk --release \
  --dart-define-from-file=tdx.env.json \
  --obfuscate --split-debug-info=build/symbols
flutter build ios --release \
  --dart-define-from-file=tdx.env.json \
  --obfuscate --split-debug-info=build/symbols
```

Run `dart format` on new files only. Most existing files predate the formatter, and formatting the whole project rewraps about 50 of them.

A Play Store build also needs `android/key.properties` (gitignored) with `storePassword`, `keyPassword`, `keyAlias` and `storeFile` pointing at your upload keystore. The current file still holds `CHANGE_ME` placeholders, and the build falls back to debug signing until you fill them in. Keep `build/symbols/` so you can read obfuscated crash reports.

---

## Open items

- [ ] Register the iOS App ID. The bundle ID is `com.felix.taiwanfarefinder`, the same as Android. Create the matching App ID and provisioning profile in the Apple Developer account before the App Store Connect record. Nobody has built the app in Xcode yet.
- [ ] Host the Privacy Policy and a support page at public URLs. Both stores want a URL, and an in-app screen doesn't count. The text is ready in `lib/pages/privacy_page.dart` and the `privacy*` ARB keys. The store listing files list every field that's still empty.
- [ ] Confirm category, age rating and price for both stores. The store listing files suggest Travel, Everyone/4+ and Free, and Felix still needs to say yes.
- [ ] Set up Android release signing. Create the upload keystore and fill in `android/key.properties`.
- [ ] Run the app on a real Android or iOS device, or an emulator. The 2026-10-01 fix pass was checked with `flutter analyze`, the test suite and a release web build against the live proxy, but not on a phone.
- [ ] `.flutter-plugins-dependencies` is committed even though `.gitignore` lists it. Remove it from the index with `git rm --cached .flutter-plugins-dependencies`.

The Terms and Privacy contact sections use `maxfelix05@gmail.com`, Felix's own address, which he approved as a stand-in until a dedicated support address exists.
