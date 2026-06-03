# BoardGames Analyzer

**An explainable hybrid board game recommendation system** built as an undergraduate Data Science and Recommender Systems research project.

The system helps users discover board games through three complementary recommendation modes, combining semantic content similarity, sentiment analysis, and popularity signals — with lightweight, interpretable explanations for every recommendation.

---

## Features

- **Three recommendation modes** — Title-Based, Trait-Based, and Combined
- **Explainable results** — every recommendation shows matched mechanics, categories, and contributing signals
- **Sentiment-enhanced ranking** — DistilBERT SST-2 scores aggregated from user reviews
- **Analytics dashboard** — interactive EDA with rating distributions, top games, mechanic/category frequency, and publication trends
- **Responsive UI** — works on mobile (iOS/Android), tablet (iPad), and desktop
- **Light / Dark theme** — toggleable from the sidebar on every page

---

## Recommendation Modes

| Mode | Signal | Recall@10 | NDCG@10 |
|---|---|---|---|
| **Title-Based** | TF-IDF + MiniLM embeddings + sentiment + popularity | **0.2033** | **0.1377** |
| **Combined** | Title similarity + trait filtering (hybrid) | 0.1789 | 0.1217 |
| **Trait-Based** | Category / mechanic / family / publisher overlap | 0.0189 | 0.0156 |

> Evaluation: 300 sampled users, 3 seed games → top-K recommendations → checked against 3 held-out games.

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
│       └── 2_Analytics.py         ← EDA / analytics dashboard
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
- All dependencies in `Requirements.txt`

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

## Dataset

Data sourced from the [BoardGameGeek (BGG)](https://boardgamegeek.com/) platform via publicly available datasets.

| Dataset | Details |
|---|---|
| Game metadata | 21,631 board games with descriptions, mechanics, categories, complexity |
| User ratings | ~18.7 million valid ratings after preprocessing |
| User reviews | Millions of text reviews (used for sentiment analysis) |

### Precomputed Artifacts

The `Dataset/Processed/` folder contains precomputed artifacts required by the app:

| File | Description |
|---|---|
| `desc_topk_csr.joblib` | TF-IDF description similarity (sparse CSR matrix) |
| `content_topk_csr.joblib` | Combined content similarity (sparse CSR matrix) |
| `emb_topk_csr.joblib` | MiniLM sentence-embedding similarity (sparse CSR matrix) |
| `sentiment_summary.csv` | Per-game aggregated DistilBERT sentiment scores |

---

## How It Works

### Hybrid Signals

```
Final Score = w₁ × Content Similarity
            + w₂ × Trait Overlap
            + w₃ × Sentiment Score
            + w₄ × Popularity Signal
```

**Content Similarity** — TF-IDF keyword similarity and MiniLM L6 sentence-transformer semantic embeddings, combined via cosine similarity.

**Trait Overlap** — Soft Jaccard overlap across mechanics, categories, families, and publishers. Includes trait expansion (e.g. "strategy" → expands to related mechanics automatically).

**Sentiment** — DistilBERT SST-2 sentiment probabilities aggregated per game from user review text, normalized before blending.

**Popularity** — Min-max normalized user rating count and Bayes average rating, weighted to surface quality without overwhelming niche titles.

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
- Enter up to several game titles (comma-separated) and/or trait preferences
- Choose mode: **Title-Based**, **Trait-Based**, or **Combined**
- Optionally filter by difficulty level
- Results include a full ranked table and top-5 styled cards with explanation text

### Analytics Dashboard
Interactive dataset explorer with sidebar controls (min-vote threshold, year range, chart size):

- Rating and complexity distributions
- Top N highest-rated games
- Top N most reviewed games
- Most common mechanics and categories
- Games published per year trend
- Community sentiment distribution

---

## Notebooks

| Notebook | Purpose |
|---|---|
| `01_Data_Inspection` | Initial data exploration and schema review |
| `02_Preprocessing` | Cleaning, filtering, feature extraction |
| `03_EDA` | Exploratory data analysis and visualizations |
| `04_Modeling_CF` | Collaborative filtering experiments |
| `05_Modeling_Content_NLP` | TF-IDF and embedding similarity computation |
| `06_Hybrid_Model` | Hybrid scoring construction |
| `07_Evaluation_Metrics` | Metric definitions and validation |
| `08_Discovery_Engine` | Full recommendation engine implementation |
| `09_Evaluation` | Holdout-based Recall@K and NDCG@K evaluation |

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
- **Sentiment coverage** — less popular games have fewer reviews, reducing sentiment signal reliability
- **No statistical significance testing** — evaluation uses single runs without p-values

---

## Purpose

Developed as an undergraduate Data Science and Recommender Systems research project to demonstrate:

- Practical hybrid recommendation system design
- Explainable AI in a hobby domain
- End-to-end ML pipeline from raw data to interactive app
- Research methodology with proper holdout evaluation

---

*Built with Python and Streamlit · Data from BoardGameGeek*
