"""Parse resumes -> extract -> anonymize -> embed -> persist profiles + FAISS index.

Usage:
    python scripts/build_index.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from talent_ai.config import DATASET_RAW_DIR, FAISS_INDEX_PATH  # noqa: E402
from talent_ai.indexing import embed_profiles, persist_candidates, process_resume  # noqa: E402
from talent_ai.schemas import CandidateProfile  # noqa: E402


def build_profiles() -> list[CandidateProfile]:
    pdf_paths = sorted(DATASET_RAW_DIR.rglob("*.pdf"))
    if not pdf_paths:
        raise SystemExit(f"No PDFs found under {DATASET_RAW_DIR}. Run scripts/download_dataset.py first.")

    profiles: list[CandidateProfile] = []
    failed = 0

    for pdf_path in pdf_paths:
        profile = process_resume(pdf_path, category=pdf_path.parent.name, base_dir=DATASET_RAW_DIR)
        if profile is None:
            failed += 1
            continue
        profiles.append(profile)

    print(f"Parsed {len(profiles)}/{len(pdf_paths)} resumes successfully.")
    if failed:
        print(f"{failed} failure(s) — see warnings above for details.")

    return profiles


def main() -> None:
    profiles = build_profiles()
    if not profiles:
        raise SystemExit("No candidate profiles were successfully built.")

    embed_profiles(profiles)

    persist_candidates(profiles)
    print(f"Saved {len(profiles)} candidate profiles.")
    print(f"Saved FAISS index ({len(profiles)} vectors) to {FAISS_INDEX_PATH}")


if __name__ == "__main__":
    main()
