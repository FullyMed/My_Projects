"""Full-coverage MiniLM embedding similarity (replaces the 20-game matrix from Notebook 05).

Why this exists
---------------
Notebook 05 built its MiniLM embeddings from review comments in the 500,000-row
review sample that Notebook 02 loaded. That sample only covered 20 games, so
``emb_topk_csr.joblib`` had neighbours for just those 20 (380 non-zeros in a
21,631 x 21,631 matrix). With a 0.35 weight in title mode, that made the 20
most-reviewed games recommend each other regardless of the seed.

This script embeds every catalog game's ``name + description`` with the same
``all-MiniLM-L6-v2`` model, L2-normalises the vectors, and keeps each game's top
``TOP_K`` cosine neighbours, i.e. the same sparse top-k format as
``desc_topk_csr.joblib`` and ``content_topk_csr.joblib``.

Row order matters: row i must be the engine's i-th game, so the catalog is
loaded exactly the way ``BoardGameDiscoveryEngine._load_metadata`` loads it.

Run from the project root:
    .venv\\Scripts\\python.exe Notebooks\\05b_embeddings_full_coverage.py
"""

import html
import os
import time
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import scipy.sparse as sp

PROJECT_ROOT = Path(__file__).resolve().parent.parent
META_PATH = PROJECT_ROOT / "Dataset" / "Raw" / "games_detailed_info.csv"
PROCESSED = PROJECT_ROOT / "Dataset" / "Processed"
EMB_CACHE = PROCESSED / "game_description_embeddings.npy"
OUT_PATH = PROCESSED / "emb_topk_csr.joblib"

MODEL_NAME = "all-MiniLM-L6-v2"
TOP_K = 50
BATCH_ROWS = 1024


def log(msg):
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)


def load_catalog():
    # Mirrors BoardGameDiscoveryEngine._load_metadata so the row order is identical
    df = pd.read_csv(META_PATH, low_memory=False)
    df["id"] = pd.to_numeric(df["id"], errors="coerce")
    df = df.dropna(subset=["id"]).copy()
    df["id"] = df["id"].astype(int)
    df = df.drop_duplicates(subset=["id"]).copy()
    return df.reset_index(drop=True)


def game_texts(df):
    names = df["primary"].fillna("").astype(str)
    # BGG descriptions carry HTML entities such as &#10; and &quot;
    descriptions = df["description"].fillna("").astype(str).map(html.unescape)
    return (names + ". " + descriptions).str.strip().tolist()


def embed(texts):
    if EMB_CACHE.exists():
        cached = np.load(EMB_CACHE)
        if cached.shape[0] == len(texts):
            log(f"using cached embeddings {cached.shape}")
            return cached

    os.environ.setdefault("HF_HUB_OFFLINE", "1")  # model is already in the local HF cache
    from sentence_transformers import SentenceTransformer

    model = SentenceTransformer(MODEL_NAME)
    log(f"embedding {len(texts):,} games (max {model.max_seq_length} tokens each)")
    started = time.time()
    vectors = model.encode(texts, batch_size=32, normalize_embeddings=True, show_progress_bar=False)
    log(f"embedded in {(time.time() - started) / 60:.1f} min")
    np.save(EMB_CACHE, vectors.astype(np.float32))
    return vectors.astype(np.float32)


def topk_cosine(vectors, k=TOP_K):
    """Keep each row's k most similar other games (positive similarities only)."""
    n = vectors.shape[0]
    rows, cols, vals = [], [], []
    for start in range(0, n, BATCH_ROWS):
        end = min(start + BATCH_ROWS, n)
        sims = vectors[start:end] @ vectors.T  # vectors are unit-length, so this is cosine
        sims[np.arange(end - start), np.arange(start, end)] = -1.0  # no self-matches
        idx = np.argpartition(sims, -k, axis=1)[:, -k:]
        top = np.take_along_axis(sims, idx, axis=1)
        keep = top > 0
        rows.append(np.repeat(np.arange(start, end), keep.sum(axis=1)))
        cols.append(idx[keep])
        vals.append(top[keep])
    matrix = sp.csr_matrix(
        (np.concatenate(vals), (np.concatenate(rows), np.concatenate(cols))), shape=(n, n)
    )
    matrix.sort_indices()
    return matrix


if __name__ == "__main__":
    catalog = load_catalog()
    vectors = embed(game_texts(catalog))
    matrix = topk_cosine(vectors)
    joblib.dump(matrix, OUT_PATH)
    per_row = np.diff(matrix.indptr)
    log(
        f"wrote {OUT_PATH.name}: shape={matrix.shape}, nnz={matrix.nnz:,}, "
        f"rows with neighbours={int((per_row > 0).sum()):,}, "
        f"size={OUT_PATH.stat().st_size / 1e6:.1f} MB"
    )
