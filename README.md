Camera Map Web App

This project visualises traffic camera locations on a Google Map with filtering, search, clustering, and detailed popups.

⸻

🚀 Run Locally (Step-by-Step)

Follow these steps exactly. Do not skip steps.

1. Navigate to project folder

cd "/Users/dawoodahmed/Documents/Learning/Camera Data"

⸻

2. Create virtual environment

python3 -m venv venv
source venv/bin/activate

⸻

3. Install dependencies

pip install flask python-dotenv

(Optional)

pip freeze > requirements.txt

⸻

4. Verify project structure

Camera Data/
├── app.py
├── .env
├── data/
│   └── camera_locations_geocoded.json
├── templates/
│   └── index.html
└── static/
    ├── css/
    │   └── styles.css
    └── js/
        └── map.js

⸻

5. Create .env

touch .env

Add your API key:

GOOGLE_MAPS_API_KEY=your_actual_key_here

⸻

6. Run the application

python app.py

Expected output:

Running on http://127.0.0.1:5000/

⸻

7. Open in browser

http://127.0.0.1:5000

⸻

⚠️ Troubleshooting

❌ Blank Map

* API key is invalid
* Maps JavaScript API is not enabled

Fix:

* Enable Google Maps JavaScript API in Google Cloud

⸻

❌ No markers showing

Check backend: