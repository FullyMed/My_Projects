# CLAUDE.md

# BoardGames Analyzer — CLAUDE.md

## 1. Project Overview

### Project Name
BoardGames Analyzer

### Project Type
Applied Data Science / Recommender Systems Research Project

### Core Purpose
BoardGames Analyzer is an explainable hybrid board game recommendation system designed to help users discover board games using multiple recommendation approaches:

- Title-based recommendation
- Trait-based recommendation
- Combined guided discovery recommendation

The project emphasizes:
- Explainability
- Lightweight recommendation architecture
- Discovery-oriented recommendation
- Interpretable recommendation signals
- Practical usability over state-of-the-art complexity

The system integrates content similarity, gameplay trait overlap, sentiment analysis, and popularity signals — not collaborative filtering or deep personalization.

### Research Goal
The project functions as:
- A strong undergraduate applied ML/Data Science project
- A recommender systems portfolio project
- A conference-style student research paper (IEEE format)
- An explainable recommendation framework study

### Research Positioning
This project is NOT intended to:
- Compete with industrial-scale recommender systems
- Replicate Netflix/Steam recommendation infrastructure
- Serve as a deep learning recommendation benchmark

Instead, it focuses on:
- Explainable recommendation
- Multi-mode discovery
- Lightweight hybrid recommendation
- Transparent methodology
- Practical usability

### Target Audience
- Board game enthusiasts and casual hobby users
- Data Science / ML portfolio reviewers
- Academic evaluators and undergraduate research supervisors

---

# 2. Tech Stack

## Programming Languages
- Python
- Markdown
- LaTeX

## Core Libraries

### Data Processing
- pandas, numpy

### Recommendation / NLP
- scikit-learn, sentence-transformers, transformers, torch

### Similarity & Embeddings
- TF-IDF Vectorizer, Cosine Similarity, MiniLM sentence-transformer embeddings

### Sentiment Analysis
- HuggingFace Transformers — DistilBERT SST-2 sentiment model

### Visualization
- matplotlib, seaborn

### App Framework
- Streamlit 1.52.2

### Notebook Environment
- Jupyter Notebook

---

# 3. Project Structure

## Actual On-Disk Structure

```
BoardGames_Analyzer/
│
├── App/                            ← Multi-page Streamlit app (MAIN APP)
│   ├── app.py                      ← Home / landing page (the sidebar labels it "app"; see "Deployment" in Section 4)
│   ├── recommender.py              ← Self-contained copy of the engine
│   ├── theme.py                    ← Shared CSS (light/dark) + chart color helpers
│   ├── requirements.txt            ← Minimal deps for Streamlit Cloud deployment
│   └── pages/
│       ├── 1_Recommendation.py     ← Recommendation engine UI
│       ├── 2_Analytics.py         ← EDA / analytics dashboard
│       ├── 3_Not_Found.py         ← Themed "Not Found" page (see Section 3, App/theme.py)
│       ├── 4_Terms_of_Use.py      ← Terms of Use page
│       └── 5_Privacy_Policy.py    ← Privacy Policy page
│
├── Notebooks/
│   ├── 01_Data_Inspection.ipynb
│   ├── 02_Preprocessing.ipynb
│   ├── 02b_sentiment_full_coverage.py   ← Current sentiment pipeline (replaces NB02's 20-game pilot)
│   ├── 03_EDA.ipynb
│   ├── 04_Modeling_CF.ipynb
│   ├── 05_Modeling_Content_NLP.ipynb
│   ├── 05b_embeddings_full_coverage.py  ← Current MiniLM embedding matrix (replaces NB05's 20-game one)
│   ├── 06_Hybrid_Model.ipynb
│   ├── 07_Evaluation_Metrics.ipynb      ← Superseded by 09 (kept as a record; see its top cell)
│   ├── 08_Discovery_Engine.ipynb
│   └── 09_Evaluation.ipynb              ← Evaluates the deployed App/recommender.py (source of all reported numbers)
│
├── Dataset/
│   ├── Raw/
│   │   ├── games_detailed_info.csv ← Primary game metadata (21,631 games)
│   │   ├── games.csv
│   │   ├── 2020-08-19.csv / 2022-01-08.csv
│   │   ├── large_bgg-26m-reviews.csv
│   │   ├── large_user_ratings.csv
│   │   ├── mechanics.csv / subcategories.csv / themes.csv
│   │   └── ...
│   └── Processed/
│       ├── desc_topk_csr.joblib    ← TF-IDF description similarity (sparse CSR)
│       ├── content_topk_csr.joblib ← Combined content similarity (sparse CSR)
│       ├── emb_topk_csr.joblib     ← MiniLM name+description embedding similarity (sparse CSR, from 05b)
│       ├── sentiment_summary.csv   ← Per-game mean P(positive) review sentiment (from 02b)
│       ├── sentiment_review_sample.parquet / sentiment_review_scored.parquet ← 02b working files (gitignored)
│       ├── game_description_embeddings.npy ← 05b embedding cache (gitignored)
│       ├── merged_clean_sample.csv
│       └── ...
│
├── Reports/
│   ├── paper.tex                   ← IEEE research paper (main document)
│   ├── references.bib
│   ├── paper.pdf                   ← Compiled output
│   ├── eval_metrics_results.csv    ← Legacy NB07 output (pre-NDCG-fix; not used anywhere)
│   ├── notebook09_summary_metrics.csv ← paper Table II numbers (3 modes + 2 baselines + sentiment ablation); long-tail Table III is notebook09_longtail_metrics.csv
│   ├── notebook09_user_level_results.csv
│   └── images/
│       ├── architecture.png
│       └── performance_chart.png
│
├── app.py                          ← Original single-page Streamlit app (root)
├── recommender.py                  ← Synced copy of engine (kept in sync with App/recommender.py)
├── Requirements.txt
├── Run.txt
└── README.md
```

---

## Important Files

### `App/app.py`
Home / landing page of the multi-page Streamlit app. Streamlit's `pages/` convention labels the main page after its filename, so the sidebar shows "app". Renaming it (e.g. to `Home.py`) was considered on 2026-10-01 and declined: see "Deployment" in Section 4.

Displays:
- Project title and description
- Navigation cards to Recommendation and Analytics pages
- Key project stats (21K+ games, 18.7M ratings, 3 modes, 21.5K games with review sentiment). The fourth box used to show "20.3% Recall@10 (Title Mode)"; that number came from the 20-game data bug (Bugs 14–15) and was replaced on 2026-10-01
- "How It Works" explainer for the three hybrid signals

### `App/theme.py`
Shared design system for all pages.

Contains:
- `_BASE_CSS` — responsive layout CSS with breakpoints for mobile (≤640px), tablet (641–1024px), desktop (≥1025px)
- `_DARK_CSS` — dark theme colour definitions
- `_LIGHT_CSS` — light theme (indigo/lavender background gradient, gradient text titles, indigo accent borders on cards)
- Both theme blocks **pin every colour Streamlit would otherwise take from its own base theme** (alerts, widget labels, captions, links, metric values, slider ticks, sidebar icons). Streamlit's base theme follows the visitor's OS light/dark setting, not this app's toggle, so anything left unpinned becomes unreadable in the mismatched combination (see Bug 13). If you add a new native widget, check it in both themes with the OS in both modes.
- Result cards are `st.container(key="result_card_N")`, styled via `[class*="st-key-result_card_"]` alongside `.result-card` — a `st.markdown('<div class="result-card">')` / `st.markdown('</div>')` pair can't wrap widgets (see Bug 11)
- `sidebar_theme()` — renders the theme toggle and returns selected mode
- `apply_theme(mode)` — injects both base + theme CSS
- `chart_colors(mode)` — returns a matplotlib colour palette dict
- `style_ax(ax, fig, colors, title)` — applies consistent chart styling
- `render_not_found(title, message, icon, show_links)` — themed "not found" card (see Section 6, "Custom 404 / Not Found"). Escapes `title`/`message` and collapses whitespace, because the 404 page feeds it the user-controllable `?reason=` query param (see Bug 12)
- `set_meta_description(description)` — injects `<meta name="description">` into the real document head per page (see Section 6, "Per-Page Meta Title / Description")

### `App/recommender.py`
Self-contained copy of the core `BoardGameDiscoveryEngine` class.

Key design decisions:
- Instantiated with `base_path=str(PROJECT_ROOT)` so it resolves Dataset/ correctly regardless of working directory
- Loaded once via `@st.cache_resource` in the recommendation page
- `difficulty_label` is handled as a **post-processing filter** via `_apply_difficulty_filter()` — NOT as part of `has_trait` detection (see Bug Fixes section below)

### `App/pages/1_Recommendation.py`
Full recommendation UI page.

Features:
- Three modes: Title-Based, Trait-Based, Combined
- Sidebar: theme, mode, top-N slider, difficulty filter
- "Try Example" button pre-fills Splendor/Azul query
- System Interpretation section shows which catalog game each typed title matched ("catan → Catan") plus expanded categories/mechanics; a warning lists any title that matched nothing
- Input placeholders are real BGG values that return results (families are "Group: Name" strings such as `Components: Miniatures`; the publisher is `CMON Global Limited`, not `CMON`)
- Full results dataframe + top-5 styled result cards with "Why recommended" reasons

### `App/pages/2_Analytics.py`
EDA / analytics dashboard page.

Six chart sections:
1. Overview metrics (total games, avg rating, avg complexity, filtered count)
2. Rating distribution + Complexity distribution (histograms)
3. Top N highest-rated games (horizontal bar, min-vote threshold)
4. Top N most-rated games (horizontal bar, by `usersrated`)
5. Top N mechanics + categories (side by side)
6. Games published per year (line chart with area fill)
7. Community sentiment distribution (if sentiment data exists) — mean P(positive) per game from `02b_sentiment_full_coverage.py`, with a caption explaining the sampling

All charts use `width='stretch'` and are responsive to the container width.

### `App/pages/3_Not_Found.py`
Standalone, themed "404 / Not Found" page. Appears in the sidebar nav like any other page (Streamlit's `pages/` convention auto-lists every file there — it cannot be hidden without switching the whole app off the `pages/` convention onto `st.navigation`, which this project intentionally does not do; see "Custom 404 / Not Found" in Section 6). Reads an optional `?reason=` query param to customize its message, and renders `theme.render_not_found(..., show_links=True)` with `st.page_link` buttons back to Home / Recommendation / Analytics.

### `App/pages/4_Terms_of_Use.py` / `App/pages/5_Privacy_Policy.py`
Static legal pages, styled with the existing `.section-title` / `.info-box` theme classes (no new CSS). Content is deliberately scoped to what's actually true for this project — see "Legal Pages" in Section 6 below for why, and for what must be kept in sync if the app's data handling ever changes.

### `Notebooks/08_Discovery_Engine.ipynb`
Main recommendation system notebook.

### `Notebooks/09_Evaluation.ipynb`
Evaluation notebook with Recall@K and NDCG@K results. Since 2026-10-01 it **imports `App/recommender.py`** instead of carrying its own copy of the engine, so the numbers describe the deployed app. Also evaluates a popularity baseline, a content-only baseline and a no-sentiment ablation, saves the CSVs in `Reports/`, prints the verbatim case-study explanations used in the paper's Table I, and regenerates `Reports/images/performance_chart.png` from the computed numbers.

### `Notebooks/02b_sentiment_full_coverage.py` / `Notebooks/05b_embeddings_full_coverage.py`
Standalone, resumable scripts (run from the project root with the venv's python) that rebuild `sentiment_summary.csv` and `emb_topk_csr.joblib`. They exist because Notebooks 02 and 05 built both signals from a 500,000-row slice of the reviews file that covered only 20 games (see Bugs 14 and 15). The docstring at the top of each explains the method.

### `Reports/paper.tex`
Main IEEE research paper.

### `app.py` / `recommender.py` (project root)
Original single-page Streamlit app — kept for reference. Run with `streamlit run app.py`.

---

# 4. How to Run

```bash
# Activate virtual environment (Windows)
.\.venv\Scripts\activate

# Run the full multi-page App (recommended)
streamlit run App/app.py

# Run the original single-page app (root)
streamlit run app.py

# Rebuild the review-sentiment signal (~1.5 h on CPU; resumable)
.venv\Scripts\python.exe Notebooks\02b_sentiment_full_coverage.py

# Rebuild the MiniLM embedding similarity (~20 min on CPU)
.venv\Scripts\python.exe Notebooks\05b_embeddings_full_coverage.py

# Re-run the evaluation (~30 min; writes Reports/notebook09_*.csv + performance_chart.png)
cd Notebooks
..\.venv\Scripts\jupyter.exe nbconvert --to notebook --execute --inplace --ExecutePreprocessor.timeout=-1 09_Evaluation.ipynb

# Recompile the paper (MiKTeX)
cd Reports
latexmk -pdf paper.tex
```

In Claude Code's desktop app, the `boardgames-analyzer` entry in `.claude/launch.json` starts the App on port 8501.

## Deployment (Streamlit Community Cloud)
The live app's entrypoint is `Data_Science/BoardGames_Analyzer/App/app.py` in the `FullyMed/My_Projects` repo. **Community Cloud cannot change an existing app's entrypoint path**: it identifies an app by repo + branch + entrypoint, so renaming or moving `App/app.py` and pushing leaves the live app broken and "view-only". The documented procedure is delete the app → push the change → redeploy, and the docs don't guarantee the same `*.streamlit.app` URL. That's why the sidebar's "app" label was kept (2026-10-01). Dependencies come from `App/requirements.txt`. The deployed data files are the git-tracked ones: `games_detailed_info.csv`, the three `*_topk_csr.joblib` matrices and `sentiment_summary.csv`.

---

# 5. Coding Style & Conventions

## General Philosophy
Prioritize:
- Readability and explainability
- Reproducibility and modularity
- Simplicity over unnecessary sophistication

Avoid overengineering.

## Naming Conventions

### Variables — descriptive snake_case
```
GOOD: content_similarity_score, trait_overlap_score, recommended_games
BAD:  x, temp1, data123
```

### Functions — verb-oriented snake_case
```
GOOD: calculate_similarity(), generate_recommendations(), compute_trait_overlap()
```

### File Names — lowercase with underscores
```
GOOD: recommender.py, evaluation_utils.py
```

## Python Formatting
- 4 spaces indentation
- PEP8-compliant
- Keep functions reasonably short
- Avoid deeply nested logic

## Comment Style
Explain WHY, not obvious WHAT.
```
GOOD: # Normalize popularity scores to prevent dominance
BAD:  # Add popularity score
```

---

# 6. Key Features

## Recommendation Modes

### 1. Title-Based
- Recall@10 0.0233, NDCG@10 0.0174 (see Section 7 for why this is far below the old 0.20)
- Uses TF-IDF description + mechanic/theme attribute similarity (averaged into `text_sim`) and MiniLM name+description embedding similarity
- Seed game → similarity scored against all 21K+ games, then the same-series cap
- Hybrid signal: `0.35 * text_sim + 0.35 * emb_sim + 0.10 * sentiment + 0.20 * popularity`

### 2. Trait-Based
- Exploratory mode (Recall@10 0.0200, NDCG@10 0.0171)
- Uses category, mechanic, family, publisher overlap scoring: `0.40 cat + 0.35 mech + 0.15 fam + 0.10 pub`, then `0.70 * score_trait + 0.15 * rating + 0.10 * log-votes + 0.05 * sentiment`
- Trait expansion: e.g. "strategy" → expands to ["economic", "puzzle", "tile placement", ...]
- Designed for exploratory discovery, not ranking

### 3. Combined
- Guided discovery; best of the three modes on every metric (Recall@10 0.0367, NDCG@10 0.0235)
- Outer-joins title similarity with trait filtering
- Final score: `0.65 * score_like + 0.35 * score_trait + 0.08 * rating + 0.04 * votes + 0.03 * sentiment`

## Difficulty Filter
- Three levels: low (complexity ≤ 2.0), medium (2.0–3.0), high (> 3.0)
- Applied as a **post-processing step** in `_apply_difficulty_filter()` on ALL three paths
- Works correctly in Title-Based mode (see Bug Fixes section)

## Same-Series Cap (added 2026-10-01)
- Once the embedding matrix covered every game, pure similarity put a seed's own editions/expansions first (Ticket to Ride → six Ticket to Ride boxes; an Unlock! seed → six Unlock! boxes)
- `_cap_same_series()` keeps at most `MAX_PER_SEED_SERIES = 2` results per BGG series tag that a **seed** has. Series tags are `boardgamefamily` values starting with `Game:` (one game line, e.g. `Game: Catan`) or `Series:` (a publisher line, e.g. `Series: Unlock! (Space Cowboys)`); `Game:` alone would miss Unlock!
- Applied after ranking, before `head(top_n)`, on the two seeded paths (title-only, combined). The title candidate pool is `max(top_n * 10, 200)` so the cap can't starve the list
- Explainable: title mode now fills `matched_families` with the shared series tags, so the reason reads e.g. "Families: Game: Ticket to Ride (Official)"
- Like the difficulty filter, this is a post-ranking rule, not a score term. Keep it that way, and keep it inside `discover()` so Notebook 09 evaluates it

## Responsive Design
The App/ Streamlit app supports:
- iOS / Android (≤640px): all columns stack vertically, reduced font sizes, 44px minimum touch targets, 16px input font to prevent iOS auto-zoom
- iPad / tablet (641–1024px): 2-column layouts maintained, reduced padding
- Laptop / Desktop (≥1025px): full layout

## Light / Dark Theme
- Dark: navy gradient background, glass-effect cards
- Light: indigo-lavender gradient page background (so white cards stand out), gradient text on titles and stat numbers, indigo left-border accent on section titles and result cards

## Custom 404 / Not Found
Streamlit's `pages/`-folder multi-page routing has a hard constraint: visiting an unrecognized URL always triggers Streamlit's own built-in banner ("Page not found. ... Running the app's main page.") before falling back to the Home page — this is generated by Streamlit's router itself, before any app code runs, and there is no public API (as of Streamlit 1.52) to intercept or replace it for arbitrary unknown URLs without abandoning the `pages/` convention for `st.navigation` + manual routing (a much larger architecture change this project deliberately avoids, per "Prioritize Simplicity").

Given that constraint, the app instead ships a **themed "Not Found" experience for in-app bad states**, not a router-level interceptor:
- `theme.render_not_found(title, message, icon, show_links)` — a reusable themed card component (styled like `.result-card`), optionally with `st.page_link` buttons back to Home/Recommendation/Analytics
- `App/pages/3_Not_Found.py` — a real, standalone page using that component in full-page form (reachable from the sidebar nav like any other page)
- `App/pages/1_Recommendation.py` — the zero-results empty state uses the same component inline instead of a plain `st.info()`

## Per-Page Meta Title / Description
Each of the 4 pages (`App/app.py`, `pages/1_Recommendation.py`, `pages/2_Analytics.py`, `pages/3_Not_Found.py`) sets:
- **Meta title** — via `st.set_page_config(page_title=...)`, Streamlit's native, fully-supported way to set the real `<title>` tag. Already distinct per page.
- **Meta description** — via `theme.set_meta_description(text)`, called immediately after `st.set_page_config` on every page. Streamlit has **no public API** for `<meta name="description">`, so this injects it into the real top-level document head using a zero-size `st.components.v1.html` iframe with a script that reaches `window.parent.document` (same-origin, so this works) — a standard, verified workaround. **Verified in-browser**: `document.title` and `document.querySelector('meta[name="description"]').content` were checked on the real top-level document for all 4 pages and update correctly per page.

If a new page is added, it must call both `st.set_page_config(page_title=...)` and `theme.set_meta_description(...)` right after it, with distinct, page-specific text for each.

## Loading States
Streamlit's default "running" indicator (top-right spinner icon) is easy to miss, so slow operations show an explicit, custom-worded spinner instead of relying on it:
- `App/pages/1_Recommendation.py`: `load_engine()` (`@st.cache_resource`) uses `show_spinner="Loading recommendation engine..."` for the cold-start load of the CSR similarity matrices + metadata; each of the three `engine.discover()` + `format_results()` call sites (Title-Based, Trait-Based, Combined) is wrapped in `with st.spinner("Finding recommendations..."):`
- `App/pages/2_Analytics.py`: `load_games()` and `load_sentiment()` (`@st.cache_data`) use `show_spinner="Loading game dataset..."` / `"Loading sentiment data..."`

**Verified in-browser**: screenshotted the app mid-load and caught both the "Loading recommendation engine..." spinner (cold start) and the "Finding recommendations..." spinner (on Get Recommendations click) rendering correctly, with results still rendering normally afterward.

Root `app.py` (legacy single-page reference app) was **not** touched — it has no `App/`-style UI parity requirement (only `recommender.py` must stay synced, per Section 10), so it was left out of scope for this pass.

If a new slow operation (cached loader, heavy compute) is added, give it an explicit `show_spinner="..."` or wrap it in `st.spinner("...")` with page-specific wording rather than relying on Streamlit's default indicator.

## Legal Pages
`App/pages/4_Terms_of_Use.py` and `App/pages/5_Privacy_Policy.py` are real, public-facing pages (indexed by search engines via their own meta title/description, like every other page — see "Per-Page Meta Title / Description" above). Their content was written to be **factually accurate for what this app actually does**, not generic boilerplate:
- No account creation, login, or persisted personal data — confirmed by reading the actual code (no database, no forms that write anywhere; text inputs on the Recommendation page live only in `st.session_state` for that browser session)
- No fabricated legal claims — e.g. no specific open-source license is asserted (none is published in this repo), no compliance certifications, no invented contact email or entity name
- Both explicitly disclaim BGG affiliation and note recommendations are algorithmic, not advice
- Both link to the actual public GitHub repo (`github.com/FullyMed/My_Projects`) as the contact method, since no other public contact channel exists
- Both are linked from the Home page footer (`st.page_link`) and cross-link each other

**If the app's actual data handling changes** (e.g. a database, user accounts, or third-party analytics/cookies are added), both pages **must** be updated to match — the whole point is that they stay true to the code, not that they sound reassuring.

---

# 7. Evaluation Results

Source: `Notebooks/09_Evaluation.ipynb` (evaluates the deployed `App/recommender.py`), saved to `Reports/notebook09_summary_metrics.csv`. Re-run 2026-10-01 after Bugs 14–16 and the same-series cap.

| Model | Recall@5 | NDCG@5 | Recall@10 | NDCG@10 | Recall@20 | NDCG@20 |
|---|---|---|---|---|---|---|
| Title-Based | 0.0133 | 0.0128 | 0.0233 | 0.0174 | 0.0411 | 0.0236 |
| Trait-Based | 0.0133 | 0.0140 | 0.0200 | 0.0171 | 0.0444 | 0.0256 |
| Combined | 0.0222 | 0.0168 | 0.0367 | 0.0235 | 0.0556 | 0.0302 |
| Popularity baseline | 0.1400 | 0.1190 | 0.2300 | 0.1595 | 0.3622 | 0.2068 |
| Content-only baseline | 0.0111 | 0.0095 | 0.0122 | 0.0100 | 0.0167 | 0.0116 |
| Title-Based, no sentiment | 0.0133 | 0.0128 | 0.0244 | 0.0178 | 0.0367 | 0.0222 |

**Long-tail analysis** (`Reports/notebook09_longtail_metrics.csv`): the same lists, scored only on held-out games outside the 100 most-rated catalog games (155 of 300 users have one; the cut-off was fixed before looking at results).

| Model | Recall@10 | NDCG@10 | Recall@20 | NDCG@20 |
|---|---|---|---|---|
| Title-Based | 0.0151 | 0.0092 | 0.0258 | 0.0124 |
| Trait-Based | 0.0183 | 0.0093 | 0.0344 | 0.0141 |
| Combined | 0.0215 | 0.0110 | 0.0398 | 0.0166 |
| Popularity baseline | 0.0000 | 0.0000 | 0.0000 | 0.0000 |
| Content-only baseline | 0.0151 | 0.0100 | 0.0215 | 0.0122 |
| Title-Based, no sentiment | 0.0151 | 0.0091 | 0.0280 | 0.0129 |

**Protocol (accurate description):** ratings from `large_user_ratings.csv` on catalog games (18,744,924); 259,737 users have ≥ 6 rated games; the **first 300** in `groupby` order are evaluated; each user's first 3 ratings **in file order** are seeds and the next 3 are held out; any rated game counts as relevant. The file is grouped by game, most-rated first, so 63.0% of held-out games are top-100 most-rated games. That's why the popularity baseline dominates.

**Why the old numbers (Title Recall@10 0.2033) are gone:** they came from the 20-game embedding/sentiment bug. Those 20 blockbusters recommended each other for every seed, which matched this popularity-skewed protocol. Don't quote 0.20 anywhere.

**Content-only and the no-sentiment ablation** use `title_variant()` in NB09, which applies the same series cap and pool depth as `discover()` (verified to reproduce the deployed title mode exactly when given the deployed weights), so they differ from Title-Based only in their weights.

---

# 8. Current Progress

## Completed

### Data Pipeline
- EDA, preprocessing, and filtering pipeline all complete

### Recommendation Engine
- Title-based, trait-based, and combined modes all complete
- Difficulty filter works correctly across all three modes

### Evaluation
- Recall@K and NDCG@K evaluation of the deployed engine, with popularity / content-only baselines, a no-sentiment ablation and a long-tail analysis (2026-10-01)
- Holdout-based evaluation implemented

### Research Paper
- IEEE paper structure complete
- 2026-10-01: methodology rewritten to match the code (per-mode formulas, real feature construction, sentiment sampling, post-ranking rules, accurate protocol); results, discussion and conclusion rewritten around the new numbers (popularity baseline wins the main protocol); Table II now shows verbatim system output; PDF recompiled

### App
- Multi-page Streamlit app (`App/`) complete with Home, Recommendation, and Analytics pages
- Light/dark theme with full responsive design
- All major bugs fixed (see Bug Fixes section)
- Deployed live on Streamlit Community Cloud

---

## Known Paper vs. Code Inconsistencies — Resolved 2026-10-01

All three earlier inconsistencies are fixed in `Reports/paper.tex`:
1. **Weight mismatch**: the single `w1..w4` formula was replaced by the real per-mode formulas (title, trait, combined).
2. **Missing baseline results**: the results table (now Table II) has popularity and content-only baselines plus a no-sentiment ablation, and a long-tail table was added.
3. **Hand-written explainability example**: the explanation table (now Table I) reproduces the system's verbatim explanations (publisher lists abbreviated with "…").

The rewrite also fixed claims the code never supported: a "random holdout" of "positively rated" games, player count/complexity as traits, "no normalisation needed", and explanations mentioning sentiment/popularity. **Rule:** if the engine, the data or the protocol changes, update the paper in the same pass and re-run NB09.

---

## Explicitly NOT Planned
- Full collaborative filtering architecture
- Industrial-scale personalization
- GNN recommendation systems
- Large-scale neural ranking pipelines

---

# 9. Bug Fixes Applied

## Bug 1 — Difficulty filter silently ignored in Title-Based mode (`App/recommender.py`)
**What was wrong:** `has_trait` included `difficulty_label is not None`. When Title-Based mode was used with a difficulty filter and no trait terms, `build_type_candidates` was called with no categories/mechanics, produced all-zero trait scores, then the `score_trait > 0` guard emptied `trait_df`. The outer merge returned title results with no difficulty filtering applied.

**Fix:** Removed `difficulty_label is not None` from `has_trait`. Added `_apply_difficulty_filter()` method that is called as a post-processing step at the end of all three return paths in `discover()`.

## Bug 2 — Crash on empty filtered dataset in Analytics page (`App/pages/2_Analytics.py`)
**What was wrong:** `_rating_hbar` guarded `x_pad` with `if len(ratings) > 0` but the next line called `ratings.min()` and `ratings.max()` unconditionally on a numpy array. When `df_rated` was empty (min_votes slider set too high), numpy raised `ValueError: zero-size array to reduction operation`.

**Fix:** Added an early-return guard at the top of `_rating_hbar`. If `ratings` is empty, displays an `st.info()` message and returns before any matplotlib calls.

## Bug 3 — Fragile `"formatted" in locals()` pattern (`App/pages/1_Recommendation.py`)
**What was wrong:** At module level in Python, `locals()` equals `globals()`. The `"formatted" in locals()` check could find a stale `formatted` value from a previous execution context.

**Fix:** Initialized `formatted = None` at the top of the `if run_btn:` block. Replaced both `"formatted" in locals()` guards with `formatted is not None`.

## Bug 4 — Dataframe height too small for few results (`App/pages/1_Recommendation.py`)
**What was wrong:** `height = min(400, 40 + 35 * len(formatted))` gave 75px for a 1-row result — too small to read.

**Fix:** `height = min(400, max(120, 40 + 35 * len(formatted)))` — enforces a 120px floor.

## Bug 5 — Root `recommender.py` out of sync with `App/recommender.py`
**What was wrong:** The root `recommender.py` still had `difficulty_label is not None` inside `has_trait` (Bug 1) and was missing the `_apply_difficulty_filter()` method entirely — 18 lines behind the fixed App copy.

**Fix:** Replaced root `recommender.py` with the canonical `App/recommender.py`. Both files are now identical. The rule in Section 10 (Keep App/ Self-Contained) still applies going forward.

## Bug 6 — Deprecated `use_container_width` parameter across all app files
**What was wrong:** Streamlit 1.52 deprecated `use_container_width=True` in favour of `width='stretch'`, with removal set for after 2025-12-31. All 9 call sites across `App/pages/1_Recommendation.py`, `App/pages/2_Analytics.py`, and root `app.py` used the old parameter.

**Fix:** Replaced all `use_container_width=True` with `width='stretch'` across all three files.

## Bug 7 — `scipy` missing from `App/requirements.txt`
**What was wrong:** `App/requirements.txt` only listed 5 packages and omitted `scipy`. The recommender loads scipy sparse CSR matrices via `joblib.load()` and calls `.getrow()` on them — requiring scipy at runtime. On Streamlit Cloud, scipy was only available as a transitive dependency of scikit-learn, making the deployment fragile and liable to break on future scikit-learn version changes.

**Fix:** Added `scipy` to `App/requirements.txt`.

## Bug 8 — Fragile `"formatted" in locals()` pattern in root `app.py`
**What was wrong:** The same Bug 3 pattern (`"formatted" in locals()`) remained in root `app.py` (lines 457 and 510) and was never updated when Bug 3 was fixed in `App/pages/1_Recommendation.py`.

**Fix:** Added `formatted = None` initialization at the top of the `if run_btn:` block. Replaced both `"formatted" in locals()` guards with `formatted is not None`.

## Bug 9 — Trait-only path in `discover()` missing `_apply_difficulty_filter()` post-processing call
**What was wrong:** The title-only and combined return paths in `discover()` both called `_apply_difficulty_filter()` as a post-processing step, but the trait-only path did not — difficulty filtering only happened inside `build_type_candidates()`, making the architecture inconsistent with the documented design.

**Fix:** Added `out = self._apply_difficulty_filter(out, difficulty_label)` before the `return` in the trait-only path in both `App/recommender.py` and root `recommender.py`. The call is safe (no double-filtering side effects) because `_apply_difficulty_filter()` returns the dataframe unchanged when `difficulty_label is None`, and the data is already filtered when it is set.

---

## 2026-10-01 fix pass (Bugs 10–20)
Found by an engine stress test (17 normal and edge-case queries), driving the real app in a browser in both themes with the OS in both light and dark mode plus a 375 px mobile viewport, and a data audit of the processed files. Every item below was re-verified after the fix.

## Bug 10 — Title-Based + difficulty filter returned fewer rows than requested (`App/recommender.py`)
**What was wrong:** The difficulty filter runs after ranking, on only the top `max(top_n * 5, 100)` title candidates. A narrow band far from the seed (e.g. "high" for Splendor) left 7 of 10 rows.

**Fix:** `discover()` uses a deeper pool, `max(top_n * 100, 2000)`, when `difficulty_label` is set. It's still a post-processing filter (Section 10 rule unchanged); the evaluation never sets a difficulty, so its numbers are unaffected.

## Bug 11 — Result cards drew an empty box above their content (`App/pages/1_Recommendation.py`, root `app.py`)
**What was wrong:** `st.markdown('<div class="result-card">')` … `st.markdown('</div>')`: each `st.markdown` is its own element, so the div closed immediately (measured: all 5 `.result-card` divs had empty innerHTML) and the card styling applied to a thin empty bar.

**Fix:** Each card is `with st.container(key=f"result_card_{rank}")`; `theme.py` (and root `app.py`'s inline CSS) style `[class*="st-key-result_card_"]` with the same rules as `.result-card`.

## Bug 12 — HTML injection through the 404 page's `?reason=` param (`App/theme.py`, `App/pages/3_Not_Found.py`)
**What was wrong:** `render_not_found()` put `message` into HTML unescaped, and `3_Not_Found.py` passes the URL's `?reason=` straight in. A crafted link rendered arbitrary markup on the live site; verified with an injected "Click to log in" link to an external domain. Streamlit stripped `onerror` handlers, but links and images got through.

**Fix:** `html.escape` on `icon`/`title`/`message`, whitespace collapsed (a blank line would otherwise end the HTML block and let Markdown links render), and `reason` capped at 200 chars. Re-verified with both an HTML payload and a `%0A%0A[link](url)` Markdown payload: both render as inert text.

## Bug 13 — Text unreadable when the visitor's OS theme differs from the app's toggle (`App/theme.py`)
**What was wrong:** Streamlit colours its native widgets from its own base theme, which follows the OS/browser, not this app's Light/Dark radio. Light theme + OS dark mode: `st.warning` text was `rgb(255,255,194)` on pale yellow. Dark theme + OS light mode: sidebar title, every widget label, captions, slider ticks, metric values and links came out at a ~1.4:1 contrast ratio.

**Fix:** Both `_LIGHT_CSS` and `_DARK_CSS` now pin those colours explicitly, with per-kind alert colours via `[data-testid="stAlertContainer"]:has([data-testid="stAlertContent{Warning,Info,Error,Success}"])`. Button labels (markdown `<p>`s) are pinned to white in `_BASE_CSS` so the themes' paragraph colour can't bleed into the gradient buttons. A contrast audit script over every page, in all four theme × OS combinations, now reports nothing below 3:1. **Known cosmetic leftover:** `st.dataframe` draws on a canvas using Streamlit's base theme, so in a mismatched combination the table renders in the other theme's colours (still readable).

## Bug 14 — Sentiment covered 20 games and measured confidence, not positivity (`Notebooks/02_Preprocessing.ipynb` → `02b_sentiment_full_coverage.py`)
**What was wrong:** NB02 read `nrows=500000` of `large_bgg-26m-reviews.csv`, which is sorted by game, so only 20 very popular games were scored. It also averaged the pipeline's `score`, which is the confidence in *whichever* label was predicted (a confidently negative review counted as ~0.99), so all 20 values sat at 0.965–0.975 and the Analytics page showed "100% positive".

**Fix:** `02b_sentiment_full_coverage.py` samples up to 10 random non-empty comments for every game (chunked, fits in 8 GB RAM), scores them with the same model (128-token truncation, length-sorted batches), converts to P(positive), and writes `sentiment_summary.csv` for games with ≥ 3 scored comments. Resumable via a checkpoint parquet.

## Bug 15 — MiniLM embedding similarity covered only the same 20 games (`Notebooks/05_Modeling_Content_NLP.ipynb` → `05b_embeddings_full_coverage.py`)
**What was wrong:** NB05 embedded review comments from that same 500K-row slice, so `emb_topk_csr.joblib` had neighbours for 20 games only (380 non-zeros). With a 0.35 weight in title mode, those 20 popular games recommended each other regardless of the seed: Splendor + Azul returned Carcassonne, Catan, Pandemic, Ticket to Ride and 7 Wonders. The paper also described the embeddings as coming from descriptions.

**Fix:** `05b_embeddings_full_coverage.py` embeds every catalog game's `name + description` (HTML-unescaped) with all-MiniLM-L6-v2 and keeps each game's top 50 cosine neighbours, in the engine's exact row order.

## Bug 16 — Notebook 09 evaluated a copy of the engine, not the deployed one
**What was wrong:** NB09 re-implemented the engine in notebook cells and computed popularity from `large_user_ratings.csv` rating counts, while the app uses `usersrated`. The published numbers didn't describe the deployed ranking.

**Fix:** NB09 now `import`s `App/recommender.py`. Same 300-user protocol; adds popularity / content-only baselines and a no-sentiment ablation; regenerates `performance_chart.png` from the computed numbers instead of hard-coded ones.

## Bug 17 — Notebook 07: `np.asfarray` and inflated NDCG
**What was wrong:** `np.asfarray` was removed in NumPy 2.0. `ndcg_at_k` computed the ideal DCG by sorting the *retrieved* relevance list, so one hit at rank 1 scored NDCG = 1.0 even with 20 held-out items (visible in `Reports/eval_metrics_results.csv`: Recall 0.15 with NDCG 0.97).

**Fix:** `np.asarray(rels, dtype=float)`; IDCG now comes from `min(n_relevant, k)`. NB07 is superseded by NB09 and was **not re-run**; a markdown cell at its top says its saved outputs and `eval_metrics_results.csv` predate the fix.

## Bug 18 — UI examples that returned nothing (`App/pages/1_Recommendation.py`, root `app.py`)
**What was wrong:** The Families placeholder "Family Games" and the Publishers placeholder "CMON" match no BGG value (families are "Group: Name" strings; the publisher is "CMON Global Limited"), so following the examples gave zero results.

**Fix:** Placeholders are now `Components: Miniatures, Crowdfunding: Kickstarter` and `Asmodee, CMON Global Limited`; every placeholder example was verified to return results.

## Bug 19 — Stale Streamlit 1.52 selectors in `App/theme.py`
**What was wrong:** `[data-testid="column"]` (the mobile column-stacking rule), `stDeployButton` and `stThumbValue` no longer exist in 1.52's DOM.

**Fix:** Retargeted to `stColumn` and `stAppDeployButton` (verified at 375 px: card metric columns stack full-width, no horizontal scroll). The `stThumbValue` selector was **removed**, not retargeted: its rule paints an indigo background with dark text, which would make the slider's value label unreadable on `stSliderThumbValue`.

## Bug 20 — Smaller engine and page fixes
- **Silent title resolution:** titles resolve by exact name, then by substring (most-voted match), and unmatched titles were silently dropped. The page now shows "typed → matched" for every seed and warns about unmatched ones (`describe_seed_matches()` in `1_Recommendation.py`).
- **Expanded traits listed case duplicates** ("Strategy … strategy"): `expand_traits()` now de-duplicates case-insensitively (`_dedupe_casefold`). Scoring was already case-insensitive, so rankings are unchanged.
- **Title-mode explanations were lowercase** while trait-mode ones were Title Case: `recommend_by_titles()` now reports matched values in the catalog's own spelling (`_seed_values` / `_meta_overlap`).
- **Combined mode excluded seeds by typed name only:** it now also excludes the resolved seed ids. This is defensive: a leak into the top 20 was *not* reproducible even with the old code, because title-similarity scores always outrank trait-only rows.
- **pandas FutureWarning** (`fillna` downcasting on the object-dtype `score_like` of an empty title result): coerced with `pd.to_numeric` first.
- **Analytics "Most Reviewed Games"** actually charts `usersrated`: renamed "Most-Rated Games".

---

# 10. Important Rules for Claude Code

## ALWAYS DO

### Maintain Project Identity
Always preserve:
- Explainable recommendation logic
- Lightweight, discovery-oriented architecture
- Multi-mode design (title, trait, combined)

### Prioritize Simplicity
Prefer readable, interpretable, modular solutions. Avoid unnecessary ML complexity.

### Preserve Research Coherence
Any modification must align with existing methodology, evaluation logic, and research claims. Do not introduce claims unsupported by the evaluation results.

### Keep Recommendations Explainable
Avoid black-box-only logic. The `make_reason()` method and matched field display must remain functional.

### Preserve the Difficulty Filter Architecture
`difficulty_label` must remain a post-processing filter (`_apply_difficulty_filter`), NOT part of `has_trait`. Do not revert to the old pattern where it was included in `has_trait`.

### Keep App/ Self-Contained
`App/recommender.py` is a self-contained copy of the engine. Any changes to root `recommender.py` must also be applied to `App/recommender.py` (or vice versa). Always instantiate the engine with `base_path=str(PROJECT_ROOT)` using `Path(__file__)` resolution so it works from any working directory.

`App/requirements.txt` is the Streamlit Cloud deployment manifest. If new imports are added to `App/recommender.py` or any page file, update `App/requirements.txt` too — the live app will break silently if a dependency is missing.

---

## NEVER DO

### Never Turn This Into Netflix-Scale Architecture
Do not introduce deep recommender architectures, massive collaborative filtering pipelines, or overcomplication.

### Never Introduce Unsupported Research Claims
Do not claim SOTA performance or superiority over industrial systems.

### Never Break Explainability
Explainability is a core contribution. Keep `make_reason()` and matched field outputs working.

### Never Reintroduce the Difficulty Filter Bug
Do not add `difficulty_label is not None` back to `has_trait` in `discover()`. The difficulty filter must be applied as a post-processing step on all three return paths.

### Never Add Random Dependencies
Keep dependencies lightweight and justified.

---

# 11. Known Research Limitations

### All Modes Lose to Popularity Offline
On the NB09 protocol, every mode is far below the popularity baseline (best mode Combined: Recall@10 0.037 vs 0.230), because the held-out games are mostly blockbusters. In the long-tail analysis, the popularity baseline gets 0 while the modes get a small share. The paper reports this candidly. Don't reframe it as a win.

### Trait-Based Recommendation Weakness
Trait-based mode is positioned as an exploratory filtering tool, not a strong ranking model (Recall@10 0.020). Acknowledged in the paper.

### Sentiment Is Sampled and Adds Little Measurable Value
At most 10 comments per game are scored, so per-game values are noisy. The no-sentiment ablation is within noise of the full title mode (Section 7).

### Name in the Embedding Text
`05b` embeds `name + description`, so similarly-named games get a small boost (Gloomhaven → "Fairytale Gloom"; catan → Catan editions). Embedding the description alone would remove it (≈25 min rebuild + NB09 re-run).

### No Personalization
The system does not maintain user profiles, implement collaborative filtering, or learn long-term user preferences. This is intentional given the project scope.

### No Statistical Significance Testing
Evaluation uses single runs over 300 users without p-values or confidence intervals. A bootstrap over `notebook09_user_level_results.csv` would add CIs without re-running anything.

### Explainability Trade-Off
The project intentionally prioritizes transparency and interpretability over raw recommendation optimization. This means Recall@K scores are lower than a pure CF system would achieve.

---

# 12. Open Items / Notes for Next Session

Carried over from the 2026-09-18 → 2026-09-29 work adding the 404 page, per-page meta tags, loading states, and legal pages. Nothing here is blocking — read before starting new work so it isn't re-litigated or silently forgotten.

## Legal pages need real info if this ever goes beyond a portfolio project
`App/pages/4_Terms_of_Use.py` and `App/pages/5_Privacy_Policy.py` (see Section 6, "Legal Pages") currently say:
- No specific software license is published for this repo
- Contact is "via the project's GitHub repository" (`github.com/FullyMed/My_Projects`) — no dedicated email, because none was provided and a personal email wasn't published to a public, search-indexable page without being asked first
- "Last updated: September 21, 2026" is a **hardcoded string** in both files — bump it manually if either page's content changes

If Felix ever wants a real license (MIT, etc.) or a dedicated contact email on those pages, both files need editing directly (search for "6. Source Code" / "8. Contact").

## `3_Not_Found.py`'s `?reason=` query param is unused
The page reads an optional `?reason=` query param to customize its message, but nothing in the app currently links to it with that param set — no internal deep-linking feature exists yet to drive it. It's dormant, ready for a future feature (e.g. linking to it from a bad game-ID lookup), not broken.

## Root `app.py` intentionally lacks the newer UX features
The legacy single-page `app.py` / `recommender.py` at the project root do **not** have: the 404 page, `set_meta_description`, or loading-state spinners — only `recommender.py`'s logic is required to stay synced with `App/recommender.py` (Section 10). If UI parity there is ever wanted, those three features would need to be ported manually; this was a deliberate scope decision each time, not an oversight.

## Image compression — considered and declined (2026-09-29)
The app has no static images at all (every chart is generated live via matplotlib/`st.pyplot`). The only PNGs in the repo are `Reports/images/architecture.png` (468K) and `performance_chart.png` (116K), used solely in the LaTeX paper build — together under 600K with zero effect on the deployed app. Don't re-suggest this unless static images are actually added to the app later.

## Suggested next improvements (offered to Felix 2026-10-01, not yet approved)
1. **Pin `App/requirements.txt`** to the tested versions (venv: pandas 2.3.3, numpy 1.26.4, scikit-learn 1.8.0, scipy 1.16.3, streamlit 1.52.2). Unpinned, Streamlit Cloud installs the newest on every rebuild.
2. **Bootstrap confidence intervals** for the results table (paper Table II) from the user-level CSV.
3. **Trim publisher lists in explanations**: big games list many localisation publishers, which adds noise to the reasons.
4. **Embed description only** in `05b` (removes the name-similarity boost).
5. **Require ≥ 3 characters for the substring title fallback** (a lone `(` currently matches some game; the page does show the match).
6. **A second, less popularity-biased protocol** (random split, rating ≥ 7 as relevant).
7. **Delete the legacy root `app.py` / `recommender.py`?** Felix's call.

## After pushing the 2026-10-01 pass
The live app redeploys from the push on its own (entrypoint unchanged). New deployed data: `emb_topk_csr.joblib` (8.7 MB, was 91 KB) and `sentiment_summary.csv` (21,510 games, was 20). Open the live site once to confirm it starts and Title mode returns similar games, not blockbusters.

---

# Final Development Philosophy

This project should remain:
- Explainable, modular, and lightweight
- Research-oriented and academically honest
- Discovery-focused, not precision-optimized

The goal is a coherent, interpretable, practically usable recommendation framework suitable for undergraduate research, portfolio presentation, and explainable discovery-oriented recommendation — not an imitation of industrial recommender systems.
