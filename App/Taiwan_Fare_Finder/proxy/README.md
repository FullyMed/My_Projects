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

The deploy step prints a URL like `https://tff-tdx-proxy.<subdomain>.workers.dev`, and lists `env.IP_LIMITER` and `env.UPSTREAM_LIMITER` as Rate Limit bindings. Then check the rate limit is on:

```bash
curl https://tff-tdx-proxy.<subdomain>.workers.dev/health
# {"ok":true,"rateLimit":true}
```

`"rateLimit": false` means the limits didn't deploy. That happens with Wrangler 3, which skips the `[[ratelimits]]` block with only a warning. Run `npm install` so you get the Wrangler 4 from `package.json`, then deploy again.

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

`wrangler dev` runs the rate limits locally too, so the 61st request in a minute gets a 429.

## Tests

```bash
npm test
```

These run the Worker in Node with a fake cache, fake rate limiters and a mocked `fetch`, so they never call TDX or Cloudflare. They cover `/health`, the per-IP limit, the shared TDX limit, cache hits and refused paths.

## Hardening

- The Worker proxies only `Rail/THSR/*` and `Rail/TRA/*` paths, so it can't be used as an open relay.
- It accepts `GET`, plus `OPTIONS` for CORS preflight.
- It doesn't pass upstream error details back to clients.
- It has two rate limits, set in `wrangler.toml`:
  - 60 requests a minute per IP, on every proxied request. One search in the app makes at most 3, so a person searching never gets close.
  - 120 calls a minute to TDX in total, counted only when a request misses the edge cache. This is what protects your TDX quota: someone can dodge the per-IP limit with many IPs, and dodge the cache by changing the query, but every call that reaches TDX counts here. TDX allows about 50 calls a second, so this stays far below it.

  Both answer with `429`, a `Retry-After: 60` header and `{"error":"rate_limited"}` or `{"error":"upstream_busy"}`. The app treats that like any failed request and shows saved fares if it has them. Cloudflare counts these limits per data center and only roughly, so a burst can go a little over. If a limit binding is missing, the Worker lets requests through rather than failing, and `/health` shows `"rateLimit": false`.
- A WAF rate limiting rule in the dashboard doesn't fit here, because WAF rules belong to a zone (your own domain) and this Worker runs on `workers.dev`. If you move it to your own domain later, you can add one there as well.
- If you put the web build on a public site, narrow `ALLOWED_ORIGINS` in `wrangler.toml` from `*` to your web app's origin.
