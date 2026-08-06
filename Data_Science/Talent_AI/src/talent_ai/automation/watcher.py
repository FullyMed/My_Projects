"""Folder watcher for new resumes dropped into Dataset/Incoming/.

On a new PDF: parse -> extract -> anonymize -> embed -> append to the persisted
index (via indexing.py, the same steps build_index.py uses for the bulk dataset),
then move the file into Dataset/Raw/INCOMING/ so it becomes part of the permanent
corpus and a later full build_index.py rebuild naturally includes it.
"""

from __future__ import annotations

import logging
import shutil
import time
from pathlib import Path

from watchdog.events import FileSystemEventHandler

# PollingObserver, not the default native Observer: the default relies on OS-level
# filesystem events (inotify on Linux), which don't reliably propagate across a
# Docker-on-Windows/WSL2 bind mount for files written from the Windows-host side
# -- confirmed by live testing (file appeared in the container's filesystem but no
# watchdog event fired). Polling works everywhere at the cost of a small per-cycle
# stat() scan, which is negligible for a folder that isn't expected to hold
# thousands of files at once.
from watchdog.observers.polling import PollingObserver as Observer

from ..config import DATASET_INCOMING_DIR, DATASET_RAW_DIR
from ..embeddings.embedder import embed_texts
from ..indexing import append_candidate, process_resume

logger = logging.getLogger(__name__)

CATEGORY = "INCOMING"
PROCESSED_DIR = DATASET_RAW_DIR / CATEGORY
FAILED_DIR = DATASET_INCOMING_DIR / "_failed"

_STABILITY_CHECKS = 3
_STABILITY_INTERVAL_SECONDS = 0.5


def _wait_until_stable(path: Path) -> bool:
    """Poll file size until it stops changing (handles slow copies where
    on_created fires before the write finishes). Returns False if the file
    disappeared before stabilizing (e.g. a temp file that got renamed away)."""
    last_size = -1
    stable_checks = 0
    while stable_checks < _STABILITY_CHECKS:
        if not path.exists():
            return False
        size = path.stat().st_size
        if size == last_size:
            stable_checks += 1
        else:
            stable_checks = 0
            last_size = size
        time.sleep(_STABILITY_INTERVAL_SECONDS)
    return True


def process_incoming_pdf(pdf_path: Path) -> bool:
    """Process one PDF from Dataset/Incoming/. Returns True on success. Moves the
    file to Dataset/Raw/INCOMING/ on success, or Dataset/Incoming/_failed/ on
    failure -- either way it's out of Dataset/Incoming/ so it isn't reprocessed."""
    if not _wait_until_stable(pdf_path):
        logger.warning("File disappeared before stabilizing: %s", pdf_path)
        return False

    profile = process_resume(pdf_path, category=CATEGORY, base_dir=DATASET_INCOMING_DIR)
    if profile is None:
        FAILED_DIR.mkdir(parents=True, exist_ok=True)
        shutil.move(str(pdf_path), str(FAILED_DIR / pdf_path.name))
        logger.warning("Failed to process %s, moved to %s", pdf_path.name, FAILED_DIR)
        return False

    profile.embedding = embed_texts([profile.anonymized_text])[0].tolist()

    # Set source_path to its post-move destination *before* persisting, so the
    # saved record matches build_index.py's convention (path relative to
    # Dataset/Raw) instead of the pre-move Dataset/Incoming path.
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    dest = PROCESSED_DIR / pdf_path.name
    profile.source_path = str(dest.relative_to(DATASET_RAW_DIR))

    append_candidate(profile)
    shutil.move(str(pdf_path), str(dest))

    logger.info("Processed and indexed %s (candidate_id=%s)", pdf_path.name, profile.candidate_id)
    return True


class _IncomingResumeHandler(FileSystemEventHandler):
    def __init__(self) -> None:
        self._seen: set[str] = set()

    def _handle(self, path_str: str) -> None:
        path = Path(path_str)
        if path.suffix.lower() != ".pdf" or path_str in self._seen:
            return
        self._seen.add(path_str)
        try:
            process_incoming_pdf(path)
        except Exception:
            logger.exception("Unexpected error processing %s", path)

    def on_created(self, event) -> None:
        if not event.is_directory:
            self._handle(event.src_path)

    def on_moved(self, event) -> None:
        if not event.is_directory:
            self._handle(event.dest_path)


def start_watcher() -> Observer:
    """Starts watching Dataset/Incoming/ in a background thread. Caller is
    responsible for calling .stop() and .join() on the returned Observer."""
    DATASET_INCOMING_DIR.mkdir(parents=True, exist_ok=True)

    observer = Observer()
    observer.schedule(_IncomingResumeHandler(), str(DATASET_INCOMING_DIR), recursive=False)
    observer.start()
    logger.info("Watching %s for new resumes", DATASET_INCOMING_DIR)
    return observer
