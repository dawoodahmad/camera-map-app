import re
import csv
import json

INPUT_FILE = "Raw_Data.txt"
CSV_OUTPUT = "camera_locations.csv"
JSON_OUTPUT = "camera_locations.json"

SECTION_MAP = {
    "Fixed camera locations": "Fixed Camera",
    "Mobile enforcement": "Mobile Enforcement",
    "Red light camera locations": "Red Light Camera",
}

records = []
current_type = None

with open(INPUT_FILE, "r", encoding="utf-8") as file:
    lines = [line.strip() for line in file if line.strip()]

for line in lines:
    if line in SECTION_MAP:
        current_type = SECTION_MAP[line]
        continue

    if not current_type:
        continue

    match = re.search(r"^(.*?)View this camera site on map\s*–\s*(.*?),\s*site:\s*(\d+)$", line)

    if match:
        location = match.group(1).strip()
        speed_or_type = match.group(2).strip()
        site_id = match.group(3).strip()

        speed_limit = None
        camera_label = None

        if "mph" in speed_or_type.lower():
            speed_limit = speed_or_type
        else:
            camera_label = speed_or_type

        records.append({
            "type": current_type,
            "location": location,
            "speed_limit": speed_limit,
            "camera_label": camera_label,
            "site_id": site_id,
            "latitude": None,
            "longitude": None,
        })

with open(CSV_OUTPUT, "w", newline="", encoding="utf-8") as csvfile:
    fieldnames = [
        "type",
        "location",
        "speed_limit",
        "camera_label",
        "site_id",
        "latitude",
        "longitude",
    ]

    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(records)

with open(JSON_OUTPUT, "w", encoding="utf-8") as jsonfile:
    json.dump(records, jsonfile, indent=2, ensure_ascii=False)

print(f"Created {CSV_OUTPUT}")
print(f"Created {JSON_OUTPUT}")
print(f"Total records: {len(records)}")