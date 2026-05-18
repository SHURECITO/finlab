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

    def test_parse_ignores_decoy_percentage(self):
        html = """<html><body>
        <p class="legal">Hasta un 10,00% E.A. de descuento en seguros.</p>
        <section>
          <h2>Crédito de Libre Inversión</h2>
          <p>Tasa desde <strong>25,00% E.A.</strong></p>
        </section>
        </body></html>"""
        result = self.scraper._parse(html)
        assert result is not None
        assert result.products[0]["tasaEA"] == pytest.approx(0.25, abs=0.001)


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
