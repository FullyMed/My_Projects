"""CLI: generate AI insights (summary, strengths/weaknesses, missing qualifications,
hiring recommendation, interview questions) for the top-K candidates against a job
description.

Deliberately scoped to the top-K shortlist, not the whole dataset — this mirrors
how a recruiter actually uses it, and keeps OpenAI API cost bounded regardless of
how many resumes are in Dataset/Raw.

Requires OPENAI_API_KEY in .env (copy .env.example -> .env and fill it in).

Usage:
    python scripts/generate_insights.py --jd scripts/sample_jds/information_technology.txt --top-k 5
"""

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from talent_ai.extraction.nlp_extractor import extract_skills  # noqa: E402
from talent_ai.insights.insight_generator import generate_insights  # noqa: E402
from talent_ai.matching.ranker import SemanticRanker  # noqa: E402
from talent_ai.schemas import JobDescription  # noqa: E402
from talent_ai.storage import load_candidates  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate AI insights for top-ranked candidates.")
    parser.add_argument("--jd", required=True, type=Path, help="Path to a job description text file")
    parser.add_argument("--top-k", type=int, default=5)
    args = parser.parse_args()

    jd_text = args.jd.read_text(encoding="utf-8")
    job = JobDescription(title=args.jd.stem, raw_text=jd_text, required_skills=extract_skills(jd_text))

    candidates = load_candidates()
    ranker = SemanticRanker()
    ranker.fit(candidates)
    results = ranker.rank(job, top_k=args.top_k)

    candidates_by_id = {c.candidate_id: c for c in candidates}

    all_insights = []
    for result in results:
        candidate = candidates_by_id[result.candidate_id]
        print(f"Generating insights for {candidate.candidate_id} (score={result.score:.3f})...")
        insights = generate_insights(candidate, job)
        all_insights.append(
            {"candidate_id": candidate.candidate_id, "score": result.score, **insights.model_dump()}
        )

        print(f"\n=== {candidate.candidate_id} ({candidate.category}) -- score {result.score:.3f} ===")
        print(f"Summary: {insights.summary}")
        print(f"Strengths: {', '.join(insights.strengths)}")
        print(f"Weaknesses: {', '.join(insights.weaknesses)}")
        print(f"Missing qualifications: {', '.join(insights.missing_qualifications)}")
        print(f"Recommendation: {insights.hiring_recommendation}")
        print("Interview questions:")
        for question in insights.interview_questions:
            print(f"  - {question}")
        print()

    out_path = Path(__file__).resolve().parents[1] / "Dataset" / "Processed" / f"insights_{job.title}.json"
    out_path.write_text(json.dumps(all_insights, indent=2), encoding="utf-8")
    print(f"Saved {len(all_insights)} insight report(s) to {out_path}")


if __name__ == "__main__":
    main()
