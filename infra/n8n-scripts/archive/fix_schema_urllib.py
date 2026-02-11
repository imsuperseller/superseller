import urllib.request
import urllib.error
import json
import os

# Configuration
API_KEY = "CU8AI-6H4JM-86J1M"
BASE_URL = "http://172.245.56.50:5678/api/v1"

def make_request(method, endpoint, data=None):
    url = f"{BASE_URL}{endpoint}"
    print(f"Request: {method} {url}")
    headers = {
        "X-N8N-API-KEY": API_KEY,
        "Content-Type": "application/json"
    }
    
    try:
        if data:
            data_bytes = json.dumps(data).encode('utf-8')
        else:
            data_bytes = None
            
        req = urllib.request.Request(url, data=data_bytes, headers=headers, method=method)
        with urllib.request.urlopen(req) as response:
            status = response.status
            body = response.read().decode('utf-8')
            print(f"Status: {status}")
            try:
                return json.loads(body)
            except:
                return body
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.reason}")
        # print(e.read().decode('utf-8'))
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None

# Explore
# n8n API is limited. Tables might only be available via Internal API which uses Cookie Auth, not API Key sometimes.
# But let's check generic ones.
print("--- Probing for Projects ---")
# n8n doesn't document /projects for public API usually, but worth a shot if using Enterprise/Teams
make_request("GET", "/projects") 

# Check specific project endpoint derived from URL
PROJECT_ID = "6L20DLwgKEB5r0rn"
TABLE_ID = "6T8jI35R2tX1Mni9"

print(f"\n--- Probing Project {PROJECT_ID} ---")
make_request("GET", f"/projects/{PROJECT_ID}")

print(f"\n--- Probing Tables under Project ---")
make_request("GET", f"/projects/{PROJECT_ID}/datatables")
make_request("GET", f"/projects/{PROJECT_ID}/databases")

print(f"\n--- Probing Specific Table {TABLE_ID} ---")
# Try root level just in case
make_request("GET", f"/datatables/{TABLE_ID}")
make_request("GET", f"/databases/{TABLE_ID}")

# Try to use the internal API endpoint if public fails.
# Internal API usually starts with /rest/ or just /api/v1 but requires different auth maybe?
# The n8n frontend uses /rest/datatables usually?
