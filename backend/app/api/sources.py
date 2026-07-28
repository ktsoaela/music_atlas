from __future__ import annotations

from fastapi import APIRouter, Query

from app.db import get_driver
from app.services.enrich import (
    enrich_artists,
    list_all_providers,
    load_tier_catalog,
    seed_source_providers,
)

router = APIRouter(prefix="/sources", tags=["sources"])


@router.get("/tiers")
def source_tiers():
    return load_tier_catalog()


@router.get("/providers")
def source_providers():
    driver = get_driver()
    rows = list_all_providers(driver)
    if not rows:
        seed_source_providers(driver)
        rows = list_all_providers(driver)
    return rows
