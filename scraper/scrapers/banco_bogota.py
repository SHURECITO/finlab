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

        candidate_sections = soup.find_all(
            string=re.compile(r"tasa|libre\s+inversi[oó]n|interés", re.IGNORECASE)
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
                "plazoMinMeses": 24,
                "plazoMaxMeses": 72,
                "requisitos": [],
                "sourceUrl": self.url,
            }],
        )
