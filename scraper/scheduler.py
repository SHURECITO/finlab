from apscheduler.schedulers.asyncio import AsyncIOScheduler

def setup_scheduler() -> AsyncIOScheduler:
    return AsyncIOScheduler()
