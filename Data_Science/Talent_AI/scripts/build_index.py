"""Parse resumes -> extract -> anonymize -> embed -> persist profiles + FAISS index.

Usage:
    python scripts/build_index.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

import faiss
import numpy as np

from talent_ai.config import DATASET_RAW_DIR, FAISS_INDEX_PATH  # noqa: E402
from talent_ai.embeddings.embedder import embed_texts  # noqa: E402
from talent_ai.extraction.anonymize import anonymize_text  # noqa: E402
from talent_ai.extraction.nlp_extractor import extract_all  # noqa: E402
from talent_ai.parsing.resume_parser import extract_text  # noqa: E402
from talent_ai.schemas import CandidateProfile  # noqa: E402
from talent_ai.storage import save_candidates  # noqa: E402


def build_profiles() -> list[CandidateProfile]:
    pdf_paths = sorted(DATASET_RAW_DIR.rglob("*.pdf"))
    if not pdf_paths:
        raise SystemExit(f"No PDFs found under {DATASET_RAW_DIR}. Run scripts/download_dataset.py first.")

    profiles: list[CandidateProfile] = []
    failures: list[tuple[Path, str]] = []

    for pdf_path in pdf_paths:
        try:
            raw_text = extract_text(pdf_path)
            if not raw_text.strip():
                failures.append((pdf_path, "no text extracted"))
                continue

            anonymized_text = anonymize_text(raw_text)
            extracted = extract_all(raw_text)

            profiles.append(
                CandidateProfile(
                    candidate_id=pdf_path.stem,
                    source_path=str(pdf_path.relative_to(DATASET_RAW_DIR)),
                    category=pdf_path.parent.name,
                    raw_text=raw_text,
                    anonymized_text=anonymized_text,
                    skills=extracted["skills"],
                    education=extracted["education"],
                    experience=extracted["experience"],
                )
            )
        except Exception as exc:  # malformed PDF, etc. — skip and report, don't abort the batch
            failures.append((pdf_path, str(exc)))

    print(f"Parsed {len(profiles)}/{len(pdf_paths)} resumes successfully.")
    if failures:
        print(f"{len(failures)} failure(s):")
        for path, reason in failures[:20]:
            print(f"  - {path.name}: {reason}")

    return profiles


def embed_profiles(profiles: list[CandidateProfile]) -> None:
    embeddings = embed_texts([p.anonymized_text for p in profiles])
    for profile, embedding in zip(profiles, embeddings):
        profile.embedding = embedding.tolist()


def persist(profiles: list[CandidateProfile]) -> None:
    save_candidates(profiles)
    print(f"Saved {len(profiles)} candidate profiles.")

    embeddings = np.stack([np.asarray(p.embedding, dtype="float32") for p in profiles])
    index = faiss.IndexFlatIP(embeddings.shape[1])
    index.add(embeddings)
    faiss.write_index(index, str(FAISS_INDEX_PATH))
    print(f"Saved FAISS index ({index.ntotal} vectors) to {FAISS_INDEX_PATH}")


def main() -> None:
    profiles = build_profiles()
    if not profiles:
        raise SystemExit("No candidate profiles were successfully built.")
    embed_profiles(profiles)
    persist(profiles)


if __name__ == "__main__":
    main()
