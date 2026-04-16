import csv
from pathlib import Path


def main() -> None:
    # Get the folder where this script lives so file paths work from anywhere.
    base_dir = Path(__file__).resolve().parent
    # Define the input and output CSV file locations.
    input_file = base_dir / "responses.csv"
    output_file = base_dir / "responses cleaned.csv"

    # Open the source CSV and read rows as dictionaries (column -> value).
    with input_file.open("r", newline="", encoding="utf-8") as infile:
        reader = csv.DictReader(infile)
        # Keep original headers so the output file has the same column order.
        fieldnames = reader.fieldnames

        # Guard against malformed files with missing headers.
        if not fieldnames:
            raise ValueError("Input CSV has no header row.")

        # Collect rows that pass cleaning rules.
        cleaned_rows = []
        for row in reader:
            # Read the "name" field safely and trim surrounding whitespace.
            name_value = (row.get("name") or "").strip()
            # Skip rows where name is missing or only spaces.
            if not name_value:
                continue

            # Normalize "role" values by converting to uppercase.
            if "role" in row and row["role"] is not None:
                row["role"] = row["role"].upper()

            # Keep the cleaned row for output.
            cleaned_rows.append(row)

    # Write cleaned data to a new CSV file.
    with output_file.open("w", newline="", encoding="utf-8") as outfile:
        writer = csv.DictWriter(outfile, fieldnames=fieldnames)
        # Write header first, then all cleaned rows.
        writer.writeheader()
        writer.writerows(cleaned_rows)


# Run main() only when this file is executed directly.
if __name__ == "__main__":
    main()
