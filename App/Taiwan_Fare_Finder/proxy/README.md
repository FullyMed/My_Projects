# TDX proxy (Cloudflare Worker)

Keeps the TDX `client_id` / `client_secret` out of the app. The Flutter client
calls this Worker with **no credentials**; the Worker holds the secret, manages
its own bearer token, and forwards read-only HSR/TRA fare + timetable requests
to TDX. Successful responses are cached at the Cloudflare edge for 6h.

## One-time setup

```bash
cd proxy
npm install
npx wrangler login
npx wrangler secret put TDX_CLIENT_ID
npx wrangler secret put TDX_CLIENT_SECRET
npx wrangler deploy
```

Deploy prints a URL like `https://tff-tdx-proxy.<subdomain>.workers.dev`.

## Point the app at it

Build/run the Flutter app with the proxy base URL (note the `/api/basic/v2`
suffix):

```bash
flutter run --dart-define=TFF_PROXY_BASE_URL=https://tff-tdx-proxy.<subdomain>.workers.dev/api/basic/v2
```

Same `--dart-define` for `flutter build apk` / `build web` (or put it in a
gitignored `tdx.env.json` and use `--dart-define-from-file=tdx.env.json`). When
`TFF_PROXY_BASE_URL` is set the app sends no credentials at all; when it's absent
the app only calls TDX directly if `TDX_CLIENT_ID` / `TDX_CLIENT_SECRET` defines
were provided (dev only — blocked entirely on web builds).

## Local development

```bash
cp .dev.vars.example .dev.vars   # fill in real values
npm run dev                      # http://localhost:8787
```

Test:

```bash
curl "http://localhost:8787/api/basic/v2/Rail/THSR/ODFare?\$format=JSON&\$filter=OriginStationID%20eq%20'1000'%20and%20DestinationStationID%20eq%20'1070'"
```

## Hardening notes

- Only `Rail/THSR/*` and `Rail/TRA/*` paths are proxied — not an open relay.
- `GET` only; `OPTIONS` for CORS preflight.
- Upstream error detail is not passed back to clients.
- Optional: add a **Rate Limiting rule** in the Cloudflare dashboard
  (Security → WAF → Rate limiting rules) on this Worker route, e.g. 60 req/min
  per IP, as defence against someone hammering your TDX quota.
- `ALLOWED_ORIGINS` in `wrangler.toml` can be narrowed from `*` to your web
  app's origin(s) if you serve the web build publicly.
