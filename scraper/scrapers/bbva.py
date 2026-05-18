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

        candidate_sections = soup.find_all(
            string=re.compile(r"tasa|vehículo|préstamo|interés", re.IGNORECASE)
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
