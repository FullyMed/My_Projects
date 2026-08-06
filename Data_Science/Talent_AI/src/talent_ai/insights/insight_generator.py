"""Generate AI candidate insights with a single structured LLM call per candidate:
summary, strengths/weaknesses, missing qualifications, hiring recommendation, and
personalized interview questions — combined into one call (cheaper and more
consistent than five separate calls).

Uses the anonymized resume text — the same PII-stripped text used for embedding in
Phase 1 — so names/emails/phone numbers are never sent to the OpenAI API.
"""

from __future__ import annotations

from ..schemas import CandidateProfile, JobDescription
from .llm_client import parse_structured
from .schemas import CandidateInsights

SYSTEM_PROMPT = (
    "You are an expert technical recruiter assistant. Evaluate how well a candidate "
    "fits a job description, based only on the resume text and job description "
    "provided. Be specific, concise, and evidence-based -- cite concrete skills or "
    "experience from the resume rather than generic statements. If the resume text "
    "is unclear or silent on a point, say so rather than guessing."
)

USER_PROMPT_TEMPLATE = """Job Description ({title}):
{jd_text}

Candidate Resume (anonymized):
{candidate_text}

Candidate's extracted skills: {skills}

Evaluate this candidate against the job description. Provide:
- A concise professional summary of the candidate
- Their key strengths relevant to this role
- Weaknesses or gaps relevant to this role
- Qualifications required by the job description that are missing from the resume
- A hiring recommendation with brief justification
- 3-5 personalized interview questions that probe the gaps/strengths you identified
"""


def generate_insights(candidate: CandidateProfile, job: JobDescription) -> CandidateInsights:
    user_prompt = USER_PROMPT_TEMPLATE.format(
        title=job.title,
        jd_text=job.raw_text,
        candidate_text=candidate.anonymized_text,
        skills=", ".join(candidate.skills) or "(none detected)",
    )
    return parse_structured(SYSTEM_PROMPT, user_prompt, CandidateInsights)
