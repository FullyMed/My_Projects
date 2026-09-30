# PX Mart Finder

**Live demo:** https://px-mart-finder.netlify.app/

## Project Description

PX Mart Finder is a retail product discovery and in-store navigation prototype designed for PX Mart (全聯福利中心) stores in Taiwan. It helps shoppers quickly locate products by aisle and shelf, browse by category, and save favorites — all through a fast, responsive interface.

The project is built as a single-branch proof-of-concept focused on **PX Mart Wufeng (Taichung)**. It demonstrates how modern frontend technologies can be applied to retail search UX, and is intended as a portfolio and prototype demo.

---

## Getting Started

```bash
# Install dependencies (run inside WSL2 / Linux if on Windows)
npm ci

# Start the development server
npm run dev:client
# → http://localhost:5000

# Type-check and production build (output: dist/public, deployed to Netlify)
npx tsc --noEmit
npm run build
```

> **Windows / WSL2 note:** Always run `npm ci` from within WSL2. Installing `node_modules` on Windows and then running in WSL2 will cause native binary errors (esbuild, rollup).

---

## Deployment

Hosted on Netlify (`netlify.toml`): the build command is `npm run build`, the publish directory is `dist/public`, and it runs on Node 22 with strict security headers and a CSP. The build also generates `sitemap.xml`, covering every product and category page, from the JSON data. If the domain changes, update it in `script/sitemap.ts`, `client/public/robots.txt`, and the `og:image`/`twitter:image` tags in `client/index.html`.

To check a production build locally:

```bash
npm run build
npx vite preview --port 5001
```

---

## Key Features

- Fast product search with fuzzy matching and typo tolerance
- Synonym expansion (e.g. searching "tissue" also finds 衛生紙, 面紙)
- Aisle and shelf location per product, per store
- Category and subcategory browsing, with product counts on every category/subcategory and a friendly "No products here yet" state for categories the demo data doesn't cover yet
- Brand filtering and multi-sort (relevance, name, aisle order) — kept in the URL, so back/forward and shared links restore them
- "Did you mean?" suggestions when no results are found
- Favorites with localStorage persistence — shared context keeps all toggles in sync
- Store selection (Wufeng branch + demo placeholders)
- Store map placeholder with aisle highlighting
- Custom branded 404 page — bilingual, with Search Products / Back to Home CTAs
- Per-page meta title and meta description (bilingual, updates live with the page and language), plus `robots.txt` and a `sitemap.xml` generated at build time from the product/category data
- Loading states: image skeletons with fade-in and error fallback, an initial app-boot spinner, and a search-debounce indicator
- Terms of Use and Privacy Policy pages, with a non-affiliation disclaimer (independent portfolio project, not affiliated with PX Mart)
- Product images compressed to WebP (9.9MB → ~0.8MB, 93% smaller) via `script/compress-images.ts`
- Route-level code-splitting (`React.lazy` + `Suspense`) — only Home ships in the main bundle
- Full bilingual support — English and Traditional Chinese (繁體中文), including `<html lang>` for screen readers
- Light and dark mode (follows the OS setting live until you pick one)
- Fully responsive — mobile (down to 320px), tablet, and desktop layouts
- Resilient to corrupt or blocked `localStorage` — bad saved values fall back to defaults instead of crashing

---

## Project Structure

```
client/
  src/
    components/    # Layout, ProductCard, ProductImage, LanguageToggle, ThemeToggle
    pages/         # Home, Search, Category, Product Detail, Favorites, Store Map, Terms, Privacy
    lib/           # data.ts, i18n.ts, storage.ts, favorites-provider.tsx, normalize.ts, seo.ts
    data/          # products.json, categories.json
  public/Images/   # Product images organized by category
server/            # Minimal Express scaffold (not actively used)
shared/            # Shared types
```

---

## Technologies Used

- **React 19** + **TypeScript**
- **Vite**
- **Tailwind CSS v4**
- **shadcn/ui**
- **Fuse.js** — fuzzy search
- **framer-motion** — spring animations and entrance transitions
- **wouter** — client-side routing
- **use-debounce** — debounced search input
- **Lucide React** — icons
- **Google Fonts** — Rubik (Latin) + Noto Sans TC (Traditional Chinese)

---

## Purpose

PX Mart Finder demonstrates how intelligent search and clear location data can reduce the time customers spend finding products inside a physical supermarket. It is designed as a portfolio piece and prototype pitch — not a production system.

---

## Future Enhancements

- More products and richer category coverage
- Real branch location data for additional stores
- Multi-branch support
- Real-time inventory synchronization
- Indoor navigation integration
- Backend API and admin dashboard
- Mobile application version
- Products for the 15 categories that are currently empty in the demo data
- Per-page OG/social preview images (would need SSR/prerendering, out of scope for this stack)
