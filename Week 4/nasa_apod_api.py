"""Fetch Astronomy Picture of the Day (APOD) data from api.nasa.gov.

Returns only: title, date, url, media_type, explanation.

NASA's APOD endpoint does not allow ``date`` and ``count`` in the same request;
pass at most one of them (omit both for today's image).
"""

from __future__ import annotations

import json
import os
import csv
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

APOD_URL = "https://api.nasa.gov/planetary/apod"

# Maximum ``count`` allowed per request (course / rate-limit guardrail).
MAX_APOD_COUNT = 50

# Fields returned by ``fetch_apod`` / ``slim_apod``.
OUTPUT_FIELDS = ("title", "date", "url", "media_type", "explanation")


def load_env_file(path: Path) -> None:
    """Load KEY=VALUE lines from a ``.env`` file into ``os.environ`` (no overrides)."""
    if not path.is_file():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key, value = key.strip(), value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


def resolve_nasa_api_key(env_path: Path | None = None) -> str:
    """Return ``NASA_API_KEY`` from the environment or a local ``.env`` file."""
    key = os.environ.get("NASA_API_KEY", "").strip()
    if key:
        return key
    if env_path is not None:
        candidate = Path(env_path)
        dotenv = candidate if candidate.is_file() else candidate / ".env"
    else:
        dotenv = Path(__file__).resolve().parent / ".env"
    load_env_file(dotenv)
    key = os.environ.get("NASA_API_KEY", "").strip()
    if not key:
        raise RuntimeError(
            "Missing NASA_API_KEY. Set it in Week 4/.env or export NASA_API_KEY."
        )
    return key


def slim_apod(entry: dict) -> dict:
    """Pick the fields we care about from one APOD JSON object."""
    return {field: entry.get(field) for field in OUTPUT_FIELDS}


def normalize_apod_payload(payload: object) -> list[dict]:
    """Turn a single APOD object or a list of objects into slim dict rows."""
    if isinstance(payload, list):
        return [slim_apod(item) for item in payload if isinstance(item, dict)]
    if isinstance(payload, dict):
        return [slim_apod(payload)]
    return []


def write_apod_csv(rows: list[dict], output_path: Path) -> None:
    """Write APOD rows to CSV using OUTPUT_FIELDS order."""
    with output_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(OUTPUT_FIELDS), extrasaction="ignore")
        writer.writeheader()
        for row in rows:
            writer.writerow({field: row.get(field) for field in OUTPUT_FIELDS})


def fetch_apod(
    *,
    date: str | None = None,
    count: int | None = None,
    api_key: str | None = None,
    env_path: Path | None = None,
    timeout: int = 60,
) -> list[dict]:
    """Call NASA APOD and return a list of slimmed records.

    Parameters
    ----------
    date
        ``YYYY-MM-DD`` for a specific day (mutually exclusive with ``count``).
    count
        Number of random APODs to return (mutually exclusive with ``date``).
        Must be between 1 and ``MAX_APOD_COUNT`` (50) inclusive.
    api_key
        NASA API key; if omitted, uses ``NASA_API_KEY`` / Week 4 ``.env``.
    env_path
        Optional path to ``.env`` (file) or folder containing ``.env``.
    """
    if date is not None and count is not None:
        raise ValueError(
            "NASA APOD does not allow both `date` and `count` in one request. "
            "Pass only one, or neither for today's image."
        )
    if count is not None:
        if count < 1:
            raise ValueError("`count` must be at least 1 when provided.")
        if count > MAX_APOD_COUNT:
            raise ValueError(
                f"`count` cannot exceed {MAX_APOD_COUNT} (got {count})."
            )

    key = api_key.strip() if api_key else resolve_nasa_api_key(env_path=env_path)
    params: dict[str, str | int] = {"api_key": key}
    if date is not None:
        params["date"] = date
    if count is not None:
        params["count"] = int(count)

    query = urlencode(params)
    url = f"{APOD_URL}?{query}"
    request = Request(url, headers={"User-Agent": "HCDE530-Week4-coursework/1.0"})
    with urlopen(request, timeout=timeout) as response:
        body = response.read().decode("utf-8")
    payload = json.loads(body)
    return normalize_apod_payload(payload)


def main() -> None:
    """Fetch 50 APOD rows and save them to Week 4/nasa_apod_results.csv."""
    base_dir = Path(__file__).resolve().parent
    output_csv = base_dir / "nasa_apod_results.csv"

    try:
        rows = fetch_apod(count=MAX_APOD_COUNT)
    except HTTPError as err:
        print(f"HTTP error from NASA APOD: {err.code} {err.reason}")
        raise SystemExit(1) from err
    except URLError as err:
        print(f"Network error reaching NASA APOD: {err.reason}")
        raise SystemExit(1) from err
    except json.JSONDecodeError as err:
        print(f"Could not parse NASA response as JSON: {err}")
        raise SystemExit(1) from err
    except (RuntimeError, ValueError) as err:
        print(err)
        raise SystemExit(1) from err

    write_apod_csv(rows, output_csv)
    print(f"Wrote {len(rows)} APOD rows to {output_csv}")


if __name__ == "__main__":
    main()
