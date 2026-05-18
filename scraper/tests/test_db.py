import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime, timezone

@pytest.mark.asyncio
async def test_upsert_rate_calls_find_one_and_update():
    mock_collection = AsyncMock()
    mock_db = MagicMock()
    mock_db.__getitem__ = MagicMock(return_value=mock_collection)

    with patch("db.get_db", return_value=mock_db):
        from db import upsert_rate
        await upsert_rate({"indicator": "IBR_1M", "value": 0.1065, "unit": "EA", "sourceDate": datetime.now(timezone.utc)})

    mock_collection.find_one_and_update.assert_called_once()
    call_args = mock_collection.find_one_and_update.call_args
    assert call_args[0][0] == {"indicator": "IBR_1M"}
    assert call_args[0][1]["$set"]["value"] == 0.1065
    assert call_args[1]["upsert"] is True

@pytest.mark.asyncio
async def test_upsert_entity_success_writes_stale_false():
    mock_collection = AsyncMock()
    mock_db = MagicMock()
    mock_db.__getitem__ = MagicMock(return_value=mock_collection)

    class FakeEntityData:
        code = "bancolombia"
        name = "Bancolombia"
        type = "banco"
        logo_url = "https://example.com/logo.svg"
        products = [{"productName": "Test", "tasaEA": 0.25}]

    with patch("db.get_db", return_value=mock_db):
        from db import upsert_entity_success
        await upsert_entity_success(FakeEntityData())

    call_args = mock_collection.find_one_and_update.call_args
    assert call_args[0][0] == {"code": "bancolombia"}
    assert call_args[0][1]["$set"]["stale"] is False
    assert call_args[1]["upsert"] is True

@pytest.mark.asyncio
async def test_upsert_entity_stale_does_not_upsert():
    mock_collection = AsyncMock()
    mock_db = MagicMock()
    mock_db.__getitem__ = MagicMock(return_value=mock_collection)

    with patch("db.get_db", return_value=mock_db):
        from db import upsert_entity_stale
        await upsert_entity_stale("bancolombia")

    call_args = mock_collection.find_one_and_update.call_args
    # upsert=False — must not create new documents
    assert call_args[1]["upsert"] is False
    assert call_args[0][1]["$set"]["stale"] is True
