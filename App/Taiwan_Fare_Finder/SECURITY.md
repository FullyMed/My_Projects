# Security

Taiwan Fare Finder runs on the user's device. The only server is a small TDX relay (the Cloudflare Worker in `proxy/`), and it stores nothing about users. The app has no accounts, logins, payments, personal data, WebViews or deep links, and its only outside data source is Taiwan's public TDX open-data API, reached through that relay. So the risks worth worrying about are the TDX account and the release build, not user data.

## What's in place

### The TDX secret stays out of the app

- No secret lives in the source. `AppConfig` (`lib/config/app_config.dart`) reads everything from `--dart-define`, normally passed in from a gitignored `tdx.env.json` passed with `--dart-define-from-file`. The app compiles in no credentials file.
- The Worker in `proxy/` holds `TDX_CLIENT_ID` and `TDX_CLIENT_SECRET` as Worker secrets. It forwards only read-only `Rail/THSR/*` and `Rail/TRA/*` requests, gets its own bearer token, and caches responses at the edge for 6 hours.
- The Worker rate-limits itself (`[[ratelimits]]` in `proxy/wrangler.toml`, which needs Wrangler 4): 60 requests a minute per IP, and 120 TDX calls a minute in total for requests that miss the edge cache. Over either limit it answers `429`. `/health` shows `"rateLimit": true` when both limits are active.
- You point the app at the Worker with `--dart-define=TFF_PROXY_BASE_URL=...`. In proxy mode the app never calls `TdxAuthService`.
- Direct mode (the `TDX_CLIENT_ID` and `TDX_CLIENT_SECRET` defines) is for local development only. A release built that way contains the secret as a plain string. R8 and Dart's `--obfuscate` don't hide string constants; this was checked against a release APK. Ship with the proxy.
- Web builds refuse to call TDX directly when no proxy is set (`TdxFareService.fetch` throws), so the secret can't end up in `main.dart.js`.
- Without credentials, `getToken()` throws and the search falls back to cached results. There's no mock fallback for HSR and TRA.

### Network

- All TDX traffic uses HTTPS, and `lib/` contains no cleartext endpoints.
- The bearer token lives in memory only. The app never writes it to disk.
- The app decodes TDX responses as UTF-8 and checks their shape (`is List`, `is Map`, positive integers). A malformed or hostile response raises a handled exception, and the app falls back to cached results.
- Station IDs must match `^[0-9A-Za-z]{2,10}$` before they go into the OData `$filter` string. That keeps the filter safe if the station maps ever come from an API instead of constants.

### Local storage

- `shared_preferences` holds only low-risk data that never leaves the device: search history, saved routes, the fare cache and a random user ID. No secrets, no personal data.
- `android:allowBackup="false"` keeps that data out of Android cloud backups.

### Android release build

- The app ID is `com.felix.taiwanfarefinder` (it used to be the template's `com.mycompany.CounterApp`), and `MainActivity.kt` lives in the matching package.
- Release builds turn on R8 `minifyEnabled` and `shrinkResources`, with rules in `proguard-rules.pro`.
- The toolchain matches the versions this Flutter release was tested with: Gradle 8.12, AGP 8.7.3, Kotlin 2.1.0. The earlier mix of AGP 8.3.2 and Kotlin 2.2.21 crashed R8. The root `android/build.gradle` also had a "sourceCompatibility has been finalized" failure, which is fixed.
- Release signing uses `android/key.properties` (gitignored) only when it's filled in and points at a keystore that exists. Otherwise the build falls back to debug signing so local `flutter run --release` still works. That fallback build can't go to the Play Store.
- Store builds also need Dart obfuscation:
  `flutter build apk --release --dart-define-from-file=tdx.env.json --obfuscate --split-debug-info=build/symbols`

### Dependencies

- The font ships with the app (five static Plus Jakarta Sans weights in `assets/fonts/`, SIL OFL, generated locally from the bundled variable font by `scripts/gen_fonts.py`). The `google_fonts` runtime download is gone.
- The remaining packages are mainstream and current: `http`, `shared_preferences`, `provider`, `go_router`, `intl`, `package_info_plus`.

## Checklist

Done:
- [x] Worker deployed with its TDX secrets set (the live proxy answers).
- [x] `lib/config/tdx_credentials.dart` and the old local test APKs are deleted.

Still open:
- [ ] Rotate the TDX client secret in the TDX portal, then update the Worker with `npx wrangler secret put TDX_CLIENT_SECRET`. An earlier value sat in plain text in a local file and a test APK, so treat it as exposed. This hasn't been confirmed as done.
- [ ] Deploy the rate-limited Worker (written 2026-10-24): `cd proxy`, `npm install` (it moves Wrangler from 3 to 4), `npx wrangler deploy`, then check that `/health` shows `"rateLimit": true`. Until then anyone who finds the URL can burn through your TDX quota.
- [ ] Create an upload keystore, fill in `android/key.properties`, and keep the `.jks` file outside the repo.
- [ ] Keep `build/symbols/` from every obfuscated build so you can read crash traces.
- [ ] Run `flutter pub outdated` now and then.

## Reporting

This is a personal project. For anything security-sensitive, open a private issue or contact the maintainer directly.
