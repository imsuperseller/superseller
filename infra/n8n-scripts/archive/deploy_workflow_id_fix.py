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

# 1. Update PrepareUpdateSuccess to ensure ID is passed through
for node in wf['nodes']:
    if node['name'] == 'PrepareUpdateSuccess':
        node['parameters']['jsCode'] = """
const submission = $('StoreSubmission').item.json;
const current = $json;

// Determine status based on current branch results
let status = 'completed';
if (current.success === false || current.reason === 'no_videos') {
    status = 'failed_no_videos';
}

return {
    json: {
        id: submission.id,
        video_url: current.video_url || null,
        status: status
    }
};
"""

# 2. Update UpdateSuccess with the CORRECT conditions structure
for node in wf['nodes']:
    if node['name'] == 'UpdateSuccess':
        # Remove the incorrect matchingColumns
        if 'columns' in node['parameters'] and 'matchingColumns' in node['parameters']['columns']:
            del node['parameters']['columns']['matchingColumns']
        
        # Add the properly structured conditions
        node['parameters']['conditions'] = {
            "combinator": "and",
            "conditions": [
                {
                    "id": "match-by-id",
                    "leftValue": "id", # Column name
                    "operator": {
                        "operation": "equals",
                        "type": "string" # Using string to be safe, or number if confirmed
                    },
                    "rightValue": "={{ $json.id }}" # Value from node input
                }
            ]
        }
        
        # Ensure values to update are mapped
        node['parameters']['columns']['value'] = {
            "status": "={{ $json.status }}",
            "finalTourUrl": "={{ $json.video_url }}"
        }

# Clean payload
payload = {
    "name": wf.get("name", "Modified Workflow"),
    "nodes": wf.get("nodes", []),
    "connections": wf.get("connections", {}),
    "settings": {"executionOrder": "v1"}
}

print(f"Deploying definitive ID condition fix to {WORKFLOW_ID}...")
response = requests.put(f"{INSTANCE_URL}/workflows/{WORKFLOW_ID}", json=payload, headers={"X-N8N-API-KEY": API_KEY, "Content-Type": "application/json"})

if response.status_code == 200:
    print("Workflow updated successfully with ID-based conditions!")
else:
    print(f"Failed. Status: {response.status_code}")
    print(f"Response: {response.text}")
    sys.exit(1)
