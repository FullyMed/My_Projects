# Security

Taiwan Fare Finder is a client-only Flutter app: no backend of its own, no
accounts, no login, no payments, no personal data, no WebView, no deep links.
The only network dependency is Taiwan's public **TDX** open-data API. The
realistic threat model is therefore narrow — it's about protecting the TDX
account and the release build, not user data.

## Hardening in place

### TDX credentials never ship in the app
- `proxy/` is a Cloudflare Worker that holds `TDX_CLIENT_ID` / `TDX_CLIENT_SECRET`
  as Worker secrets and forwards only read-only `Rail/THSR/*` and `Rail/TRA/*`
  requests. It manages its own bearer token and edge-caches responses for 6h.
- The app is pointed at it with `--dart-define=TFF_PROXY_BASE_URL=...`. With that
  set, `lib/config/tdx_credentials.dart` is never read.
- Web builds **refuse** to make a direct TDX call when no proxy is configured
  (`TdxFareService.fetch` throws), so the secret can't be shipped in `main.dart.js`.
- `lib/config/tdx_credentials.dart` is gitignored and not in git history; only
  `.dart.example` is tracked.

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
  `com.mycompany.CounterApp`).
- R8 `minifyEnabled` + `shrinkResources` on release.
- Release signing uses `android/key.properties` when present (gitignored),
  falling back to debug signing only for local `flutter run --release`.
- Store builds must add Dart obfuscation:
  `flutter build apk --release --obfuscate --split-debug-info=build/symbols`

### Dependencies
- Fonts are bundled (`assets/fonts/PlusJakartaSans-VariableFont_wght.ttf`,
  SIL OFL) — the `google_fonts` runtime download was removed.
- Remaining deps are mainstream and current: `http`, `shared_preferences`,
  `provider`, `go_router`, `intl`, `package_info_plus`.

## Operational checklist

- [ ] **Rotate the TDX client secret** — the previous value sat in plaintext.
      Regenerate it in the TDX portal and load it only into the Worker.
- [ ] `cd proxy && npm install && npx wrangler login`
- [ ] `npx wrangler secret put TDX_CLIENT_ID` / `... TDX_CLIENT_SECRET`
- [ ] `npx wrangler deploy`, then build the app with `TFF_PROXY_BASE_URL`.
- [ ] (Optional) Add a Cloudflare Rate Limiting rule on the Worker route.
- [ ] Generate an upload keystore, create `android/key.properties`, store the
      `.jks` outside the repo.
- [ ] Keep `build/symbols/` from obfuscated builds so crash traces can be
      symbolized.
- [ ] Run `flutter pub outdated` periodically.

## Reporting

This is a personal project. Open a private issue or contact the maintainer
directly for anything security-sensitive.
