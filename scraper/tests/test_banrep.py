import pytest
from unittest.mock import AsyncMock, patch
from rates.banrep import _parse_ibr_html, _parse_ipc_html

# Representative snippet of Banrep's IBR table HTML
IBR_FIXTURE = """
<html><body>
<table class="views-table">
  <thead><tr><th>Fecha</th><th>IBR overnight</th><th>IBR 1 mes</th><th>IBR 3 meses</th><th>IBR 6 meses</th></tr></thead>
  <tbody>
    <tr>
      <td>2025-05-16</td>
      <td>10.50%</td>
      <td>10.65%</td>
      <td>10.71%</td>
      <td>10.82%</td>
    </tr>
  </tbody>
</table>
</body></html>
"""

IPC_FIXTURE = """
<html><body>
<table class="views-table">
  <thead><tr><th>Mes</th><th>Variación anual</th></tr></thead>
  <tbody>
    <tr><td>Abr 2025</td><td>5.68%</td></tr>
  </tbody>
</table>
</body></html>
"""

def test_parse_ibr_html_returns_three_rates():
    rates = _parse_ibr_html(IBR_FIXTURE)
    assert len(rates) == 3
    indicators = {r["indicator"] for r in rates}
    assert indicators == {"IBR_1M", "IBR_3M", "IBR_6M"}

def test_parse_ibr_html_values():
    rates = _parse_ibr_html(IBR_FIXTURE)
    by_indicator = {r["indicator"]: r for r in rates}
    assert by_indicator["IBR_1M"]["value"] == pytest.approx(0.1065, abs=0.0001)
    assert by_indicator["IBR_3M"]["value"] == pytest.approx(0.1071, abs=0.0001)
    assert by_indicator["IBR_6M"]["value"] == pytest.approx(0.1082, abs=0.0001)

def test_parse_ibr_html_unit_is_EA():
    rates = _parse_ibr_html(IBR_FIXTURE)
    for r in rates:
        assert r["unit"] == "EA"

def test_parse_ipc_html_returns_ipc_anual():
    rate = _parse_ipc_html(IPC_FIXTURE)
    assert rate["indicator"] == "IPC_ANUAL"
    assert rate["value"] == pytest.approx(0.0568, abs=0.0001)
    assert rate["unit"] == "EA"

def test_parse_ibr_html_raises_on_empty_table():
    with pytest.raises(ValueError, match="IBR"):
        _parse_ibr_html("<html><body><table></table></body></html>")

def test_parse_ipc_html_raises_on_empty_table():
    with pytest.raises(ValueError, match="IPC"):
        _parse_ipc_html("<html><body><table></table></body></html>")
