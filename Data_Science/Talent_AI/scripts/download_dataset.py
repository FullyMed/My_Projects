"""Download the public Kaggle resume dataset into Dataset/Raw/<category>/*.pdf.

Requires your own Kaggle API credentials (free, per-user). Kaggle has two token
formats depending on when your account generated one — either works:
  - Newer API token (starts with "KGAT_"): save it to
      Windows: C:\\Users\\<you>\\.kaggle\\access_token
      macOS/Linux: ~/.kaggle/access_token
    (or set the KAGGLE_API_TOKEN environment variable instead)
  - Classic kaggle.json (Settings -> API -> "Create New Token"): save it to
      Windows: C:\\Users\\<you>\\.kaggle\\kaggle.json
      macOS/Linux: ~/.kaggle/kaggle.json
    (or set KAGGLE_USERNAME / KAGGLE_KEY environment variables instead)

Dataset: snehaanbhawal/resume-dataset
  Categorized resume PDFs (e.g. "Data Science", "Accountant", "HR", ...) plus a CSV
  of extracted text. We use the PDFs directly so the pipeline's own parsing/OCR code
  gets exercised, and keep the category folder name as a label for evaluation.
"""

import shutil
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from talent_ai.config import DATASET_RAW_DIR  # noqa: E402

DATASET_SLUG = "snehaanbhawal/resume-dataset"


def _has_kaggle_credentials() -> bool:
    import os

    if os.environ.get("KAGGLE_API_TOKEN"):
        return True
    if os.environ.get("KAGGLE_USERNAME") and os.environ.get("KAGGLE_KEY"):
        return True
    return (Path.home() / ".kaggle" / "kaggle.json").exists() or (
        Path.home() / ".kaggle" / "access_token"
    ).exists()


def main() -> None:
    if not _has_kaggle_credentials():
        print(
            "No Kaggle API credentials found.\n"
            "Set them up first (see the module docstring for both token formats):\n"
            "  1. https://www.kaggle.com/settings -> API -> Create New Token\n"
            "  2a. Newer token (starts with KGAT_): save it to "
            f"{Path.home() / '.kaggle' / 'access_token'}\n"
            "      (or set the KAGGLE_API_TOKEN env var)\n"
            "  2b. Classic kaggle.json: save it to "
            f"{Path.home() / '.kaggle' / 'kaggle.json'}\n"
            "      (or set KAGGLE_USERNAME / KAGGLE_KEY env vars)\n"
            "Then re-run this script.",
            file=sys.stderr,
        )
        sys.exit(1)

    import kagglehub

    print(f"Downloading '{DATASET_SLUG}' via kagglehub (cached after first run)...")
    cache_path = Path(kagglehub.dataset_download(DATASET_SLUG))
    print(f"Downloaded to cache: {cache_path}")

    pdf_files = list(cache_path.rglob("*.pdf"))
    if not pdf_files:
        print(f"No PDF files found under {cache_path} — dataset layout may have changed.", file=sys.stderr)
        sys.exit(1)

    copied = 0
    for pdf_path in pdf_files:
        category = pdf_path.parent.name
        dest_dir = DATASET_RAW_DIR / category
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest_path = dest_dir / pdf_path.name
        if not dest_path.exists():
            shutil.copy2(pdf_path, dest_path)
            copied += 1

    categories = sorted({p.parent.name for p in pdf_files})
    print(f"Copied {copied} new PDF(s) ({len(pdf_files)} total) into {DATASET_RAW_DIR}")
    print(f"Categories ({len(categories)}): {', '.join(categories)}")


if __name__ == "__main__":
    main()
