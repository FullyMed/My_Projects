# BoardGames Analyzer

A board game recommender that tells you why it picked each game. I built it as an undergraduate data science research project, with a Streamlit app and an IEEE-style paper.

You can start from games you already like, from traits you want (co-op, tile placement, horror), or from both. Each suggestion lists the categories, mechanics, families and publishers it shares with what you asked for.

---

## What's in the app

- Three ways to search: Title-Based, Trait-Based and Combined.
- A reason on every result, plus the component scores. The page also shows which catalog game each typed title matched, so a typo can't quietly pick the wrong seed.
- A review-sentiment signal: DistilBERT SST-2 scored up to 10 random review comments per game.
- An Analytics page with interactive Altair charts of the data (ratings, complexity, top games, common mechanics and categories, releases per year). They stay readable on a phone and show details on hover.
- Light and dark themes, a layout that works on phones, tablets and desktops, and loading spinners for the slow steps.
- Keyboard friendly: a skip link on every page and a visible focus ring on every control. Every page passes a WCAG AA contrast check in both themes, whether your computer is in light or dark mode.
- A themed 404 page, a distinct title and meta description on every page, and Terms of use and Privacy policy pages linked from the home page.

---

## How well it works

| Mode | Signal | Recall@10 | NDCG@10 | Recall@10, long tail |
|---|---|---|---|---|
| **Title-Based** | TF-IDF + MiniLM embeddings + sentiment + popularity | 0.0233 | 0.0174 | 0.0151 |
| **Trait-Based** | Category / mechanic / family / publisher overlap | 0.0200 | 0.0171 | 0.0183 |
| **Combined** | Title similarity + trait filtering (hybrid) | **0.0367** | **0.0235** | **0.0215** |
| *Popularity baseline* | Most-rated games, ignoring the seeds | *0.2300* | *0.1595* | *0.0000* |
| *Content-only baseline* | Title mode without sentiment and popularity | *0.0122* | *0.0100* | *0.0151* |
| *Title-Based, no sentiment* | Ablation | *0.0244* | *0.0178* | *0.0151* |

The popularity baseline wins this test by a wide margin. Notebook 09 takes 300 users, uses each user's first 3 rated games as seeds, and holds out the next 3. The ratings file lists the most-rated games first, so 63% of the held-out games are top-100 blockbusters, and a list of popular games guesses many of them.

The long-tail column counts only held-out games outside the top 100 (155 of the 300 users have one). There, popularity scores zero and the three modes find a few. That fits what the app is for: explainable discovery beyond the obvious picks, not predicting the next popular game someone rates.

Older versions of this README showed Title-Based Recall@10 = 0.20. That number came from a data bug, where sentiment and embeddings covered only 20 popular games, and I've withdrawn it. The full tables are in `CLAUDE.md` Section 7 and in the paper.

---

## Project structure

```
BoardGames_Analyzer/
│
├── App/                            ← Multi-page Streamlit app (main)
│   ├── app.py                      ← Home / landing page
│   ├── recommender.py              ← BoardGameDiscoveryEngine class
│   ├── theme.py                    ← Shared CSS, responsive design, chart colors
│   └── pages/
│       ├── 1_Recommendation.py     ← Recommendation page
│       ├── 2_Analytics.py         ← Data charts
│       ├── 3_Not_Found.py         ← Themed "not found" page
│       ├── 4_Terms_of_Use.py      ← Terms of use
│       └── 5_Privacy_Policy.py    ← Privacy policy
│
├── Notebooks/
│   ├── 01_Data_Inspection.ipynb
│   ├── 02_Preprocessing.ipynb
│   ├── 02b_sentiment_full_coverage.py   ← Builds sentiment_summary.csv
│   ├── 03_EDA.ipynb
│   ├── 04_Modeling_CF.ipynb
│   ├── 05_Modeling_Content_NLP.ipynb
│   ├── 05b_embeddings_full_coverage.py  ← Builds emb_topk_csr.joblib
│   ├── 06_Hybrid_Model.ipynb
│   ├── 07_Evaluation_Metrics.ipynb
│   ├── 08_Discovery_Engine.ipynb
│   └── 09_Evaluation.ipynb
│
├── Dataset/
│   ├── Raw/                        ← games_detailed_info.csv, reviews, ratings
│   └── Processed/                  ← Precomputed similarity matrices, sentiment
│
├── Reports/
│   ├── paper.tex                   ← IEEE research paper
│   ├── paper.pdf
│   ├── references.bib
│   └── images/
│
├── app.py                          ← Original single-page app (root)
├── recommender.py                  ← Original engine (root)
└── Requirements.txt
```

---

## Getting started

### What you need

- Python 3.10 or newer
- For development: everything in `Requirements.txt`
- For the Streamlit Cloud deployment: the short list in `App/requirements.txt` (streamlit, pandas, numpy, scikit-learn, scipy, altair, joblib), each pinned to the version the app was tested with

### Install

```bash
# Clone the repository
git clone <repo-url>
cd BoardGames_Analyzer

# Create and activate a virtual environment
python -m venv .venv

# Windows
.\.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

# Install dependencies
pip install -r Requirements.txt
```

### Run

```bash
# Multi-page app (recommended)
streamlit run App/app.py

# Original single-page app
streamlit run app.py
```

Then open `http://localhost:8501` in your browser.

---

## Deployment

The live app is at https://boardgamediscovery.streamlit.app/. It runs on Streamlit Community Cloud from `App/app.py` in this repository.

Cloud starts the app from the root of the repository, so it only reads a `.streamlit/config.toml` placed there. That's why the repository root has a copy of this project's `.streamlit/config.toml` (the indigo accent and the security settings). The copy in this folder is for local runs. The two files need to stay the same, so change both together.

Streamlit Cloud installs the packages in `App/requirements.txt`. They're pinned to exact versions, so a rebuild installs the same set every time. The pinned numpy (1.26.4) doesn't support Python 3.13, so the app needs Python 3.11 or 3.12 on Cloud. The three precomputed similarity matrices (`desc_topk_csr.joblib`, `content_topk_csr.joblib`, `emb_topk_csr.joblib`) are in the repository, and the app loads them at startup, so there's no build step.

---

## Dataset

All data comes from public [BoardGameGeek (BGG)](https://boardgamegeek.com/) datasets.

| Dataset | Details |
|---|---|
| Game metadata | 21,631 board games with descriptions, mechanics, categories, complexity |
| User ratings | 18.7 million ratings on those games |
| User reviews | ~26 million ratings with optional comments; the sentiment step samples up to 10 comments per game |

### Precomputed files

The app needs these files from `Dataset/Processed/`:

| File | Description |
|---|---|
| `desc_topk_csr.joblib` | TF-IDF description similarity (sparse CSR matrix) |
| `content_topk_csr.joblib` | Mechanic / theme / subcategory similarity (sparse CSR matrix) |
| `emb_topk_csr.joblib` | MiniLM (all-MiniLM-L6-v2) name + description embedding similarity (sparse CSR matrix), built by `Notebooks/05b_embeddings_full_coverage.py` |
| `sentiment_summary.csv` | Per-game mean probability that a review is positive (DistilBERT SST-2), built by `Notebooks/02b_sentiment_full_coverage.py` |

---

## How it works

### The scores

Each mode has its own fixed weights. Every signal is min-max normalized to 0–1 first.

```
Title-Based:  0.35 × keyword similarity (TF-IDF description + mechanics/themes, averaged)
            + 0.35 × semantic similarity (MiniLM embeddings)
            + 0.10 × sentiment
            + 0.20 × popularity (number of ratings)

Trait score:  0.40 × category overlap + 0.35 × mechanic overlap
            + 0.15 × family overlap   + 0.10 × publisher overlap
Trait-Based:  0.70 × trait score + 0.15 × rating + 0.10 × log(votes) + 0.05 × sentiment

Combined:     0.65 × Title-Based score + 0.35 × trait score
            + 0.08 × rating + 0.04 × log(votes) + 0.03 × sentiment
```

For keyword and semantic similarity, the engine stores each game's 50 nearest neighbours in three spaces: description TF-IDF, mechanic/theme/subcategory vectors, and all-MiniLM-L6-v2 embeddings of the game's name and description.

Trait overlap is the share of your requested categories, mechanics, families and publishers that a game has. Broad words expand into related BGG terms, so "strategy" also searches categories like Economic and mechanics like Hand Management.

Sentiment is the average chance that a review is positive, over up to 10 random comments per game. Games with fewer than 3 scored comments get the overall average.

Popularity is the min-max normalized number of user ratings. The Trait-Based and Combined modes also add the Bayes average rating.

### After ranking

Two rules run after the scores, so neither one changes a score.

The difficulty filter keeps games in the band you choose:

| Level | BGG average weight |
|---|---|
| Light | ≤ 2.0 |
| Medium | 2.0 – 3.0 |
| Heavy | > 3.0 |

The same-series cap allows at most 2 results from any BGG series a seed game belongs to. Without it, Ticket to Ride returns six Ticket to Ride editions. The explanation names the shared series.

---

## App pages

### Home
An overview, a few stats, and links to the other pages.

### Recommendation
Type one or more games (comma-separated), traits, or both, and pick a mode: Title-Based, Trait-Based or Combined. You can also set a difficulty. The page shows which game each typed title matched and warns you about titles it couldn't find. You get a ranked table and cards for the top 5, each with its reason. A search with no results shows a "No matches" card with ideas for widening it.

### Analytics
Charts of the dataset, with sidebar controls for the minimum number of ratings, the years shown and the bars per chart:

- Rating and complexity distributions
- Top N highest-rated and most-rated games
- The most common mechanics and categories
- Games released per year
- How positive the reviews sound, per game

### Not found
A themed 404 page with links back to Home, Recommendation and Analytics. Streamlit's router still shows its own "Page not found" banner for unknown URLs before it falls back to Home, and the app can't change that. This page covers "not found" states inside the app.

### Terms of use and privacy policy
Plain-language pages about what the app does with your input: no accounts, and what you type stays in your browser session. They also say the project has no connection to BGG. The home page footer links to both, and they link to each other.

---

## Notebooks

| Notebook | Purpose |
|---|---|
| `01_Data_Inspection` | First look at the data and its schema |
| `02_Preprocessing` | Cleaning, filtering, feature extraction (its sentiment step was a 20-game pilot, replaced by `02b`) |
| `02b_sentiment_full_coverage.py` | Review sentiment for every game (script) |
| `03_EDA` | Exploratory analysis and charts |
| `04_Modeling_CF` | Collaborative filtering experiments |
| `05_Modeling_Content_NLP` | TF-IDF and attribute similarity (its embedding step covered only 20 games, replaced by `05b`) |
| `05b_embeddings_full_coverage.py` | MiniLM embedding similarity for every game (script) |
| `06_Hybrid_Model` | Builds the hybrid score |
| `07_Evaluation_Metrics` | Early metric experiments (superseded by `09`) |
| `08_Discovery_Engine` | Full recommendation engine |
| `09_Evaluation` | Recall@K / NDCG@K of the deployed engine, baselines and a no-sentiment ablation |

---

## Tech stack

| Category | Libraries |
|---|---|
| Data processing | pandas, numpy |
| Machine learning | scikit-learn, scipy |
| NLP & embeddings | sentence-transformers (MiniLM-L6), transformers (DistilBERT SST-2), torch |
| Similarity storage | scipy sparse CSR matrices, joblib |
| Visualization | Altair (app charts), matplotlib and seaborn (notebooks, paper figures) |
| App framework | Streamlit 1.52 |
| Notebooks | Jupyter |
| Paper | LaTeX (IEEE format) |

---

## Research paper

The full paper is at `Reports/paper.tex`, compiled to `Reports/paper.pdf`.

**Title:** *An Explainable Multi-Mode Board Game Recommendation System Using Content Similarity, Sentiment Analysis, and Popularity Signals*

The paper describes the three modes and how each one scores games, then tests them against popularity and content-only baselines on BoardGameGeek ratings with Recall@K and NDCG@K. It reports the result as it came out: popularity wins the main test, the modes reach a few less popular games that popularity never does, and sentiment adds nothing measurable.

---

## Limitations

- The system doesn't learn from you. There are no user profiles and no collaborative filtering.
- Trait-Based mode is for exploring, not precise retrieval, and its scores show it.
- Sentiment comes from at most 10 comments per game, so a single game's value is noisy.
- Every mode loses to the popularity baseline offline. Showing that the discovery side helps people would take a user study.
- Game names are part of the embedded text, so games with similar names get a small boost.
- The evaluation is a single run, with no p-values or confidence intervals.

---

## Open items

- The legal pages list the GitHub repo as the only contact and say there's no published software license. Both pages need updating if a license or a contact email is added.
- The paper and the code matched up again on 2026-10-01: real per-mode formulas, baselines, an ablation, a long-tail analysis, and the system's own explanations.
- Suggested next steps, not yet approved: add bootstrap confidence intervals, shorten the publisher lists in explanations, embed descriptions only, and add a second evaluation that leans less on popular games. See `CLAUDE.md` Section 12.
- The root single-page app (`app.py` / `recommender.py`) is a reference copy. It doesn't have the 404 page, meta tags or loading spinners that `App/` has.
- Image compression was considered and skipped: the app has no static images, since every chart is drawn live. See `CLAUDE.md`.

---

## Purpose

An undergraduate recommender-systems project that covers the whole pipeline: raw BoardGameGeek dumps, a recommender that explains each suggestion, a deployed app, and an evaluation against baselines that reports the result as it came out, including where the baseline wins.

---

*Built with Python and Streamlit · Data from BoardGameGeek*
