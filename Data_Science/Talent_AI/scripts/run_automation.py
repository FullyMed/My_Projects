"""Automation daemon: folder watcher + scheduled re-ranking/reports/email.

Starts the Dataset/Incoming/ folder watcher (background thread) and a scheduled
ranking-cycle loop (main thread) together. Ctrl+C stops both cleanly.

Never calls the OpenAI API -- AI Insights stay on-demand in the dashboard.

Usage:
    python scripts/run_automation.py [--interval-minutes N] [--top-k N]
"""

import argparse
import logging
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from talent_ai.automation.scheduler import run_ranking_cycle  # noqa: E402
from talent_ai.automation.watcher import start_watcher  # noqa: E402
from talent_ai.config import SCHEDULE_INTERVAL_MINUTES  # noqa: E402

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("talent_ai.automation")


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the resume-intake watcher and scheduled ranking loop.")
    parser.add_argument("--interval-minutes", type=float, default=SCHEDULE_INTERVAL_MINUTES)
    parser.add_argument("--top-k", type=int, default=10)
    args = parser.parse_args()

    observer = start_watcher()

    logger.info("Scheduler running every %s minute(s). Press Ctrl+C to stop.", args.interval_minutes)
    try:
        while True:
            try:
                run_ranking_cycle(top_k=args.top_k)
            except Exception:
                logger.exception("Ranking cycle failed, will retry next interval")
            time.sleep(args.interval_minutes * 60)
    except KeyboardInterrupt:
        logger.info("Stopping...")
    finally:
        observer.stop()
        observer.join()


if __name__ == "__main__":
    main()
