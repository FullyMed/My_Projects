"""Streamlit recruiter dashboard.

Run with:
    streamlit run app/dashboard.py

Reuses the existing pipeline modules directly (no duplicated logic):
storage.load_candidates, matching.ranker/baseline, extraction.nlp_extractor,
insights.insight_generator. See CLAUDE.md "Key decisions" for why AI Insights are
on-demand per-candidate rather than auto-generated for the whole shortlist.
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

import pandas as pd
import streamlit as st

# Streamlit Community Cloud's "Secrets" UI populates st.secrets, not os.environ,
# but config.py (shared with local .env / Docker env vars) reads via
# os.environ.get(...) -- bridge secrets into the environment before
# talent_ai.config loads. No-op locally where no secrets.toml exists.
try:
    for _key, _value in st.secrets.items():
        os.environ.setdefault(_key, str(_value))
except Exception:
    pass

from talent_ai.analytics import skill_gap_analysis  # noqa: E402
from talent_ai.config import (  # noqa: E402
    APP_PASSWORD,
    CANDIDATES_PARQUET,
    OPENAI_API_KEY,
    PUBLIC_CANDIDATES_PARQUET,
    PUBLIC_DEPLOYMENT,
)
from talent_ai.extraction.nlp_extractor import extract_skills  # noqa: E402
from talent_ai.insights.insight_generator import generate_insights  # noqa: E402
from talent_ai.matching.baseline import TfidfRanker  # noqa: E402
from talent_ai.matching.ranker import SemanticRanker  # noqa: E402
from talent_ai.schemas import CandidateProfile, JobDescription, MatchResult  # noqa: E402
from talent_ai.storage import load_candidates  # noqa: E402

SAMPLE_JDS_DIR = Path(__file__).resolve().parents[1] / "scripts" / "sample_jds"

st.set_page_config(page_title="Talent_AI Dashboard", layout="wide")


@st.cache_resource(show_spinner="Loading candidate profiles...")
def _load_candidates_cached() -> list[CandidateProfile]:
    path = PUBLIC_CANDIDATES_PARQUET if PUBLIC_DEPLOYMENT else CANDIDATES_PARQUET
    return load_candidates(path)


@st.cache_resource(show_spinner="Fitting rankers...")
def _build_rankers(_candidates: list[CandidateProfile]) -> tuple[SemanticRanker, TfidfRanker]:
    semantic = SemanticRanker()
    semantic.fit(_candidates)
    tfidf = TfidfRanker()
    tfidf.fit(_candidates)
    return semantic, tfidf


@st.cache_data(show_spinner=False)
def _cached_insights(candidate_id: str, anonymized_text: str, skills: tuple, jd_title: str, jd_text: str):
    """Cache key is plain strings/tuples (not the pydantic models) so re-expanding a
    candidate or re-rendering doesn't re-call the OpenAI API for the same pair."""
    candidate = CandidateProfile(
        candidate_id=candidate_id,
        source_path="",
        raw_text=anonymized_text,
        anonymized_text=anonymized_text,
        skills=list(skills),
    )
    job = JobDescription(title=jd_title, raw_text=jd_text)
    return generate_insights(candidate, job)


def _results_to_dataframe(
    results: list[MatchResult], candidates_by_id: dict[str, CandidateProfile], required_skills: list[str]
) -> pd.DataFrame:
    rows = []
    for r in results:
        candidate = candidates_by_id[r.candidate_id]
        matched = sorted(set(candidate.skills) & set(required_skills))
        rows.append(
            {
                "Rank": r.rank,
                "Candidate ID": r.candidate_id,
                "Category": candidate.category,
                "Score": round(r.score, 3),
                "Matched Skills": ", ".join(matched) or "-",
            }
        )
    return pd.DataFrame(rows)


def _render_candidate_detail(result: MatchResult, candidate: CandidateProfile, job: JobDescription) -> None:
    with st.expander(f"#{result.rank} -- {candidate.candidate_id} ({candidate.category}) -- score {result.score:.3f}"):
        st.markdown("**Skills:** " + (", ".join(candidate.skills) or "(none detected)"))

        if candidate.education:
            st.markdown("**Education**")
            for line in candidate.education[:5]:
                st.markdown(f"- {line}")

        if candidate.experience:
            st.markdown("**Experience**")
            for line in candidate.experience[:5]:
                st.markdown(f"- {line}")

        if not PUBLIC_DEPLOYMENT:
            with st.expander("Raw resume text"):
                st.text(candidate.raw_text[:3000])

        st.divider()

        insights_locked = (
            PUBLIC_DEPLOYMENT and bool(APP_PASSWORD) and not st.session_state.get("insights_unlocked", False)
        )
        if not OPENAI_API_KEY:
            st.info("Set OPENAI_API_KEY in .env to enable AI Insights.")
        elif insights_locked:
            st.info("Enter the AI Insights password in the sidebar to enable this.")
        st.caption("Generating insights calls the OpenAI API (small real cost per click).")

        if st.button(
            "Generate AI Insights",
            key=f"insights_{candidate.candidate_id}",
            disabled=not OPENAI_API_KEY or insights_locked,
        ):
            try:
                with st.spinner("Calling OpenAI..."):
                    insights = _cached_insights(
                        candidate.candidate_id,
                        candidate.anonymized_text,
                        tuple(candidate.skills),
                        job.title,
                        job.raw_text,
                    )
            except Exception as exc:  # missing key, billing error, network issue, etc.
                st.error(f"Failed to generate insights: {exc}")
            else:
                st.markdown(f"**Summary:** {insights.summary}")

                st.markdown("**Strengths**")
                for item in insights.strengths:
                    st.markdown(f"- {item}")

                st.markdown("**Weaknesses**")
                for item in insights.weaknesses:
                    st.markdown(f"- {item}")

                st.markdown("**Missing qualifications**")
                for item in insights.missing_qualifications:
                    st.markdown(f"- {item}")

                st.markdown(f"**Hiring recommendation:** {insights.hiring_recommendation}")

                st.markdown("**Interview questions**")
                for item in insights.interview_questions:
                    st.markdown(f"- {item}")


def main() -> None:
    st.title("Talent_AI -- Recruiter Dashboard")
    st.caption("Semantic candidate matching, a TF-IDF baseline for comparison, and on-demand AI insights.")

    data_path = PUBLIC_CANDIDATES_PARQUET if PUBLIC_DEPLOYMENT else CANDIDATES_PARQUET
    if not data_path.exists():
        build_command = "build_public_dataset.py" if PUBLIC_DEPLOYMENT else "build_index.py"
        st.error(
            f"No processed candidate data found at `{data_path}`.\n\n"
            "Run this first from the project root:\n\n"
            f"```bash\npython scripts/{build_command}\n```"
        )
        st.stop()

    candidates = _load_candidates_cached()
    semantic_ranker, tfidf_ranker = _build_rankers(candidates)
    candidates_by_id = {c.candidate_id: c for c in candidates}
    categories = sorted({c.category for c in candidates if c.category})

    st.caption(f"{len(candidates)} candidate profiles loaded across {len(categories)} categories.")

    sample_jd_files = sorted(SAMPLE_JDS_DIR.glob("*.txt"))
    sample_jd_names = [p.stem.replace("_", " ").title() for p in sample_jd_files]

    with st.sidebar:
        if PUBLIC_DEPLOYMENT and APP_PASSWORD:
            st.header("AI Insights Access")
            entered_password = st.text_input("Password to enable AI Insights", type="password")
            st.session_state["insights_unlocked"] = entered_password == APP_PASSWORD

        st.header("Job Description")
        selected_idx = st.selectbox(
            "Sample job description", options=range(len(sample_jd_files)), format_func=lambda i: sample_jd_names[i]
        )
        custom_jd_text = st.text_area("...or paste your own JD (overrides the dropdown above)", height=150)

        st.header("Ranking")
        ranking_mode = st.radio(
            "Ranking mode", ["Semantic (recommended)", "TF-IDF baseline", "Compare both"]
        )
        top_k = st.slider("Top K candidates", min_value=5, max_value=25, value=10)

    if custom_jd_text.strip():
        jd_title, jd_text = "Custom JD", custom_jd_text
    else:
        jd_title = sample_jd_names[selected_idx]
        jd_text = sample_jd_files[selected_idx].read_text(encoding="utf-8")

    job = JobDescription(title=jd_title, raw_text=jd_text, required_skills=extract_skills(jd_text))

    st.subheader(f"Job: {job.title}")
    with st.expander("Job description text"):
        st.text(job.raw_text)
    st.caption(f"Required skills detected: {', '.join(job.required_skills) or '(none detected)'}")

    if ranking_mode == "Compare both":
        col1, col2 = st.columns(2)
        with col1:
            st.markdown("**Semantic ranking**")
            semantic_results = semantic_ranker.rank(job, top_k=top_k)
            st.dataframe(
                _results_to_dataframe(semantic_results, candidates_by_id, job.required_skills),
                hide_index=True,
                use_container_width=True,
            )
        with col2:
            st.markdown("**TF-IDF baseline ranking**")
            tfidf_results = tfidf_ranker.rank(job, top_k=top_k)
            st.dataframe(
                _results_to_dataframe(tfidf_results, candidates_by_id, job.required_skills),
                hide_index=True,
                use_container_width=True,
            )
        results = semantic_results
    else:
        ranker = semantic_ranker if ranking_mode.startswith("Semantic") else tfidf_ranker
        results = ranker.rank(job, top_k=top_k)
        st.dataframe(
            _results_to_dataframe(results, candidates_by_id, job.required_skills),
            hide_index=True,
            use_container_width=True,
        )

    st.subheader("Skill Gap Analysis")
    st.caption("Share of the current top-K shortlist missing each required skill -- higher means a bigger gap.")
    shortlist = [candidates_by_id[r.candidate_id] for r in results]
    gaps = skill_gap_analysis(shortlist, job.required_skills)
    if gaps:
        gap_df = pd.DataFrame(gaps, columns=["Skill", "Fraction Missing"])
        gap_df["% Missing"] = (gap_df["Fraction Missing"] * 100).round(1)
        st.bar_chart(gap_df.set_index("Skill")["% Missing"])
    else:
        st.caption("No required skills detected for this job description.")

    st.subheader("Candidate details")
    for result in results:
        _render_candidate_detail(result, candidates_by_id[result.candidate_id], job)


if __name__ == "__main__":
    main()
