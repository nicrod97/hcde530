import csv
from collections import Counter
from pathlib import Path


def main() -> None:
    # Build path to the cleaned CSV in the same folder as this script.
    base_dir = Path(__file__).resolve().parent
    input_file = base_dir / "responses cleaned.csv"

    role_counts: Counter[str] = Counter()

    # Read cleaned CSV and count each role value.
    with input_file.open("r", newline="", encoding="utf-8") as infile:
        reader = csv.DictReader(infile)
        for row in reader:
            role = (row.get("role") or "").strip()
            if role:
                role_counts[role] += 1

    # Print counts sorted from highest to lowest.
    print("Role counts:")
    for role, count in role_counts.most_common():
        print(f"{role}: {count}")


if __name__ == "__main__":
    main()
