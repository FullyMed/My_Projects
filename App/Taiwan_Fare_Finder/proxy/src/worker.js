/**
 * Taiwan Fare Finder — TDX proxy (Cloudflare Worker)
 *
 * Purpose: keep the TDX client id/secret OFF the mobile/web client. The app
 * calls this Worker with no credentials; the Worker holds the secret, fetches
 * and caches its own bearer token, and forwards read-only fare/timetable
 * requests to TDX.
 *
 * Secrets (set with `wrangler secret put`):
 *   TDX_CLIENT_ID
 *   TDX_CLIENT_SECRET
 *
 * Optional vars (wrangler.toml [vars] or dashboard):
 *   ALLOWED_ORIGINS  comma-separated list for CORS; omit or "*" to allow all
 *                    (fare data is public, so "*" is acceptable)
 */

const TDX_TOKEN_URL =
  "https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token";
const TDX_API_ROOT = "https://tdx.transportdata.tw/api/basic/v2";

// Only these path prefixes may be proxied — not an open relay.
const ALLOWED_PREFIXES = ["Rail/THSR/", "Rail/TRA/"];

// Edge-cache successful responses. Fares/timetables change rarely.
const EDGE_CACHE_SECONDS = 6 * 60 * 60;

// Module-scoped token cache (per isolate). Refreshed 60s before expiry.
let cachedToken = null;
let tokenExpiresAt = 0;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    const cors = corsHeaders(origin, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== "GET") {
      return json({ error: "method_not_allowed" }, 405, cors);
    }

    // Accept both "/api/basic/v2/Rail/THSR/ODFare" and "/Rail/THSR/ODFare".
    let subPath = url.pathname;
    if (subPath.startsWith("/api/basic/v2/")) {
      subPath = subPath.slice("/api/basic/v2/".length);
    } else if (subPath.startsWith("/")) {
      subPath = subPath.slice(1);
    }

    if (subPath === "" || subPath === "health") {
      return json({ ok: true }, 200, cors);
    }

    if (!ALLOWED_PREFIXES.some((p) => subPath.startsWith(p))) {
      return json({ error: "path_not_allowed", path: subPath }, 403, cors);
    }

    const target = new URL(`${TDX_API_ROOT}/${subPath}`);
    // Forward only the query string the app sent (e.g. $format, $filter).
    target.search = url.search;

    // Serve from the edge cache when possible.
    const cache = caches.default;
    const cacheKey = new Request(target.toString(), { method: "GET" });
    const hit = await cache.match(cacheKey);
    if (hit) {
      return withCors(hit, cors);
    }

    let token;
    try {
      token = await getToken(env);
    } catch (e) {
      return json({ error: "tdx_auth_failed" }, 502, cors);
    }

    let upstream;
    try {
      upstream = await fetch(target.toString(), {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
    } catch (e) {
      return json({ error: "tdx_unreachable" }, 502, cors);
    }

    const body = await upstream.text();
    const headers = new Headers(cors);
    headers.set("Content-Type", "application/json; charset=utf-8");

    if (upstream.ok) {
      headers.set("Cache-Control", `public, max-age=${EDGE_CACHE_SECONDS}`);
      const resp = new Response(body, { status: 200, headers });
      ctx.waitUntil(cache.put(cacheKey, resp.clone()));
      return resp;
    }

    // Pass through non-200s without caching, but don't leak upstream detail.
    return json({ error: "tdx_error", status: upstream.status }, 502, cors);
  },
};

async function getToken(env) {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt) return cachedToken;

  if (!env.TDX_CLIENT_ID || !env.TDX_CLIENT_SECRET) {
    throw new Error("missing TDX credentials");
  }

  const resp = await fetch(TDX_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: env.TDX_CLIENT_ID,
      client_secret: env.TDX_CLIENT_SECRET,
    }),
  });

  if (!resp.ok) throw new Error(`token HTTP ${resp.status}`);
  const data = await resp.json();
  const token = data.access_token;
  const expiresIn = Number(data.expires_in);
  if (!token || !Number.isFinite(expiresIn) || expiresIn <= 60) {
    throw new Error("bad token response");
  }

  cachedToken = token;
  tokenExpiresAt = now + (expiresIn - 60) * 1000;
  return token;
}

function corsHeaders(origin, env) {
  const raw = (env.ALLOWED_ORIGINS || "*").trim();
  const h = {
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
  if (raw === "*" || !origin) {
    h["Access-Control-Allow-Origin"] = raw === "*" ? "*" : raw;
  } else {
    const list = raw.split(",").map((s) => s.trim());
    h["Access-Control-Allow-Origin"] = list.includes(origin) ? origin : list[0];
  }
  return h;
}

function withCors(resp, cors) {
  const headers = new Headers(resp.headers);
  for (const [k, v] of Object.entries(cors)) headers.set(k, v);
  return new Response(resp.body, { status: resp.status, headers });
}

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, "Content-Type": "application/json; charset=utf-8" },
  });
}
