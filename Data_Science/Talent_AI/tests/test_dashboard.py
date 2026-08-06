"""Smoke tests for the Streamlit dashboard, using the real (already-built)
Dataset/Processed/candidates.parquet rather than a mocked dataset -- keeps the test
simple and avoids re-deriving the CANDIDATES_PARQUET path the dashboard hardcodes.
generate_insights is still mocked so this suite never makes a real OpenAI call.
"""

from pathlib import Path
from unittest.mock import patch

import pytest
from streamlit.testing.v1 import AppTest

from talent_ai.config import CANDIDATES_PARQUET
from talent_ai.insights.schemas import CandidateInsights

DASHBOARD_PATH = Path(__file__).resolve().parents[1] / "app" / "dashboard.py"

pytestmark = pytest.mark.skipif(
    not CANDIDATES_PARQUET.exists(),
    reason="Run scripts/build_index.py first to build Dataset/Processed/candidates.parquet",
)


def test_dashboard_loads_and_renders_ranking_table():
    at = AppTest.from_file(str(DASHBOARD_PATH), default_timeout=60)
    at.run()

    assert not at.exception
    assert len(at.dataframe) >= 1
    assert len(at.dataframe[0].value) > 0


def test_dashboard_generates_ai_insights_on_button_click():
    fake_insights = CandidateInsights(
        summary="Strong candidate overall.",
        strengths=["Python", "SQL"],
        weaknesses=["Limited cloud experience"],
        missing_qualifications=["Kubernetes"],
        hiring_recommendation="Recommend for a technical interview.",
        interview_questions=["Describe a challenging debugging experience."],
    )

    at = AppTest.from_file(str(DASHBOARD_PATH), default_timeout=60)
    at.run()
    assert not at.exception
    assert len(at.button) >= 1

    with patch("talent_ai.insights.insight_generator.generate_insights", return_value=fake_insights):
        at.button[0].click().run()

    assert not at.exception
    rendered = "\n".join(m.value for m in at.markdown)
    assert "Strong candidate overall." in rendered
    assert "Kubernetes" in rendered
