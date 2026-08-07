"""Prepares a PII-safe copy of the candidate dataset for public deployment.

Streamlit Community Cloud can't run build_index.py (no Kaggle credentials, no
local Dataset/Raw), so the deployed dashboard needs some candidate data
committed to the repo. Committing the real candidates.parquet as-is would defeat
anonymize.py entirely -- it stores each candidate's full original raw_text
(names/emails/phones). redact_for_public overwrites raw_text with the already
PII-stripped anonymized_text, so the committed file itself never contains real
contact info, independent of anything the UI does or doesn't show.
"""

from __future__ import annotations

from .schemas import CandidateProfile


def redact_for_public(profile: CandidateProfile) -> CandidateProfile:
    return profile.model_copy(update={"raw_text": profile.anonymized_text})
