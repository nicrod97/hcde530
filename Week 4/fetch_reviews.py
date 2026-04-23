"""Fetch app review data from the Week 4 API and export selected fields to CSV."""

import csv
import json
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

# API base URL (full review rows live at /reviews).
API_BASE = "https://hcde530-week4-api.onrender.com"
REVIEWS_URL = f"{API_BASE}/reviews"

# Columns saved to CSV and shown in the console summary (order preserved).
EXPORT_FIELDS = [
    "app",
    "date",
    "verified_purchase",
    "rating",
    "category",
    "helpful_votes",
    "review",
]

# Only keep reviews at or above this star rating (e.g. 3, 4, and 5 when set to 3).
MIN_RATING_INCLUSIVE = 3

# Truncate review body in the terminal; CSV always gets the full text.
REVIEW_PRINT_PREVIEW_CHARS = 120


def fetch_reviews_page(limit: int, offset: int) -> dict:
    """Return one JSON payload from the reviews endpoint."""
    url = f"{REVIEWS_URL}?limit={limit}&offset={offset}"
    request = Request(url, headers={"User-Agent": "HCDE530-Week4-coursework/1.0"})
    with urlopen(request, timeout=60) as response:
        body = response.read().decode("utf-8")
    return json.loads(body)


def fetch_all_reviews() -> list[dict]:
    """Walk every page until all reviews for this dataset are collected."""
    page_size = 100
    offset = 0
    reviews: list[dict] = []

    while True:
        payload = fetch_reviews_page(limit=page_size, offset=offset)
        batch = payload.get("reviews") or []
        reviews.extend(batch)

        total = int(payload.get("total") or 0)
        offset += len(batch)

        if not batch or offset >= total:
            break

    return reviews


def rating_value(review: dict) -> int | None:
    """Return numeric rating if the API value is an integer, else None."""
    value = review.get("rating")
    if isinstance(value, bool) or value is None:
        return None
    if isinstance(value, int):
        return value
    if isinstance(value, float) and value.is_integer():
        return int(value)
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def reviews_at_or_above_rating(
    reviews: list[dict], min_inclusive: int
) -> list[dict]:
    """Reviews whose rating is greater than or equal to min_inclusive."""
    filtered: list[dict] = []
    for review in reviews:
        score = rating_value(review)
        if score is not None and score >= min_inclusive:
            filtered.append(review)
    return filtered


def preview_text(text: str, max_chars: int) -> str:
    """Shorten text for console output when it exceeds max_chars."""
    if len(text) <= max_chars:
        return text
    return text[:max_chars] + "…"


def review_row_for_export(review: dict) -> dict[str, object]:
    """Pick export fields from one API review object."""
    vp = review.get("verified_purchase", "")
    if isinstance(vp, bool):
        vp = "true" if vp else "false"
    body = review.get("review", "")
    if not isinstance(body, str):
        body = str(body) if body is not None else ""

    return {
        "app": review.get("app", ""),
        "date": review.get("date", ""),
        "verified_purchase": vp,
        "rating": review.get("rating", ""),
        "category": review.get("category", ""),
        "helpful_votes": review.get("helpful_votes", ""),
        "review": body,
    }


def print_review_summary(review: dict, counter: int) -> None:
    """Print numbered export fields for one review (review text preview only)."""
    row = review_row_for_export(review)
    display = dict(row)
    display["review"] = preview_text(
        str(display.get("review", "")), REVIEW_PRINT_PREVIEW_CHARS
    )
    parts = [f"{name}={display[name]}" for name in EXPORT_FIELDS]
    print(f"#{counter} | " + " | ".join(parts))


def write_results_csv(rows: list[dict], output_path: Path) -> None:
    """Write selected review columns to a CSV file."""
    with output_path.open("w", newline="", encoding="utf-8") as outfile:
        writer = csv.DictWriter(
            outfile, fieldnames=EXPORT_FIELDS, extrasaction="ignore"
        )
        writer.writeheader()
        for review in rows:
            writer.writerow(review_row_for_export(review))


def main() -> None:
    base_dir = Path(__file__).resolve().parent
    output_csv = base_dir / "reviews_category_helpful.csv"

    try:
        reviews = fetch_all_reviews()
    except HTTPError as err:
        print(f"HTTP error from API: {err.code} {err.reason}")
        raise SystemExit(1) from err
    except URLError as err:
        print(f"Network error reaching API: {err.reason}")
        raise SystemExit(1) from err
    except json.JSONDecodeError as err:
        print(f"Could not parse API response as JSON: {err}")
        raise SystemExit(1) from err

    total_fetched = len(reviews)
    filtered = reviews_at_or_above_rating(reviews, MIN_RATING_INCLUSIVE)

    print(
        f"Reviews with rating {MIN_RATING_INCLUSIVE} or above: "
        f"{len(filtered)} of {total_fetched} fetched\n"
    )

    for index, review in enumerate(filtered, start=1):
        print_review_summary(review, index)

    try:
        write_results_csv(filtered, output_csv)
    except OSError as err:
        print(f"Could not write CSV file: {err}")
        raise SystemExit(1) from err

    print(
        f"\nSaved {len(filtered)} rows (rating >= {MIN_RATING_INCLUSIVE}) "
        f"to {output_csv}"
    )


if __name__ == "__main__":
    main()
