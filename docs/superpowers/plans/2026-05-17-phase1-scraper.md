# Phase 1 — Credit Rate Scraper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Python FastAPI microservice in `scraper/` that fetches IBR/IPC rates from Banrep and scrapes entity credit rates via Playwright, then upserts them into the shared MongoDB Atlas collections (`financialEntities`, `referenceRates`).

**Architecture:** FastAPI provides the `/health` endpoint Railway needs; APScheduler runs the nightly scrape job inside the same process. Reference rates (IBR/IPC) are fetched from Banrep's public statistics page via `httpx`. Entity rates are scraped with Playwright (headless Chromium) and parsed with BeautifulSoup. Each entity parser is a pure `_parse(html) -> EntityData | None` method — testable without a browser. MongoDB writes go through `motor` (async driver). Failed entity scrapes mark `stale: true`; successful ones write full product data.

**Tech Stack:** Python 3.11, FastAPI 0.111, uvicorn, motor 3.4, httpx 0.27, playwright 1.44, APScheduler 3.10, beautifulsoup4 4.12, pydantic 2.7, pytest + pytest-asyncio. Base image: `mcr.microsoft.com/playwright/python:v1.44.0-jammy` (Chromium pre-installed).

**IMPORTANT — landing page:** This service is `scraper/` only. It does not touch `app/` (Next.js frontend) or `backend/src/` (NestJS). Zero changes to any frontend file.

---

## File Map

| File | Responsibility |
|---|---|
| `scraper/Dockerfile` | Railway container build |
| `scraper/requirements.txt` | Pinned Python deps |
| `scraper/.env.example` | Required env vars documentation |
| `scraper/main.py` | FastAPI app, `/health`, lifespan (scheduler start/stop) |
| `scraper/scheduler.py` | `run_scrape_job()` orchestrator + APScheduler setup + `--run-now` CLI |
| `scraper/db.py` | motor client, `upsert_rate()`, `upsert_entity_success()`, `upsert_entity_stale()` |
| `scraper/rates/__init__.py` | Empty |
| `scraper/rates/banrep.py` | `fetch_reference_rates()` via httpx + BeautifulSoup |
| `scraper/scrapers/__init__.py` | `ALL_SCRAPERS` list export |
| `scraper/scrapers/base.py` | `EntityData` dataclass + `BaseEntityScraper` ABC |
| `scraper/scrapers/bancolombia.py` | `BancolombiaScraper` |
| `scraper/scrapers/bbva.py` | `BBVAScraper` |
| `scraper/scrapers/banco_bogota.py` | `BancoBogotaScraper` |
| `scraper/scrapers/sempli.py` | `SempliScraper` |
| `scraper/scrapers/lulo_bank.py` | `LuloBankScraper` |
| `scraper/scrapers/r5.py` | `R5Scraper` |
| `scraper/tests/__init__.py` | Empty |
| `scraper/tests/fixtures/bancolombia.html` | Fixture for Bancolombia parser tests |
| `scraper/tests/fixtures/bbva.html` | Fixture for BBVA parser tests |
| `scraper/tests/fixtures/banco_bogota.html` | Fixture for Banco de Bogotá parser tests |
| `scraper/tests/fixtures/sempli.html` | Fixture for Sempli parser tests |
| `scraper/tests/fixtures/lulo_bank.html` | Fixture for Lulo Bank parser tests |
| `scraper/tests/fixtures/r5.html` | Fixture for R5 parser tests |
| `scraper/tests/test_banrep.py` | Unit tests for Banrep rate parsing |
| `scraper/tests/test_scrapers.py` | Unit tests for all 6 entity parsers |

---

## Task 1: Project Scaffold

**Files:**
- Create: `scraper/Dockerfile`
- Create: `scraper/requirements.txt`
- Create: `scraper/.env.example`
- Create: `scraper/main.py`
- Create: `scraper/rates/__init__.py`
- Create: `scraper/scrapers/__init__.py` (placeholder, updated in Task 4)
- Create: `scraper/tests/__init__.py`

- [ ] **Step 1: Create `scraper/requirements.txt`**

```
fastapi==0.111.0
uvicorn[standard]==0.29.0
motor==3.4.0
httpx==0.27.0
playwright==1.44.0
APScheduler==3.10.4
beautifulsoup4==4.12.3
pydantic==2.7.1
pytest==8.2.0
pytest-asyncio==0.23.6
```

- [ ] **Step 2: Create `scraper/Dockerfile`**

```dockerfile
FROM mcr.microsoft.com/playwright/python:v1.44.0-jammy
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
```

- [ ] **Step 3: Create `scraper/.env.example`**

```
# Required
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/finlab

# Optional — cron expression for the nightly scrape job (default: 2 AM UTC)
SCRAPE_CRON=0 2 * * *
```

- [ ] **Step 4: Create `scraper/main.py`**

```python
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI

@asynccontextmanager
async def lifespan(app: FastAPI):
    from scheduler import setup_scheduler
    scheduler = setup_scheduler()
    scheduler.start()
    yield
    scheduler.shutdown()

app = FastAPI(lifespan=lifespan)

@app.get("/health")
async def health():
    return {"status": "ok"}
```

- [ ] **Step 5: Create empty `__init__.py` files**

Create these three empty files:
- `scraper/rates/__init__.py`
- `scraper/scrapers/__init__.py`  
- `scraper/tests/__init__.py`

- [ ] **Step 6: Verify FastAPI starts**

```bash
cd scraper
pip install -r requirements.txt
MONGODB_URI=placeholder uvicorn main:app --port 8080
```

Expected: Server starts, logs `Application startup complete`. Hit Ctrl+C.

(The scheduler will fail because `scheduler.py` doesn't exist yet — that's OK, next task will fix it but for now you can comment out the import temporarily to test the health endpoint.)

- [ ] **Step 7: Create temporary `scraper/scheduler.py` stub so `main.py` loads**

```python
from apscheduler.schedulers.asyncio import AsyncIOScheduler

def setup_scheduler() -> AsyncIOScheduler:
    return AsyncIOScheduler()
```

- [ ] **Step 8: Commit scaffold**

```bash
cd scraper
# from repo root:
git add scraper/
git commit -m "feat(scraper): project scaffold — Dockerfile, FastAPI health endpoint, deps"
```

---

## Task 2: Database Layer

**Files:**
- Create: `scraper/db.py`
- Create: `scraper/tests/test_db.py`

- [ ] **Step 1: Write the failing tests**

Create `scraper/tests/test_db.py`:

```python
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime, timezone

@pytest.mark.asyncio
async def test_upsert_rate_calls_find_one_and_update():
    mock_collection = AsyncMock()
    mock_db = MagicMock()
    mock_db.__getitem__ = MagicMock(return_value=mock_collection)

    with patch("db.get_db", return_value=mock_db):
        from db import upsert_rate
        await upsert_rate({"indicator": "IBR_1M", "value": 0.1065, "unit": "EA", "sourceDate": datetime.now(timezone.utc)})

    mock_collection.find_one_and_update.assert_called_once()
    call_args = mock_collection.find_one_and_update.call_args
    assert call_args[0][0] == {"indicator": "IBR_1M"}
    assert call_args[0][1]["$set"]["value"] == 0.1065

@pytest.mark.asyncio
async def test_upsert_entity_success_writes_stale_false():
    mock_collection = AsyncMock()
    mock_db = MagicMock()
    mock_db.__getitem__ = MagicMock(return_value=mock_collection)

    class FakeEntityData:
        code = "bancolombia"
        name = "Bancolombia"
        type = "banco"
        logo_url = "https://example.com/logo.svg"
        products = [{"productName": "Test", "tasaEA": 0.25}]

    with patch("db.get_db", return_value=mock_db):
        from db import upsert_entity_success
        await upsert_entity_success(FakeEntityData())

    call_args = mock_collection.find_one_and_update.call_args
    assert call_args[0][0] == {"code": "bancolombia"}
    assert call_args[0][1]["$set"]["stale"] is False
    assert call_args[1]["upsert"] is True

@pytest.mark.asyncio
async def test_upsert_entity_stale_does_not_upsert():
    mock_collection = AsyncMock()
    mock_db = MagicMock()
    mock_db.__getitem__ = MagicMock(return_value=mock_collection)

    with patch("db.get_db", return_value=mock_db):
        from db import upsert_entity_stale
        await upsert_entity_stale("bancolombia")

    call_args = mock_collection.find_one_and_update.call_args
    # upsert=False — must not create new documents
    assert call_args[1]["upsert"] is False
    assert call_args[0][1]["$set"]["stale"] is True
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd scraper
python -m pytest tests/test_db.py -v
```

Expected: `ImportError: No module named 'db'`

- [ ] **Step 3: Implement `scraper/db.py`**

```python
import os
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

_client: AsyncIOMotorClient | None = None

def get_db() -> AsyncIOMotorDatabase:
    global _client
    if _client is None:
        uri = os.environ["MONGODB_URI"]
        _client = AsyncIOMotorClient(uri)
    return _client.get_default_database()

async def upsert_rate(rate: dict) -> None:
    db = get_db()
    now = datetime.now(timezone.utc)
    await db["referenceRates"].find_one_and_update(
        {"indicator": rate["indicator"]},
        {"$set": {**rate, "updatedAt": now}},
        upsert=True,
    )

async def upsert_entity_success(data) -> None:
    """data is an EntityData from scrapers/base.py"""
    db = get_db()
    now = datetime.now(timezone.utc)
    await db["financialEntities"].find_one_and_update(
        {"code": data.code},
        {"$set": {
            "name": data.name,
            "type": data.type,
            "logoUrl": data.logo_url,
            "products": data.products,
            "stale": False,
            "updatedAt": now,
        }},
        upsert=True,
    )

async def upsert_entity_stale(code: str) -> None:
    db = get_db()
    now = datetime.now(timezone.utc)
    await db["financialEntities"].find_one_and_update(
        {"code": code},
        {"$set": {"stale": True, "updatedAt": now}},
        upsert=False,
    )
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd scraper
python -m pytest tests/test_db.py -v
```

Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add scraper/db.py scraper/tests/test_db.py
git commit -m "feat(scraper): database layer — motor upsert helpers for rates and entities"
```

---

## Task 3: Reference Rates Fetcher

**Files:**
- Create: `scraper/rates/banrep.py`
- Create: `scraper/tests/test_banrep.py`

**Context — Banrep data sources:**

IBR rates (1M, 3M, 6M) are published on Banrep's indicators page. The scraper fetches the HTML table from `https://www.banrep.gov.co/es/estadisticas/tasas-interes-indicativas` using `httpx`. The page is server-rendered (Drupal CMS — no JS needed).

IPC_ANUAL is the 12-month CPI variation, published on `https://www.banrep.gov.co/es/estadisticas/inflacion-al-consumidor`. Alternatively, if Banrep changes the page structure, DANE's IPC page is a fallback.

The Banrep statistics pages render an HTML table with a date and rate value. BeautifulSoup extracts the most recent row.

- [ ] **Step 1: Write the failing tests**

Create `scraper/tests/test_banrep.py`:

```python
import pytest
from unittest.mock import AsyncMock, patch
from rates.banrep import _parse_ibr_html, _parse_ipc_html

# Representative snippet of Banrep's IBR table HTML
IBR_FIXTURE = """
<html><body>
<table class="views-table">
  <thead><tr><th>Fecha</th><th>IBR overnight</th><th>IBR 1 mes</th><th>IBR 3 meses</th><th>IBR 6 meses</th></tr></thead>
  <tbody>
    <tr>
      <td>2025-05-16</td>
      <td>10.50%</td>
      <td>10.65%</td>
      <td>10.71%</td>
      <td>10.82%</td>
    </tr>
  </tbody>
</table>
</body></html>
"""

IPC_FIXTURE = """
<html><body>
<table class="views-table">
  <thead><tr><th>Mes</th><th>Variación anual</th></tr></thead>
  <tbody>
    <tr><td>Abr 2025</td><td>5.68%</td></tr>
  </tbody>
</table>
</body></html>
"""

def test_parse_ibr_html_returns_three_rates():
    rates = _parse_ibr_html(IBR_FIXTURE)
    assert len(rates) == 3
    indicators = {r["indicator"] for r in rates}
    assert indicators == {"IBR_1M", "IBR_3M", "IBR_6M"}

def test_parse_ibr_html_values():
    rates = _parse_ibr_html(IBR_FIXTURE)
    by_indicator = {r["indicator"]: r for r in rates}
    assert by_indicator["IBR_1M"]["value"] == pytest.approx(0.1065, abs=0.0001)
    assert by_indicator["IBR_3M"]["value"] == pytest.approx(0.1071, abs=0.0001)
    assert by_indicator["IBR_6M"]["value"] == pytest.approx(0.1082, abs=0.0001)

def test_parse_ibr_html_unit_is_EA():
    rates = _parse_ibr_html(IBR_FIXTURE)
    for r in rates:
        assert r["unit"] == "EA"

def test_parse_ipc_html_returns_ipc_anual():
    rate = _parse_ipc_html(IPC_FIXTURE)
    assert rate["indicator"] == "IPC_ANUAL"
    assert rate["value"] == pytest.approx(0.0568, abs=0.0001)
    assert rate["unit"] == "EA"

def test_parse_ibr_html_raises_on_empty_table():
    with pytest.raises(ValueError, match="IBR"):
        _parse_ibr_html("<html><body><table></table></body></html>")

def test_parse_ipc_html_raises_on_empty_table():
    with pytest.raises(ValueError, match="IPC"):
        _parse_ipc_html("<html><body><table></table></body></html>")
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd scraper
python -m pytest tests/test_banrep.py -v
```

Expected: `ImportError: cannot import name '_parse_ibr_html'`

- [ ] **Step 3: Implement `scraper/rates/banrep.py`**

```python
import re
from datetime import datetime, timezone
import httpx
from bs4 import BeautifulSoup

IBR_URL = "https://www.banrep.gov.co/es/estadisticas/tasas-interes-indicativas"
IPC_URL = "https://www.banrep.gov.co/es/estadisticas/inflacion-al-consumidor"

_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    )
}

def _parse_percent(text: str) -> float:
    """Extract a percentage value from text like '10.65%' → 0.1065."""
    match = re.search(r"(\d{1,3}(?:[.,]\d+)?)\s*%", text)
    if not match:
        raise ValueError(f"No percentage found in: {text!r}")
    return float(match.group(1).replace(",", ".")) / 100

def _parse_ibr_html(html: str) -> list[dict]:
    """
    Parse the most recent IBR row from Banrep's tasas-interes-indicativas HTML.
    Returns list of 3 dicts: IBR_1M, IBR_3M, IBR_6M.
    Column order: overnight | 1 mes | 3 meses | 6 meses (index 1, 2, 3 in data row).
    """
    soup = BeautifulSoup(html, "html.parser")
    rows = soup.select("table tbody tr")
    if not rows:
        raise ValueError("IBR table has no data rows")
    # Most recent row is first
    cells = rows[0].find_all("td")
    if len(cells) < 4:
        raise ValueError(f"IBR row has {len(cells)} cells, expected ≥ 4")
    today = datetime.now(timezone.utc)
    return [
        {"indicator": "IBR_1M",  "value": _parse_percent(cells[1].get_text()), "unit": "EA", "sourceDate": today},
        {"indicator": "IBR_3M",  "value": _parse_percent(cells[2].get_text()), "unit": "EA", "sourceDate": today},
        {"indicator": "IBR_6M",  "value": _parse_percent(cells[3].get_text()), "unit": "EA", "sourceDate": today},
    ]

def _parse_ipc_html(html: str) -> dict:
    """
    Parse the most recent IPC_ANUAL (variación anual) from Banrep's inflacion page.
    Returns a single rate dict.
    """
    soup = BeautifulSoup(html, "html.parser")
    rows = soup.select("table tbody tr")
    if not rows:
        raise ValueError("IPC table has no data rows")
    cells = rows[0].find_all("td")
    # Variación anual is the second column (index 1)
    if len(cells) < 2:
        raise ValueError(f"IPC row has {len(cells)} cells, expected ≥ 2")
    today = datetime.now(timezone.utc)
    return {
        "indicator": "IPC_ANUAL",
        "value": _parse_percent(cells[1].get_text()),
        "unit": "EA",
        "sourceDate": today,
    }

async def fetch_reference_rates() -> list[dict]:
    """
    Fetch IBR (1M, 3M, 6M) and IPC_ANUAL from Banrep's public statistics pages.
    Raises on network error or parse failure — caller should abort the scrape run.
    """
    async with httpx.AsyncClient(headers=_HEADERS, timeout=30) as client:
        ibr_resp = await client.get(IBR_URL)
        ibr_resp.raise_for_status()
        ipc_resp = await client.get(IPC_URL)
        ipc_resp.raise_for_status()

    ibr_rates = _parse_ibr_html(ibr_resp.text)
    ipc_rate = _parse_ipc_html(ipc_resp.text)
    return ibr_rates + [ipc_rate]
```

**Note for implementer:** Banrep periodically redesigns their statistics pages. If these tests pass but the live `fetch_reference_rates()` returns incorrect values after deployment, inspect the actual HTML from the live page and adjust the CSS selector in `_parse_ibr_html`/`_parse_ipc_html` (the `soup.select()` call). The parsing logic itself (`_parse_percent`) will not need to change.

- [ ] **Step 4: Run tests — must pass**

```bash
cd scraper
python -m pytest tests/test_banrep.py -v
```

Expected: 6 passed.

- [ ] **Step 5: Commit**

```bash
git add scraper/rates/banrep.py scraper/tests/test_banrep.py
git commit -m "feat(scraper): Banrep reference rates fetcher — IBR 1M/3M/6M + IPC_ANUAL"
```

---

## Task 4: Scraper Base + Bancolombia

**Files:**
- Create: `scraper/scrapers/base.py`
- Create: `scraper/scrapers/bancolombia.py`
- Create: `scraper/tests/fixtures/bancolombia.html`
- Update: `scraper/scrapers/__init__.py`
- Create: `scraper/tests/test_scrapers.py` (first test)

- [ ] **Step 1: Implement `scraper/scrapers/base.py`**

```python
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Optional
from playwright.async_api import Page

@dataclass
class EntityData:
    code: str
    name: str
    type: str       # "banco" | "fintech"
    logo_url: str
    products: list[dict] = field(default_factory=list)

class BaseEntityScraper(ABC):
    """
    Base class for entity rate scrapers.
    Subclasses define class-level attributes (code, name, type, logo_url, url)
    and implement _parse(html) -> Optional[EntityData].
    """
    code: str
    name: str
    type: str
    logo_url: str
    url: str

    async def scrape(self, page: Page) -> Optional[EntityData]:
        """Navigate to self.url and return EntityData, or None on any failure."""
        try:
            await page.set_extra_http_headers({
                "User-Agent": (
                    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
                )
            })
            await page.goto(self.url, wait_until="networkidle", timeout=30000)
            html = await page.content()
            return self._parse(html)
        except Exception as e:
            print(f"[{self.code}] scrape error: {e}")
            return None

    @abstractmethod
    def _parse(self, html: str) -> Optional[EntityData]:
        """
        Extract EntityData from rendered page HTML.
        Return None if the rate cannot be found.
        Do NOT raise — return None instead.
        """
```

- [ ] **Step 2: Create `scraper/tests/fixtures/bancolombia.html`**

```html
<!DOCTYPE html>
<html>
<head><title>Crédito de Libre Inversión - Bancolombia</title></head>
<body>
  <section class="producto-tasas">
    <h2>Condiciones del crédito</h2>
    <p>Tasa de interés: <strong>25,00% E.A.</strong></p>
    <p>Monto desde $1.000.000 hasta $500.000.000</p>
    <p>Plazo: 48 a 84 meses</p>
  </section>
</body>
</html>
```

- [ ] **Step 3: Write the failing test for Bancolombia**

Create `scraper/tests/test_scrapers.py`:

```python
import pytest
from pathlib import Path

FIXTURES = Path(__file__).parent / "fixtures"

def load(name: str) -> str:
    return (FIXTURES / name).read_text(encoding="utf-8")

class TestBancolombia:
    def setup_method(self):
        from scrapers.bancolombia import BancolombiaScraper
        self.scraper = BancolombiaScraper()

    def test_parse_extracts_rate(self):
        result = self.scraper._parse(load("bancolombia.html"))
        assert result is not None
        assert result.code == "bancolombia"
        assert result.products[0]["tasaEA"] == pytest.approx(0.25, abs=0.001)

    def test_parse_returns_none_when_no_rate(self):
        result = self.scraper._parse("<html><body><p>Sin información</p></body></html>")
        assert result is None

    def test_parse_product_fields(self):
        result = self.scraper._parse(load("bancolombia.html"))
        p = result.products[0]
        assert p["tasaType"] == "EA"
        assert p["montoMinimo"] == 1_000_000
        assert p["montoMaximo"] == 500_000_000
        assert p["plazoMinMeses"] == 48
        assert p["plazoMaxMeses"] == 84
```

- [ ] **Step 4: Run test to confirm it fails**

```bash
cd scraper
python -m pytest tests/test_scrapers.py::TestBancolombia -v
```

Expected: `ImportError: cannot import name 'BancolombiaScraper'`

- [ ] **Step 5: Implement `scraper/scrapers/bancolombia.py`**

```python
import re
from typing import Optional
from bs4 import BeautifulSoup
from .base import BaseEntityScraper, EntityData

class BancolombiaScraper(BaseEntityScraper):
    code = "bancolombia"
    name = "Bancolombia"
    type = "banco"
    logo_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Bancolombia_logo.svg/1200px-Bancolombia_logo.svg.png"
    url = "https://www.bancolombia.com/personas/prestamos/credito-libre-inversion"

    def _parse(self, html: str) -> Optional[EntityData]:
        soup = BeautifulSoup(html, "html.parser")
        text = soup.get_text(" ")
        match = re.search(r"(\d{1,2}(?:[.,]\d+)?)\s*%\s*E\.?A\.?", text, re.IGNORECASE)
        if not match:
            return None
        tasa_ea = float(match.group(1).replace(",", ".")) / 100
        return EntityData(
            code=self.code,
            name=self.name,
            type=self.type,
            logo_url=self.logo_url,
            products=[{
                "productName": "Crédito de Libre Inversión",
                "tasaEA": tasa_ea,
                "tasaType": "EA",
                "montoMinimo": 1_000_000,
                "montoMaximo": 500_000_000,
                "plazoMinMeses": 48,
                "plazoMaxMeses": 84,
                "requisitos": [],
                "sourceUrl": self.url,
            }],
        )
```

- [ ] **Step 6: Update `scraper/scrapers/__init__.py`**

```python
from .bancolombia import BancolombiaScraper

ALL_SCRAPERS = [BancolombiaScraper]
```

- [ ] **Step 7: Run tests — must pass**

```bash
cd scraper
python -m pytest tests/test_scrapers.py::TestBancolombia -v
```

Expected: 3 passed.

- [ ] **Step 8: Commit**

```bash
git add scraper/scrapers/base.py scraper/scrapers/bancolombia.py \
        scraper/scrapers/__init__.py \
        scraper/tests/fixtures/bancolombia.html scraper/tests/test_scrapers.py
git commit -m "feat(scraper): BaseEntityScraper + Bancolombia parser"
```

---

## Task 5: BBVA + Banco de Bogotá Scrapers

**Files:**
- Create: `scraper/scrapers/bbva.py`
- Create: `scraper/scrapers/banco_bogota.py`
- Create: `scraper/tests/fixtures/bbva.html`
- Create: `scraper/tests/fixtures/banco_bogota.html`
- Update: `scraper/scrapers/__init__.py`
- Update: `scraper/tests/test_scrapers.py` (add test classes)

- [ ] **Step 1: Create fixture `scraper/tests/fixtures/bbva.html`**

```html
<!DOCTYPE html>
<html>
<head><title>Préstamo Vehículo - BBVA Colombia</title></head>
<body>
  <div class="detail-rate">
    <span class="label">Tasa desde</span>
    <span class="value">17,88% E.A.</span>
  </div>
  <div class="detail-amount">
    <p>Montos entre $3.000.000 y $200.000.000</p>
    <p>Plazo: de 12 a 84 meses</p>
  </div>
</body>
</html>
```

- [ ] **Step 2: Create fixture `scraper/tests/fixtures/banco_bogota.html`**

```html
<!DOCTYPE html>
<html>
<head><title>Crédito Libre Inversión - Banco de Bogotá</title></head>
<body>
  <div class="tasa-credito">
    <p class="tasa-valor">25,34% E.A.</p>
    <p>Monto: desde $1.000.000 hasta $500.000.000</p>
    <p>Plazo: 24 a 72 meses</p>
  </div>
</body>
</html>
```

- [ ] **Step 3: Add failing tests for BBVA and Banco de Bogotá**

Append to `scraper/tests/test_scrapers.py`:

```python
class TestBBVA:
    def setup_method(self):
        from scrapers.bbva import BBVAScraper
        self.scraper = BBVAScraper()

    def test_parse_extracts_rate(self):
        result = self.scraper._parse(load("bbva.html"))
        assert result is not None
        assert result.code == "bbva"
        assert result.products[0]["tasaEA"] == pytest.approx(0.1788, abs=0.001)

    def test_parse_returns_none_when_no_rate(self):
        assert self.scraper._parse("<html><body></body></html>") is None

    def test_parse_product_fields(self):
        result = self.scraper._parse(load("bbva.html"))
        p = result.products[0]
        assert p["montoMinimo"] == 3_000_000
        assert p["montoMaximo"] == 200_000_000
        assert p["plazoMinMeses"] == 12
        assert p["plazoMaxMeses"] == 84

class TestBancoBogota:
    def setup_method(self):
        from scrapers.banco_bogota import BancoBogotaScraper
        self.scraper = BancoBogotaScraper()

    def test_parse_extracts_rate(self):
        result = self.scraper._parse(load("banco_bogota.html"))
        assert result is not None
        assert result.code == "banco_bogota"
        assert result.products[0]["tasaEA"] == pytest.approx(0.2534, abs=0.001)

    def test_parse_returns_none_when_no_rate(self):
        assert self.scraper._parse("<html><body></body></html>") is None

    def test_parse_product_fields(self):
        result = self.scraper._parse(load("banco_bogota.html"))
        p = result.products[0]
        assert p["montoMinimo"] == 1_000_000
        assert p["montoMaximo"] == 500_000_000
        assert p["plazoMinMeses"] == 24
        assert p["plazoMaxMeses"] == 72
```

- [ ] **Step 4: Run tests to confirm failure**

```bash
cd scraper
python -m pytest tests/test_scrapers.py::TestBBVA tests/test_scrapers.py::TestBancoBogota -v
```

Expected: `ImportError` for both scrapers.

- [ ] **Step 5: Implement `scraper/scrapers/bbva.py`**

```python
import re
from typing import Optional
from bs4 import BeautifulSoup
from .base import BaseEntityScraper, EntityData

class BBVAScraper(BaseEntityScraper):
    code = "bbva"
    name = "BBVA Colombia"
    type = "banco"
    logo_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/BBVA_2019.svg/1200px-BBVA_2019.svg.png"
    url = "https://www.bbva.com.co/personas/productos/prestamos/vehiculo.html"

    def _parse(self, html: str) -> Optional[EntityData]:
        soup = BeautifulSoup(html, "html.parser")
        text = soup.get_text(" ")
        match = re.search(r"(\d{1,2}(?:[.,]\d+)?)\s*%\s*E\.?A\.?", text, re.IGNORECASE)
        if not match:
            return None
        tasa_ea = float(match.group(1).replace(",", ".")) / 100
        return EntityData(
            code=self.code,
            name=self.name,
            type=self.type,
            logo_url=self.logo_url,
            products=[{
                "productName": "Crédito Vehículo (Tasa Fija)",
                "tasaEA": tasa_ea,
                "tasaType": "EA",
                "montoMinimo": 3_000_000,
                "montoMaximo": 200_000_000,
                "plazoMinMeses": 12,
                "plazoMaxMeses": 84,
                "requisitos": [],
                "sourceUrl": self.url,
            }],
        )
```

- [ ] **Step 6: Implement `scraper/scrapers/banco_bogota.py`**

```python
import re
from typing import Optional
from bs4 import BeautifulSoup
from .base import BaseEntityScraper, EntityData

class BancoBogotaScraper(BaseEntityScraper):
    code = "banco_bogota"
    name = "Banco de Bogotá"
    type = "banco"
    logo_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Banco_de_Bogot%C3%A1_logo.svg/1200px-Banco_de_Bogot%C3%A1_logo.svg.png"
    url = "https://www.bancodebogota.com/personas/creditos/libre-inversion"

    def _parse(self, html: str) -> Optional[EntityData]:
        soup = BeautifulSoup(html, "html.parser")
        text = soup.get_text(" ")
        match = re.search(r"(\d{1,2}(?:[.,]\d+)?)\s*%\s*E\.?A\.?", text, re.IGNORECASE)
        if not match:
            return None
        tasa_ea = float(match.group(1).replace(",", ".")) / 100
        return EntityData(
            code=self.code,
            name=self.name,
            type=self.type,
            logo_url=self.logo_url,
            products=[{
                "productName": "Crédito de Libre Inversión",
                "tasaEA": tasa_ea,
                "tasaType": "EA",
                "montoMinimo": 1_000_000,
                "montoMaximo": 500_000_000,
                "plazoMinMeses": 24,
                "plazoMaxMeses": 72,
                "requisitos": [],
                "sourceUrl": self.url,
            }],
        )
```

- [ ] **Step 7: Update `scraper/scrapers/__init__.py`**

```python
from .bancolombia import BancolombiaScraper
from .bbva import BBVAScraper
from .banco_bogota import BancoBogotaScraper

ALL_SCRAPERS = [BancolombiaScraper, BBVAScraper, BancoBogotaScraper]
```

- [ ] **Step 8: Run tests — must pass**

```bash
cd scraper
python -m pytest tests/test_scrapers.py -v
```

Expected: 9 passed (3 Bancolombia + 3 BBVA + 3 Banco de Bogotá).

- [ ] **Step 9: Commit**

```bash
git add scraper/scrapers/bbva.py scraper/scrapers/banco_bogota.py \
        scraper/scrapers/__init__.py \
        scraper/tests/fixtures/bbva.html scraper/tests/fixtures/banco_bogota.html \
        scraper/tests/test_scrapers.py
git commit -m "feat(scraper): BBVA and Banco de Bogotá scrapers"
```

---

## Task 6: Fintech Scrapers (Sempli, Lulo Bank, R5)

**Files:**
- Create: `scraper/scrapers/sempli.py`
- Create: `scraper/scrapers/lulo_bank.py`
- Create: `scraper/scrapers/r5.py`
- Create: `scraper/tests/fixtures/sempli.html`
- Create: `scraper/tests/fixtures/lulo_bank.html`
- Create: `scraper/tests/fixtures/r5.html`
- Update: `scraper/scrapers/__init__.py`
- Update: `scraper/tests/test_scrapers.py`

- [ ] **Step 1: Create fixtures**

`scraper/tests/fixtures/sempli.html`:
```html
<!DOCTYPE html>
<html>
<head><title>Créditos - Sempli</title></head>
<body>
  <div class="credit-info">
    <p class="rate">Tasa: 24,65% E.A.</p>
    <p>Montos desde $10.000.000 hasta $250.000.000</p>
    <p>Plazos de 12 a 36 meses</p>
    <ul>
      <li>Empresa constituida mínimo 1 año</li>
      <li>Ventas anuales superiores a $120M COP</li>
    </ul>
  </div>
</body>
</html>
```

`scraper/tests/fixtures/lulo_bank.html`:
```html
<!DOCTYPE html>
<html>
<head><title>Crédito Libre Inversión - Lulo Bank</title></head>
<body>
  <section class="loan-details">
    <p>Tasa de interés efectiva anual: 22,41% E.A.</p>
    <p>Desde $1.000.000 hasta $50.000.000</p>
    <p>12 a 48 meses</p>
  </section>
</body>
</html>
```

`scraper/tests/fixtures/r5.html`:
```html
<!DOCTYPE html>
<html>
<head><title>Crédito Vehículo - R5</title></head>
<body>
  <div class="vehiculo-rate">
    <span>Tasa desde 18,16% E.A.</span>
    <p>Montos: $5.000.000 - $50.000.000</p>
    <p>Plazo: 12 a 48 meses</p>
  </div>
</body>
</html>
```

- [ ] **Step 2: Add failing tests**

Append to `scraper/tests/test_scrapers.py`:

```python
class TestSempli:
    def setup_method(self):
        from scrapers.sempli import SempliScraper
        self.scraper = SempliScraper()

    def test_parse_extracts_rate(self):
        result = self.scraper._parse(load("sempli.html"))
        assert result is not None
        assert result.code == "sempli"
        assert result.products[0]["tasaEA"] == pytest.approx(0.2465, abs=0.001)

    def test_parse_returns_none_when_no_rate(self):
        assert self.scraper._parse("<html><body></body></html>") is None

    def test_parse_product_fields(self):
        result = self.scraper._parse(load("sempli.html"))
        p = result.products[0]
        assert p["montoMinimo"] == 10_000_000
        assert p["montoMaximo"] == 250_000_000
        assert p["plazoMinMeses"] == 12
        assert p["plazoMaxMeses"] == 36

class TestLuloBank:
    def setup_method(self):
        from scrapers.lulo_bank import LuloBankScraper
        self.scraper = LuloBankScraper()

    def test_parse_extracts_rate(self):
        result = self.scraper._parse(load("lulo_bank.html"))
        assert result is not None
        assert result.code == "lulo_bank"
        assert result.products[0]["tasaEA"] == pytest.approx(0.2241, abs=0.001)

    def test_parse_returns_none_when_no_rate(self):
        assert self.scraper._parse("<html><body></body></html>") is None

    def test_parse_product_fields(self):
        result = self.scraper._parse(load("lulo_bank.html"))
        p = result.products[0]
        assert p["montoMinimo"] == 1_000_000
        assert p["montoMaximo"] == 50_000_000
        assert p["plazoMinMeses"] == 12
        assert p["plazoMaxMeses"] == 48

class TestR5:
    def setup_method(self):
        from scrapers.r5 import R5Scraper
        self.scraper = R5Scraper()

    def test_parse_extracts_rate(self):
        result = self.scraper._parse(load("r5.html"))
        assert result is not None
        assert result.code == "r5"
        assert result.products[0]["tasaEA"] == pytest.approx(0.1816, abs=0.001)

    def test_parse_returns_none_when_no_rate(self):
        assert self.scraper._parse("<html><body></body></html>") is None

    def test_parse_product_fields(self):
        result = self.scraper._parse(load("r5.html"))
        p = result.products[0]
        assert p["montoMinimo"] == 5_000_000
        assert p["montoMaximo"] == 50_000_000
        assert p["plazoMinMeses"] == 12
        assert p["plazoMaxMeses"] == 48
```

- [ ] **Step 3: Run to confirm failure**

```bash
cd scraper
python -m pytest tests/test_scrapers.py::TestSempli tests/test_scrapers.py::TestLuloBank tests/test_scrapers.py::TestR5 -v
```

Expected: `ImportError` for all three.

- [ ] **Step 4: Implement `scraper/scrapers/sempli.py`**

```python
import re
from typing import Optional
from bs4 import BeautifulSoup
from .base import BaseEntityScraper, EntityData

class SempliScraper(BaseEntityScraper):
    code = "sempli"
    name = "Sempli"
    type = "fintech"
    logo_url = "https://sempli.co/wp-content/uploads/2022/06/sempli-logo.svg"
    url = "https://sempli.co/creditos"

    def _parse(self, html: str) -> Optional[EntityData]:
        soup = BeautifulSoup(html, "html.parser")
        text = soup.get_text(" ")
        match = re.search(r"(\d{1,2}(?:[.,]\d+)?)\s*%\s*E\.?A\.?", text, re.IGNORECASE)
        if not match:
            return None
        tasa_ea = float(match.group(1).replace(",", ".")) / 100
        return EntityData(
            code=self.code,
            name=self.name,
            type=self.type,
            logo_url=self.logo_url,
            products=[{
                "productName": "Crédito a Término (Pymes)",
                "tasaEA": tasa_ea,
                "tasaType": "EA",
                "montoMinimo": 10_000_000,
                "montoMaximo": 250_000_000,
                "plazoMinMeses": 12,
                "plazoMaxMeses": 36,
                "requisitos": [
                    "Empresa constituida mínimo 1 año",
                    "Ventas anuales superiores a $120M COP",
                ],
                "sourceUrl": self.url,
            }],
        )
```

- [ ] **Step 5: Implement `scraper/scrapers/lulo_bank.py`**

```python
import re
from typing import Optional
from bs4 import BeautifulSoup
from .base import BaseEntityScraper, EntityData

class LuloBankScraper(BaseEntityScraper):
    code = "lulo_bank"
    name = "Lulo Bank"
    type = "fintech"
    logo_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Lulo_Bank_logo.svg/1200px-Lulo_Bank_logo.svg.png"
    url = "https://www.lulobank.com/credito"

    def _parse(self, html: str) -> Optional[EntityData]:
        soup = BeautifulSoup(html, "html.parser")
        text = soup.get_text(" ")
        match = re.search(r"(\d{1,2}(?:[.,]\d+)?)\s*%\s*E\.?A\.?", text, re.IGNORECASE)
        if not match:
            return None
        tasa_ea = float(match.group(1).replace(",", ".")) / 100
        return EntityData(
            code=self.code,
            name=self.name,
            type=self.type,
            logo_url=self.logo_url,
            products=[{
                "productName": "Crédito Libre Inversión",
                "tasaEA": tasa_ea,
                "tasaType": "EA",
                "montoMinimo": 1_000_000,
                "montoMaximo": 50_000_000,
                "plazoMinMeses": 12,
                "plazoMaxMeses": 48,
                "requisitos": [],
                "sourceUrl": self.url,
            }],
        )
```

- [ ] **Step 6: Implement `scraper/scrapers/r5.py`**

```python
import re
from typing import Optional
from bs4 import BeautifulSoup
from .base import BaseEntityScraper, EntityData

class R5Scraper(BaseEntityScraper):
    code = "r5"
    name = "R5"
    type = "fintech"
    logo_url = "https://r5.com.co/wp-content/uploads/2023/01/logo-r5.svg"
    url = "https://r5.com.co"

    def _parse(self, html: str) -> Optional[EntityData]:
        soup = BeautifulSoup(html, "html.parser")
        text = soup.get_text(" ")
        match = re.search(r"(\d{1,2}(?:[.,]\d+)?)\s*%\s*E\.?A\.?", text, re.IGNORECASE)
        if not match:
            return None
        tasa_ea = float(match.group(1).replace(",", ".")) / 100
        return EntityData(
            code=self.code,
            name=self.name,
            type=self.type,
            logo_url=self.logo_url,
            products=[{
                "productName": "Crédito Vehículo",
                "tasaEA": tasa_ea,
                "tasaType": "EA",
                "montoMinimo": 5_000_000,
                "montoMaximo": 50_000_000,
                "plazoMinMeses": 12,
                "plazoMaxMeses": 48,
                "requisitos": [],
                "sourceUrl": self.url,
            }],
        )
```

- [ ] **Step 7: Update `scraper/scrapers/__init__.py`**

```python
from .bancolombia import BancolombiaScraper
from .bbva import BBVAScraper
from .banco_bogota import BancoBogotaScraper
from .sempli import SempliScraper
from .lulo_bank import LuloBankScraper
from .r5 import R5Scraper

ALL_SCRAPERS = [
    BancolombiaScraper,
    BBVAScraper,
    BancoBogotaScraper,
    SempliScraper,
    LuloBankScraper,
    R5Scraper,
]
```

- [ ] **Step 8: Run all scraper tests — must pass**

```bash
cd scraper
python -m pytest tests/test_scrapers.py -v
```

Expected: 18 passed (3 per scraper × 6 scrapers).

- [ ] **Step 9: Run full test suite**

```bash
cd scraper
python -m pytest tests/ -v
```

Expected: All tests pass (test_db, test_banrep, test_scrapers).

- [ ] **Step 10: Commit**

```bash
git add scraper/scrapers/sempli.py scraper/scrapers/lulo_bank.py scraper/scrapers/r5.py \
        scraper/scrapers/__init__.py \
        scraper/tests/fixtures/sempli.html scraper/tests/fixtures/lulo_bank.html \
        scraper/tests/fixtures/r5.html scraper/tests/test_scrapers.py
git commit -m "feat(scraper): fintech scrapers — Sempli, Lulo Bank, R5"
```

---

## Task 7: Scheduler + Orchestrator + Main Integration

**Files:**
- Update: `scraper/scheduler.py` (replaces the stub from Task 1)
- Update: `scraper/main.py` (no lifespan changes needed — already imports scheduler)

- [ ] **Step 1: Implement `scraper/scheduler.py`**

Replace the Task 1 stub entirely:

```python
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
    Scrape all 6 entities sequentially. If the browser crashes mid-run, reopen it
    and continue from the next entity. Each entity failure marks stale=True only.
    """
    from scrapers import ALL_SCRAPERS
    from db import upsert_entity_success, upsert_entity_stale

    browser = await pw.chromium.launch(headless=True)
    for scraper_cls in ALL_SCRAPERS:
        scraper = scraper_cls()
        try:
            page = await browser.new_page()
        except Exception:
            # Browser crashed — reopen and retry this entity's page
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
      Phase A — fetch IBR/IPC from Banrep (required; fails loudly)
      Phase B — scrape 6 entity pages with Playwright (best-effort; stale on failure)
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

    # Phase B: entity scrapers (best-effort, browser crash recovery included)
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
```

- [ ] **Step 2: Verify FastAPI app starts cleanly**

```bash
cd scraper
MONGODB_URI=placeholder uvicorn main:app --port 8080 &
sleep 2
curl http://localhost:8080/health
kill %1
```

Expected output: `{"status":"ok"}`

- [ ] **Step 3: Run full test suite one final time**

```bash
cd scraper
python -m pytest tests/ -v
```

Expected: All tests pass. Count: test_db (3) + test_banrep (6) + test_scrapers (18) = 27 tests.

- [ ] **Step 4: Commit**

```bash
git add scraper/scheduler.py
git commit -m "feat(scraper): scheduler + job orchestrator — nightly cron + --run-now CLI"
```

---

## Post-Implementation Validation

After deployment to Railway:

1. **Health check:** `GET https://<scraper-url>/health` → `{"status":"ok"}`

2. **Manual smoke test** (run immediately after deploy to validate live scraping):
```bash
# From your local machine with MONGODB_URI set:
cd scraper
pip install -r requirements.txt
python scheduler.py --run-now
```
Check MongoDB Atlas: `referenceRates` and `financialEntities` collections should show updated `updatedAt` timestamps. Entity documents where scraping succeeded will have `stale: false`; those where parsing failed will have `stale: true`.

3. **If all entities come back stale:** Banrep pages loaded correctly (otherwise Phase A would have errored). The entity parsers couldn't find `XX.XX% E.A.` text in the rendered HTML. Inspect the live page HTML and update the `_parse()` regex or CSS selectors in the relevant scraper file. No tests need changing — only the scraper file.

4. **If Banrep rates parse incorrectly:** Inspect `https://www.banrep.gov.co/es/estadisticas/tasas-interes-indicativas` and adjust the column indices in `_parse_ibr_html` (`cells[1]`, `cells[2]`, `cells[3]`).

---

## Railway Deployment Notes

In the Railway dashboard:
- Create a new service → "Deploy from GitHub repo"
- Set **Root Directory**: `scraper`
- Set **Environment Variables**: `MONGODB_URI` (same value as the backend service)
- Set **Port**: `8080`
- Optionally set `SCRAPE_CRON` (default is `0 2 * * *` = 2 AM UTC nightly)

The Dockerfile will be detected automatically. First build takes ~3-4 minutes (downloading the Playwright base image + pip install). Subsequent deploys are faster (layer cache).
