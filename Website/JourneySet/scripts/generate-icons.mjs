/**
 * Regenerates JourneySet's raster icons from vector sources.
 *
 *   npm run icons            # favicons + Open Graph image
 *   npm run icons -- og      # only public/og-image.png
 *   npm run icons -- favicons
 *
 * Favicons: rasterised from public/favicon.svg (the source of truth) into
 *   favicon.ico (16/32/48), apple-touch-icon.png (180), icon-192.png, icon-512.png.
 * OG image: public/og-image.png (1200×630), drawn from the SVG below. It's the
 *   card shown when a JourneySet link is shared (Slack, iMessage, X, Discord…),
 *   referenced by the og:image / twitter:image tags in index.html.
 *
 * Text uses system sans-serif fonts (librsvg can't load Google Fonts), so the
 * OG image renders slightly differently per OS — re-check it visually after
 * regenerating.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = (f) => path.join(root, 'public', f);

async function favicons() {
  const svg = await readFile(pub('favicon.svg'));
  const png = (size) => sharp(svg, { density: 72 * (size / 32) * 2 }).resize(size, size).png().toBuffer();

  await writeFile(pub('apple-touch-icon.png'), await png(180));
  await writeFile(pub('icon-192.png'), await png(192));
  await writeFile(pub('icon-512.png'), await png(512));
  await writeFile(pub('favicon.ico'), await pngToIco(await Promise.all([png(16), png(32), png(48)])));
  console.log('✓ favicons: favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png');
}

// Brand values mirror tailwind/index.css defaults: indigo-500 #6366f1,
// indigo-600 #4f46e5, violet-600 #7c3aed, slate-950 #020617, slate-400 #94a3b8.
const ogSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#020617"/>
      <stop offset="1" stop-color="#1e1b4b"/>
    </linearGradient>
    <radialGradient id="glow" cx="900" cy="80" r="520" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#7c3aed" stop-opacity="0.45"/>
      <stop offset="1" stop-color="#7c3aed" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="badge" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#6366f1"/>
      <stop offset="1" stop-color="#7c3aed"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#818cf8"/>
      <stop offset="1" stop-color="#c4b5fd"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <!-- Logo badge: same geometry as public/favicon.svg, scaled ×4 -->
  <g transform="translate(96,96)">
    <rect width="128" height="128" rx="32" fill="url(#badge)"/>
    <g transform="translate(32,32) scale(2.6667)" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
    </g>
  </g>
  <text x="252" y="182" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" font-size="64" font-weight="800" fill="#ffffff" letter-spacing="-1">JourneySet</text>

  <text x="96" y="340" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" font-size="72" font-weight="800" fill="#ffffff" letter-spacing="-2">The productivity planner</text>
  <text x="96" y="424" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" font-size="72" font-weight="800" fill="url(#accent)" letter-spacing="-2">you'll love.</text>

  <text x="96" y="510" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" font-size="30" fill="#94a3b8">Weekly planner  ·  Goal tracker  ·  Event calendar</text>

  <text x="1104" y="566" text-anchor="end" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" font-size="24" font-weight="600" fill="#a5b4fc">journeyset.vercel.app</text>
</svg>`;

async function ogImage() {
  await sharp(Buffer.from(ogSvg)).png({ compressionLevel: 9 }).toFile(pub('og-image.png'));
  console.log('✓ og-image.png (1200×630)');
}

const which = process.argv[2] ?? 'all';
if (which === 'all' || which === 'favicons') await favicons();
if (which === 'all' || which === 'og') await ogImage();
