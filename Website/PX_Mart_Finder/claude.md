# CLAUDE.md

# PX Mart Finder

## 1. Project Overview

### What This Project Is
PX Mart Finder is a retail product discovery and in-store navigation prototype designed for PX Mart (全聯福利中心) in Taiwan.

The project helps users:
- Search products quickly
- Browse by categories/subcategories
- View aisle and shelf locations
- Find products inside a physical PX Mart branch

This is a frontend-focused prototype intended primarily for:
- Portfolio demonstration
- UX/UI experimentation
- Retail product discovery concepts
- Prototype pitching/demo purposes

---

### Current Product Positioning
This project is intentionally positioned as a:

> Single-Branch Prototype System

The primary supported branch is:
- PX Mart Wufeng (Taichung, Taiwan)

Other stores are demo placeholders only and are NOT intended to represent real production coverage.

---

### Goals
- Demonstrate retail search UX
- Simulate real supermarket product finding
- Showcase modern frontend engineering skills
- Build a clean and realistic portfolio project
- Potentially pitch as a prototype/demo concept to PX Mart

---

### Target Audience
Primary audience:
- Portfolio reviewers
- Recruiters
- University evaluators
- PX Mart stakeholders (prototype/demo context)

Secondary audience:
- Customers trying to locate products inside a store

---

# 2. Tech Stack

## Core Stack
- React
- TypeScript
- Vite
- Tailwind CSS v4

## UI / Styling
- shadcn/ui
- Tailwind utilities
- Lucide React icons
- framer-motion (animations and micro-interactions)
- Google Fonts: Rubik + Noto Sans TC

## Routing
- wouter

## Search / Filtering
- Fuse.js (fuzzy search)

## State & Utilities
- React Hooks
- use-debounce

## Build / Tooling
- npm
- Vite build system
- TypeScript compiler

## Important Technical Decisions

### No react-window
The project previously used react-window, but virtualization was removed because:
- Dataset size is currently small
- It introduced dependency/API compatibility issues
- Simpler rendering is more stable and maintainable for the prototype scope

The project now uses standard `.map()` rendering for product lists.

### No wrapping motion.div around nested interactive elements
Do NOT add a `motion.div` with `whileTap` around a Button/interactive element that is already inside another `motion.div` with `whileTap`. Framer-motion attaches native `pointerdown` listeners directly on DOM elements. When the inner element is tapped, the event bubbles and triggers both the inner and outer `whileTap` simultaneously.

Use CSS `active:scale-*` for press feedback on elements nested inside a `motion.div`.

---

# 3. Project Structure

## Root Structure

```
client/
server/
shared/
dist/
```

## client/
Frontend React application.

### client/src/components/
Reusable UI components.

Key components:
- `layout.tsx` — App shell: responsive header, sidebar (desktop), bottom nav (mobile)
- `product-card.tsx` — Product list card with location pill, framer-motion hover/tap
- `language-toggle.tsx` — EN / 繁中 switcher
- `theme-toggle.tsx` — Light / Dark mode toggle

### client/src/pages/
Page-level views.

| File | Route | Notes |
|------|-------|-------|
| `home.tsx` | `/` | Hero search + category grid |
| `search-results.tsx` | `/search` | Fuzzy search + filter + sort |
| `category-detail.tsx` | `/category/:id` | Subcategory list |
| `product-detail.tsx` | `/product/:id` | Two-column on desktop |
| `favorites.tsx` | `/favorites` | Saved products |
| `store-map.tsx` | `/store-map` | Placeholder aisle map |
| `not-found.tsx` | `*` | 404, fully localized |

### client/src/lib/
Core app logic and shared frontend utilities.

| File | Purpose |
|------|---------|
| `data.ts` | All product, category, store data + exported types |
| `i18n.ts` | All translation strings (EN + ZH), context hooks |
| `normalize.ts` | Aisle/shelf value normalization |
| `storage.ts` | localStorage hooks (favorites, recent searches) |
| `validateData.ts` | Data integrity checks (DEV mode only) |

### client/src/data/
Static mock data files (JSON):
- products
- categories
- stores

This project currently relies entirely on local mock/static data.

## server/
Minimal Express backend scaffold. Currently NOT actively used.

## shared/
Shared types/utilities between frontend and backend.

## dist/
Production build output. Do NOT manually edit.

---

# 4. Layout & Responsive System

## Breakpoints
| Breakpoint | Width | Layout |
|-----------|-------|--------|
| Mobile | < 1024px | Full-width content + fixed bottom nav |
| Desktop | ≥ 1024px (`lg`) | 224px left sidebar + main content column |

## Container
- Outer wrapper: `max-w-screen-xl mx-auto`
- Header background spans full viewport width; inner content is constrained
- On desktop, main content area = screen width − 224px sidebar

## Navigation
- **Mobile/Tablet**: Fixed bottom nav with Home / Search / Saved tabs
- **Desktop**: Left sidebar with same items; bottom nav hidden via `lg:hidden`
- Both read from the same `NAV_ITEMS` constant in `layout.tsx`

## CSS Variables
```css
--px-header-h: 72px;      /* sticky header height; used for sticky offsets */
--px-bottom-nav-h: 64px;  /* bottom nav height reference */
--radius: 1rem;            /* global border-radius base */
```

## Responsive Grid Examples
| Page | Mobile | Tablet (sm) | Desktop (xl) |
|------|--------|-------------|--------------|
| Category grid (home) | 3 cols | 4 cols | 6 cols |
| Product results | 1 col | 2 cols | 3 cols |
| Subcategories | 1 col | 2 cols | 3 cols |
| Favorites | 1 col | 2 cols | 3 cols |

## Product Detail (desktop)
Two-column grid: `lg:grid-cols-[40%_1fr]`
- Left: product image, sticky (`lg:sticky lg:top-[72px] lg:h-[calc(100vh-72px)]`)
- Right: details, location, similar products (scrollable)

---

# 5. Design System

## Typography
- **Font**: Rubik (Latin) + Noto Sans TC (Traditional Chinese fallback)
- Loaded via Google Fonts `@import` in `index.css`
- **Important**: The Google Fonts `@import url(...)` MUST be the very first line in `index.css`, before `@import "tailwindcss"`. PostCSS expands Tailwind's import into CSS rules, making any later `@import` invalid.

## Colors
PX Mart inspired Blue & Red theme:
- Primary: `215 90% 45%` (blue)
- Secondary: `350 80% 55%` (red accent)
- Background: `210 20% 98%` (cool off-white)

Dark mode uses desaturated variants — defined in `index.css` under `.dark`.

## Animation Principles
- Use `framer-motion` for entrance animations (stagger, fade-in, scale)
- Use spring physics (`type: "spring", stiffness: 280–400, damping: 22–28`) for interactive elements
- Entrance delays: `Math.min(index, 8) * 0.04–0.05s` — cap at 8 items to avoid slow lists
- Use CSS `hover:` / `active:` for simple color/shadow transitions
- Use `whileHover` / `whileTap` on outermost non-nested wrappers only

## Shadows & Depth
- Cards: `shadow-sm` default, `shadow-lg` on hover
- Bottom nav: `shadow-[0_-4px_24px_rgba(0,0,0,0.07)]`
- Header: `shadow-md`

---

# 6. Localization (i18n)

## Supported Languages
- English (`en`)
- Traditional Chinese — 繁體中文 (`zh`)

## How it Works
- All strings live in `client/src/lib/i18n.ts` under `translations.en` and `translations.zh`
- Access via `const { t, language } = useLanguage()`
- `t("key")` returns the string for the current language
- `language` is `"en"` or `"zh"` — use for conditional display of locale-specific data fields

## Rules
- ALL user-facing strings must use `t()` — no hardcoded English/Chinese in JSX
- Exception: parameterized strings (e.g. `"Location data for ${store.nameEn}"`) may use inline ternary since `t()` has no interpolation support
- Always add both `en` and `zh` keys together — never add one without the other
- Taiwan uses Traditional Chinese: always write `門市` (not `門店`), `分類` (not `类别`), etc.

---

# 7. Coding Style & Conventions

## General Philosophy
Code should prioritize:
- readability
- maintainability
- stability
- simplicity over unnecessary complexity

## Naming Conventions
- Variables: `camelCase` (e.g. `selectedStore`, `expandedTerms`)
- Components: `PascalCase` (e.g. `ProductCard`, `SearchResults`)
- Files: `kebab-case` (e.g. `search-results.tsx`, `product-detail.tsx`)

## TypeScript Rules
- Use `import type { Foo }` for type-only imports
- Avoid re-defining types locally when they are exported from `@/lib/data`
- Avoid `any` — use `LucideIcon` for icon map types, proper interfaces for data
- Icon maps: `Record<string, LucideIcon>` (import `type LucideIcon` from `lucide-react`)

## React Rules
- Prefer functional components and hooks
- Keep components focused and modular
- Use `cn()` from `@/lib/utils` for conditional classNames

## Comment Style
Only comment when the WHY is non-obvious. No redundant or task-tracking comments.

---

# 8. Key Features

## Product Search
- Fuzzy search via Fuse.js across name, brand, category, subcategory, keywords
- Synonym expansion (`SYNONYMS` map in `data.ts`)
- Debounced input with URL sync

## Category Browsing
- Category grid on home page with animated entrance
- Subcategory filtering per category

## Product Detail Pages
- Product image, category badge, brand
- Location pill (aisle + shelf) with store-map link
- Two-column layout on desktop
- Similar products section (checks both `category_en` and `category_zh`)

## Favorites System
- Toggle via heart button on ProductCard
- Stored in localStorage via `useFavorites()` hook

## Search Suggestions
- If no results: fuzzy "did you mean" suggestions + category shortcuts

## Sorting
- Relevance (default)
- Name A–Z
- Aisle order (numeric sort with shelf as tiebreaker)

## Store Map
- Demo placeholder aisle map
- Highlights the target aisle when navigated from product detail

---

# 9. Current Progress

## Completed

### Core Features
- Search system with fuzzy matching + synonym expansion
- Product cards with location, favorites, hover/tap animations
- Product detail pages (two-column on desktop)
- Category browsing with subcategory filtering
- Favorites with localStorage persistence
- Sorting/filtering
- Store selection (dropdown, persisted)
- Full responsive layout (mobile, tablet, desktop)

### UI/UX
- Dark mode support (full light/dark theme)
- Rubik + Noto Sans TC typography
- Framer-motion animations: stagger entrance, spring hover, tap feedback
- Bottom navigation (mobile/tablet)
- Sidebar navigation (desktop)
- Sticky search/filter header
- Two-column product detail on desktop
- Consistent 1rem border radius, soft shadows

### Localization
- All UI strings in `i18n.ts` with EN and ZH keys
- Traditional Chinese throughout (門市, not 門店, etc.)
- `not-found.tsx`, error states, store-map labels all fully localized

### Bug Fixes Applied
- Similar products filter checks both `category_en` and `category_zh`
- `iconMap` typed as `Record<string, LucideIcon>` (removed `any`)
- Heart button pointer-event bubbling fixed (CSS `active:scale-90` instead of nested `motion.div`)
- Duplicate local `type Product` removed from `search-results.tsx`
- `{ { } }` JSX spacing inconsistency in `store-map.tsx` fixed
- Google Fonts `@import` moved to top of `index.css`

### Build Status
TypeScript: `npx tsc --noEmit` → 0 errors
Runtime: serving on port 5000 with no CSS/PostCSS errors

## Pending / Future Improvements

### README.md
A proper public-facing README still needs to be written.

### Data Expansion
- More products
- Richer category coverage
- Real branch data

### Backend Expansion
- APIs
- Real database
- Authentication
- Admin dashboard

### Real PX Mart Integration
Currently NOT integrated with real PX Mart systems. All data is prototype/demo data.

---

# 10. Important Rules for Claude Code

## Claude MUST ALWAYS

### Respect Project Scope
Single-branch retail prototype. Do NOT over-engineer.

### Prioritize Stability
Prefer stable, readable, maintainable code over unnecessary optimization or abstraction.

### Preserve Existing UX Direction
The project aims for a clean, modern, minimal, retail-oriented UI with smooth spring animations.
Do not redesign unnecessarily.

### Keep Traditional Chinese Support
All strings must have both EN and ZH translations in `i18n.ts`.
Use Traditional Chinese conventions (Taiwan): 門市, 走道, 分類, 收藏, etc.

### Keep Data Consistent
- Product IDs must be unique
- Image paths must be valid
- Store location data must be consistent
- Category/subcategory references must match `CATEGORIES` in `data.ts`

### Maintain Build Stability
Always ensure `npx tsc --noEmit` passes with 0 errors after changes.

### Follow the CSS Import Order
In `index.css`, always put external `@import url(...)` (Google Fonts etc.) **before** `@import "tailwindcss"`.

## Claude MUST NEVER

### Do NOT Reintroduce react-window
Virtualization was intentionally removed. Do not add it back.

### Do NOT Add Enterprise Complexity
Avoid microservice architecture, unnecessary backend layers, premature optimization, or complex state management libraries (Redux, Zustand, etc.).

### Do NOT Pretend This Is Production Scale
This is intentionally prototype scale and single-branch focused.

### Do NOT Break Existing Data Structure
Avoid unnecessary schema rewrites unless strictly required.

### Do NOT Nest motion.div whileTap Inside Another motion.div whileTap
Framer-motion uses native `pointerdown` listeners. Nesting `whileTap` motion elements causes the parent to trigger on child taps due to event bubbling. Use CSS `active:scale-*` for press feedback on nested interactive elements.

### Do NOT Hardcode Strings in JSX
All user-facing text must go through `t("key")` from `useLanguage()`. The only exception is parameterized strings that require interpolation (no template support in `t()`).

---

# 11. Known Issues / Notes

## Known Console Noise
Some non-critical console errors may appear related to `/writing`, `/site_integration`, or permission errors. These originate from environment/tooling integrations, not PX Mart Finder itself. Not blocking.

## Dependency Notes
- esbuild platform mismatch may occur when `node_modules` was installed on Windows but run in WSL2. Fix: `npm ci` inside WSL2.

## Important Architectural Decision
The project intentionally favors simplicity, prototype realism, and maintainability over artificial complexity or enterprise-scale simulation.

---

# Final Philosophy

This project is intentionally designed as:

> A clean, realistic, fully responsive, single-branch retail product finder prototype

NOT:
- a massive enterprise retail platform
- a production-scale nationwide system
- a hyper-optimized architecture experiment

The focus is:
- strong UX with smooth, gentle interactions
- believable prototype quality
- stable frontend engineering
- full responsive design (mobile → tablet → desktop)
- clear portfolio value
