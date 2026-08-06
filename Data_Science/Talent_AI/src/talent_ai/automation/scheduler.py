"""Periodic re-ranking + report generation.

Only touches free, local ranking (SemanticRanker) -- never calls the OpenAI API.
AI Insights stay on-demand in the dashboard on purpose; automation must never be
able to silently rack up LLM cost on a timer. See CLAUDE.md "Key decisions".
"""

from __future__ import annotations

import logging
from datetime import datetime
from pathlib import Path

from ..config import CANDIDATES_PARQUET, REPORTS_DIR
from ..extraction.nlp_extractor import extract_skills
from ..matching.ranker import SemanticRanker
from ..schemas import CandidateProfile, JobDescription, MatchResult
from ..storage import load_candidates
from .notifier import send_report_email

logger = logging.getLogger(__name__)

SAMPLE_JDS_DIR = Path(__file__).resolve().parents[3] / "scripts" / "sample_jds"


def _write_report(
    job: JobDescription, results: list[MatchResult], candidates_by_id: dict[str, CandidateProfile]
) -> Path:
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_path = REPORTS_DIR / f"{job.title}_{timestamp}.md"

    lines = [
        f"# Ranking report: {job.title}",
        f"Generated {datetime.now().isoformat(timespec='seconds')}",
        "",
        f"Required skills detected: {', '.join(job.required_skills) or '(none detected)'}",
        "",
        "| Rank | Candidate ID | Category | Score | Matched Skills |",
        "|---|---|---|---|---|",
    ]
    for result in results:
        candidate = candidates_by_id[result.candidate_id]
        matched = sorted(set(candidate.skills) & set(job.required_skills))
        lines.append(
            f"| {result.rank} | {result.candidate_id} | {candidate.category or ''} "
            f"| {result.score:.3f} | {', '.join(matched) or '-'} |"
        )

    report_path.write_text("\n".join(lines), encoding="utf-8")
    return report_path


def run_ranking_cycle(top_k: int = 10) -> list[Path]:
    """Rank current candidates against every scripts/sample_jds/*.txt file (the
    recruiter's tracked job postings), write one timestamped report per JD, and
    email it if SMTP is configured. Returns the report paths written (empty if no
    index has been built yet -- run scripts/build_index.py, or let the watcher
    process the first incoming resume)."""
    if not CANDIDATES_PARQUET.exists():
        logger.warning("No candidate index yet (%s missing) -- skipping this cycle", CANDIDATES_PARQUET)
        return []

    candidates = load_candidates()
    ranker = SemanticRanker()
    ranker.fit(candidates)
    candidates_by_id = {c.candidate_id: c for c in candidates}

    jd_paths = sorted(SAMPLE_JDS_DIR.glob("*.txt"))
    written: list[Path] = []

    for jd_path in jd_paths:
        jd_text = jd_path.read_text(encoding="utf-8")
        job = JobDescription(title=jd_path.stem, raw_text=jd_text, required_skills=extract_skills(jd_text))

        results = ranker.rank(job, top_k=top_k)
        report_path = _write_report(job, results, candidates_by_id)
        written.append(report_path)
        logger.info("Wrote report %s (%d candidates ranked)", report_path.name, len(candidates))

        send_report_email(report_path, subject=f"Talent_AI ranking update: {job.title}")

    return written
