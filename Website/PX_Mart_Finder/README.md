# PX Mart Finder

Live demo: https://px-mart-finder.netlify.app/

PX Mart Finder helps you find a product inside a PX Mart (全聯福利中心) supermarket. You search for it, and the app tells you the aisle and shelf. You can also browse by category and save products for your next shop.

It's a portfolio prototype built around one real branch, PX Mart Wufeng in Taichung. The Taipei and Kaohsiung branches are demo placeholders. PX Mart has nothing to do with the project. Most of the 2,751 products, with their names and photos, come from the Wufeng branch's public listing on foodpanda (October 2026). The aisle data is demo data, and only the first 56 products have any.

## Getting started

```bash
# Install dependencies (on Windows, run this inside WSL2)
npm ci

# Start the dev server on http://localhost:5000
npm run dev:client

# Type-check, then build for production (output goes to dist/public)
npx tsc --noEmit
npm run build
```

On Windows, run `npm ci` inside WSL2. If you install `node_modules` on Windows and then run the app in WSL2, esbuild and Rollup fail with native binary errors.

## Deployment

Netlify hosts the site, using the settings in `netlify.toml`. It runs `npm run build` on Node 22, publishes `dist/public`, and adds security headers, including a Content Security Policy. The build also writes `sitemap.xml` from the product and category data, so the sitemap stays in step when you add products.

A push to `main` on GitHub deploys the site on its own. The build takes about a minute.

If the domain changes, update it in three places: `script/sitemap.ts`, `client/public/robots.txt`, and the `og:image` and `twitter:image` tags in `client/index.html`.

To try a production build on your machine:

```bash
npm run build
npx vite preview --port 5001
```

## What it does

- Search by product name, brand or category. Small typos still find a match, and some words search their synonyms too: "soda" also looks for 可樂 and 汽水.
- See the aisle and shelf for each product, per branch.
- Browse 23 categories and their subcategories. Each one shows how many products it has. Every category has products now; the one empty subcategory (Clothing, Bags) says "Coming soon" instead of leading to a blank page.
- Products without aisle data say so plainly ("No aisle info for this branch yet") instead of showing a made-up location.
- Filter by brand and sort by best match, name or aisle order. The filters live in the URL, so the back button and shared links keep them.
- Long result lists show 40 products at a time, with a "Show more" button for the next 40.
- Get "Did you mean" suggestions when a search finds nothing.
- Save products with the heart button. Saved products stay in your browser.
- Switch between the Wufeng branch and the two demo branches.
- Open a demo store map that shows which aisle to head to.
- Use it in English or Traditional Chinese (繁體中文), in light or dark mode, on a phone as narrow as 320px or on a desktop.
- Read the Terms of Use and Privacy Policy, which say plainly that PX Mart doesn't run or endorse the app.

Accessibility and polish:

- All text meets WCAG AA contrast in light and dark mode, and every page has a single main heading.
- A "Skip to content" link and clear focus rings make it usable from the keyboard.
- Buttons and toggles are big enough to tap comfortably on a phone.
- If your device asks for reduced motion, the animations stop moving and only fade.

A few things under the hood:

- Each page sets its own title and description, and both change when you switch language.
- Images show a placeholder while they load and an icon if they fail.
- Every page except Home loads on demand, which keeps the first download small.
- The product data is its own file, downloaded alongside the app code (about 480 KB) instead of inside it, so adding products doesn't make the app code bigger.
- Product photos are WebP files, made by `script/compress-images.ts` from PNG or JPEG originals. The first 35 went from 9.9 MB to about 0.8 MB; the 2,695 foodpanda photos went from about 110 MB to about 67 MB.
- If saved settings in your browser get corrupted, the app falls back to its defaults instead of crashing.

## Project structure

```
client/
  src/
    components/    Layout, ProductCard, ProductImage, LanguageToggle, ThemeToggle
    pages/         Home, Search, Category, Product, Saved, Store map, Terms, Privacy, 404
    lib/           data.ts, i18n.ts, storage.ts, favorites-provider.tsx, normalize.ts, seo.ts
    data/          products.json, categories.json
  public/Images/   Product photos, grouped by category
script/            Build script, sitemap generator, image compressor
server/            Express scaffold from the original template (not used)
shared/            Shared types (not used)
```

## Built with

- React 19 and TypeScript, bundled with Vite
- Tailwind CSS v4 and shadcn/ui
- Fuse.js for fuzzy search
- framer-motion for animation
- wouter for routing
- use-debounce for the search box
- Lucide icons
- Rubik and Noto Sans TC from Google Fonts

## Purpose

The project shows how good search and clear aisle data can save shoppers time inside a real supermarket. It's a portfolio piece and a prototype pitch, so it isn't built for production traffic or real inventory.

## What's next

- Real aisle data for the 2,695 products that don't have any yet, and for more branches
- A drawn floor plan for the store map
- Live stock levels
- A backend and an admin page for editing products
- A mobile app version
- Per-page link previews, which would need server-side rendering
