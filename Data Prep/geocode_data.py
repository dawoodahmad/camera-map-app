import json
import time
import os
import requests

INPUT_FILE = "camera_locations.json"
OUTPUT_FILE = "camera_locations_geocoded.json"

API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

if not API_KEY:
    raise Exception("GOOGLE_MAPS_API_KEY environment variable is missing")

def geocode_location(location):
    address = f"{location}, Bristol, UK"

    url = "https://maps.googleapis.com/maps/api/geocode/json"

    params = {
        "address": address,
        "key": API_KEY,
        "region": "uk"
    }

    response = requests.get(url, params=params)
    data = response.json()

    if data["status"] == "OK":
        result = data["results"][0]
        lat_lng = result["geometry"]["location"]

        return {
            "latitude": lat_lng["lat"],
            "longitude": lat_lng["lng"],
            "formatted_address": result["formatted_address"],
            "geocode_status": "OK"
        }

    return {
        "latitude": None,
        "longitude": None,
        "formatted_address": None,
        "geocode_status": data["status"]
    }

with open(INPUT_FILE, "r", encoding="utf-8") as file:
    locations = json.load(file)

for index, item in enumerate(locations, start=1):
    if item["latitude"] and item["longitude"]:
        continue

    print(f"{index}/{len(locations)} - Geocoding: {item['location']}")

    result = geocode_location(item["location"])

    item["latitude"] = result["latitude"]
    item["longitude"] = result["longitude"]
    item["formatted_address"] = result["formatted_address"]
    item["geocode_status"] = result["geocode_status"]

    time.sleep(0.2)

with open(OUTPUT_FILE, "w", encoding="utf-8") as file:
    json.dump(locations, file, indent=2, ensure_ascii=False)

print(f"Done. Created {OUTPUT_FILE}")