# CLAUDE.md

# PX Mart Finder

## 1. What this project is

PX Mart Finder is a prototype that helps shoppers find products inside a PX Mart (全聯福利中心) supermarket in Taiwan. You search or browse, and the app shows the aisle and shelf. You can also save products for later.

It's a frontend-only portfolio project. The people who'll look at it are portfolio reviewers, recruiters, university evaluators and, possibly, PX Mart itself as a pitch. Shoppers come second.

It covers one real branch, **PX Mart Wufeng (Taichung)**. The Taipei and Kaohsiung branches are demo placeholders, not real coverage. All product and aisle data is demo data, and PX Mart has no part in the project.

Live site: https://px-mart-finder.netlify.app/ (see [Deployment](#deployment)).

---

# 2. Tech stack

- React 19, TypeScript, Vite, Tailwind CSS v4
- shadcn/ui, Lucide icons, framer-motion
- wouter for routing
- Fuse.js for fuzzy search, use-debounce for the search box
- Google Fonts: Rubik (Latin) and Noto Sans TC (Traditional Chinese)
- npm. `sharp` is a devDependency used only by `script/compress-images.ts`, so it never reaches the client bundle.

## Technical decisions to keep

### Product images are WebP
Local product photos in `client/public/Images` are `.webp`. `script/compress-images.ts` converted them from PNG: it resizes to at most 800px wide, re-encodes at quality 80 and keeps alpha transparency, since these are cut-out product shots on a `bg-muted` background. That took the folder from 9.9 MB to about 0.8 MB with no visible loss at the sizes they render (about 128px in `product-card.tsx`, up to about 430px on `product-detail.tsx`).

To add a local product photo: put the PNG or JPEG in `client/public/Images/...`, run `npm run compress-images`, then point `image_url` in `products.json` at the new `.webp`. The script walks the whole folder, skips files under 10 KB and deletes each original after writing the `.webp`. Don't commit large PNGs. Unsplash images (`image_url` starting with `https://`) don't need compressing.

### No react-window
The project used react-window once. It was removed because the list is small and the library caused dependency and API problems. Product lists render with a plain `.map()`. Don't add virtualization back.

### No `whileTap` inside another `whileTap`
framer-motion attaches native `pointerdown` listeners to each element. If a `motion.div` with `whileTap` sits inside another one, a tap on the inner element bubbles up and fires both. For press feedback on anything nested inside a `motion.div`, use CSS `active:scale-*`.

### Favorites live in one shared context
`useFavorites()` reads from `FavoritesContext`. Never turn it back into a hook with its own `useState`. That was the original design, and it gave each `ProductCard` its own copy of the list, so toggling two products made the second card overwrite the first card's localStorage write. `FavoritesProvider` (`favorites-provider.tsx`) now holds the only `useState`, and every component shares it. Copy the `LanguageContext` pattern for any other app-wide state.

### Read query params with wouter's `useSearch()`, never `window.location.search`
wouter's `useLocation()` re-renders only when the **pathname** changes. When only the query string changes (`/search?sort=name` to `/search?sort=aisle`, or back and forward between two searches), a component that reads `window.location.search` while rendering doesn't update. That's why the sort and brand dropdowns did nothing until 2026-09-30: the URL changed and the list didn't. `search-results.tsx` and `store-map.tsx` read params with `useSearch()`. Reading `window.location.search` inside an event handler, to build the next URL as `updateParam` does, is fine.

### Route-level code-splitting
`App.tsx` imports `Home` and `NotFound` directly and every other page with `React.lazy()`, inside one `<Suspense>` (a small spinner) wrapped by `Layout`, so the header and nav never flash. That took the main chunk from 629 KB to about 506 KB (162 KB gzipped). What's left is react-dom, framer-motion and the Radix dropdown for the store picker, which the landing page needs, so `vite.config.ts` sets `chunkSizeWarningLimit: 600` with a comment explaining why. Don't tune `manualChunks`. `QueryClientProvider`, `TooltipProvider` and `<Toaster />` came out of the tree because nothing used them; the shadcn `ui/` files and `lib/queryClient.ts` are still on disk, unused.

### localStorage goes through the `storage.ts` helpers
`readStored`, `readStoredList` and `writeStored` in `lib/storage.ts` wrap every read and write in `try/catch` and check the shape: `readStoredList` drops non-string entries, `App.tsx` accepts only `"en"` or `"zh"`, and `theme-provider.tsx` accepts only `light`, `dark` or `system`. Corrupt JSON, a hand-edited value or blocked storage falls back to defaults instead of a white screen. Use these helpers for any new saved setting.

---

# 3. Project structure

```
client/     the React app
script/     build script, sitemap generator, image compressor
server/     Express scaffold from the original template (not used)
shared/     shared types (not used)
dist/       build output, don't edit by hand
```

### client/src/components/
- `layout.tsx`: the app shell. Header, desktop sidebar, mobile bottom nav.
- `product-card.tsx`: a product in a list, with its location pill and framer-motion hover and tap.
- `product-image.tsx`: `<ProductImage>`. Shows a `Skeleton` while the image loads, fades it in, and shows an `ImageOff` icon if it fails. Used by `product-card.tsx` and the hero image on `product-detail.tsx`.
- `language-toggle.tsx`: the EN / 繁中 switch.
- `theme-toggle.tsx`: the light / dark switch.

### client/src/pages/

| File | Route | Notes |
|------|-------|-------|
| `home.tsx` | `/` | Hero search and category grid |
| `search-results.tsx` | `/search` | Fuzzy search, filters and sort |
| `category-detail.tsx` | `/category/:id` | Subcategory list |
| `product-detail.tsx` | `/product/:id` | Two columns on desktop |
| `favorites.tsx` | `/favorites` | Saved products |
| `store-map.tsx` | `/store-map` | Placeholder aisle map |
| `terms.tsx` | `/terms` | Terms of Use |
| `privacy.tsx` | `/privacy` | Privacy Policy |
| `not-found.tsx` | `*` | Branded 404 |

### client/src/lib/

| File | Purpose |
|------|---------|
| `data.ts` | Products, categories and stores, with their types. `isInCategory`, `isInSubCategory` and `countProducts` are the only place category matching happens; the search filters and the count badges both use them |
| `i18n.ts` | Every UI string in English and Chinese, plus the language and store contexts |
| `normalize.ts` | Turns aisle and shelf values into numbers for sorting |
| `storage.ts` | `FavoritesContext`, `useFavorites()`, `useRecentSearches()` and the safe localStorage helpers |
| `favorites-provider.tsx` | `FavoritesProvider`, which holds the one shared favorites `useState` |
| `validateData.ts` | Data checks that run in dev mode only |
| `seo.ts` | `usePageMeta(title, description)`, which sets `document.title` and the description meta tag |

### client/src/data/
`products.json` and `categories.json`. The store list (`STORE_LIST`) is in `data.ts`. All data is local and static.

---

# 4. Layout

| Width | Layout |
|-------|--------|
| Under 1024px | Full-width content and a fixed bottom nav |
| 1024px and up (`lg`) | 224px left sidebar and the content column |

- The outer wrapper is `max-w-screen-xl mx-auto`. The header background spans the full width; its content doesn't.
- The bottom nav (Home / Search / Saved) and the desktop sidebar both read `NAV_ITEMS` in `layout.tsx`.
- CSS variables: `--px-header-h: 72px` (sticky offsets), `--px-bottom-nav-h: 64px`, `--radius: 1rem`.

| Page | Mobile | Tablet (`sm`) | Desktop (`xl`) |
|------|--------|---------------|----------------|
| Category grid (home) | 3 columns | 4 columns | 6 columns |
| Search results | 1 | 2 | 3 |
| Subcategories | 1 | 2 | 3 |
| Saved | 1 | 2 | 3 |

Product detail on desktop: the image column sticks (`lg:sticky lg:top-[72px] lg:h-[calc(100vh-72px)]`) and the details, location and similar products scroll beside it.

---

# 5. Design system

## Type
Rubik for Latin text, Noto Sans TC for Chinese, loaded with a Google Fonts `@import` in `index.css`. That `@import url(...)` **must be the first line** of `index.css`, before `@import "tailwindcss"`. PostCSS expands Tailwind's import into CSS rules, and any `@import` after rules is invalid.

## Color
A blue and red palette in the spirit of PX Mart:
- Primary `215 90% 45%` (blue)
- Secondary `350 80% 55%` (red)
- Background `210 20% 98%` (cool off-white)

Dark mode uses softer versions, defined under `.dark` in `index.css`.

## Motion
- framer-motion for entrances (stagger, fade, scale).
- Springs for interactive elements: `type: "spring"`, stiffness 280 to 400, damping 22 to 28.
- Stagger delay `Math.min(index, 8) * 0.04` to `0.05`s, capped at 8 items so long lists don't crawl in.
- CSS `hover:` and `active:` for simple color and shadow changes.
- `whileHover` and `whileTap` only on the outermost wrapper (see the nesting rule above).

## Depth
Cards use `shadow-sm` and `shadow-lg` on hover. The bottom nav uses `shadow-[0_-4px_24px_rgba(0,0,0,0.07)]` and the header `shadow-md`.

---

# 6. Languages

The app speaks English (`en`) and Traditional Chinese (`zh`).

- Every string lives in `client/src/lib/i18n.ts`, under `translations.en` and `translations.zh`.
- Components call `const { t, language } = useLanguage()` and `t("key")`. Use `language` to pick between `_en` and `_zh` data fields.
- No hardcoded English or Chinese in JSX. The one exception is a sentence that needs a value inside it (`t()` has no interpolation), which can use an inline `language === "en" ? ... : ...`.
- Add the `en` and `zh` keys together, never one without the other.
- Write Taiwan Traditional Chinese: 門市 (not 門店), 分類 (not 类别), 走道, 收藏, 商品.

## Writing style

On 2026-10-23 the owner had all user-facing text, the legal pages and both docs rewritten with the Humanizer and Stop Slop skills. Keep new text in the same style.

- **Voice.** Plain and friendly, in short sentences with everyday words. English uses "you", "we" for the app, and "I" in the legal pages, where the one person who built it speaks. Chinese uses 你, not 您, and natural Taiwanese phrasing rather than translated English (避免「此為」「本應用程式」「您尚未添加」).
- **Spelling.** American English, as the UI already uses ("Favorites", "color").
- **Case.** Sentence case for headings, buttons, labels and page titles: "Search products", "View aisle map", "Page not found | PX Mart". "Terms of Use" and "Privacy Policy" keep their capitals because they're document names.
- **Words.** "Aisle info" for location data, "branch" for a store, "saved" for favorites (the nav says "Saved", the page title "Saved products"). Use one word per idea; don't rotate synonyms.
- **Messages.** Say what happened and what to do next, with a full stop: "No products match that search. Try another word." Counts agree with their number: "1 result", "56 results".
- **No em dashes.** Not in UI text, data, code comments or docs. Use a comma, a colon, parentheses or a new sentence. The demo branches are "Taipei (demo store)" and "台北（示意門市）".
- **Honesty.** Don't claim what isn't true. The store map is a placeholder and says so ("Demo map, not the real store layout"; "We haven't drawn this branch's floor plan yet"). The app is unofficial, and the footer, legal pages and meta descriptions say so. Feature text in the README has to match real data: the synonym example uses "soda", because there are no tissue products.
- **Legal pages.** Plain words, but the promises are real. If the app starts storing something new, update `privacySection1Body` and `legalLastUpdated` in both languages together.

---

# 7. Coding conventions

- Write readable, stable, simple code; keep abstraction to what the job needs.
- Names: `camelCase` variables, `PascalCase` components, `kebab-case` files.
- TypeScript: `import type { Foo }` for type-only imports; reuse the types exported from `@/lib/data`; no `any` (icon maps are `Record<string, LucideIcon>`).
- React: function components and hooks, small focused components, `cn()` from `@/lib/utils` for conditional classes.
- Comments only where the reason isn't obvious from the code.

---

# 8. Features

## Search
- Fuse.js fuzzy search across name, brand, category, subcategory and keywords.
- Synonyms from `SYNONYMS` in `data.ts` ("soda" also searches 可樂 and 汽水).
- Debounced input, synced to the URL.
- When nothing matches: fuzzy "Did you mean" suggestions and shortcuts to non-empty categories.
- Sorting by best match (default), name A-Z, or aisle order (numeric aisle, then shelf).

## Categories
- The home grid animates in, and each tile has a product count (a muted `0` when empty).
- Each subcategory row shows "N items" or "Coming soon" under its name.
- Only 8 of the 23 categories have products. The empty ones stay visible, since they match the real store's sections, and lead to a "No products here yet" state in `search-results.tsx` (`isEmptyCategory`: a category or subcategory filter with no query and no brand). Its shortcut tiles offer only categories that have products.

## Product page
- Image, category badge and brand.
- Location pill (aisle and shelf) with a link to the store map.
- Two columns on desktop.
- Similar products from the same category (matched on `category_en` or `category_zh`).
- If the chosen branch has no location for the product, the "Show similar items with aisle info" button appears only when such items exist. Otherwise the page shows the `noSimilarWithLocation` message.
- `showOnlyWithLocation` resets on every `/product/:id` change, because wouter keeps the component mounted.
- An unknown product or category ID renders the branded `<NotFound />`, and the page still sets its own "not found" title.

## Saved products
- Heart button on `ProductCard` and on the product page.
- One shared state in `FavoritesContext` (see the rule in section 2), saved to localStorage in `useFavoritesState()`.

## Store map
- A placeholder map that says it's a demo.
- Shows the aisle you came from when you arrive from a product page.
- The `?store=` param is applied once per link (the effect depends on `storeId` only). If you then switch branch in the header, the switch sticks and the aisle hides, since that aisle belongs to the linked branch.

## 404 page
- `not-found.tsx` has an icon, a big "404", a heading and description, "Search products" and "Back to home" buttons, and a "Go back" link (`window.history.back()`).
- The buttons are wouter `Link`s styled with `buttonVariants`, not `Button asChild`, to avoid Radix `Slot` ref-forwarding problems with wouter v3.
- It renders inside the normal `Layout`, as the catch-all `<Route>` in `App.tsx`.

## Page titles and descriptions
- `usePageMeta(title, description)` in `lib/seo.ts` sets `document.title` to `"<title> | PX Mart"` and updates `<meta name="description">` in a `useEffect`. No react-helmet and no SSR.
- Every page passes text for the current language, so switching language updates the tab title live:
  - `home.tsx` and `favorites.tsx` use fixed `i18n.ts` keys; `store-map.tsx` builds its description from the branch name.
  - `category-detail.tsx` uses the category name and its subcategory count.
  - `product-detail.tsx` uses the product name, brand, and aisle and shelf when known.
  - `search-results.tsx` reflects the query or category, falling back to `metaSearchTitle` and `metaSearchDesc`.
  - `not-found.tsx` reuses `pageNotFound` and `pageNotFoundDesc`.
- Pages with an early return (`category-detail.tsx`, `product-detail.tsx`) call `usePageMeta` before the return, with not-found text as the fallback, so the hook order stays the same on every render.

## Loading states
The data is static and renders at once, so there's no fetching state. Loading indicators cover the real waits:
- **Product images.** `<ProductImage>` shows a `Skeleton`, fades the `<img>` in on `onLoad` (`transition-opacity duration-300`) and shows a muted `ImageOff` icon on `onError`. It stores the status together with its `src` (`{ src, status }`), so a new `src` reads as "loading" on the same render. An earlier `useEffect` reset could run after a cached image's `onLoad` and leave the new image stuck at `opacity-0`.
- **Lazy pages.** The `<Suspense>` in `App.tsx` shows a small centered `Loader2` spinner while a page chunk loads.
- **Remote images.** 21 product photos come from Unsplash. Five of them (f4, 100, 101, 103, 110) had been deleted upstream (HTTP 404) and were replaced on 2026-09-30. If an image falls back to the icon, `curl` every `images.unsplash.com` URL in `products.json` for a non-200 and swap in a free-license photo. `netlify.toml`'s CSP allows `images.unsplash.com` as the only remote image host.
- **First load.** `client/index.html` shows `#app-boot-loader`, a spinner styled inline because it has to paint before the bundle loads. `main.tsx` fades it out with a `.hide` class after `createRoot().render()` and removes it on `transitionend`, with a 400ms `setTimeout` fallback, since `transitionend` doesn't always fire if the class lands before the first paint.
- **Search debounce.** `search-results.tsx` swaps the search icon for a spinning `Loader2` while `query !== debouncedQuery` (300ms), so you can see the results haven't caught up with your typing.

## Legal pages
- `terms.tsx` (`/terms`) and `privacy.tsx` (`/privacy`) share the back-header and prose layout of `store-map.tsx`. Their text is in `i18n.ts` (`termsSection1-6Title/Body`, `privacySection1-5Title/Body`, `legalLastUpdated`), and each page calls `usePageMeta`.
- Both say plainly that the app is an independent, unofficial portfolio project that PX Mart (全聯福利中心) doesn't own, run, endorse or sponsor. That matters because the app uses a real retailer's name and colors.
- The Privacy Policy describes what the app really does: it keeps everything in localStorage (`px-lang`, `px-store`, `px-favorites`, `px-recent-searches`, `vite-ui-theme`), has no backend, accounts, analytics or tracking, and loads some images from Unsplash.
- Links to them sit at the bottom of the desktop sidebar (`mt-auto` in `layout.tsx`) and in the `<footer>` on `home.tsx`. They aren't in `NAV_ITEMS` or the bottom nav, since they're not main navigation. Home got the footer because it's the one page with normal page flow and no inner scroll area.

---

# 9. Progress

## Done
- Search with fuzzy matching and synonyms; brand filter and three sorts.
- Product cards, product pages (two columns on desktop), category browsing.
- Saved products, kept in localStorage.
- Branch picker, remembered between visits.
- Responsive layout for mobile, tablet and desktop, with a bottom nav on small screens and a sidebar on desktop.
- Light and dark mode; Rubik and Noto Sans TC; spring animations for entrances, hover and tap.
- English and Traditional Chinese for every string.

## Fix history

Earlier fixes:
- Similar products check both `category_en` and `category_zh`.
- `iconMap` is typed `Record<string, LucideIcon>` instead of `any`.
- The heart button uses CSS `active:scale-90` instead of a nested `motion.div`, which fixed taps bubbling to the card.
- Removed a duplicate local `type Product` from `search-results.tsx`, a `{ { } }` JSX spacing slip in `store-map.tsx`, and unused `location` / `setLocation` variables there.
- Moved the Google Fonts `@import` to the top of `index.css`.
- Replaced 7 missing local images (f2 to f8, Fresh Vegetables) with Unsplash photos.
- Swapped `gray-*` classes in `not-found.tsx` for theme-aware ones.
- **Saved products bug.** Each `ProductCard` used to keep its own favorites state, so saving two products in a row made the second overwrite the first in localStorage, and removing did the same in reverse. Fixed with the shared `FavoritesContext` (section 2).
- Rebuilt `not-found.tsx` as the branded 404.
- Added per-page titles and descriptions with `usePageMeta`.
- Added the loading states, and fixed the boot loader staying in the DOM when `transitionend` didn't fire.
- Added the Terms of Use and Privacy Policy.
- Compressed the local product photos to WebP (35 files, 9.9 MB to about 0.8 MB).

**2026-09-30 fix pass** (committed as `9a0f4a3`, deployed 2026-10-23):
- **Sort and brand filter did nothing.** The URL changed but the list didn't. See the `useSearch()` rule in section 2.
- **Copy-paste errors in `products.json`.** `香蕉` (banana) was a keyword on 6 other tropical fruits; `草莓` (strawberry) on every tomato, grape, orange, avocado and blueberry; `菠菜` (spinach) on cucumbers and bean sprouts. The blueberries (`c1`) had the Chinese name `新鮮草莓`. Lemon (`b4`) sat under Apples & Pears and moved to Citrus Fruits; avocado (`d1`) moved from Citrus Fruits to Tropical Fruits. `c2` and `c5` were both "Cherry Tomatoes 550g" and became "Yu Nu ..." and "Sheng Nu ...", matching their Chinese names.
- Replaced 5 dead (404) Unsplash image URLs.
- Empty categories got counts and the "No products here yet" state. The category header used to say "N Categories" for subcategories.
- Moved hardcoded English/Chinese ternaries into `i18n.ts`.
- **The mobile header was too wide** at 375px, so the page scrolled sideways. Below `sm` the language toggle drops its flags; below 420px the "PX Mart" text title is `sr-only` (the logo stays); the store picker truncates (`min-w-0`). Checked at 320px with the back button showing.
- **The theme toggle's first click did nothing** in "system" mode on a dark OS, because it compared against the stored `"system"`. It now toggles from the actual `.dark` class, and "system" mode follows OS changes live.
- The store map snapped the header's branch back to the URL's branch; `ProductImage` could get stuck invisible; the similar-products button could empty the list with no message. See section 8.
- Scroll resets to the top on route change (`layout.tsx`). Clear search (×) clears only the query and keeps category, brand and sort. Searches from the search page go into recent searches too. The active brand stays in the brand list when a new query no longer matches it.
- `<html lang>` follows the language (`zh-Hant-TW` or `en`). Icon-only buttons (heart, back, clear, store picker) have aria-labels. "View aisle map" is a styled `Link` instead of a `<button>` inside an `<a>`.
- `index.html` got a default title, description and `theme-color`. It lost an unused Inter and Noto Sans **SC** (Simplified) stylesheet, an `og:image` pointing at a missing `Logo.jpg`, Replit's `twitter:site` and `maximum-scale=1` (which blocked pinch-zoom). `site.webmanifest` icon paths pointed at `/` instead of `/favicon_io/`, and its name was empty.
- Deleted the Replit agent state files (`.local/state/replit/`) and gitignored `.local/`.
- Added `robots.txt`, a build-generated `sitemap.xml` and absolute `og:image` / `twitter:image` URLs.

**2026-10-23 writing pass** (uncommitted, for the owner to review): see [Writing style](#writing-style). It also:
- fixed "1 Results" on the search page, which now reads "1 result" / "56 results" (Chinese "56 筆結果"),
- renamed the demo branches to "Taipei (demo store)" and "Kaohsiung (demo store)" (the old names had an em dash),
- made the "Saved" nav item and the page title agree ("Saved products"),
- dropped five unused keys (`section`, `recentSearches`, `howToFind`, `goToAisle`, `metaStoreMapDesc`),
- removed every em dash from `client/src`, `script/` and `index.html` (the shadcn `ui/` files are untouched).

## Build status
- `npx tsc --noEmit`: 0 errors.
- `npm run build`: no warnings. Main chunk about 506 KB (162 KB gzipped); the other pages load on demand.
- `npm run dev:client`: serves on port 5000, with zero console errors or warnings across all routes (apart from the dev-only data validation log, which passes).
- `.claude/launch.json` has `px-mart-prod-preview`, which runs `vite preview` on port 5001 and serves `dist/public`. Run `npm run build` first.

## Still to do

### Data
- 15 of the 23 categories have no products yet (they show "Coming soon"). Fresh Fruits alone is 34 of the 56 products.
- Real aisle data for more branches.
- Some photos sit in a folder that no longer matches the product's subcategory; the lemon's photo is in `Images/Fresh Fruits/Apples & Pears/`. The paths still work.

### Bigger ideas
- A drawn floor plan for the store map.
- An API, a database, accounts and an admin page for editing products.
- A real connection to PX Mart systems. Today it's all demo data.

### Deployment
Live site: **https://px-mart-finder.netlify.app/**. `netlify.toml` builds with `npm run build` on Node 22, publishes `dist/public` and sets security headers, including a CSP that allows `images.unsplash.com` as the only remote image host.

**Deployed and checked live on 2026-10-23.** Before that, on 2026-10-15, the live site was still a build from before 2026-09-21, even though `9a0f4a3` had been pushed to GitHub `FullyMed/My_Projects` (a monorepo). Its `netlify.toml` headers weren't applied, so Netlify wasn't building from the repo at all. The owner linked the repo with **base directory `Website/PX_Mart_Finder`** and redeployed. Nobody has seen yet whether a push deploys on its own; the next push will show it.

The 2026-10-23 check:
- The served bundle `index-Dy2SAV7u.js` matched the local build.
- All five security headers from `netlify.toml` were present (CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`).
- `robots.txt`, `sitemap.xml` (`application/xml`, 84 URLs) and the fixed manifest were served, and deep links returned 200.
- In the browser, under the real CSP: Rubik loaded, all 56 product images loaded (21 from Unsplash), sort by name worked through the UI, 香蕉 found only the banana, empty categories said "Coming soon", and the store map showed the linked aisle.
- Unknown IDs showed the 404, nothing scrolled sideways at 375px, and the console had **no errors or CSP violations**.

To check a deploy: `curl -s https://px-mart-finder.netlify.app/ | grep -c app-boot-loader` should print a number above 0 (the id appears in the CSS and in the div), `curl -sI` should show `Content-Security-Policy`, and the `assets/index-*.js` name in the live HTML should match `dist/public` after `npm run build`. The CSP exists only on Netlify, so check anything that loads a new remote resource (fonts, images, scripts) on the live site.

### SEO
- `client/public/robots.txt` allows everything and has a `Sitemap:` line.
- `sitemap.xml` is **generated, not committed**. `writeSitemap` in `script/sitemap.ts` runs inside `script/build.ts` after the Vite build and writes `dist/public/sitemap.xml` from `products.json` and `categories.json`: 5 static routes, every `/category/<id>` and every `/product/<id>` (84 URLs today). It can't drift from the data. If the domain changes, update `SITE_URL` there, the `Sitemap:` line in `robots.txt`, and the absolute `og:image` / `twitter:image` in `index.html`. `/favorites` is left out on purpose, since it's per-device localStorage and always empty for a crawler. `npx vite build` alone skips the sitemap, so use `npm run build`.
- The `og:title`, `og:description` and `og:image` in `index.html` are the same on every page. Link-preview bots don't run JavaScript, so per-page cards would need SSR or prerendering, which is out of scope.

---

# 10. Rules for Claude Code

## Always
- **Stay in scope.** It's a single-branch prototype. Don't over-engineer.
- **Prefer stable, readable code** to clever optimization or extra abstraction.
- **Keep the look.** Clean, minimal, retail-style UI with gentle spring animation. No redesigns nobody asked for.
- **Keep Traditional Chinese.** Every string needs `en` and `zh` in `i18n.ts`, in Taiwanese usage (門市, 走道, 分類, 收藏).
- **Keep the data consistent.** Unique product IDs, valid image paths, consistent store locations, and categories and subcategories that match `CATEGORIES`.
- **Keep the build green.** `npx tsc --noEmit` must pass with 0 errors after every change.
- **Keep the CSS import order.** External `@import url(...)` lines go before `@import "tailwindcss"` in `index.css`.
- **Follow the [writing style](#writing-style)** for any new text.

## Never
- **Don't bring back react-window.**
- **Don't add enterprise complexity:** microservices, extra backend layers, premature optimization, or state libraries such as Redux or Zustand.
- **Don't give `useFavorites` its own `useState`.** It must read `FavoritesContext`, or saved products start overwriting each other again (section 2).
- **Don't present it as production scale.** It's a prototype for one branch.
- **Don't rewrite the data schema** unless there's no other way.
- **Don't nest `whileTap` motion elements.** Use CSS `active:scale-*` for nested press feedback.
- **Don't commit or push.** The owner does that himself (said again on 2026-09-30). Leave changes in the working tree, list the changed files at the end, and don't offer to commit. Only run `git commit` or `git push` if he asks for it right then.
- **Don't hardcode strings in JSX.** Everything goes through `t("key")`, except sentences that need a value inside them.

---

# 11. Notes

- **Console noise.** Errors mentioning `/writing`, `/site_integration` or permissions come from tooling around the editor, not from the app. Ignore them.
- **WSL2.** If `node_modules` was installed on Windows and you run the app in WSL2, esbuild fails with a platform mismatch. Run `npm ci` inside WSL2.
- **The point of the project** is a clean, believable, fully responsive single-branch prototype with stable frontend code and clear portfolio value. It isn't meant to be a nationwide retail platform or an architecture experiment.
