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
    if len(cells) < 5:
        raise ValueError(f"IBR row has {len(cells)} cells, expected >= 5")
    today = datetime.now(timezone.utc)
    return [
        {"indicator": "IBR_1M",  "value": _parse_percent(cells[2].get_text()), "unit": "EA", "sourceDate": today},
        {"indicator": "IBR_3M",  "value": _parse_percent(cells[3].get_text()), "unit": "EA", "sourceDate": today},
        {"indicator": "IBR_6M",  "value": _parse_percent(cells[4].get_text()), "unit": "EA", "sourceDate": today},
    ]

def _parse_ipc_html(html: str) -> dict:
    """
    Parse the most recent IPC_ANUAL (variacion anual) from Banrep's inflacion page.
    Returns a single rate dict.
    """
    soup = BeautifulSoup(html, "html.parser")
    rows = soup.select("table tbody tr")
    if not rows:
        raise ValueError("IPC table has no data rows")
    cells = rows[0].find_all("td")
    # Variacion anual is the second column (index 1)
    if len(cells) < 2:
        raise ValueError(f"IPC row has {len(cells)} cells, expected >= 2")
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
