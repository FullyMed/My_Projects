# Security

Taiwan Fare Finder is a client-only Flutter app: no backend of its own, no
accounts, no login, no payments, no personal data, no WebView, no deep links.
The only network dependency is Taiwan's public **TDX** open-data API. The
realistic threat model is therefore narrow — it's about protecting the TDX
account and the release build, not user data.

## Hardening in place

### TDX credentials never ship in the app
- **No secret in source.** All config comes from `--dart-define`
  (`AppConfig`, `lib/config/app_config.dart`), normally via a gitignored
  `tdx.env.json` passed with `--dart-define-from-file`. There is no credentials
  `.dart` file compiled into the app.
- `proxy/` is a Cloudflare Worker that holds `TDX_CLIENT_ID` / `TDX_CLIENT_SECRET`
  as Worker secrets and forwards only read-only `Rail/THSR/*` and `Rail/TRA/*`
  requests. It manages its own bearer token and edge-caches responses for 6h.
- The app is pointed at it with `--dart-define=TFF_PROXY_BASE_URL=...`. In proxy
  mode `TdxAuthService` is never called.
- Direct mode (`TDX_CLIENT_ID` / `TDX_CLIENT_SECRET` defines) is local-dev only.
  A release built with them embeds the secret as a **plaintext string** —
  R8 and Dart `--obfuscate` do *not* hide string constants (verified against a
  release APK). Use the proxy for anything shipped.
- Web builds **refuse** a direct TDX call when no proxy is configured
  (`TdxFareService.fetch` throws), so the secret can't reach `main.dart.js`.
- `getToken()` throws when no credentials are present → caller falls back to
  cache, then to the deterministic mock.

### Network
- All TDX traffic is HTTPS. No cleartext endpoints anywhere in `lib/`.
- The bearer token is kept in memory only — never written to disk.
- TDX responses are parsed defensively (`is List` / `is Map` / positive-int
  checks); malformed or hostile responses raise a handled exception and the app
  falls back to cache, then to the deterministic mock.
- Station IDs are validated against `^[0-9A-Za-z]{2,10}$` before they reach the
  OData `$filter` string, so that path stays safe if the station maps ever
  become dynamic.

### Local storage
- `shared_preferences` holds only low-sensitivity, device-local data: search
  history, favorites, the fare cache, and a random `userId`. No secrets, no PII.
- `android:allowBackup="false"` keeps that data out of Android cloud backup.

### Android release build
- Real app id `com.felix.taiwanfarefinder` (was the template's
  `com.mycompany.CounterApp`); `MainActivity.kt` moved to the matching package.
- R8 `minifyEnabled` + `shrinkResources` on release, with `proguard-rules.pro`.
- Toolchain aligned to this Flutter version's tested set (Gradle 8.12,
  AGP 8.7.3, Kotlin 2.1.0) — the previous mix (AGP 8.3.2 + Kotlin 2.2.21)
  crashed R8. The root `android/build.gradle` also had a pre-existing
  "sourceCompatibility has been finalized" failure, now fixed.
- Release signing uses `android/key.properties` when present (gitignored),
  falling back to debug signing only for local `flutter run --release`.
- Store builds must add Dart obfuscation:
  `flutter build apk --release --dart-define-from-file=tdx.env.json --obfuscate --split-debug-info=build/symbols`

### Dependencies
- Fonts are bundled (`assets/fonts/PlusJakartaSans-VariableFont_wght.ttf`,
  SIL OFL) — the `google_fonts` runtime download was removed.
- Remaining deps are mainstream and current: `http`, `shared_preferences`,
  `provider`, `go_router`, `intl`, `package_info_plus`.

## Operational checklist

- [ ] **Rotate the TDX client secret** — the previous value sat in plaintext
      and is baked into the local `app-release.apk` test build. Regenerate it in
      the TDX portal.
- [ ] `cd proxy && npm install && npx wrangler login`
- [ ] `npx wrangler secret put TDX_CLIENT_ID` / `... TDX_CLIENT_SECRET`
- [ ] `npx wrangler deploy`, then build the app with `--dart-define-from-file=tdx.env.json`
      (containing `TFF_PROXY_BASE_URL`).
- [ ] Delete the now-unused `lib/config/tdx_credentials.dart` once its values are
      in the Worker, and delete the local `build/app/outputs/flutter-apk/*.apk`
      test builds.
- [ ] (Optional) Add a Cloudflare Rate Limiting rule on the Worker route.
- [ ] Generate an upload keystore, create `android/key.properties`, store the
      `.jks` outside the repo.
- [ ] Keep `build/symbols/` from obfuscated builds so crash traces can be
      symbolized.
- [ ] Run `flutter pub outdated` periodically.

## Reporting

This is a personal project. Open a private issue or contact the maintainer
directly for anything security-sensitive.
