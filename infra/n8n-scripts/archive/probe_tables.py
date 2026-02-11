import requests
import os

# Configuration
API_KEY = os.environ.get("N8N_API_KEY")
BASE_URL = "http://172.245.56.50:5678/api/v1"  # Derived from push_workflow.py logic
# BASE_URL = "https://n8n.rensto.com/api/v1" # Alternate if IP fails

HEADERS = {
    "X-N8N-API-KEY": API_KEY,
    "Content-Type": "application/json"
}

def probe(endpoint):
    url = f"{BASE_URL}{endpoint}"
    try:
        print(f"Probing {url}...")
        response = requests.get(url, headers=HEADERS, timeout=5)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            try:
                data = response.json()
                # Print simplified structure
                if isinstance(data, list):
                    print(f"Results: {len(data)} items")
                    if len(data) > 0:
                        print(f"First item keys: {list(data[0].keys())}")
                else:
                    print(f"Result keys: {list(data.keys())}")
                return data
            except:
                print("Response not JSON")
        else:
            print(f"Error: {response.text[:200]}")
    except Exception as e:
        print(f"Request failed: {e}")

# Try known or guessed endpoints
print("--- Probing for Tables ---")
probe("/databases") # Often used for internal DBs
probe("/data-tables")
probe("/tables")
probe("/projects") # Might contain tables if nested
probe("/workflows") # Just to confirm auth works
