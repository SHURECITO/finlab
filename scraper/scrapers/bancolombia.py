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

        # Try to scope to a section containing rate information before falling back to full page
        # This avoids matching marketing/legal percentages that appear earlier in the DOM
        candidate_sections = soup.find_all(
            string=re.compile(r"tasa|libre\s+inversi[oó]n|inter[eé]s", re.IGNORECASE)
        )

        search_text = ""
        for section in candidate_sections:
            parent = section.parent
            if parent:
                section_text = parent.get_text(" ")
                if re.search(r"(?<!\d)\d{1,2}(?:[.,]\d+)?\s*%\s*E\.?A\.?", section_text, re.IGNORECASE):
                    search_text = section_text
                    break

        if not search_text:
            search_text = soup.get_text(" ")

        match = re.search(r"(?<!\d)(\d{1,2}(?:[.,]\d+)?)\s*%\s*E\.?A\.?", search_text, re.IGNORECASE)
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
