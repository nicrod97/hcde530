import csv
import sys
from pathlib import Path


def count_words(text):
    """Return the number of words in a response string."""
    return len(text.split())


def load_response_texts(csv_name="demo_responses.csv"):
    """Load non-empty response values from the CSV file."""
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


def main():
    # Optional: pass a CSV filename, e.g., python3 response_length_summary.py dummy_responses.csv
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
