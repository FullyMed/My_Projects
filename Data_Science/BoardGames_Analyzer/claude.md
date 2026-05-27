# CLAUDE.md

# BoardGames Analyzer — CLAUDE.md

## 1. Project Overview

### Project Name
BoardGames Analyzer

### Project Type
Applied Data Science / Recommender Systems Research Project

### Core Purpose
BoardGames Analyzer is an explainable hybrid board game recommendation system designed to help users discover board games using multiple recommendation approaches, including:

- Title-based recommendation
- Trait-based recommendation
- Combined guided discovery recommendation

The project emphasizes:
- Explainability
- Lightweight recommendation architecture
- Discovery-oriented recommendation
- Interpretable recommendation signals
- Practical usability over state-of-the-art complexity

The system integrates:
- Content similarity
- Gameplay trait overlap
- Sentiment analysis
- Popularity signals

rather than relying heavily on collaborative filtering or deep personalization architectures.

### Research Goal
The project is intended to function as:
- A strong undergraduate applied ML/Data Science project
- A recommender systems portfolio project
- A conference-style student research paper
- An explainable recommendation framework study

### Research Positioning
This project is NOT intended to:
- Compete with industrial-scale recommender systems
- Replicate Netflix/Steam recommendation infrastructure
- Serve as a deep learning recommendation benchmark

Instead, the project focuses on:
- Explainable recommendation
- Multi-mode discovery
- Lightweight hybrid recommendation
- Transparent methodology
- Practical recommendation usability

### Target Audience
- Board game enthusiasts
- Casual hobby users
- Data Science / ML portfolio reviewers
- Academic evaluators
- Undergraduate research supervisors

---

# 2. Tech Stack

## Programming Languages
- Python
- Markdown
- LaTeX

## Core Libraries

### Data Processing
- pandas
- numpy

### Recommendation / NLP
- scikit-learn
- sentence-transformers
- transformers
- torch

### Similarity & Embeddings
- TF-IDF Vectorizer
- Cosine Similarity
- MiniLM sentence-transformer embeddings

### Sentiment Analysis
- HuggingFace Transformers
- DistilBERT SST-2 sentiment model

### Visualization
- matplotlib
- seaborn

### App Framework
- Streamlit

### Notebook Environment
- Jupyter Notebook

---

# 3. Project Structure

## Main Structure

BoardGames_Analyzer/
│
├── notebooks/
│   ├── 01_EDA.ipynb
│   ├── 02_Preprocessing.ipynb
│   ├── ...
│   ├── 08_Discovery_Engine.ipynb
│   ├── 09_Evaluation.ipynb
│
├── app/
│   ├── app.py
│   ├── recommender.py
│   ├── assets/
│   ├── components/
│
├── data/
│   ├── raw/
│   ├── processed/
│   ├── embeddings/
│
├── paper/
│   ├── paper.tex
│   ├── references.bib
│   ├── figures/
│
├── models/
│
├── outputs/
│
└── README.md

---

## Important Files

### app.py
Main Streamlit application entry point.

Responsible for:
- UI rendering
- User interaction
- Recommendation display
- Theme/layout handling

### recommender.py
Core recommendation logic.

Contains:
- Similarity computation
- Recommendation ranking
- Hybrid scoring
- Recommendation mode logic

### 08_Discovery_Engine.ipynb
Main recommendation system notebook.

Contains:
- Title-based recommendation
- Trait-based recommendation
- Combined recommendation logic
- Similarity matrix generation

### 09_Evaluation.ipynb
Evaluation notebook.

Contains:
- Recall@K
- NDCG@K
- Holdout evaluation
- User sampling
- Recommendation performance analysis

### paper.tex
Main IEEE research paper.

---

# 4. Coding Style & Conventions

## General Philosophy
Code should prioritize:
- Readability
- Explainability
- Reproducibility
- Modularity
- Simplicity over unnecessary sophistication

Avoid overengineering.

---

## Naming Conventions

### Variables
Use descriptive snake_case.

GOOD:
content_similarity_score
trait_overlap_score
recommended_games

BAD:
x
temp1
data123

---

### Functions
Use verb-oriented snake_case.

GOOD:
calculate_similarity()
generate_recommendations()
compute_trait_overlap()

---

### File Names
Use lowercase with underscores.

GOOD:
recommender.py
evaluation_utils.py

---

## Formatting Rules

### Python
- 4 spaces indentation
- PEP8-compliant formatting
- Keep functions reasonably short
- Avoid deeply nested logic

---

## Comment Style

### Preferred
Explain WHY, not obvious WHAT.

GOOD:
# Normalize popularity scores to prevent dominance

BAD:
# Add popularity score

---

# 5. Key Features

## Core Recommendation Modes

### 1. Title-Based Recommendation
- Strongest quantitative retrieval mode
- Uses semantic similarity
- Based on seed game input

### 2. Trait-Based Recommendation
- Exploratory recommendation mode
- Uses:
  - mechanics
  - categories
  - themes
  - complexity
- Lower retrieval accuracy
- Designed for gameplay preference exploration

### 3. Combined Recommendation
- Guided discovery mode
- Combines:
  - title similarity
  - gameplay preference filtering

---

## Hybrid Signals

### Content Similarity
Uses:
- TF-IDF
- MiniLM sentence-transformer embeddings
- Cosine similarity

### Trait Similarity
Uses:
- Shared gameplay mechanics
- Category overlap
- Soft overlap scoring

### Sentiment Analysis
Uses:
- DistilBERT SST-2 sentiment model
- Aggregated review sentiment

### Popularity Signals
Uses:
- Average rating
- Rating count

---

## Explainability
The system provides lightweight recommendation explanations such as:
- shared mechanics
- thematic similarity
- sentiment strength
- popularity indicators

---

# 6. Current Progress

## Completed

### Data Pipeline
- EDA completed
- Dataset preprocessing completed
- Filtering pipeline completed

### Recommendation Engine
- Title-based recommendation completed
- Trait-based recommendation completed
- Combined recommendation completed

### Evaluation
- Recall@K evaluation completed
- NDCG@K evaluation completed
- Holdout evaluation implemented

### Research Paper
- IEEE paper structure completed
- Methodology revised
- Evaluation section revised
- Discussion revised
- Explainability section added

### Streamlit App
- Working recommendation UI completed
- Light/dark theme support
- Interactive recommendation display

---

## Current Known Research Position

### Quantitative Performance
- Title-based mode performs best
- Combined mode offers flexibility
- Trait-based mode performs weakly quantitatively

### Research Identity
The project is positioned as:
- Explainable
- Discovery-oriented
- Lightweight hybrid recommendation

NOT:
- State-of-the-art recommendation research

---

## Pending / Optional Improvements

### Potential Improvements
- Baseline experiments
- Better trait overlap formulation
- Modern literature additions
- Minor UI polish
- Better recommendation explanation UI

### Explicitly NOT Planned
- Full collaborative filtering architecture
- Industrial-scale personalization
- GNN recommendation systems
- Large-scale neural ranking pipelines

---

# 7. Important Rules for Claude Code

## ALWAYS DO

### Maintain Project Identity
Always preserve the project's core identity:
- Explainable
- Lightweight
- Discovery-oriented
- Multi-mode recommendation

### Prioritize Simplicity
Prefer:
- readable solutions
- interpretable logic
- modular architecture

over:
- unnecessary ML complexity

### Preserve Research Coherence
Any modification must align with:
- existing methodology
- evaluation logic
- research claims

### Keep Recommendations Explainable
Avoid black-box-only recommendation logic.

### Respect Existing Evaluation Logic
Current evaluation uses:
- Recall@K
- NDCG@K
- holdout-based recommendation evaluation

---

## NEVER DO

### Never Turn This Into Netflix-Scale Architecture
DO NOT:
- introduce unnecessary deep recommender architectures
- add massive collaborative filtering pipelines
- overcomplicate the system

### Never Introduce Unsupported Research Claims
DO NOT claim:
- SOTA performance
- superiority over industrial systems
- advanced personalization

unless actual evidence exists.

### Never Break Explainability
Explainability is one of the project's core contributions.

### Never Add Random Dependencies
Keep dependencies lightweight and justified.

---

# 8. Known Issues / Notes

## Known Research Limitations

### Trait-Based Recommendation Weakness
Trait-based recommendation has weak quantitative performance.

Observed:
- Low Recall@10
- Weak ranking effectiveness

This is acknowledged intentionally in the paper.

Trait-based mode is positioned as:
- exploratory filtering
NOT:
- strongest ranking model

---

## No Personalization
The current system:
- does NOT maintain user profiles
- does NOT implement collaborative filtering
- does NOT learn long-term user preferences

This is intentional due to project scope.

---

## No Statistical Significance Testing
Current evaluation uses:
- single evaluation runs
- no p-values
- no repeated random trials

This is acceptable for current project scope.

---

## Explainability Trade-Off
The project intentionally prioritizes:
- transparency
- interpretability
- modularity

over:
- raw recommendation optimization

---

# Final Development Philosophy

This project should remain:

- Explainable
- Modular
- Lightweight
- Research-oriented
- Discovery-focused
- Academically honest

The goal is NOT to imitate industrial recommender systems.

The goal is to provide a coherent, interpretable, and practically usable recommendation framework suitable for:
- undergraduate research
- portfolio presentation
- applied recommendation system analysis
- explainable discovery-oriented recommendation.