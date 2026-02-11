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

# 1. Update MergeVideosintoTour1 URL to Port 3456
for node in wf['nodes']:
    if node['name'] == 'MergeVideosintoTour1':
        node['parameters']['url'] = "http://172.245.56.50:3456/merge"
        # Ensure it expects JSON (which is default for httpRequest 4.3 if sendBody is true)
        print("Updated MergeVideosintoTour1 to port 3456")

# 2. Update PrepareUpdateSuccess Logic to handle port 3456 response
for node in wf['nodes']:
    if node['name'] == 'PrepareUpdateSuccess':
        node['parameters']['jsCode'] = """
const submission = $('StoreSubmission').item.json;
const mergeNodeCalled = $('MergeVideosintoTour1').isExecuted;
const current = $json;

let finalUrl = null;
let status = 'completed';

if (mergeNodeCalled) {
    // Port 3456 returns { success: true, video_url: "..." }
    const mergeData = $('MergeVideosintoTour1').item.json;
    finalUrl = mergeData.video_url;
} else if (current.video_url) {
    // This is the "Skip Merge" 1-video case
    finalUrl = current.video_url;
} else if (current.success === false) {
    status = 'failed_no_videos';
}

return {
    json: {
        id: submission.id,
        video_url: finalUrl,
        status: status
    }
};
"""
        print("Updated PrepareUpdateSuccess logic for port 3456")

# Clean payload for deploy
payload = {
    "name": wf.get("name", "Modified Workflow"),
    "nodes": wf.get("nodes", []),
    "connections": wf.get("connections", {}),
    "settings": {"executionOrder": "v1"}
}

print(f"Deploying Port 3456 update to {WORKFLOW_ID}...")
response = requests.put(f"{INSTANCE_URL}/workflows/{WORKFLOW_ID}", json=payload, headers={"X-N8N-API-KEY": API_KEY, "Content-Type": "application/json"})

if response.status_code == 200:
    print("Workflow updated successfully with Port 3456!")
else:
    print(f"Failed. Status: {response.status_code}")
    print(f"Response: {response.text}")
    sys.exit(1)
