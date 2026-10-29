# CLAUDE.md

# PX Mart Finder

## 1. What this project is

PX Mart Finder is a prototype that helps shoppers find products inside a PX Mart (全聯福利中心) supermarket in Taiwan. You search or browse, and the app shows the aisle and shelf. You can also save products for later.

It's a frontend-only portfolio project. The people who'll look at it are portfolio reviewers, recruiters, university evaluators and, possibly, PX Mart itself as a pitch. Shoppers come second.

It covers one real branch, **PX Mart Wufeng (Taichung)**. The Taipei and Kaohsiung branches are demo placeholders, not real coverage. PX Mart has no part in the project. Of the 2,126 products, 2,070 (IDs `200` to `2275`, with gaps where some were removed after checking) come from the Wufeng branch's public foodpanda listing, with real names and photos; see [Products from foodpanda](#products-from-foodpanda). All aisle data is demo data, and only the first 56 products have any.

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

To add a local product photo: put the PNG or JPEG in `client/public/Images/...`, run `npm run compress-images`, then point `image_url` in `products.json` at the new `.webp`. The script walks the whole folder, converts `.png`, `.jpg` and `.jpeg` (JPEG support was added on 2026-10-29; before that it only took PNG), skips files under 10 KB and deletes each original after writing the `.webp`. `Images/Banner.jpg` (8.7 KB) and `Images/Logo.png` (3 KB) are only safe because they're under 10 KB, and `Logo.png` is referenced by name in `layout.tsx` and `index.html`, so never put a larger non-product image in this folder. Don't commit large PNGs. Unsplash images (`image_url` starting with `https://`) don't need compressing.

### No react-window
The project used react-window once. It was removed because the list is small and the library caused dependency and API problems. Product lists render with a plain `.map()`. Don't add virtualization back.

### No `whileTap` inside another `whileTap`
framer-motion attaches native `pointerdown` listeners to each element. If a `motion.div` with `whileTap` sits inside another one, a tap on the inner element bubbles up and fires both. For press feedback on anything nested inside a `motion.div`, use CSS `active:scale-*`.

### Favorites live in one shared context
`useFavorites()` reads from `FavoritesContext`. Never turn it back into a hook with its own `useState`. That was the original design, and it gave each `ProductCard` its own copy of the list, so toggling two products made the second card overwrite the first card's localStorage write. `FavoritesProvider` (`favorites-provider.tsx`) now holds the only `useState`, and every component shares it. Copy the `LanguageContext` pattern for any other app-wide state.

### Read query params with wouter's `useSearch()`, never `window.location.search`
wouter's `useLocation()` re-renders only when the **pathname** changes. When only the query string changes (`/search?sort=name` to `/search?sort=aisle`, or back and forward between two searches), a component that reads `window.location.search` while rendering doesn't update. That's why the sort and brand dropdowns did nothing until 2026-09-30: the URL changed and the list didn't. `search-results.tsx` and `store-map.tsx` read params with `useSearch()`. Reading `window.location.search` inside an event handler, to build the next URL as `updateParam` does, is fine.

### Route-level code-splitting
`App.tsx` imports `Home` and `NotFound` directly and every other page with `React.lazy()`, inside one `<Suspense>` (a small spinner) wrapped by `Layout`, so the header and nav never flash. That took the main chunk from 629 KB to about 506 KB (162 KB gzipped). Adding the foodpanda products on 2026-10-29 took it to about 757 KB (203 KB gzipped) after the first pass (591 products), about 1,130 KB (261 KB gzipped) after the second (1,381 products), and on 2026-10-30 about 1,483 KB (320 KB gzipped) after the third (2,126 products), because `products.json` is bundled and Home needs it for the category counts. What's left is react-dom, framer-motion, the Radix dropdown for the store picker and the product data, which the landing page needs, so `vite.config.ts` sets `chunkSizeWarningLimit: 1600` with a comment explaining why. **Don't raise it again:** if the catalog grows further, load `products.json` separately (for example a fetched JSON file) so the first page stays fast. Don't tune `manualChunks`. `QueryClientProvider`, `TooltipProvider` and `<Toaster />` came out of the tree because nothing used them; the shadcn `ui/` files and `lib/queryClient.ts` are still on disk, unused.

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

Product detail on desktop: the image is a square, rounded panel (`lg:w-2/5 lg:aspect-square lg:rounded-3xl`) that sticks below the header (`lg:sticky lg:top-[calc(var(--px-header-h)+2rem)]`) while the details, location and similar products scroll beside it. It used to fill a full-height column with `object-cover`, which cropped square product shots (half the melon was cut off). On mobile the image is a full-bleed square.

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

## Design rules

On 2026-10-23 the owner had the UI reviewed with the UI/UX Pro Max, taste-skill (redesign-existing-projects), Frontend Design and Emil Kowalski skills. It was a fix pass, not a redesign. Keep new UI to these rules:

- **Contrast.** All text meets WCAG AA (4.5:1, or 3:1 for large text) in light and dark mode. Don't fade text with opacity (`text-muted-foreground/70`, `opacity-60`); use `text-muted-foreground` as the lightest text color. Before the pass, the sidebar and footer links were 2.8:1, product-card brand and section text 2.9:1, and the store-map placeholder text as low as 1.1:1.
- **Brand surfaces.** The header and the home and category heroes use `bg-brand text-brand-foreground`, not `bg-primary`. `--brand` is the PX blue in light mode and a deep blue (`216 70% 26%`) in dark mode, with white text in both. Dark mode's `--primary` is a bright blue meant for buttons and links; as a header it was a loud slab with dark text.
- **Don't use `secondary` for buttons.** `--secondary` is red in light mode and slate in dark mode, so a `secondary` button changes meaning between themes. The 404 page's second button is `outline`.
- **Text size.** 12px (`text-xs`) is the smallest size for words. Numeric count pills and card category badges may use 11px. Labels are sentence case, never `uppercase` with wide tracking.
- **Headings.** One `<h1>` per page. The header's "PX Mart" is a `<span>`, Home's hero title is the `<h1>`, and Search has an `sr-only` `<h1>` with the page title. Section headings are `<h2>`.
- **Focus.** `index.css` gives every focusable element a 2px `--ring` outline. Buttons, inputs and select triggers use a 2px ring instead (`focus-visible:ring-2`). The header and home hero set `[--ring:0_0%_100%]` so rings show white on blue. There's a "Skip to content" link (first Tab stop) that jumps to `<main id="main">`.
- **Touch targets.** Mobile controls are at least 40px, aiming for 44px. Where a pill has to stay small (store picker, language toggle), an `after:absolute after:-inset-y-1.5` pad stretches the tap area. The clear-search × is a 36px button, not a 16px icon.
- **Buttons.** `components/ui/button.tsx` has real hover states and press feedback (`active:scale-[0.97]`, 150ms ease-out, on transform and color only). It used to reference Replit utilities that don't exist (`hover-elevate`, `active-elevate-2`, `border-primary-border`, `--button-outline`), so buttons had no hover state. Don't pass `transition-colors` or `transition-all` to a `Button`; it overrides the transition list and kills the press animation.
- **Motion.** Press feedback is CSS on the button itself, so `motion.div` wrappers have no `whileTap` (the product card keeps its own and stops the heart's `pointerdown` from reaching it). Entrances start at `scale(0.96–0.97)`, never from nothing, and use the `[0.23, 1, 0.32, 1]` ease-out curve. Staggers cap at 8 items. `<MotionConfig reducedMotion="user">` in `App.tsx` and a `prefers-reduced-motion` block in `index.css` turn movement off for people who ask, and the "Show similar items" scroll jumps instead of gliding for them.
- **Status, not alarm.** Missing aisle data uses a neutral muted panel with a `MapPinOff` icon. Red is only for saved products (the heart).
- **No duplicate navigation.** The header's back arrow shows on every page except Home, so pages don't add their own Back button (the category, store map, Terms and Privacy pages each had a second one).
- **Empty states point somewhere.** The empty Saved page has a "Search products" button; the empty-category state offers categories that have products, with their item counts.
- **Accessible names.** Decorative icons get `aria-hidden="true"`. Search inputs are `type="search"` with an `aria-label`. Toggles use `aria-pressed`, current nav links `aria-current="page"`, and the search result count is `aria-live="polite"`.

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
- All 23 categories have products (9 to 235 each; most subcategories have about 15, average 13.5). The categories and subcategories match foodpanda's own sections for this branch, which is why the 2026-10-29 import mapped onto them almost one to one. The one empty subcategory is Clothing & Accessories > Bags (foodpanda has nothing there). An empty category or subcategory leads to a "No products here yet" state in `search-results.tsx` (`isEmptyCategory`: a category or subcategory filter with no query and no brand). Its shortcut tiles offer only categories that have products.

## Product page
- Image, category badge and brand.
- Location pill (aisle and shelf) with a link to the store map.
- Two columns on desktop.
- Similar products from the same category (matched on `category_en` or `category_zh`).
- If the chosen branch has no location for the product, a neutral panel says so. The "Show similar items with aisle info" button appears only when such items exist; otherwise the panel shows the `noSimilarWithLocation` message.
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
- `terms.tsx` (`/terms`) and `privacy.tsx` (`/privacy`) share a sticky title bar and a prose column (`max-w-2xl`, about 70 characters a line). Their text is in `i18n.ts` (`termsSection1-6Title/Body`, `privacySection1-5Title/Body`, `legalLastUpdated`), and each page calls `usePageMeta`.
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

**2026-10-23 writing pass** (committed as `63dc39c`, deployed): see [Writing style](#writing-style). It also:
- fixed "1 Results" on the search page, which now reads "1 result" / "56 results" (Chinese "56 筆結果"),
- renamed the demo branches to "Taipei (demo store)" and "Kaohsiung (demo store)" (the old names had an em dash),
- made the "Saved" nav item and the page title agree ("Saved products"),
- dropped five unused keys (`section`, `recentSearches`, `howToFind`, `goToAisle`, `metaStoreMapDesc`),
- removed every em dash from `client/src`, `script/` and `index.html` (the shadcn `ui/` files are untouched).

**2026-10-23 design pass** (committed as `9341e68`, deployed: on 2026-10-23 the live bundle `index-D7knjVYp.js` matched the local build, with no console or CSP errors): see [Design rules](#design-rules). A measured audit of every page in light and dark mode at 375px and desktop width found:
- 9 text colors below WCAG AA; there are now none.
- Two `<h1>`s on most pages, and none of their own on Home and Search; there's now exactly one per page.
- Buttons with no hover state, caused by the undefined Replit classes.
- A 1px focus ring, and none at all on the store picker.
- A 16px clear button and 32px heart and header buttons.
- 10px text on the store pill, card badges and bottom-nav labels.
- A cropped product photo on desktop, and ALL-CAPS tracked labels ("LOCATION", "PX SELECT", "HEAD TO AISLE").
- Duplicate Back buttons on four pages.
- In dark mode, a bright blue header with dark text.
- A red error box for missing aisle data.
- An uncapped stagger on the home grid, and no reduced-motion support.

All of these are fixed. Since the change, tsc and the build pass, the console is clean, nothing scrolls sideways at 375px, and keyboard focus is visible on the blue header.

**2026-10-29 fixes**, found while checking the foodpanda products:
- **Category pages scrolled sideways at 320px** when a subcategory name was long ("Taiwanese Instant Noodles Cup & Bowls" made the page 397px wide). The rows are `Button`s, which set `whitespace-nowrap`, and grid items don't shrink below their content. `category-detail.tsx` now gives each grid item `min-w-0` and lets the name wrap (`whitespace-normal`) instead of truncating, so the whole name stays readable. Keep that pattern for any `Button` with variable-length text inside a grid.
- **Two cherry tomato products shared one photo.** `c2` (玉女, Yu Nu 550g) used the same image as `c5` (聖女, Sheng Nu), which shows the larger elongated 聖女 kind; `c2` now uses `Yu Nu Cherry Tomatoes.webp`, like the 300g Yu Nu (`c8`). `Images/Fresh Fruits/Berries & Grapes/Cherry Tomatoes 2.webp` (round tomatoes) is referenced by nothing; it's left for the owner to delete or use.

## Build status
- `npx tsc --noEmit`: 0 errors.
- `npm run build`: no warnings. Main chunk about 1,483 KB (320 KB gzipped), including the product data; the other pages load on demand. The sitemap has 2,154 URLs.
- `npm run dev:client`: serves on port 5000, with zero console errors or warnings across all routes (apart from the dev-only data validation log, which passes).
- `.claude/launch.json` has `px-mart-prod-preview`, which runs `vite preview` on port 5001 and serves `dist/public`. Run `npm run build` first.

## Still to do

### Next steps (agreed 2026-10-23)
Everything up to `9341e68` is committed, pushed and live, and the owner considers the current state finished. These are the open items, in order:
1. ~~**Confirm that a push deploys on its own.**~~ **Done 2026-10-24:** a push to `main` deploys on its own. See [Deployment](#deployment).
2. **Test on a real phone** (iPhone Safari, Android Chrome). Mobile has only been checked in browser emulation at 375px and 320px.
3. **Optional content**, in whatever order the owner picks:
   - ~~Products for the 15 empty categories.~~ **Done 2026-10-29 and 2026-10-30:** 2,070 products from the branch's foodpanda listing, in three passes, at the owner's request (see [Products from foodpanda](#products-from-foodpanda)). Don't invent products unasked; new ones come from the owner or that listing.
   - Aisle data for the demo branches (Taipei 7 products, Kaohsiung none).
   - A drawn floor plan (simple SVG, no new library) for the store map, with the linked aisle highlighted.
4. **Left on purpose:** a brief dark flash of the boot spinner when the OS is dark and the app is set to light. Fixing it needs an inline script, which the CSP (`script-src 'self'`) blocks.

### Data
- 2,126 products. Only the original 56 have aisle data; the 2,070 foodpanda products have an empty `locationsByStore` and show "No aisle info for this branch yet". `validateData.ts` counts these instead of reporting an error.
- Brand names are English in both languages (as they were before), so the Chinese UI shows "Kimlan" next to 金蘭鼓舌醬油. Translating `brand` would need a `brand_zh` field, which is a schema change.
- foodpanda's photos are packshots on white, not cut-outs like the original 35, so in dark mode they sit in a white box. That's left as is.
- Real aisle data for more branches.
- Some photos sit in a folder that no longer matches the product's subcategory; the lemon's photo is in `Images/Fresh Fruits/Apples & Pears/`. The paths still work.

### Products from foodpanda
On 2026-10-29 the owner asked for real product names (Chinese and English) and photos from the branch's foodpanda page, `https://www.foodpanda.com.tw/shop/woiw/quan-lian-fu-li-zhong-xin-wu-feng-min-sheng-dian` (no aisle data or prices). How it was done, so it can be repeated or extended:
- Each category has a page at `.../category/<foodpanda category id>`, with `/en/` before `/shop` for English. The pages are rendered in the browser, so plain `curl` gets no products; they were fetched with Firecrawl (`rawHtml`). Each product card has `data-testid="groceries-product-card-<id>"`, an `<img>` and a name, inside a subcategory block with an `<h2>` heading. Chinese and English were matched by that product id.
- Up to 4 products per subcategory, counting existing ones; Fresh Fruits was skipped (it already had 34). About 43% of foodpanda's "English" names are still Chinese, and some are wrong (an English name for a different product, "AA" for 4號 batteries, which are AAA in Taiwan). The Chinese name is treated as correct, and every English name and brand was written by hand. Products whose English brand name wasn't certain, and near-duplicates, were left out rather than guessed.
- Unbranded fresh, deli and bakery items use the brand "PX Fresh" (as the vegetables already did); unbranded household items use "PX Select".
- Photos were downloaded at `?height=600` into `Images/<category>/<subcategory>/` (the snacks folder is `Snacks_Candies`) and converted with `npm run compress-images`: 535 photos, about 22 MB of JPEG to 13.7 MB of WebP. Filenames are the English name with only letters, digits, spaces, dots and hyphens (`&` becomes `and`); when two products in one folder share an English name, the brand goes in front (`Safeway Ultra-Thin Condoms 12 Pieces.webp`). The live site serves them itself; nothing loads from foodpanda, so the CSP didn't change.
- The Terms of Use (`termsSection1Body`, `termsSection5Body`, both languages) say where the names and photos come from and that they belong to their owners.
- **Checked on 2026-10-29.** Every photo was looked at next to its Chinese and English name on contact sheets. That fixed four brands read off the pack (#271 Hazeline, not Lux; #533 Bourbon "Fettuccine", 北日本 being Bourbon's old name; #545 Valda; #527 Reeva) and removed three products: two near-duplicates of originals (a second Carrots and a second plain Lay's) and #733, whose photo showed a different variant (Bolognese) from its name (起司蘑菇). In the photos where foodpanda's English named another product, the photo matched the Chinese name. Then, on the production build (`vite preview`): all 569 local photos returned 200 as WebP; every subcategory page showed the same count as the data; all 591 product pages had one `<h1>` with the right name and photo at 320px; saving a product, Chinese names and search, the store map and the 404 worked; and no page scrolled sideways at 320px or 375px in either language. No console errors or failed requests.
- **Second pass, same day.** The owner asked for more, and chose a one-time target of about 10 products per subcategory (not all of foodpanda's ~7,900, which would have meant a 4.4 MB bundle, ~210 MB of photos and ~3,600 unchecked translations). It counted existing products, included Fresh Fruits this time, and kept Health & Medical > Sexual Wellness at its 4. 930 candidates were reviewed and 792 kept, then 790 after the photo check, as IDs `738` to `1529`; 790 photos went from 32.7 MB to 20 MB. The photo check fixed five brands read off the pack (葛莉思 is **Greens**; 威滅 is **Combat**; 易口舒 is **Eclipse**; 高頓 is King Car's Gordon, not Knorr's 康寶) and removed two products whose English brand wasn't certain (貝納頌, 益富). Brand rule: 美味大師 products are **Master Chef**, and only products labelled 聖雷蒙 are **San Remo**. Ten subcategories end below 10 because foodpanda has fewer (Frozen Vegetables has 1). Five first-pass photos were renamed with the brand in front because a second-pass product shares their English name. Checked on the production build: all 1,381 product pages (name, photo, one `<h1>`, no sideways scroll at 320px), every subcategory count, search in both languages, saving, the store map and the 404; no console errors or failed requests. **Speed** (CPU slowed 4x, time until content shows, `vite preview`): Home 2.1s before vs 1.8s after (no change), but search pages with many results got slower because every result card renders at once: "milk" 1.7s to 3.2s (43 to 106 results), the Snacks category 1.8s to 3.4s (135 results). Showing results in pages of about 40 with a "Show more" button would bring that back without virtualization; not done yet.
- **Third pass, 2026-10-30.** The owner asked for more again and chose about 15 per subcategory (not 20, which would have needed the data-loading change). The scraped pages from the 29th were gone (scratch folder cleared), so all 46 category pages were fetched again with the same method. New candidates were matched against existing products by normalized Chinese name (exact, or 90% similar within the same subcategory), which removed 1,366 listings already in the app. 832 candidates were reviewed and 570 kept, then a top-up of 236 more for subcategories still short, with 176 kept: 746 photos downloaded and converted, 745 products added (IDs `1530` to `2275`). One product was dropped because foodpanda had deleted its photo (HTTP 404 at every size): TU's soap dish. The photo check fixed three brands and a name: 歐護 is **OFF!**, 天廚's sea salt is **Pacific Salt**, UHA's 酷Q彌 gummies are **Kogumi**; and #2272 became "Ma Bamboo" so it no longer shares an English name with #638 (both 快煮筍絲, different bamboo). Result: 92 of 158 subcategories have 15 or more, 49 have 10 to 14, average 13.5; 17 stay below 10 because foodpanda has fewer (Frozen Vegetables 1, Stationery 2, Preserved Eggs 2). Checked on the production build: every subcategory count, every product page, search in both languages, saving, the store map and the 404 at 320px and 375px. **Speed** (CPU slowed 4x, time until content shows, `vite preview`, median of three, against the committed 1,381-product build): Home 1.7s before and after; "tea" 1.8s to 2.7s (71 to 113 results); "milk" 2.2s to 3.4s (106 to 181); the Snacks category 2.2s to 3.6s (135 to 222). Home is unaffected; large result lists render every card at once, so a "Show more" button is now the most useful next change.

### Bigger ideas
- A drawn floor plan for the store map.
- An API, a database, accounts and an admin page for editing products.
- A real connection to PX Mart systems. Today it's all demo data.

### Deployment
Live site: **https://px-mart-finder.netlify.app/**. `netlify.toml` builds with `npm run build` on Node 22, publishes `dist/public` and sets security headers, including a CSP that allows `images.unsplash.com` as the only remote image host.

**Deployed and checked live on 2026-10-23.** Before that, on 2026-10-15, the live site was still a build from before 2026-09-21, even though `9a0f4a3` had been pushed to GitHub `FullyMed/My_Projects` (a monorepo). Its `netlify.toml` headers weren't applied, so Netlify wasn't building from the repo at all. The owner linked the repo with **base directory `Website/PX_Mart_Finder`** and redeployed.

**A push to `main` deploys on its own (confirmed 2026-10-24).** The current production deploy (`6adc3579e8fbab15211baaa0`) was built from commit `dd29280` on `main`, came from GitHub with `manual_deploy: false`, and started 43 seconds after the commit. That commit only changed `CLAUDE.md`, so any push to the monorepo's `main` triggers a build, not only pushes that touch this project. Netlify skipped the upload because the files matched the previous deploy ("All files already uploaded"), and the live bundle stayed `index-D7knjVYp.js`. So after a push, wait about a minute, then run the curl checks below. Don't click deploy by hand. To see deploys: Netlify, then the `px-mart-finder` site, then **Deploys**.

The 2026-10-23 check:
- The served bundle `index-Dy2SAV7u.js` matched the local build.
- All five security headers from `netlify.toml` were present (CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`).
- `robots.txt`, `sitemap.xml` (`application/xml`, 84 URLs) and the fixed manifest were served, and deep links returned 200.
- In the browser, under the real CSP: Rubik loaded, all 56 product images loaded (21 from Unsplash), sort by name worked through the UI, 香蕉 found only the banana, empty categories said "Coming soon", and the store map showed the linked aisle.
- Unknown IDs showed the 404, nothing scrolled sideways at 375px, and the console had **no errors or CSP violations**.

To check a deploy: `curl -s https://px-mart-finder.netlify.app/ | grep -c app-boot-loader` should print a number above 0 (the id appears in the CSS and in the div), `curl -sI` should show `Content-Security-Policy`, and the `assets/index-*.js` name in the live HTML should match `dist/public` after `npm run build`. The CSP exists only on Netlify, so check anything that loads a new remote resource (fonts, images, scripts) on the live site.

### SEO
- `client/public/robots.txt` allows everything and has a `Sitemap:` line.
- `sitemap.xml` is **generated, not committed**. `writeSitemap` in `script/sitemap.ts` runs inside `script/build.ts` after the Vite build and writes `dist/public/sitemap.xml` from `products.json` and `categories.json`: 5 static routes, every `/category/<id>` and every `/product/<id>` (2,154 URLs as of 2026-10-30). It can't drift from the data. If the domain changes, update `SITE_URL` there, the `Sitemap:` line in `robots.txt`, and the absolute `og:image` / `twitter:image` in `index.html`. `/favorites` is left out on purpose, since it's per-device localStorage and always empty for a crawler. `npx vite build` alone skips the sitemap, so use `npm run build`.
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
- **Follow the [writing style](#writing-style)** for any new text, and the [design rules](#design-rules) for any new UI.

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
