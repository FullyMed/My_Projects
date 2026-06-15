# My Projects

Personal portfolio of software projects across mobile apps, data science, and web development.

---

## App

### [Taiwan Fare Finder](App/Taiwan_Fare_Finder/)
**Cross-platform Flutter app** for searching and comparing public transportation fares across Taiwan.

- Supports HSR, TRA, MRT, Bus, and YouBike via real-time TDX API data
- Offline LRU cache (up to 100 queries via `shared_preferences`)
- Multilingual: English, Traditional Chinese, Simplified Chinese, Indonesian
- Responsive layout: phone → tablet → desktop (bottom nav → nav rail → extended nav rail)
- Fare comparison across modes, passenger tiers, saved routes, search history

**Stack:** Flutter / Dart, TDX API, Provider, go_router, Google Fonts

---

## Data Science

### [BoardGames Analyzer](Data_Science/BoardGames_Analyzer/)
**Explainable hybrid board game recommendation system** — undergraduate Data Science / Recommender Systems research project.

- Three recommendation modes: Title-Based, Trait-Based, Combined
- Signals: TF-IDF + MiniLM embeddings + DistilBERT sentiment + popularity
- Best performance — Recall@10: 0.2033, NDCG@10: 0.1377 (Title-Based)
- Interactive Streamlit app with analytics dashboard and light/dark theme
- IEEE-format research paper included

**Stack:** Python, Streamlit, scikit-learn, sentence-transformers, HuggingFace Transformers, pandas

### [Future Analyzer](Data_Science/Future_Analyzer/)
Early-stage data science project. Currently in planning/setup (notebooks and dataset folders only).

---

## Website

### [JourneySet](Website/JourneySet/)
**Personal productivity planner** web app with Supabase backend.

- Weekly task planner (with recurring task support), goal tracker, event calendar
- Time-conflict detection, export/print views, dark/light mode, compact sidebar
- Offline-resilient: all reads fall back to localStorage cache when Supabase is unreachable

**Stack:** React 18, TypeScript, Vite, Tailwind CSS, Supabase (PostgreSQL + Auth + RLS), react-router-dom v7

### [Prambanan Batik](Website/Prambanan_Batik/)
**Product catalog and review system** for authentic Indonesian batik.

- Browse and filter products by category; customer reviews with star ratings
- Admin panel: manage products, categories, reviews, images, and admins
- CSV bulk import, SEO sitemap/robots.txt, outbound click tracking
- Brute-force login protection (5 attempts / 15 min lockout), preview mode when DB is down

**Stack:** PHP 7.4+, MySQL 8, PDO, Vanilla HTML/CSS/JS, Apache/Nginx

### [PX Mart Finder](Website/PX_Mart_Finder/)
**Retail product discovery prototype** for PX Mart (全聯福利中心) stores in Taiwan.

- Fuzzy search with synonym expansion (Fuse.js), aisle and shelf location per product
- Category browsing, favorites, sorting, store selection
- Full responsive layout (mobile → tablet → desktop), dark mode, Traditional Chinese + English
- Single-branch proof-of-concept: PX Mart Wufeng (Taichung)

**Stack:** React, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, Fuse.js, Framer Motion, wouter

### [Three Frogs](Website/Three%20Frogs/)
**Website for a boardgame café** in Surabaya, Indonesia — live at [threefrogsboardgame.com](https://threefrogsboardgame.com).

- Browse ~218 board games, create an account, book table time
- Token-based forgot-password flow (1-hour expiry), booking cancellation limits (2/month)
- Booking hours enforced client- and server-side (12:00–22:00)
- No build step — plain HTML/CSS/JS + PHP endpoints

**Stack:** Vanilla HTML, CSS, JavaScript, jQuery, PHP 8, MySQL, Hostinger shared hosting
