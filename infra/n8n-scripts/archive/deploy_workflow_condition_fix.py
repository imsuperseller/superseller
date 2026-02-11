import json
import requests
import sys

# Configuration
API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYjRhMzI1MS0yNmY2LTQ2MTctYmNmOS1lMDdmM2NhOTY4YTciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYzNTA3OTM0fQ.8uTe56737gdeBCgiDMQLYplD_1vacCtAye8jgdPAO-w"
WORKFLOW_ID = "stj8DmATqe66D9j4"
INSTANCE_URL = "http://172.245.56.50:5678/api/v1"

# Load current workflow to modify
try:
    # Fetch fresh to ensure we have IDs
    response = requests.get(f"{INSTANCE_URL}/workflows/{WORKFLOW_ID}", headers={"X-N8N-API-KEY": API_KEY})
    wf = response.json()
except Exception as e:
    print(f"Error fetching workflow: {e}")
    sys.exit(1)

# 1. Create the PrepareUpdateSuccess node
prepare_update_node = {
    "parameters": {
        "jsCode": "const submission = $('StoreSubmission').item.json;\nreturn { json: { id: submission.id, video_url: $json.video_url, status: ($json.success === false || $json.reason === 'no_videos') ? 'failed_no_videos' : 'completed' } };"
    },
    "id": "prepare-update-id-new",
    "name": "PrepareUpdateSuccess",
    "type": "n8n-nodes-base.code",
    "typeVersion": 2,
    "position": [-1700, 15100]
}

# Add the new node
wf['nodes'].append(prepare_update_node)

# 2. Update connections
# Remove old connections to UpdateSuccess
connections = wf['connections']

# Find connections TO UpdateSuccess and redirect them to PrepareUpdateSuccess
for node_name, node_conn in connections.items():
    if 'main' in node_conn:
        for branch in node_conn['main']:
            for target in branch:
                if target['node'] == 'UpdateSuccess':
                    target['node'] = 'PrepareUpdateSuccess'

# Add the connection FROM PrepareUpdateSuccess TO UpdateSuccess
if 'PrepareUpdateSuccess' not in connections:
    connections['PrepareUpdateSuccess'] = {"main": [[{"node": "UpdateSuccess", "type": "main", "index": 0}]]}

# 3. Update UpdateSuccess parameters to use the newly injected fields
for node in wf['nodes']:
    if node['name'] == 'UpdateSuccess':
        node['parameters']['columns']['value'] = {
            "status": "={{ $json.status }}",
            "finalTourUrl": "={{ $json.video_url }}"
        }
        # Ensure matchingColumns is set to id
        node['parameters']['columns']['matchingColumns'] = ["id"]

# Clean payload for Public API
payload = {
    "name": wf.get("name", "Modified Workflow"),
    "nodes": wf.get("nodes", []),
    "connections": wf.get("connections", {}),
    "settings": {"executionOrder": "v1"}
}

print(f"Deploying condition fix update to {WORKFLOW_ID}...")
response = requests.put(f"{INSTANCE_URL}/workflows/{WORKFLOW_ID}", json=payload, headers={"X-N8N-API-KEY": API_KEY, "Content-Type": "application/json"})

if response.status_code == 200:
    print("Workflow updated successfully with condition/ID fix!")
else:
    print(f"Failed to update workflow. Status code: {response.status_code}")
    print(f"Response: {response.text}")
    sys.exit(1)
