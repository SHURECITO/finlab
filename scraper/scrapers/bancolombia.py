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
