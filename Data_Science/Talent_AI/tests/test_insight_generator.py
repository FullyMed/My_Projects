from unittest.mock import patch

from talent_ai.insights.insight_generator import generate_insights
from talent_ai.insights.schemas import CandidateInsights
from talent_ai.schemas import CandidateProfile, JobDescription


def test_generate_insights_sends_anonymized_text_and_returns_parsed_model():
    candidate = CandidateProfile(
        candidate_id="c1",
        source_path="c1.pdf",
        category="INFORMATION-TECHNOLOGY",
        raw_text="Jane Doe, jane.doe@example.com. Experienced with Python, SQL, AWS.",
        anonymized_text="[NAME], [EMAIL]. Experienced with Python, SQL, AWS.",
        skills=["python", "sql", "aws"],
    )
    job = JobDescription(title="IT Specialist", raw_text="Looking for a Python/AWS engineer.")

    fake_insights = CandidateInsights(
        summary="Experienced IT professional with strong cloud skills.",
        strengths=["Python", "AWS"],
        weaknesses=["No leadership experience mentioned"],
        missing_qualifications=["Kubernetes"],
        hiring_recommendation="Recommend -- strong technical match.",
        interview_questions=["Describe a time you used AWS in production."],
    )

    with patch(
        "talent_ai.insights.insight_generator.parse_structured", return_value=fake_insights
    ) as mock_parse:
        result = generate_insights(candidate, job)

    assert result == fake_insights
    mock_parse.assert_called_once()

    _, user_prompt, response_model = mock_parse.call_args.args
    assert response_model is CandidateInsights
    assert "Jane Doe" not in user_prompt
    assert "jane.doe@example.com" not in user_prompt
    assert "[NAME]" in user_prompt
