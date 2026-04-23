"""Fetch artwork id, title, artist from api.artic.edu and save to CSV."""

from __future__ import annotations

import csv
import json
import sys
from pathlib import Path
from urllib.error import HTTPError, URLError

from artic_artworks_api import fetch_artic, slim_artwork

# Each request asks for up to this many rows (matches artic_artworks_api cap of 50).
PAGE_SIZE = 50

# Stop after this many pages (PAGE_SIZE rows each). Lower for quick tests.
MAX_PAGES = 5

# Columns written to CSV (order preserved).
EXPORT_FIELDS = ["id", "title", "artist"]


def fetch_artworks_rows(max_pages: int, page_size: int) -> list[dict]:
    """Walk the Art Institute /artworks pages and return slim dict rows."""
    rows: list[dict] = []
    for page in range(1, max_pages + 1):
        payload = fetch_artic(page=page, limit=page_size)
        batch = [
            item
            for item in (payload.get("data") or [])
            if isinstance(item, dict)
        ]
        for item in batch:
            rows.append(slim_artwork(item))

        pagination = payload.get("pagination") or {}
        total_pages = int(pagination.get("total_pages") or 0)
        if not batch:
            break
        if total_pages and page >= total_pages:
            break
    return rows


def write_csv(rows: list[dict], path: Path) -> None:
    """Write rows using EXPORT_FIELDS as columns."""
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=EXPORT_FIELDS, extrasaction="ignore")
        writer.writeheader()
        for row in rows:
            writer.writerow({key: row.get(key) for key in EXPORT_FIELDS})


def main() -> None:
    base_dir = Path(__file__).resolve().parent
    output_csv = base_dir / "artic_artworks.csv"

    max_pages = MAX_PAGES
    page_size = PAGE_SIZE
    if len(sys.argv) >= 2:
        max_pages = int(sys.argv[1])
    if len(sys.argv) >= 3:
        page_size = min(50, max(1, int(sys.argv[2])))

    try:
        rows = fetch_artworks_rows(max_pages=max_pages, page_size=page_size)
    except HTTPError as err:
        print(f"HTTP error from Art Institute API: {err.code} {err.reason}")
        raise SystemExit(1) from err
    except URLError as err:
        print(f"Network error reaching API: {err.reason}")
        raise SystemExit(1) from err
    except json.JSONDecodeError as err:
        print(f"Could not parse API response as JSON: {err}")
        raise SystemExit(1) from err
    except TimeoutError:
        print("Request to Art Institute API timed out.")
        raise SystemExit(1)

    try:
        write_csv(rows, output_csv)
    except OSError as err:
        print(f"Could not write CSV file: {err}")
        raise SystemExit(1) from err

    print(f"Saved {len(rows)} rows to {output_csv}")
    if rows:
        sample = rows[0]
        print(f"Example: id={sample.get('id')!r}, title={sample.get('title')!r}")


if __name__ == "__main__":
    main()
