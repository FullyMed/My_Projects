"""Full-coverage review sentiment (replaces the 20-game pilot from Notebook 02).

Why this exists
---------------
Notebook 02 read only the first 500,000 rows of ``large_bgg-26m-reviews.csv``.
That file is sorted by game, so the pilot covered just 20 (very popular)
games. It also averaged the pipeline's ``score`` field, which is the model's
confidence in *whichever* label it predicted, so a confidently negative review
counted as ~0.99, the same as a confidently positive one.

This script fixes both problems:
  1. Sample up to ``REVIEWS_PER_GAME`` random non-empty comments for EVERY game
     (streamed in chunks, so it fits in ~8 GB of RAM).
  2. Score them with the same DistilBERT SST-2 model and convert each result to
     P(positive) = score if label == POSITIVE else 1 - score.
  3. Average P(positive) per game; games with fewer than ``MIN_REVIEWS`` scored
     comments are left out, so the engine falls back to the dataset mean for them.

Output: ``Dataset/Processed/sentiment_summary.csv`` (same schema the engine and
Analytics page already read: id, avg_sentiment_score, review_count).

Run from the project root (resumable; progress is checkpointed):
    .venv\\Scripts\\python.exe Notebooks\\02b_sentiment_full_coverage.py
"""

import os
import sys
import time
from pathlib import Path

import numpy as np
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parent.parent
RAW_REVIEWS = PROJECT_ROOT / "Dataset" / "Raw" / "large_bgg-26m-reviews.csv"
PROCESSED = PROJECT_ROOT / "Dataset" / "Processed"
SAMPLE_PATH = PROCESSED / "sentiment_review_sample.parquet"
SCORED_PATH = PROCESSED / "sentiment_review_scored.parquet"
SUMMARY_PATH = PROCESSED / "sentiment_summary.csv"

REVIEWS_PER_GAME = 10
MIN_REVIEWS = 3
MAX_TOKENS = 128          # median comment is ~25 tokens; truncating long ones keeps CPU time reasonable
BATCH_SIZE = 32
CHECKPOINT_EVERY = 5_000  # reviews
RANDOM_SEED = 42
MODEL_NAME = "distilbert-base-uncased-finetuned-sst-2-english"


def log(msg):
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)


def build_sample():
    """Keep the REVIEWS_PER_GAME comments with the smallest random key per game.

    Taking the k smallest of i.i.d. random keys is a uniform random sample, and
    it can be done chunk by chunk without holding all 26M rows in memory.
    """
    rng = np.random.default_rng(RANDOM_SEED)
    kept = None
    total_rows = 0
    reader = pd.read_csv(RAW_REVIEWS, usecols=["ID", "comment"], chunksize=1_000_000)
    for i, chunk in enumerate(reader, start=1):
        total_rows += len(chunk)
        chunk = chunk.dropna(subset=["comment"])
        chunk["comment"] = chunk["comment"].astype(str).str.strip()
        chunk = chunk[chunk["comment"] != ""]
        chunk["key"] = rng.random(len(chunk))
        merged = chunk if kept is None else pd.concat([kept, chunk], ignore_index=True)
        kept = (
            merged.sort_values("key")
            .groupby("ID", sort=False)
            .head(REVIEWS_PER_GAME)
            .reset_index(drop=True)
        )
        log(f"chunk {i}: {total_rows:,} rows read, {len(kept):,} comments kept, {kept['ID'].nunique():,} games")

    kept = kept.rename(columns={"ID": "id"}).drop(columns="key")
    kept["id"] = pd.to_numeric(kept["id"], errors="coerce")
    kept = kept.dropna(subset=["id"]).astype({"id": int})
    kept.to_parquet(SAMPLE_PATH, index=False)
    log(f"sample saved: {len(kept):,} comments across {kept['id'].nunique():,} games -> {SAMPLE_PATH.name}")
    return kept


def score_sample(sample):
    os.environ.setdefault("HF_HUB_OFFLINE", "1")  # model is already in the local HF cache
    from transformers import pipeline

    done = pd.read_parquet(SCORED_PATH) if SCORED_PATH.exists() else pd.DataFrame(columns=["row", "pos_prob"])
    done_rows = set(done["row"].astype(int))

    sample = sample.reset_index(drop=True)
    sample["row"] = sample.index
    todo = sample[~sample["row"].isin(done_rows)].copy()
    # Sorting by length keeps each batch's padding small, which is what makes batching pay off on CPU
    todo = todo.assign(length=todo["comment"].str.len()).sort_values("length")
    log(f"scoring {len(todo):,} comments ({len(done_rows):,} already done)")

    clf = pipeline("sentiment-analysis", model=MODEL_NAME, truncation=True, max_length=MAX_TOKENS)

    results = [done] if len(done) else []
    started = time.time()
    rows, texts = todo["row"].tolist(), todo["comment"].tolist()
    for start in range(0, len(texts), CHECKPOINT_EVERY):
        batch_rows = rows[start:start + CHECKPOINT_EVERY]
        preds = clf(texts[start:start + CHECKPOINT_EVERY], batch_size=BATCH_SIZE)
        pos_prob = [p["score"] if p["label"] == "POSITIVE" else 1.0 - p["score"] for p in preds]
        results.append(pd.DataFrame({"row": batch_rows, "pos_prob": pos_prob}))
        pd.concat(results, ignore_index=True).to_parquet(SCORED_PATH, index=False)

        n_done = start + len(batch_rows)
        rate = n_done / (time.time() - started)
        eta_min = (len(texts) - n_done) / rate / 60
        log(f"scored {n_done:,}/{len(texts):,}  ({rate:.1f}/s, ~{eta_min:.0f} min left)")

    scored = pd.concat(results, ignore_index=True).astype({"row": int})
    return sample.merge(scored, on="row", how="inner")


def summarize(scored):
    summary = (
        scored.groupby("id")
        .agg(avg_sentiment_score=("pos_prob", "mean"), review_count=("pos_prob", "size"))
    )
    summary = summary[summary["review_count"] >= MIN_REVIEWS].sort_index()
    summary.to_csv(SUMMARY_PATH)
    log(
        f"wrote {SUMMARY_PATH.name}: {len(summary):,} games, "
        f"mean={summary['avg_sentiment_score'].mean():.3f}, "
        f"share with mean P(positive) >= 0.5: {(summary['avg_sentiment_score'] >= 0.5).mean():.1%}"
    )


def restrict_to_catalog(sample):
    """The reviews file covers more games than the metadata the engine serves; skip the rest."""
    meta_ids = pd.read_csv(PROJECT_ROOT / "Dataset" / "Raw" / "games_detailed_info.csv", usecols=["id"])["id"]
    catalog = set(pd.to_numeric(meta_ids, errors="coerce").dropna().astype(int))
    kept = sample[sample["id"].isin(catalog)]
    log(f"restricted to catalog: {len(kept):,} comments across {kept['id'].nunique():,} games")
    return kept


if __name__ == "__main__":
    stage = sys.argv[1] if len(sys.argv) > 1 else "all"
    sample = pd.read_parquet(SAMPLE_PATH) if SAMPLE_PATH.exists() and stage != "sample" else build_sample()
    if stage == "sample":
        sys.exit(0)
    summarize(score_sample(restrict_to_catalog(sample)))
