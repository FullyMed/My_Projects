# BoardGames Analyzer

**An explainable hybrid board game recommendation system** built as an undergraduate Data Science and Recommender Systems research project.

The system helps users discover board games through three complementary recommendation modes, combining semantic content similarity, sentiment analysis, and popularity signals — with lightweight, interpretable explanations for every recommendation.

---

## Features

- **Three recommendation modes** — Title-Based, Trait-Based, and Combined
- **Explainable results** — every recommendation lists the mechanics, categories, families and publishers it shares with your seeds or requested traits, plus its component scores; the page also shows which game each typed title was matched to
- **Sentiment signal** — DistilBERT SST-2 run on a random sample of each game's user reviews (up to 10 per game)
- **Analytics dashboard** — interactive EDA with rating distributions, top games, mechanic/category frequency, and publication trends
- **Responsive UI** — works on mobile (iOS/Android), tablet (iPad), and desktop
- **Light / Dark theme** — toggleable from the sidebar on every page
- **Custom 404 / Not Found page** — themed empty-state experience, both as a dedicated page and inline for zero-result searches
- **Per-page SEO metadata** — distinct browser-tab title and meta description on every page
- **Loading states** — explicit spinners for the recommendation engine's cold start, each search, and dataset loading on the Analytics page
- **Terms of Use / Privacy Policy pages** — linked from the home page footer

---

## Recommendation Modes

| Mode | Signal | Recall@10 | NDCG@10 | Recall@10, long tail |
|---|---|---|---|---|
| **Title-Based** | TF-IDF + MiniLM embeddings + sentiment + popularity | 0.0233 | 0.0174 | 0.0151 |
| **Trait-Based** | Category / mechanic / family / publisher overlap | 0.0200 | 0.0171 | 0.0183 |
| **Combined** | Title similarity + trait filtering (hybrid) | **0.0367** | **0.0235** | **0.0215** |
| *Popularity baseline* | Most-rated games, ignoring the seeds | *0.2300* | *0.1595* | *0.0000* |
| *Content-only baseline* | Title mode without sentiment and popularity | *0.0122* | *0.0100* | *0.0151* |
| *Title-Based, no sentiment* | Ablation | *0.0244* | *0.0178* | *0.0151* |

> **Read this honestly:** on this offline protocol the popularity baseline wins clearly. The protocol is from Notebook 09: 300 users, each user's first 3 rated games as seeds and the next 3 held out. The ratings file is ordered by game popularity, so 63% of held-out games are top-100 most-rated titles. The **long-tail** column counts only held-out games outside the top 100 (155 users). There, popularity scores 0 and the similarity-based modes find a few. The system is built for explainable discovery, not next-rating prediction. Earlier versions of this README showed Title-Based Recall@10 = 0.20. That number came from a data bug (sentiment and embeddings covered only 20 popular games) and is withdrawn. Full tables are in `CLAUDE.md` Section 7 and the paper.

---

## Project Structure

```
BoardGames_Analyzer/
│
├── App/                            ← Multi-page Streamlit app (main)
│   ├── app.py                      ← Home / landing page
│   ├── recommender.py              ← BoardGameDiscoveryEngine class
│   ├── theme.py                    ← Shared CSS, responsive design, chart colors
│   └── pages/
│       ├── 1_Recommendation.py     ← Recommendation engine UI
│       ├── 2_Analytics.py         ← EDA / analytics dashboard
│       ├── 3_Not_Found.py         ← Themed "Not Found" page
│       ├── 4_Terms_of_Use.py      ← Terms of Use
│       └── 5_Privacy_Policy.py    ← Privacy Policy
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

## Getting Started

### Prerequisites

- Python 3.10+
- Full dev environment: all dependencies in `Requirements.txt`
- Streamlit Cloud deployment: minimal deps in `App/requirements.txt` (streamlit, pandas, numpy, scikit-learn, scipy, matplotlib)

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

The app is deployed live on **Streamlit Community Cloud**, served from `App/app.py` in this repository.

Streamlit Cloud uses `App/requirements.txt` as the dependency manifest. The three precomputed similarity matrices (`desc_topk_csr.joblib`, `content_topk_csr.joblib`, `emb_topk_csr.joblib`) are committed to the repository and loaded at startup — no build step required.

---

## Dataset

Data sourced from the [BoardGameGeek (BGG)](https://boardgamegeek.com/) platform via publicly available datasets.

| Dataset | Details |
|---|---|
| Game metadata | 21,631 board games with descriptions, mechanics, categories, complexity |
| User ratings | ~18.7 million valid ratings after preprocessing |
| User reviews | ~26 million ratings with optional comments; a random sample of up to 10 comments per game is used for sentiment |

### Precomputed Artifacts

The `Dataset/Processed/` folder contains precomputed artifacts required by the app:

| File | Description |
|---|---|
| `desc_topk_csr.joblib` | TF-IDF description similarity (sparse CSR matrix) |
| `content_topk_csr.joblib` | Combined content similarity (sparse CSR matrix) |
| `emb_topk_csr.joblib` | MiniLM (all-MiniLM-L6-v2) name + description embedding similarity (sparse CSR matrix), built by `Notebooks/05b_embeddings_full_coverage.py` |
| `sentiment_summary.csv` | Per-game mean probability that a review is positive (DistilBERT SST-2), built by `Notebooks/02b_sentiment_full_coverage.py` |

---

## How It Works

### Hybrid Signals

Each mode has its own fixed weights (all signals min-max normalized to 0–1):

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

**Keyword / semantic similarity** — each game's 50 nearest neighbours under description TF-IDF, mechanic/theme/subcategory vectors, and all-MiniLM-L6-v2 embeddings of its name and description.

**Trait Overlap** — the share of your requested categories / mechanics / families / publishers that a game has. Includes trait expansion (e.g. "strategy" → expands to related categories and mechanics automatically).

**Sentiment** — mean probability that a review is positive (DistilBERT SST-2) over up to 10 randomly sampled comments per game; games with fewer than 3 scored comments use the dataset mean.

**Popularity** — min-max normalized number of user ratings (plus Bayes average rating in the Trait-Based and Combined modes).

### Difficulty Filter

Games can be filtered by complexity level before results are returned:

| Level | BGG Average Weight |
|---|---|
| Low | ≤ 2.0 |
| Medium | 2.0 – 3.0 |
| High | > 3.0 |

The filter is applied as a post-processing step across all three recommendation modes.

---

## App Pages

### Home
Landing page with project overview, key stats, and navigation cards.

### Recommendation Engine
- Enter up to several game titles (comma-separated) and/or trait preferences; the page shows which game each title matched and warns about titles it couldn't find
- Choose mode: **Title-Based**, **Trait-Based**, or **Combined**
- Optionally filter by difficulty level
- Results include a full ranked table and top-5 styled cards with explanation text
- A zero-result query shows a themed "No Matches Found" card instead of a plain message

### Not Found
A dedicated, themed 404 page (styled to match the rest of the app) with links back to Home, Recommendation, and Analytics. Note: Streamlit's router still shows its own built-in "Page not found" banner for genuinely unrecognized URLs before falling back to Home — this page covers in-app "not found" states, not arbitrary bad URLs (a Streamlit platform limitation).

### Terms of Use / Privacy Policy
Static pages describing what the app actually does with your input (short version: no accounts, no persisted personal data — search inputs live only in your browser session) and disclaiming BGG affiliation. Linked from the Home page footer and from each other.

### Analytics Dashboard
Interactive dataset explorer with sidebar controls (min-vote threshold, year range, chart size):

- Rating and complexity distributions
- Top N highest-rated games
- Top N most-rated games
- Most common mechanics and categories
- Games published per year trend
- Community sentiment distribution (mean P(positive) per game)

---

## Notebooks

| Notebook | Purpose |
|---|---|
| `01_Data_Inspection` | Initial data exploration and schema review |
| `02_Preprocessing` | Cleaning, filtering, feature extraction (its sentiment step was a 20-game pilot, replaced by `02b`) |
| `02b_sentiment_full_coverage.py` | Review sentiment for every game (script) |
| `03_EDA` | Exploratory data analysis and visualizations |
| `04_Modeling_CF` | Collaborative filtering experiments |
| `05_Modeling_Content_NLP` | TF-IDF and attribute similarity (its embedding step covered only 20 games, replaced by `05b`) |
| `05b_embeddings_full_coverage.py` | MiniLM embedding similarity for every game (script) |
| `06_Hybrid_Model` | Hybrid scoring construction |
| `07_Evaluation_Metrics` | Early metric experiments (superseded by `09`) |
| `08_Discovery_Engine` | Full recommendation engine implementation |
| `09_Evaluation` | Recall@K / NDCG@K of the deployed engine, baselines and a no-sentiment ablation |

---

## Tech Stack

| Category | Libraries |
|---|---|
| Data processing | pandas, numpy |
| Machine learning | scikit-learn, scipy |
| NLP & embeddings | sentence-transformers (MiniLM-L6), transformers (DistilBERT SST-2), torch |
| Similarity storage | scipy sparse CSR matrices, joblib |
| Visualization | matplotlib, seaborn |
| App framework | Streamlit 1.52 |
| Notebooks | Jupyter |
| Paper | LaTeX (IEEE format) |

---

## Research Paper

The project includes a full IEEE-format research paper at `Reports/paper.tex` / `Reports/paper.pdf`.

**Title:** *An Explainable Multi-Mode Board Game Recommendation System Using Content Similarity, Sentiment Analysis, and Popularity Signals*

**Abstract:** Proposes a lightweight hybrid recommendation framework for board game discovery that integrates textual content similarity, gameplay trait matching, sentiment analysis, and popularity-based signals. Evaluated using Recall@K and NDCG@K under a holdout-based protocol on the BoardGameGeek dataset.

---

## Limitations

- **No personalization** — the system does not maintain user profiles or collaborative filtering
- **Trait-Based mode is exploratory** — low quantitative performance by design; intended for preference exploration rather than precise retrieval
- **Sentiment is sampled** — at most 10 review comments per game are scored, so values for individual games are noisy
- **Popularity wins offline** — on the evaluation protocol every mode is far below a popularity baseline; the system's value is explainable discovery beyond the blockbusters, which needs a user study to demonstrate
- **Same-series cap** — at most 2 results from any BGG series a seed belongs to (otherwise Ticket to Ride returns six Ticket to Ride editions); the shared series is named in the explanation
- **Name in embeddings** — game names are part of the embedded text, so similarly-named games get a small boost
- **No statistical significance testing** — evaluation uses single runs without p-values or confidence intervals

---

## Roadmap / Open Items

- **Legal pages placeholder info** — Terms of Use / Privacy Policy currently list the GitHub repo as the only contact method and state no software license is published. Update both if a real license or dedicated contact email is added later.
- **Paper vs. code** — fixed on 2026-10-01: the paper now uses the real per-mode formulas, reports baselines, an ablation and a long-tail analysis, and shows verbatim system explanations.
- **Suggested next steps** (not yet approved): pin `App/requirements.txt` versions, bootstrap confidence intervals, shorter publisher lists in explanations, description-only embeddings, a less popularity-biased evaluation protocol. See `CLAUDE.md` Section 12.
- **Root single-page app** (`app.py` / `recommender.py` at the project root) is kept only for reference and intentionally does not have the 404 page, SEO meta tags, or loading-state spinners that the `App/` version has.
- Image compression was evaluated and skipped — the app has no static images (all charts render live via matplotlib); see `CLAUDE.md` for details.

---

## Purpose

Developed as an undergraduate Data Science and Recommender Systems research project to demonstrate:

- Practical hybrid recommendation system design
- Explainable AI in a hobby domain
- End-to-end ML pipeline from raw data to interactive app
- Research methodology with holdout evaluation, baselines and candid reporting of negative results

---

*Built with Python and Streamlit · Data from BoardGameGeek*
