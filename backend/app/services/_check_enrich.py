"""ponytail: one runnable check for enrich helpers — no network required."""

from app.services.enrich import _slug, load_tier_catalog


def main() -> None:
    catalog = load_tier_catalog()
    assert len(catalog["tiers"]) == 5
    assert catalog["tiers"][0]["tier"] == 1
    assert any(p["id"] == "wikidata" for p in catalog["tiers"][0]["providers"])
    assert any(p["id"] == "interview" for p in catalog["tiers"][2]["providers"])
    assert any(p["id"] == "fan-site" for p in catalog["tiers"][4]["providers"])
    assert _slug("Miriam Makeba!") == "miriam-makeba"
    print("ok: source tiers + slug")


if __name__ == "__main__":
    main()
