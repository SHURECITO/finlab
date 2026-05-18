# Phase 1 — Credit Rate Scraper: Design Spec
*Created: 2026-05-17*

## Purpose

A Python FastAPI microservice that keeps `financialEntities` and `referenceRates` in MongoDB Atlas up to date with real credit rate data. Runs as a second Railway service from the same GitHub repository. Eliminates reliance on the seed script's static values.

---

## Constraints

- All services remain on Railway (backend) and Vercel (frontend). No new platforms.
- No signed URLs, no new cloud providers, no GCS for this phase.
- Shared MongoDB Atlas cluster — same `MONGODB_URI` as the NestJS backend.
- Entity rate scraping is best-effort; failure marks `stale: true` and preserves existing data.
- Reference rate fetching (Banrep API) is required; if it fails, the run fails with a logged error.

---

## Directory Layout

```
scraper/                          # Railway service root
├── Dockerfile
├── requirements.txt
├── .env.example
├── main.py                       # FastAPI app + APScheduler startup
├── scheduler.py                  # APScheduler job wiring
├── db.py                         # motor async client + upsert helpers
├── rates/
│   └── banrep.py                 # IBR + IPC via Banrep public REST API (httpx)
├── scrapers/
│   ├── base.py                   # BaseEntityScraper ABC: scrape() -> EntityData | None
│   ├── bancolombia.py
│   ├── bbva.py
│   ├── banco_bogota.py
│   ├── sempli.py
│   ├── lulo_bank.py
│   └── r5.py
└── tests/
    ├── test_banrep.py             # mocked httpx, assert IBR/IPC extraction
    └── test_scrapers.py           # static HTML fixtures, mock Playwright Page
```

---

## Technology Stack

| Concern | Library |
|---|---|
| HTTP framework | FastAPI + uvicorn |
| Async MongoDB driver | motor |
| HTTP client (Banrep API) | httpx |
| Browser automation | playwright (async API) |
| Scheduler | APScheduler (AsyncIOScheduler) |
| Data validation | pydantic v2 |
| Testing | pytest + pytest-asyncio |
| Container base | `mcr.microsoft.com/playwright/python:v1.44.0-jammy` |

---

## Data Flow

### Phase A — Reference Rates (required)

`banrep.py` makes `httpx` GET calls to Banrep's public REST API.

Targets:
- `IBR_1M` — 1-month IBR rate
- `IBR_3M` — 3-month IBR rate
- `IBR_6M` — 6-month IBR rate
- `IPC_ANUAL` — annual CPI from Banrep or DANE

Each rate upserts to the `referenceRates` collection using `indicator` as the upsert key. Fields written: `value`, `unit`, `sourceDate` (today's date). The `updatedAt` timestamp comes from Mongoose's `timestamps: true`.

If Banrep's API is unreachable, the function raises an exception, the job logs the error and exits without writing anything. The existing seeded values stay in place.

### Phase B — Entity Rates (best-effort)

One Playwright `Browser` instance (Chromium, headless) is launched. Entities are scraped sequentially.

For each entity (`code` is the upsert key):

**On success:**
```python
await db.upsert_entity(code, {
    "products": [...],  # updated product list with new tasaEA, limits, plazos
    "stale": False,
    "updatedAt": datetime.utcnow()
})
```

**On failure (parse error, timeout, network error, selector not found):**
```python
await db.upsert_entity(code, {
    "stale": True,
    "updatedAt": datetime.utcnow()
})
```

The existing product data in MongoDB is not touched on failure — only the `stale` flag and `updatedAt` are written. The NestJS `credit-comparison.service.ts` already propagates `stale` to the frontend, which shows a banner.

The browser is closed after all 6 entities regardless of individual outcomes.

---

## BaseEntityScraper Interface

```python
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional
from playwright.async_api import Page

@dataclass
class EntityData:
    code: str
    name: str
    type: str          # 'banco' | 'fintech'
    logoUrl: str
    products: list[dict]

class BaseEntityScraper(ABC):
    url: str

    @abstractmethod
    async def scrape(self, page: Page) -> Optional[EntityData]:
        """Navigate to self.url and extract entity data. Return None on failure."""
```

Each concrete scraper (`BancolombiaScraper`, etc.) navigates to its URL, waits for the relevant DOM element, and extracts rate fields. If any selector is missing, it returns `None` (not raises) so the orchestrator can mark stale cleanly.

---

## Scheduling

APScheduler `AsyncIOScheduler` is configured at FastAPI startup:

```python
scheduler.add_job(run_scrape_job, CronTrigger.from_crontab(SCRAPE_CRON))
scheduler.start()
```

`SCRAPE_CRON` env var defaults to `"0 2 * * *"` (2 AM UTC nightly). On startup the job does NOT run immediately — it waits for the first scheduled time. This avoids hammering sites every time the service restarts.

---

## Deployment (Railway)

**Dockerfile:**
```dockerfile
FROM mcr.microsoft.com/playwright/python:v1.44.0-jammy
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
```

Chromium is pre-installed in the base image. No `playwright install` step needed.

**Railway service config:**
- Root Directory: `scraper`
- Port: `8080`
- Health check: `GET /health` → `{ "status": "ok" }`
- Environment variables: `MONGODB_URI` (same as backend), `SCRAPE_CRON` (optional)

---

## Manual Smoke Test

```bash
cd scraper
MONGODB_URI=... python -m pytest tests/ -v          # unit tests (no real network)
MONGODB_URI=... python scheduler.py --run-now       # full live run against real MongoDB
```

`--run-now` is a CLI flag on `scheduler.py` that runs the job once and exits. Used after a site layout change to validate the updated parser.

---

## Error Handling Summary

| Scenario | Behavior |
|---|---|
| Banrep API unreachable | Job fails, logs error, no writes |
| Entity page timeout | Entity marked `stale: true`, others continue |
| Entity selector missing | Entity marked `stale: true`, others continue |
| MongoDB write fails | Log error, continue to next entity |
| Playwright browser crash | Reopen browser, continue from next entity |

---

## Out of Scope

- No authentication on the FastAPI endpoints (the service has no user-facing API beyond `/health`)
- No rate-history tracking (each upsert overwrites the previous value)
- No notification/alerting on stale entities beyond the existing frontend banner
- No Phase 1 interaction with GCS (that belongs to Phase 4)
