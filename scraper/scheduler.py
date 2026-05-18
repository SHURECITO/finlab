import asyncio
import logging
import os
import sys
from datetime import datetime, timezone

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

logger = logging.getLogger(__name__)

SCRAPE_CRON = os.getenv("SCRAPE_CRON", "0 2 * * *")


async def _scrape_entities(pw) -> None:
    """
    Scrape all entities sequentially. Reopens browser on crash and continues.
    Each entity failure marks stale=True only — does not stop the run.
    """
    from scrapers import ALL_SCRAPERS
    from db import upsert_entity_success, upsert_entity_stale

    browser = await pw.chromium.launch(headless=True)
    for scraper_cls in ALL_SCRAPERS:
        scraper = scraper_cls()
        page = None
        try:
            page = await browser.new_page()
        except Exception:
            logger.warning("[browser] crash detected, reopening for %s", scraper.code)
            try:
                await browser.close()
            except Exception:
                pass
            try:
                browser = await pw.chromium.launch(headless=True)
                page = await browser.new_page()
            except Exception as reopen_err:
                logger.error("[browser] cannot reopen: %s — stopping entity scrape", reopen_err)
                await upsert_entity_stale(scraper.code)
                break
        try:
            result = await scraper.scrape(page)
            if result is not None:
                await upsert_entity_success(result)
                logger.info("[entity] %s — updated, stale=False", scraper.code)
            else:
                await upsert_entity_stale(scraper.code)
                logger.warning("[entity] %s — parse returned None, marked stale", scraper.code)
        except Exception as e:
            logger.error("[entity] %s — error: %s — marking stale", scraper.code, e)
            try:
                await upsert_entity_stale(scraper.code)
            except Exception as db_err:
                logger.error("[entity] %s — also failed to mark stale: %s", scraper.code, db_err)
        finally:
            try:
                await page.close()
            except Exception:
                pass
    try:
        await browser.close()
    except Exception:
        pass


async def run_scrape_job() -> None:
    """
    Full scrape run:
      Phase A — fetch IBR/IPC from Banrep (required; logs error and returns on failure)
      Phase B — scrape entity pages with Playwright (best-effort; stale on failure)
    """
    from rates.banrep import fetch_reference_rates
    from db import upsert_rate
    from playwright.async_api import async_playwright

    logger.info("Scrape job started at %s", datetime.now(timezone.utc).isoformat())

    # Phase A: reference rates (required)
    try:
        rates = await fetch_reference_rates()
        for rate in rates:
            await upsert_rate(rate)
            logger.info("[rate] %s = %.4f", rate["indicator"], rate["value"])
    except Exception as e:
        logger.error("Reference rates fetch failed: %s — aborting run", e)
        return

    # Phase B: entity scrapers (best-effort)
    async with async_playwright() as pw:
        await _scrape_entities(pw)

    logger.info("Scrape job complete at %s", datetime.now(timezone.utc).isoformat())


def setup_scheduler() -> AsyncIOScheduler:
    scheduler = AsyncIOScheduler()
    scheduler.add_job(run_scrape_job, CronTrigger.from_crontab(SCRAPE_CRON))
    logger.info("Scheduler configured: cron=%s", SCRAPE_CRON)
    return scheduler


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    if "--run-now" in sys.argv:
        asyncio.run(run_scrape_job())
    else:
        print("Usage: python scheduler.py --run-now")
        sys.exit(1)
