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
        candidate_sections = soup.find_all(
            string=re.compile(r"tasa|vehículo|auto|interés", re.IGNORECASE)
        )
        search_text = ""
        for section in candidate_sections:
            parent = section.parent
            if parent:
                section_text = parent.get_text(" ")
                if re.search(r"\d{1,2}(?:[.,]\d+)?\s*%\s*E\.?A\.?", section_text, re.IGNORECASE):
                    search_text = section_text
                    break
        if not search_text:
            search_text = soup.get_text(" ")
        match = re.search(r"(\d{1,2}(?:[.,]\d+)?)\s*%\s*E\.?A\.?", search_text, re.IGNORECASE)
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
