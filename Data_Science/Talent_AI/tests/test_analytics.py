from talent_ai.analytics import skill_gap_analysis
from talent_ai.schemas import CandidateProfile


def _candidate(candidate_id: str, skills: list[str]) -> CandidateProfile:
    return CandidateProfile(
        candidate_id=candidate_id,
        source_path=f"{candidate_id}.pdf",
        raw_text="text",
        anonymized_text="text",
        skills=skills,
    )


def test_skill_gap_analysis_computes_missing_fractions_and_sorts_descending():
    candidates = [
        _candidate("a", ["python", "sql"]),
        _candidate("b", ["python"]),
        _candidate("c", []),
        _candidate("d", ["python", "aws"]),
    ]
    required_skills = ["python", "sql", "aws"]

    result = skill_gap_analysis(candidates, required_skills)

    result_by_skill = dict(result)
    assert result_by_skill["python"] == 0.25  # only candidate c is missing it
    assert result_by_skill["sql"] == 0.75  # b, c, d missing it
    assert result_by_skill["aws"] == 0.75  # a, b, c missing it

    # most commonly missing first
    assert result[0][0] in {"sql", "aws"}
    assert result[0][1] == 0.75
    assert result[-1] == ("python", 0.25)


def test_skill_gap_analysis_handles_empty_inputs():
    assert skill_gap_analysis([], ["python"]) == []
    assert skill_gap_analysis([_candidate("a", ["python"])], []) == []
