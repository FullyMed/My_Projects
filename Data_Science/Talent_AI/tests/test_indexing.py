import fitz

from talent_ai import indexing, storage
from talent_ai.indexing import process_resume
from talent_ai.schemas import CandidateProfile


def _make_pdf(tmp_path, text: str, name: str = "resume.pdf"):
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((72, 72), text)
    pdf_path = tmp_path / name
    doc.save(pdf_path)
    doc.close()
    return pdf_path


def _candidate(candidate_id: str, embedding: list[float]) -> CandidateProfile:
    return CandidateProfile(
        candidate_id=candidate_id,
        source_path=f"{candidate_id}.pdf",
        raw_text="text",
        anonymized_text="text",
        embedding=embedding,
    )


def test_process_resume_returns_profile_with_extracted_skills(tmp_path):
    pdf_path = _make_pdf(tmp_path, "Jane Doe. Experienced with Python, SQL, and AWS.")

    profile = process_resume(pdf_path, category="TEST", base_dir=tmp_path)

    assert profile is not None
    assert profile.candidate_id == "resume"
    assert profile.category == "TEST"
    assert "python" in profile.skills
    assert "Jane Doe" not in profile.anonymized_text


def test_process_resume_returns_none_for_blank_pdf(tmp_path):
    doc = fitz.open()
    doc.new_page()
    pdf_path = tmp_path / "blank.pdf"
    doc.save(pdf_path)
    doc.close()

    assert process_resume(pdf_path, category="TEST", base_dir=tmp_path) is None


def test_persist_candidates_round_trips_through_storage(tmp_path, monkeypatch):
    parquet_path = tmp_path / "candidates.parquet"
    faiss_path = tmp_path / "candidates.faiss"
    monkeypatch.setattr(storage, "CANDIDATES_PARQUET", parquet_path)
    monkeypatch.setattr(indexing, "CANDIDATES_PARQUET", parquet_path)
    monkeypatch.setattr(indexing, "FAISS_INDEX_PATH", faiss_path)

    profiles = [_candidate("a", [1.0, 0.0]), _candidate("b", [0.0, 1.0])]
    indexing.persist_candidates(profiles)

    assert parquet_path.exists()
    assert faiss_path.exists()
    loaded = storage.load_candidates()
    assert {c.candidate_id for c in loaded} == {"a", "b"}


def test_append_candidate_builds_up_index_incrementally(tmp_path, monkeypatch):
    parquet_path = tmp_path / "candidates.parquet"
    faiss_path = tmp_path / "candidates.faiss"
    monkeypatch.setattr(storage, "CANDIDATES_PARQUET", parquet_path)
    monkeypatch.setattr(indexing, "CANDIDATES_PARQUET", parquet_path)
    monkeypatch.setattr(indexing, "FAISS_INDEX_PATH", faiss_path)

    updated = indexing.append_candidate(_candidate("first", [1.0, 0.0]))
    assert [c.candidate_id for c in updated] == ["first"]

    updated = indexing.append_candidate(_candidate("second", [0.0, 1.0]))
    assert {c.candidate_id for c in updated} == {"first", "second"}
