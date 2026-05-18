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
