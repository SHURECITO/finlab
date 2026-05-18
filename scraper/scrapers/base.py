import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import TYPE_CHECKING, Optional

if TYPE_CHECKING:
    from playwright.async_api import Page

logger = logging.getLogger(__name__)

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

    async def scrape(self, page: "Page") -> Optional[EntityData]:
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
        except Exception:
            logger.exception("[%s] scrape error", self.code)
            return None

    @abstractmethod
    def _parse(self, html: str) -> Optional[EntityData]:
        """
        Extract EntityData from rendered page HTML.
        Return None if the rate cannot be found.
        Do NOT raise — return None instead.
        """
