import csv
import sys
from pathlib import Path


def count_words(text: str) -> int:
    """Count words in one survey response string.

    Parameters
    ----------
    text
        Full text from a single ``response`` cell (may include multiple sentences).

    Returns
    -------
    int
        Number of whitespace-separated tokens; empty or whitespace-only input is 0.

    Notes
    -----
    We use simple ``split()`` (not a linguistics tokenizer) because the assignment
    only needs a consistent, repeatable length metric across rows.
    """
    return len(text.split())


def load_response_texts(csv_name: str = "demo_responses.csv") -> list[str]:
    """Load trimmed, non-empty ``response`` values from a CSV next to this script.

    Parameters
    ----------
    csv_name
        Filename only (not a path); resolved beside ``response_length_summary.py``
        so the script behaves the same when run from the repo root or this folder.

    Returns
    -------
    list[str]
        Each string is one participant response, in file order, excluding blank cells.

    Raises
    ------
    FileNotFoundError
        If the CSV is missing—stops early so we never mis-read another file by accident.
    ValueError
        If the header row is missing or lacks a ``response`` column—fail fast with a
        fix hint instead of a downstream KeyError deep in a loop.
    """
    # Anchor to this file so relative paths do not depend on the shell's cwd.
    csv_path = Path(__file__).with_name(csv_name)
    if not csv_path.exists():
        raise FileNotFoundError(
            f"File not found: {csv_path}. Put the CSV in the same folder as this script."
        )

    with csv_path.open(newline="", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        if not reader.fieldnames or "response" not in reader.fieldnames:
            raise ValueError(
                "Missing required column: response. Check your CSV header names."
            )
        return [row["response"].strip() for row in reader if row["response"].strip()]


def main() -> None:
    # argv lets graders swap in dummy_responses.csv without editing the source.
    csv_name = sys.argv[1] if len(sys.argv) > 1 else "demo_responses.csv"
    responses = load_response_texts(csv_name)
    word_counts = [count_words(response) for response in responses]

    print("Word count per response:")
    for i, count in enumerate(word_counts, start=1):
        print(f"{i:>2}. {count:>3} words")

    print("\nSummary:")
    print(f"Shortest response: {min(word_counts)} words")
    print(f"Longest response : {max(word_counts)} words")
    print(f"Average response : {sum(word_counts) / len(word_counts):.1f} words")


if __name__ == "__main__":
    main()
