"""Fetch Week 4 API reviews and write a static HTML dashboard (positives vs. watch-outs)."""

from __future__ import annotations

import json
from html import escape
from pathlib import Path

from fetch_reviews import (
    fetch_all_reviews,
    rating_value,
    review_row_for_export,
)

# Ratings >= this value go in the “positives” section; lower ratings go in “things to look out for”.
SPLIT_RATING = 3


def split_reviews(reviews: list[dict]) -> tuple[list[dict], list[dict], int]:
    """Return (positives, watch_outs, skipped_missing_rating)."""
    positives: list[dict] = []
    watch_outs: list[dict] = []
    skipped = 0

    for review in reviews:
        score = rating_value(review)
        if score is None:
            skipped += 1
            continue
        if score >= SPLIT_RATING:
            positives.append(review)
        else:
            watch_outs.append(review)

    return positives, watch_outs, skipped


def render_card(review: dict, variant: str) -> str:
    """One review card as HTML (variant is 'positive' or 'watchout')."""
    row = review_row_for_export(review)
    score = rating_value(review)
    rating_attr = str(score) if score is not None else ""

    app = escape(str(row["app"]))
    date = escape(str(row["date"]))
    category = escape(str(row["category"]))
    rating = escape(str(row["rating"]))
    helpful = escape(str(row["helpful_votes"]))
    verified = escape(str(row["verified_purchase"]))
    body = escape(str(row["review"])).replace("\n", "<br />")

    return f"""<article class="card card--{variant}" data-rating="{escape(rating_attr)}">
  <div class="card__meta">
    <span class="pill pill--{variant}">{rating}★</span>
    <span class="card__app">{app}</span>
    <span class="card__muted">{category}</span>
  </div>
  <p class="card__body">{body}</p>
  <div class="card__footer">
    <span>{date}</span>
    <span>Helpful: {helpful}</span>
    <span>Verified: {verified}</span>
  </div>
</article>"""


def rating_filter_markup() -> str:
    """Checkboxes + actions for client-side rating filter (1–5 stars)."""
    chips = []
    for n in range(5, 0, -1):
        chips.append(
            f'<label class="filter-chip"><input type="checkbox" name="rating-filter" '
            f'value="{n}" checked /> {n}★</label>'
        )
    return "\n".join(chips)


def build_html(positives: list[dict], watch_outs: list[dict], skipped: int) -> str:
    """Assemble the full dashboard document."""
    positive_cards = "\n".join(render_card(r, "positive") for r in positives)
    watch_cards = "\n".join(render_card(r, "watchout") for r in watch_outs)
    filter_chips = rating_filter_markup()

    meta = {
        "splitRating": SPLIT_RATING,
        "positiveCount": len(positives),
        "watchoutCount": len(watch_outs),
        "skippedMissingRating": skipped,
    }
    meta_json = escape(json.dumps(meta), quote=True)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>HCDE 530 — Review text dashboard</title>
  <meta name="description" content="Synthetic app reviews split by star rating for research review." />
  <style>
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}

    :root {{
      --bg: #f4f5f7;
      --surface: #ffffff;
      --border: #e1e4ea;
      --text: #161922;
      --muted: #5c6370;
      --positive: #0d6b4d;
      --positive-soft: #e6f5ef;
      --watch: #8a4b12;
      --watch-soft: #fdf1e6;
      --shadow: 0 1px 2px rgba(22, 25, 34, 0.06);
    }}

    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.55;
      min-height: 100vh;
    }}

    header {{
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: 1.5rem clamp(1rem, 4vw, 2rem);
      box-shadow: var(--shadow);
    }}

    header h1 {{
      font-size: clamp(1.15rem, 2.5vw, 1.45rem);
      font-weight: 700;
      letter-spacing: -0.02em;
    }}

    header p {{
      color: var(--muted);
      font-size: 0.9rem;
      margin-top: 0.35rem;
      max-width: 52rem;
    }}

    .container {{
      max-width: 1200px;
      margin: 0 auto;
      padding: clamp(1rem, 3vw, 2rem);
    }}

    .stats {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 0.75rem;
      margin-bottom: 1.75rem;
    }}

    .stat {{
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 0.9rem 1rem;
      box-shadow: var(--shadow);
    }}

    .stat strong {{
      display: block;
      font-size: 1.35rem;
      font-weight: 700;
    }}

    .stat span {{
      font-size: 0.8rem;
      color: var(--muted);
    }}

    section.section {{
      margin-bottom: 2.25rem;
    }}

    .section__head {{
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 0.5rem 1rem;
      margin-bottom: 1rem;
    }}

    .section__head h2 {{
      font-size: 1.1rem;
      font-weight: 700;
    }}

    .section__head p {{
      font-size: 0.875rem;
      color: var(--muted);
    }}

    .grid {{
      display: grid;
      gap: 0.85rem;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
    }}

    .card {{
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1rem 1.05rem;
      box-shadow: var(--shadow);
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }}

    .card--positive {{
      border-top: 3px solid var(--positive);
      background: linear-gradient(180deg, var(--positive-soft) 0%, var(--surface) 42%);
    }}

    .card--watchout {{
      border-top: 3px solid var(--watch);
      background: linear-gradient(180deg, var(--watch-soft) 0%, var(--surface) 42%);
    }}

    .card__meta {{
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.4rem 0.65rem;
      font-size: 0.85rem;
    }}

    .pill {{
      font-weight: 700;
      font-size: 0.75rem;
      padding: 0.2rem 0.5rem;
      border-radius: 999px;
    }}

    .pill--positive {{
      background: #c6ebd9;
      color: var(--positive);
    }}

    .pill--watchout {{
      background: #fad9bc;
      color: var(--watch);
    }}

    .card__app {{
      font-weight: 600;
    }}

    .card__muted {{
      color: var(--muted);
      font-size: 0.8rem;
    }}

    .card__body {{
      font-size: 0.92rem;
      color: #22262e;
    }}

    .card__footer {{
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem 1rem;
      font-size: 0.75rem;
      color: var(--muted);
      border-top: 1px solid var(--border);
      padding-top: 0.55rem;
    }}

    footer.page-foot {{
      font-size: 0.78rem;
      color: var(--muted);
      padding: 0 0 2rem;
    }}

    footer.page-foot code {{
      font-size: 0.78em;
      background: #e9ebf0;
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
    }}

    .filter-panel {{
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1rem 1.1rem;
      margin-bottom: 1.5rem;
      box-shadow: var(--shadow);
    }}

    .filter-panel__title {{
      font-size: 0.9rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }}

    .filter-panel__row {{
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem 0.75rem;
    }}

    .filter-chips {{
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }}

    .filter-chip {{
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.82rem;
      padding: 0.35rem 0.55rem;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: #fafbfc;
      cursor: pointer;
      user-select: none;
    }}

    .filter-chip:has(input:checked) {{
      border-color: #2f6fed;
      background: #eef4ff;
    }}

    .filter-chip input {{
      margin: 0;
      accent-color: #2f6fed;
    }}

    .filter-actions {{
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }}

    .filter-actions button {{
      font: inherit;
      font-size: 0.8rem;
      padding: 0.35rem 0.65rem;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: var(--surface);
      cursor: pointer;
    }}

    .filter-actions button:hover {{
      background: #f0f2f6;
    }}

    #filter-live {{
      width: 100%;
      margin-top: 0.65rem;
      font-size: 0.8rem;
      color: var(--muted);
    }}
  </style>
</head>
<body>
  <header>
    <h1>Review text dashboard</h1>
    <p>
      Synthetic app reviews from the Week 4 API, split for research: <strong>positives</strong> are ratings
      <strong>{SPLIT_RATING}+</strong>; <strong>things to look out for</strong> are ratings <strong>below {SPLIT_RATING}</strong>.
    </p>
  </header>

  <div class="container">
    <div class="stats" aria-label="Summary counts">
      <div class="stat">
        <strong>{len(positives)}</strong>
        <span>Positives ({SPLIT_RATING}+ stars)</span>
      </div>
      <div class="stat">
        <strong>{len(watch_outs)}</strong>
        <span>Watch-outs (below {SPLIT_RATING})</span>
      </div>
      <div class="stat">
        <strong>{skipped}</strong>
        <span>Skipped (missing rating)</span>
      </div>
    </div>

    <div class="filter-panel" role="region" aria-label="Filter reviews by star rating">
      <div class="filter-panel__title">Filter by star rating</div>
      <div class="filter-panel__row">
        <div class="filter-chips">
{filter_chips}
        </div>
        <div class="filter-actions">
          <button type="button" id="rating-filter-all">Select all</button>
          <button type="button" id="rating-filter-none">Clear all</button>
        </div>
      </div>
      <p id="filter-live" aria-live="polite"></p>
    </div>

    <section class="section" aria-labelledby="positives-heading">
      <div class="section__head">
        <h2 id="positives-heading">Positives — themes and praise ({SPLIT_RATING}+ stars)</h2>
        <p>Use this section to spot strengths users call out across apps and categories.</p>
      </div>
      <div class="grid">
{positive_cards}
      </div>
    </section>

    <section class="section" aria-labelledby="watch-heading">
      <div class="section__head">
        <h2 id="watch-heading">Things to look out for — risks and friction (below {SPLIT_RATING} stars)</h2>
        <p>Use this section for research caveats: complaints, confusion, and unmet expectations.</p>
      </div>
      <div class="grid">
{watch_cards}
      </div>
    </section>

    <footer class="page-foot">
      Built from live API data. Machine-readable summary:
      <code id="dashboard-meta" data-json="{meta_json}"></code>
    </footer>
  </div>
  <script>
(function () {{
  const cards = document.querySelectorAll(".card[data-rating]");
  const inputs = document.querySelectorAll('input[name="rating-filter"]');
  const live = document.getElementById("filter-live");

  function selectedRatings() {{
    return Array.from(inputs)
      .filter(function (el) {{ return el.checked; }})
      .map(function (el) {{ return el.value; }});
  }}

  function applyFilter() {{
    const selected = selectedRatings();
    let visible = 0;
    cards.forEach(function (card) {{
      const r = card.getAttribute("data-rating");
      const show = selected.length > 0 && selected.indexOf(r) !== -1;
      card.style.display = show ? "" : "none";
      if (show) visible += 1;
    }});
    if (live) {{
      if (selected.length === 0) {{
        live.textContent =
          "Select one or more star ratings to see reviews (all filters cleared).";
      }} else {{
        live.textContent =
          "Showing " +
          visible +
          " of " +
          cards.length +
          " reviews for: " +
          selected
            .map(Number)
            .sort(function (a, b) {{ return b - a; }})
            .join(", ") +
          " stars.";
      }}
    }}
  }}

  inputs.forEach(function (el) {{
    el.addEventListener("change", applyFilter);
  }});
  const allBtn = document.getElementById("rating-filter-all");
  const noneBtn = document.getElementById("rating-filter-none");
  if (allBtn) {{
    allBtn.addEventListener("click", function (e) {{
      e.preventDefault();
      inputs.forEach(function (el) {{ el.checked = true; }});
      applyFilter();
    }});
  }}
  if (noneBtn) {{
    noneBtn.addEventListener("click", function (e) {{
      e.preventDefault();
      inputs.forEach(function (el) {{ el.checked = false; }});
      applyFilter();
    }});
  }}
  applyFilter();
}})();
  </script>
</body>
</html>
"""


def main() -> None:
    base_dir = Path(__file__).resolve().parent
    output_path = base_dir / "review_dashboard.html"

    reviews = fetch_all_reviews()
    positives, watch_outs, skipped = split_reviews(reviews)
    html = build_html(positives, watch_outs, skipped)

    output_path.write_text(html, encoding="utf-8")
    print(f"Wrote {output_path} ({len(positives)} positives, {len(watch_outs)} watch-outs).")


if __name__ == "__main__":
    main()
