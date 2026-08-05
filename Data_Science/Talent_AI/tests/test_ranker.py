from talent_ai.matching.baseline import TfidfRanker
from talent_ai.matching.ranker import SemanticRanker
from talent_ai.schemas import CandidateProfile, JobDescription


def _candidate(candidate_id: str, text: str, embedding: list[float] | None = None) -> CandidateProfile:
    return CandidateProfile(
        candidate_id=candidate_id,
        source_path=f"{candidate_id}.pdf",
        raw_text=text,
        anonymized_text=text,
        embedding=embedding,
    )


def test_semantic_ranker_orders_by_cosine_similarity():
    candidates = [
        _candidate("a", "python developer", embedding=[1.0, 0.0]),
        _candidate("b", "chef", embedding=[0.0, 1.0]),
        _candidate("c", "software engineer python", embedding=[0.9, 0.1]),
    ]
    ranker = SemanticRanker()
    ranker.fit(candidates)

    results = ranker.rank_by_vector([1.0, 0.0], top_k=3)
    ordered_ids = [r.candidate_id for r in results]

    assert ordered_ids[0] == "a"
    assert ordered_ids[-1] == "b"


def test_tfidf_ranker_ranks_keyword_overlap_higher():
    candidates = [
        _candidate("a", "Experienced Python developer with Django and SQL."),
        _candidate("b", "Professional chef specializing in French cuisine."),
    ]
    ranker = TfidfRanker()
    ranker.fit(candidates)

    job = JobDescription(
        title="Python Developer",
        raw_text="Looking for a Python developer with Django experience.",
    )
    results = ranker.rank(job, top_k=2)

    assert results[0].candidate_id == "a"
