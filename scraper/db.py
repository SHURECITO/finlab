import os
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

_client: AsyncIOMotorClient | None = None

def get_db() -> AsyncIOMotorDatabase:
    global _client
    if _client is None:
        uri = os.environ.get("MONGODB_URI")
        if not uri:
            raise RuntimeError("MONGODB_URI environment variable is not set")
        _client = AsyncIOMotorClient(uri)
    return _client.get_default_database()

async def upsert_rate(rate: dict) -> None:
    db = get_db()
    now = datetime.now(timezone.utc)
    await db["referenceRates"].find_one_and_update(
        {"indicator": rate["indicator"]},
        {"$set": {**rate, "updatedAt": now}},
        upsert=True,
    )

async def upsert_entity_success(data) -> None:
    """data is an EntityData from scrapers/base.py"""
    db = get_db()
    now = datetime.now(timezone.utc)
    await db["financialEntities"].find_one_and_update(
        {"code": data.code},
        {"$set": {
            "name": data.name,
            "type": data.type,
            "logoUrl": data.logo_url,
            "products": data.products,
            "stale": False,
            "updatedAt": now,
        }},
        upsert=True,
    )

async def upsert_entity_stale(code: str) -> None:
    db = get_db()
    now = datetime.now(timezone.utc)
    await db["financialEntities"].find_one_and_update(
        {"code": code},
        {"$set": {"stale": True, "updatedAt": now}},
        upsert=False,
    )
