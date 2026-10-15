# TDX proxy (Cloudflare Worker)

This Worker keeps the TDX `client_id` and `client_secret` out of the app. The Flutter app calls it without any credentials. The Worker holds the secret, gets its own bearer token, and forwards read-only HSR and TRA fare and timetable requests to TDX. Cloudflare caches successful responses at the edge for 6 hours.

## One-time setup

```bash
cd proxy
npm install
npx wrangler login
npx wrangler secret put TDX_CLIENT_ID
npx wrangler secret put TDX_CLIENT_SECRET
npx wrangler deploy
```

The deploy step prints a URL like `https://tff-tdx-proxy.<subdomain>.workers.dev`.

## Point the app at it

Run or build the Flutter app with the proxy URL. Keep the `/api/basic/v2` suffix:

```bash
flutter run --dart-define=TFF_PROXY_BASE_URL=https://tff-tdx-proxy.<subdomain>.workers.dev/api/basic/v2
```

Pass the same `--dart-define` to `flutter build apk` or `flutter build web`, or put it in a gitignored `tdx.env.json` and use `--dart-define-from-file=tdx.env.json`. With `TFF_PROXY_BASE_URL` set, the app sends no credentials at all. Without it, the app calls TDX directly only if you passed the `TDX_CLIENT_ID` and `TDX_CLIENT_SECRET` defines. That mode is for development, and web builds block it.

## Local development

```bash
cp .dev.vars.example .dev.vars   # fill in real values
npm run dev                      # http://localhost:8787
```

To test it:

```bash
curl "http://localhost:8787/api/basic/v2/Rail/THSR/ODFare?\$format=JSON&\$filter=OriginStationID%20eq%20'1000'%20and%20DestinationStationID%20eq%20'1070'"
```

Cloudflare's bot check rejects some default clients (Python's `urllib` gets error 1010). `curl` and the app's own Dart client get through.

## Hardening

- The Worker proxies only `Rail/THSR/*` and `Rail/TRA/*` paths, so it can't be used as an open relay.
- It accepts `GET`, plus `OPTIONS` for CORS preflight.
- It doesn't pass upstream error details back to clients.
- It has no rate limit yet. Anyone who finds the URL can use up your TDX quota. Add a Rate Limiting rule in the Cloudflare dashboard (Security → WAF → Rate limiting rules) on this Worker's route, for example 60 requests a minute per IP.
- If you put the web build on a public site, narrow `ALLOWED_ORIGINS` in `wrangler.toml` from `*` to your web app's origin.
