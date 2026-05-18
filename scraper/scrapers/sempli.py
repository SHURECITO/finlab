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
        candidate_sections = soup.find_all(
            string=re.compile(r"tasa|crédito|pymes|interés", re.IGNORECASE)
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
