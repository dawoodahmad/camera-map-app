import json
import os
from flask import Flask, jsonify, render_template
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

DATA_FILE = "data/camera_locations_geocoded.json"

@app.route("/")
def index():
    return render_template(
        "index.html",
        google_maps_api_key=os.getenv("GOOGLE_MAPS_API_KEY")
    )

@app.route("/data")
def get_data():
    with open(DATA_FILE, "r", encoding="utf-8") as file:
        return jsonify(json.load(file))

if __name__ == "__main__":
    app.run(debug=True)