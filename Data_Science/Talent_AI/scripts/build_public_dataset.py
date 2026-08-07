"""Build the PII-redacted candidate dataset committed to the repo for public
deployment (Streamlit Community Cloud can't run build_index.py itself -- no
Kaggle credentials, no local Dataset/Raw).

Every candidate's raw_text is overwritten with their already-anonymized text
before saving, so the committed file itself never contains real names/emails/
phone numbers -- see src/talent_ai/public_dataset.py for why this matters.

Usage:
    python scripts/build_public_dataset.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from talent_ai.config import PUBLIC_CANDIDATES_PARQUET  # noqa: E402
from talent_ai.public_dataset import redact_for_public  # noqa: E402
from talent_ai.storage import load_candidates, save_candidates  # noqa: E402


def main() -> None:
    candidates = load_candidates()
    public_candidates = [redact_for_public(c) for c in candidates]
    save_candidates(public_candidates, path=PUBLIC_CANDIDATES_PARQUET)

    size_mb = PUBLIC_CANDIDATES_PARQUET.stat().st_size / (1024 * 1024)
    print(f"Wrote {len(public_candidates)} redacted candidates to {PUBLIC_CANDIDATES_PARQUET} ({size_mb:.1f} MB)")


if __name__ == "__main__":
    main()
