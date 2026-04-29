import csv


# Load the CSV file
filename = "demo_responses.csv"
responses = []

# newline="" avoids blank rows on Windows-style CSV line endings; utf-8 matches our saved files.
with open(filename, newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        responses.append(row)


def count_words(response: str) -> int:
    """Count words in one response string for length summaries.

    Parameters
    ----------
    response
        Raw text from the ``response`` column for one row.

    Returns
    -------
    int
        Number of whitespace-separated words (same rule as Week 2 summary script).
    """
    return len(response.split())


# Count words in each response and print a row-by-row summary
print(f"{'ID':<6} {'Role':<22} {'Words':<6} {'Response (first 60 chars)'}")
print("-" * 75)

word_counts = []

# Goes through each row in the responses list
for row in responses:
    participant = row["participant_id"]
    role = row["role"]
    response = row["response"]

    # Call our function to count words in this response
    count = count_words(response)
    word_counts.append(count)

    # Truncate so the terminal table stays readable on narrow windows.
    if len(response) > 60:
        preview = response[:60] + "..."
    else:
        preview = response

    print(f"{participant:<6} {role:<22} {count:<6} {preview}")

# Print summary statistics
print()
print("── Summary ─────────────────────────────────")
print(f"  Total responses : {len(word_counts)}")
print(f"  Shortest        : {min(word_counts)} words")
print(f"  Longest         : {max(word_counts)} words")
print(f"  Average         : {sum(word_counts) / len(word_counts):.1f} words")
