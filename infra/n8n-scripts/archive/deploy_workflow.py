import json
import requests
import sys

# Configuration
API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYjRhMzI1MS0yNmY2LTQ2MTctYmNmOS1lMDdmM2NhOTY4YTciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYzNTA3OTM0fQ.8uTe56737gdeBCgiDMQLYplD_1vacCtAye8jgdPAO-w"
WORKFLOW_ID = "stj8DmATqe66D9j4"
INSTANCE_URL = "http://172.245.56.50:5678/api/v1"

# Load modified workflow
try:
    with open('modified_wf_v2.json', 'r') as f:
        wf = json.load(f)
except Exception as e:
    print(f"Error loading workflow: {e}")
    sys.exit(1)

# Minimal settings to avoid "additional properties" error
settings = {
    "executionOrder": "v1"
}

# Clean payload for Public API (PUT /workflows/{id})
payload = {
    "name": wf.get("name", "Modified Workflow"),
    "nodes": wf.get("nodes", []),
    "connections": wf.get("connections", {}),
    "settings": settings
}

headers = {
    "X-N8N-API-KEY": API_KEY,
    "Content-Type": "application/json"
}

print(f"Deploying workflow {WORKFLOW_ID} with MINIMAL SETTINGS to {INSTANCE_URL}...")
response = requests.put(f"{INSTANCE_URL}/workflows/{WORKFLOW_ID}", json=payload, headers=headers)

if response.status_code == 200:
    print("Workflow updated successfully with minimal settings!")
    print(f"Response: {response.text[:200]}...")
else:
    print(f"Failed to update workflow. Status code: {response.status_code}")
    print(f"Response: {response.text}")
    
    # Try with empty settings if minimal failed
    print("Trying with empty settings...")
    payload["settings"] = {}
    response = requests.put(f"{INSTANCE_URL}/workflows/{WORKFLOW_ID}", json=payload, headers=headers)
    if response.status_code == 200:
        print("Workflow updated successfully with EMPTY settings!")
    else:
        print(f"Failed again. Status: {response.status_code}")
        print(f"Response: {response.text}")
        sys.exit(1)
