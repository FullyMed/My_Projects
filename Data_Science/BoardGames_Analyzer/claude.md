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
│   ├── app.py                      ← Home / landing page
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
│   ├── 03_EDA.ipynb
│   ├── 04_Modeling_CF.ipynb
│   ├── 05_Modeling_Content_NLP.ipynb
│   ├── 06_Hybrid_Model.ipynb
│   ├── 07_Evaluation_Metrics.ipynb
│   ├── 08_Discovery_Engine.ipynb
│   └── 09_Evaluation.ipynb
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
│       ├── emb_topk_csr.joblib     ← MiniLM embedding similarity (sparse CSR)
│       ├── sentiment_summary.csv   ← Per-game aggregated sentiment scores
│       ├── merged_clean_sample.csv
│       └── ...
│
├── Reports/
│   ├── paper.tex                   ← IEEE research paper (main document)
│   ├── references.bib
│   ├── paper.pdf                   ← Compiled output
│   ├── eval_metrics_results.csv
│   ├── notebook09_summary_metrics.csv
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
Home / landing page of the multi-page Streamlit app.

Displays:
- Project title and description
- Navigation cards to Recommendation and Analytics pages
- Key project stats (21K+ games, 18.7M ratings, Recall@10)
- "How It Works" explainer for the three hybrid signals

### `App/theme.py`
Shared design system for all pages.

Contains:
- `_BASE_CSS` — responsive layout CSS with breakpoints for mobile (≤640px), tablet (641–1024px), desktop (≥1025px)
- `_DARK_CSS` — dark theme colour definitions
- `_LIGHT_CSS` — light theme (indigo/lavender background gradient, gradient text titles, indigo accent borders on cards)
- `sidebar_theme()` — renders the theme toggle and returns selected mode
- `apply_theme(mode)` — injects both base + theme CSS
- `chart_colors(mode)` — returns a matplotlib colour palette dict
- `style_ax(ax, fig, colors, title)` — applies consistent chart styling
- `render_not_found(title, message, icon, show_links)` — themed "not found" card (see Section 6, "Custom 404 / Not Found")
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
- System Interpretation section shows expanded categories/mechanics
- Full results dataframe + top-5 styled result cards with "Why recommended" reasons

### `App/pages/2_Analytics.py`
EDA / analytics dashboard page.

Six chart sections:
1. Overview metrics (total games, avg rating, avg complexity, filtered count)
2. Rating distribution + Complexity distribution (histograms)
3. Top N highest-rated games (horizontal bar, min-vote threshold)
4. Top N most reviewed games (horizontal bar)
5. Top N mechanics + categories (side by side)
6. Games published per year (line chart with area fill)
7. Community sentiment distribution (if sentiment data exists)

All charts use `width='stretch'` and are responsive to the container width.

### `App/pages/3_Not_Found.py`
Standalone, themed "404 / Not Found" page. Appears in the sidebar nav like any other page (Streamlit's `pages/` convention auto-lists every file there — it cannot be hidden without switching the whole app off the `pages/` convention onto `st.navigation`, which this project intentionally does not do; see "Custom 404 / Not Found" in Section 6). Reads an optional `?reason=` query param to customize its message, and renders `theme.render_not_found(..., show_links=True)` with `st.page_link` buttons back to Home / Recommendation / Analytics.

### `App/pages/4_Terms_of_Use.py` / `App/pages/5_Privacy_Policy.py`
Static legal pages, styled with the existing `.section-title` / `.info-box` theme classes (no new CSS). Content is deliberately scoped to what's actually true for this project — see "Legal Pages" in Section 6 below for why, and for what must be kept in sync if the app's data handling ever changes.

### `Notebooks/08_Discovery_Engine.ipynb`
Main recommendation system notebook.

### `Notebooks/09_Evaluation.ipynb`
Evaluation notebook with Recall@K and NDCG@K results.

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
```

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
- Strongest quantitative performance (Recall@10: 0.20, NDCG@10: 0.14)
- Uses TF-IDF + MiniLM embedding cosine similarity
- Seed game → similarity scored against all 21K+ games
- Hybrid signal: `0.35 * text_sim + 0.35 * emb_sim + 0.10 * sentiment + 0.20 * popularity`

### 2. Trait-Based
- Exploratory mode (Recall@10: 0.02, NDCG@10: 0.02)
- Uses category, mechanic, family, publisher overlap scoring
- Trait expansion: e.g. "strategy" → expands to ["economic", "puzzle", "tile placement", ...]
- Intentionally weaker quantitatively — designed for exploratory discovery, not ranking

### 3. Combined
- Guided discovery (Recall@10: 0.18, NDCG@10: 0.12)
- Outer-joins title similarity with trait filtering
- Final score: `0.65 * score_like + 0.35 * score_trait + 0.08 * rating + 0.04 * votes + 0.03 * sentiment`

## Difficulty Filter
- Three levels: low (complexity ≤ 2.0), medium (2.0–3.0), high (> 3.0)
- Applied as a **post-processing step** in `_apply_difficulty_filter()` on ALL three paths
- Works correctly in Title-Based mode (see Bug Fixes section)

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

| Model       | Recall@5 | NDCG@5 | Recall@10 | NDCG@10 | Recall@20 | NDCG@20 |
|-------------|----------|--------|-----------|---------|-----------|---------|
| Title-Based | 0.1144   | 0.0977 | 0.2033    | 0.1377  | 0.3011    | 0.1726  |
| Trait-Based | 0.0144   | 0.0137 | 0.0189    | 0.0156  | 0.0367    | 0.0219  |
| Combined    | 0.0967   | 0.0846 | 0.1789    | 0.1217  | 0.2822    | 0.1588  |

Evaluation protocol: 300 sampled users, 3 seed games → recommend → check against 3 held-out games.

---

# 8. Current Progress

## Completed

### Data Pipeline
- EDA, preprocessing, and filtering pipeline all complete

### Recommendation Engine
- Title-based, trait-based, and combined modes all complete
- Difficulty filter works correctly across all three modes

### Evaluation
- Recall@K and NDCG@K evaluation complete
- Holdout-based evaluation implemented

### Research Paper
- IEEE paper structure complete
- Methodology, evaluation, discussion, and explainability sections complete

### App
- Multi-page Streamlit app (`App/`) complete with Home, Recommendation, and Analytics pages
- Light/dark theme with full responsive design
- All major bugs fixed (see Bug Fixes section)
- Deployed live on Streamlit Community Cloud

---

## Known Paper vs. Code Inconsistencies (Unresolved)

These are known issues in the research paper that have not yet been corrected:

### 1. Weight Mismatch
The paper (Section III) states weights: `w1=0.50, w2=0.20, w3=0.15, w4=0.15`.
The actual code (`recommender.py:recommend_by_titles`) uses: `w_text=0.35, w_emb=0.35, w_sent=0.10, w_pop=0.20`.
The paper formula and code implementation do not match.

### 2. Missing Baseline Results
The paper (Section IV) describes a popularity-based baseline and a content-based baseline, but Table I only shows Title, Trait, and Combined rows — no baseline numbers.

### 3. Hand-Written Explainability Example
Table II shows polished natural-language explanations (e.g. "Shared engine-building mechanics, high semantic similarity..."). The actual system outputs raw matched field names (e.g. "Categories: Strategy | Mechanics: Tile Placement"). The table does not reflect actual system output.

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

### Trait-Based Recommendation Weakness
Trait-based mode has low Recall@10 (0.02) and NDCG@10 (0.02). This is intentional — it is positioned as an exploratory filtering tool, not a strong ranking model. Acknowledged in the paper.

### No Personalization
The system does not maintain user profiles, implement collaborative filtering, or learn long-term user preferences. This is intentional given the project scope.

### No Statistical Significance Testing
Evaluation uses single runs without p-values or repeated trials. Acceptable for the current scope.

### Explainability Trade-Off
The project intentionally prioritizes transparency and interpretability over raw recommendation optimization. This means Recall@K scores are lower than a pure CF system would achieve.

---

# Final Development Philosophy

This project should remain:
- Explainable, modular, and lightweight
- Research-oriented and academically honest
- Discovery-focused, not precision-optimized

The goal is a coherent, interpretable, practically usable recommendation framework suitable for undergraduate research, portfolio presentation, and explainable discovery-oriented recommendation — not an imitation of industrial recommender systems.
