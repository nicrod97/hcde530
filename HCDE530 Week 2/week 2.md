# Week 2 — C2: Code literacy and documentation (resubmission)

## For a non-technical reader: what is in this folder?

Two small Python programs read survey-style answers from a **CSV** file (a spreadsheet saved as plain text). Each row is one person’s reply. The scripts **count how many words** are in the written answer, print a line for each person, then print a short summary (shortest, longest, and average length). That helps you see at a glance whether people wrote a little or a lot.

- **`demo_word_count.py`** — Earlier exercise: reads `demo_responses.csv`, loops through rows, and prints a table with participant id, role, word count, and a short preview of the text. Good for learning the flow step by step.

- **`response_length_summary.py`** — Same idea, structured for reuse: it looks next to the script for the CSV (so paths work whether you run from this folder or elsewhere), checks that the file and the `response` column exist **before** processing (so you get a clear error instead of a cryptic crash), lets you pass a different CSV name on the command line, and prints per-response counts plus min/max/average.

Sample data: `demo_responses.csv` and `dummy_responses.csv`. Extra context for the course lives in `CONTEXT.md`.

## How this meets C2 (documentation and readable code)

**Explaining for others:** This file is the plain-language map of the scripts. In the code itself, comments focus on **why** something is there—for example, using `Path(__file__)` so the script finds the CSV next to the file no matter where you run it from, and checking headers up front so missing columns fail with a message that says what to fix.

**Docstrings:** `load_response_texts` and `count_words` in `response_length_summary.py` each document what they accept, what they return, and what can go wrong (see the file for the exact wording). That is meant for “future you” or a teammate who needs to change the script without re-reading every line.

**Commit messages:** Going forward I am using messages that name the **behavior** and the **reason**, not labels like “update” or “fix.” For example: *“response_length_summary: validate CSV has response column before read”* or *“demo_word_count: truncate preview at 60 chars to keep terminal output readable.”* A past gap was having working code but almost no commits that explained documentation choices; this resubmission pairs this write-up with clearer conventions in the script and in git.

## Short competency claim

I can read and adjust these scripts, document them for a non-technical reader (this file), and keep **why-focused** comments plus **docstrings** that spell out inputs, outputs, and errors on the main helpers in `response_length_summary.py`. Commit messages should describe what changed and why, matching the examples above.
