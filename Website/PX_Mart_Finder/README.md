# PX Mart Finder

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
```

> **Windows / WSL2 note:** Always run `npm ci` from within WSL2. Installing `node_modules` on Windows and then running in WSL2 will cause native binary errors (esbuild, rollup).

---

## Key Features

- Fast product search with fuzzy matching and typo tolerance
- Synonym expansion (e.g. searching "tissue" also finds 衛生紙, 面紙)
- Aisle and shelf location per product, per store
- Category and subcategory browsing
- Brand filtering and multi-sort (relevance, name, aisle order)
- "Did you mean?" suggestions when no results are found
- Favorites with localStorage persistence — shared context keeps all toggles in sync
- Store selection (Wufeng branch + demo placeholders)
- Store map placeholder with aisle highlighting
- Full bilingual support — English and Traditional Chinese (繁體中文)
- Light and dark mode
- Fully responsive — mobile, tablet, and desktop layouts

---

## Project Structure

```
client/
  src/
    components/    # Layout, ProductCard, LanguageToggle, ThemeToggle
    pages/         # Home, Search, Category, Product Detail, Favorites, Store Map
    lib/           # data.ts, i18n.ts, storage.ts, favorites-provider.tsx, normalize.ts
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
