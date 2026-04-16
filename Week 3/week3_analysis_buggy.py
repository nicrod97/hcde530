import csv
import re

# Load the survey data from a CSV file
filename = "week3_survey_messy.csv"
rows = []

with open(filename, newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        rows.append(row)

# Count responses by role
# Normalize role names so "ux researcher" and "UX Researcher" are counted together
role_counts = {}
for row in rows:
    role = row["role"].strip().title()
    if not role:   # skip empty roles
        continue
    if role in role_counts:
        role_counts[role] += 1
    else:
        role_counts[role] = 1
print("Responses by role:")
for role, count in sorted(role_counts.items()):
    print(f"  {role}: {count}")


# Flag rows with invalid age ranges
# Valid format is "##-##" with both values between 16 and 100
def flag_invalid_ages(rows, field="age_range", min_age=16, max_age=100):
    flagged = []
    for i, row in enumerate(rows):
        value = row.get(field, "").strip()
        match = re.fullmatch(r"(\d+)-(\d+)", value)
        if not match:
            flagged.append((i + 2, row.get("participant_name", "?"), value or "(empty)"))
        else:
            low, high = int(match.group(1)), int(match.group(2))
            if low < min_age or high > max_age or low >= high:
                flagged.append((i + 2, row.get("participant_name", "?"), value))
    return flagged

invalid_ages = flag_invalid_ages(rows)
print(f"\nInvalid age ranges found: {len(invalid_ages)}")
for row_num, name, value in invalid_ages:
    print(f"  Row {row_num} ({name}): '{value}'")


# Calculate the average years of experience
# FIX LOCATION: This block replaces the original direct int conversion.
# We safely parse "experience_years" so text values like "fifteen" do not crash the script.
total_experience = 0
valid_experience_count = 0

for row in rows:
    try:
        total_experience += int(row["experience_years"])
        valid_experience_count += 1
    except ValueError:
        # Skip rows where experience_years is not a valid integer.
        continue

# FIX LOCATION: Use only valid numeric rows for the denominator.
if valid_experience_count > 0:
    avg_experience = total_experience / valid_experience_count
    print(f"\nAverage years of experience: {avg_experience:.1f}")
else:
    print("\nAverage years of experience: no valid numeric data")

# Find the top 5 highest satisfaction scores
scored_rows = []
for row in rows:
    if row["satisfaction_score"].strip():
        scored_rows.append((row["participant_name"], int(row["satisfaction_score"])))

scored_rows.sort(key=lambda x: x[1])
top5 = scored_rows[:5]

print("\nTop 5 satisfaction scores:")
for name, score in top5:
    print(f"  {name}: {score}")
