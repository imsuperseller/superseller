import json
import requests
import sys

# Configuration
API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYjRhMzI1MS0yNmY2LTQ2MTctYmNmOS1lMDdmM2NhOTY4YTciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYzNTA3OTM0fQ.8uTe56737gdeBCgiDMQLYplD_1vacCtAye8jgdPAO-w"
WORKFLOW_ID = "stj8DmATqe66D9j4"
INSTANCE_URL = "http://172.245.56.50:5678/api/v1"

# Fetch current workflow
try:
    response = requests.get(f"{INSTANCE_URL}/workflows/{WORKFLOW_ID}", headers={"X-N8N-API-KEY": API_KEY})
    wf = response.json()
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)

connections = wf['connections']

# Fix ExteriorReady1 -> CollectExteriorVideos -> SyncBranches
# 0 = True, 1 = False
print("Restoring CollectExteriorVideos connection...")

# 1. Connect ExteriorReady1 (True) to CollectExteriorVideos
connections['ExteriorReady1']['main'][0] = [{"node": "CollectExteriorVideos", "type": "main", "index": 0}]

# 2. Connect ExteriorReady1 (False) directly to SyncBranches (to avoid hanging)
connections['ExteriorReady1']['main'][1] = [{"node": "SyncBranches", "type": "main", "index": 1}]

# 3. Connect CollectExteriorVideos to SyncBranches
connections['CollectExteriorVideos'] = {
    "main": [
        [
            {
                "node": "SyncBranches",
                "type": "main",
                "index": 1
            }
        ]
    ]
}

wf['connections'] = connections

# Clean payload
payload = {
    "name": wf.get("name", "Modified Workflow"),
    "nodes": wf.get("nodes", []),
    "connections": wf.get("connections", {}),
    "settings": {"executionOrder": "v1"}
}

response = requests.put(f"{INSTANCE_URL}/workflows/{WORKFLOW_ID}", json=payload, headers={"X-N8N-API-KEY": API_KEY, "Content-Type": "application/json"})

if response.status_code == 200:
    print("Workflow updated successfully! CollectExteriorVideos restored.")
else:
    print(f"Failed. Status: {response.status_code}")
    print(f"Response: {response.text}")
    sys.exit(1)
