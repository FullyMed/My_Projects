"""CLI: rank candidates against a job description.

Usage:
    python scripts/rank_candidates.py --jd scripts/sample_jds/information_technology.txt --top-k 10
"""

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from talent_ai.extraction.nlp_extractor import extract_skills  # noqa: E402
from talent_ai.matching.ranker import SemanticRanker  # noqa: E402
from talent_ai.schemas import JobDescription  # noqa: E402
from talent_ai.storage import load_candidates  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description="Rank candidates against a job description.")
    parser.add_argument("--jd", required=True, type=Path, help="Path to a job description text file")
    parser.add_argument("--top-k", type=int, default=10)
    args = parser.parse_args()

    jd_text = args.jd.read_text(encoding="utf-8")
    job = JobDescription(title=args.jd.stem, raw_text=jd_text, required_skills=extract_skills(jd_text))

    candidates = load_candidates()
    ranker = SemanticRanker()
    ranker.fit(candidates)
    results = ranker.rank(job, top_k=args.top_k)

    candidates_by_id = {c.candidate_id: c for c in candidates}

    print(f"Job: {job.title}")
    print(f"Required skills detected: {', '.join(job.required_skills) or '(none detected)'}\n")
    print(f"{'Rank':<5} {'Candidate ID':<15} {'Category':<24} {'Score':<7} Matched skills")
    for result in results:
        candidate = candidates_by_id[result.candidate_id]
        matched = sorted(set(candidate.skills) & set(job.required_skills))
        print(
            f"{result.rank:<5} {result.candidate_id:<15} {(candidate.category or ''):<24} "
            f"{result.score:<7.3f} {', '.join(matched) or '-'}"
        )


if __name__ == "__main__":
    main()
