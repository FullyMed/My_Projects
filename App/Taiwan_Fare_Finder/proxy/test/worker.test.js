// Offline tests for the Worker: fake rate limiters, a fake edge cache and a
// mocked fetch, so nothing here calls TDX or Cloudflare. Run with `npm test`.
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

import worker from "../src/worker.js";

const FARE_PATH = "/api/basic/v2/Rail/THSR/ODFare";

// Counts calls per key, like the real binding with a fixed limit.
function fakeLimiter(max) {
  const counts = new Map();
  return {
    keys: [],
    async limit({ key }) {
      this.keys.push(key);
      const n = (counts.get(key) || 0) + 1;
      counts.set(key, n);
      return { success: n <= max };
    },
  };
}

let upstreamCalls;
let cacheStore;

beforeEach(() => {
  upstreamCalls = [];
  cacheStore = new Map();
  globalThis.caches = {
    default: {
      async match(req) {
        const hit = cacheStore.get(req.url);
        return hit ? hit.clone() : undefined;
      },
      async put(req, resp) {
        cacheStore.set(req.url, resp);
      },
    },
  };
  globalThis.fetch = async (url) => {
    const u = String(url);
    if (u.includes("/openid-connect/token")) {
      return Response.json({ access_token: "test-token", expires_in: 3600 });
    }
    upstreamCalls.push(u);
    return new Response("[]", { status: 200 });
  };
});

const ctx = { waitUntil(p) { return p; } };

function env(overrides = {}) {
  return {
    TDX_CLIENT_ID: "id",
    TDX_CLIENT_SECRET: "secret",
    IP_LIMITER: fakeLimiter(60),
    UPSTREAM_LIMITER: fakeLimiter(120),
    ...overrides,
  };
}

function get(path, ip = "203.0.113.7") {
  return new Request(`https://proxy.example${path}`, {
    headers: { "CF-Connecting-IP": ip, Origin: "https://app.example" },
  });
}

// A distinct query per call, so every request misses the edge cache.
const fareQuery = (i) => `${FARE_PATH}?$format=JSON&n=${i}`;

test("health reports whether both limiters are bound", async () => {
  let body = await (await worker.fetch(get("/health"), env(), ctx)).json();
  assert.deepEqual(body, { ok: true, rateLimit: true });

  body = await (await worker.fetch(get("/health"), env({ UPSTREAM_LIMITER: undefined }), ctx)).json();
  assert.deepEqual(body, { ok: true, rateLimit: false });
});

test("an IP over its limit gets 429 with Retry-After and CORS; other IPs don't", async () => {
  const e = env({ IP_LIMITER: fakeLimiter(3) });
  for (let i = 0; i < 3; i++) {
    const r = await worker.fetch(get(fareQuery(i)), e, ctx);
    assert.equal(r.status, 200);
  }
  const blocked = await worker.fetch(get(fareQuery(3)), e, ctx);
  assert.equal(blocked.status, 429);
  assert.equal(blocked.headers.get("Retry-After"), "60");
  assert.equal(blocked.headers.get("Access-Control-Allow-Origin"), "*");
  assert.deepEqual(await blocked.json(), { error: "rate_limited" });
  assert.equal(upstreamCalls.length, 3, "the blocked request never reached TDX");

  const other = await worker.fetch(get(fareQuery(4), "198.51.100.9"), e, ctx);
  assert.equal(other.status, 200);
  assert.deepEqual(e.IP_LIMITER.keys.slice(-1), ["ip:198.51.100.9"]);
});

test("cache hits count per IP but don't use the upstream allowance", async () => {
  const e = env({ UPSTREAM_LIMITER: fakeLimiter(1) });
  const path = fareQuery("same");
  assert.equal((await worker.fetch(get(path), e, ctx)).status, 200); // miss
  for (let i = 0; i < 5; i++) {
    assert.equal((await worker.fetch(get(path), e, ctx)).status, 200); // hits
  }
  assert.equal(upstreamCalls.length, 1);
  assert.equal(e.UPSTREAM_LIMITER.keys.length, 1);
  assert.equal(e.IP_LIMITER.keys.length, 6);
});

test("cache misses over the shared cap get 429 upstream_busy, across IPs", async () => {
  const e = env({ UPSTREAM_LIMITER: fakeLimiter(2) });
  assert.equal((await worker.fetch(get(fareQuery(1), "192.0.2.1"), e, ctx)).status, 200);
  assert.equal((await worker.fetch(get(fareQuery(2), "192.0.2.2"), e, ctx)).status, 200);
  const blocked = await worker.fetch(get(fareQuery(3), "192.0.2.3"), e, ctx);
  assert.equal(blocked.status, 429);
  assert.deepEqual(await blocked.json(), { error: "upstream_busy" });
  assert.equal(upstreamCalls.length, 2);
});

test("disallowed paths are refused before any limiter is touched", async () => {
  const e = env();
  const r = await worker.fetch(get("/api/basic/v2/Bus/Route/City/Taipei"), e, ctx);
  assert.equal(r.status, 403);
  assert.equal(e.IP_LIMITER.keys.length, 0);
});

test("missing or failing limiters let requests through", async () => {
  const none = env({ IP_LIMITER: undefined, UPSTREAM_LIMITER: undefined });
  assert.equal((await worker.fetch(get(fareQuery("a")), none, ctx)).status, 200);

  const broken = { async limit() { throw new Error("binding error"); } };
  const failing = env({ IP_LIMITER: broken, UPSTREAM_LIMITER: broken });
  assert.equal((await worker.fetch(get(fareQuery("b")), failing, ctx)).status, 200);
});
