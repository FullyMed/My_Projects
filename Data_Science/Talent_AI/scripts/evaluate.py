"""Evaluate SemanticRanker vs. TfidfRanker with Precision@K.

Ground truth is coarse but objective and not hand-cherry-picked: a candidate counts
as "relevant" to a JD if the dataset's own category label for that resume matches
the JD's topic keywords. This is what makes the proposal's "semantic vs. keyword
matching" claim measurable rather than aspirational.

Usage:
    python scripts/evaluate.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from talent_ai.matching.baseline import TfidfRanker  # noqa: E402
from talent_ai.matching.ranker import SemanticRanker  # noqa: E402
from talent_ai.schemas import JobDescription, MatchResult  # noqa: E402
from talent_ai.storage import load_candidates  # noqa: E402

SAMPLE_JDS_DIR = Path(__file__).parent / "sample_jds"

# JD file -> keywords checked as a case-insensitive substring of the candidate's
# dataset category. Keyword-based (not exact category strings) so this stays robust
# to minor category-naming differences across dataset versions.
EVAL_JDS = {
    "information_technology.txt": ["information-technology", "information technology", " it"],
    "human_resources.txt": ["hr", "human-resources", "human resources"],
}

K_VALUES = [5, 10]


def precision_at_k(results: list[MatchResult], relevant_ids: set[str], k: int) -> float:
    top_k_ids = [r.candidate_id for r in results[:k]]
    if not top_k_ids:
        return 0.0
    hits = sum(1 for cid in top_k_ids if cid in relevant_ids)
    return hits / len(top_k_ids)


def main() -> None:
    candidates = load_candidates()
    print(f"Loaded {len(candidates)} candidate profiles.\n")

    semantic = SemanticRanker()
    semantic.fit(candidates)
    tfidf = TfidfRanker()
    tfidf.fit(candidates)

    available_categories = sorted({c.category for c in candidates if c.category})

    for jd_filename, keywords in EVAL_JDS.items():
        jd_path = SAMPLE_JDS_DIR / jd_filename
        jd_text = jd_path.read_text(encoding="utf-8")
        job = JobDescription(title=jd_path.stem, raw_text=jd_text)

        relevant_ids = {
            c.candidate_id
            for c in candidates
            if c.category and any(kw in f" {c.category.lower()} " for kw in keywords)
        }
        if not relevant_ids:
            print(
                f"[{job.title}] No candidates matched keywords {keywords} — skipping.\n"
                f"  Available categories: {available_categories}"
            )
            continue

        print(f"[{job.title}] {len(relevant_ids)} relevant candidates (ground truth)")
        for k in K_VALUES:
            semantic_p = precision_at_k(semantic.rank(job, top_k=k), relevant_ids, k)
            tfidf_p = precision_at_k(tfidf.rank(job, top_k=k), relevant_ids, k)
            print(f"  Precision@{k}:  semantic={semantic_p:.2f}   tfidf={tfidf_p:.2f}")
        print()


if __name__ == "__main__":
    main()
