# Week 3 Competency Claim — C3 (data cleaning and file handling, resubmission)

## ValueError on `experience_years`

I got `ValueError: invalid literal for int() with base 10: 'fifteen'` and, **before** asking an agent to explain the traceback, I traced the failure to one row: `experience_years` held the **English word** `fifteen`, not the digit string `"15"`. Python’s `int()` only accepts strings that are valid integer literals (digits, optional sign)—not number words. That is the gap between data that **looks** numeric to a person (a column labeled “years of experience”) and data that **is** numeric to the parser: the CSV still stores text, and a word like `fifteen` cannot be converted the same way as `"15"`. I wrapped the conversion in `try`/`except ValueError`, skip non-parseable rows, and compute the average only over rows where `int(...)` succeeds.

## Top satisfaction scores (sort bug)

For “top 5” satisfaction I had sorted scores **ascending** (Python’s default) and then taken `[:5]`, which returned the **five lowest** scores, not the highest. The fix is to sort **descending** (`reverse=True` on the score) before slicing, so the first five rows are the true top five. That change is in `week3_analysis_buggy.py` alongside this resubmission.

## CSV cleaning and repeatable output

`clean_responses.py` reads `responses.csv` (not hardcoded rows), drops rows with empty names, normalizes `role`, and writes `responses cleaned.csv`. `week3_analysis_buggy.py` reads `week3_survey_messy.csv`, normalizes roles for counting, flags malformed `age_range` values, and prints summaries in a stable order each run.

## Commits

Earlier commit messages on this branch were vague (“added new function,” etc.) and did not spell out the ValueError cause or the sort bug. This resubmission adds the explanations above and a new commit that states the satisfaction **sort direction fix** explicitly so the history matches what changed and why.
