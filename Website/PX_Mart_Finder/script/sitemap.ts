import { readFile, writeFile } from "fs/promises";

export const SITE_URL = "https://px-mart-finder.netlify.app";

// /favorites is left out on purpose: it's per-device localStorage, always empty for a crawler.
const STATIC_ROUTES = ["/", "/search", "/store-map", "/terms", "/privacy"];

// Generated from the JSON data at build time so it can't drift when products/categories change.
export async function writeSitemap(outFile: string) {
  const categories: { id: string }[] = JSON.parse(await readFile("client/src/data/categories.json", "utf-8"));
  const products: { id: string }[] = JSON.parse(await readFile("client/src/data/products.json", "utf-8"));

  const paths = [
    ...STATIC_ROUTES,
    ...categories.map((c) => `/category/${encodeURIComponent(c.id)}`),
    ...products.map((p) => `/product/${encodeURIComponent(p.id)}`),
  ];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...paths.map((p) => `  <url><loc>${SITE_URL}${p}</loc></url>`),
    "</urlset>",
    "",
  ].join("\n");

  await writeFile(outFile, xml);
  console.log(`sitemap: ${paths.length} URLs → ${outFile}`);
}
