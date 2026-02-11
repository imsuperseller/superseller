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

# 1. Update FinalListBuilder1 (Ensuring the same logic as previous "final" script)
for node in wf['nodes']:
    if node['name'] == 'FinalListBuilder1':
        node['parameters']['jsCode'] = """const staticData = $getWorkflowStaticData('global');

// Retrieve everything collected
const roomVideos = staticData.roomVideos || [];
const exteriorVideos = staticData.exteriorVideos || [];

const allVideos = [...exteriorVideos, ...roomVideos];

// IMPORTANT: Clear memory so the next execution starts fresh
staticData.roomVideos = [];
staticData.exteriorVideos = [];

// CASE: Zero videos (Handle gracefully)
if (allVideos.length === 0) {
    return { 
        json: { 
            video_url: null,
            skipMerge: true,
            success: false,
            reason: "no_videos"
        } 
    };
}

// CASE: Single video (Skip merge)
if (allVideos.length === 1) {
    return { 
        json: { 
            video_url: allVideos[0],
            skipMerge: true,
            success: true
        } 
    };
}

// CASE: Multiple videos (Standard)
return { 
    json: { 
        video_urls: allVideos,
        skipMerge: false,
        success: true
    } 
};"""

# 2. Update UpdateSuccess with DEFENSIVE expression
# Using n8n's recommended check for node execution to avoid "node hasn't been executed" error.
for node in wf['nodes']:
    if node['name'] == 'UpdateSuccess':
        if 'columns' in node['parameters'] and 'value' in node['parameters']['columns']:
            # status expression: check both current input ($json) and potential merge node output safely
            node['parameters']['columns']['value']['status'] = "={{ ($json.video_url || ($('MergeVideosintoTour1').isExecuted ? $('MergeVideosintoTour1').item.json.video_url : null)) ? 'completed' : 'failed_no_videos' }}"
            node['parameters']['columns']['value']['finalTourUrl'] = "={{ $json.video_url || ($('MergeVideosintoTour1').isExecuted ? $('MergeVideosintoTour1').item.json.video_url : '') }}"

# Clean payload for Public API
payload = {
    "name": wf.get("name", "Modified Workflow"),
    "nodes": wf.get("nodes", []),
    "connections": wf.get("connections", {}),
    "settings": {"executionOrder": "v1"}
}

headers = {
    "X-N8N-API-KEY": API_KEY,
    "Content-Type": "application/json"
}

print(f"Deploying defensive update to {WORKFLOW_ID}...")
response = requests.put(f"{INSTANCE_URL}/workflows/{WORKFLOW_ID}", json=payload, headers=headers)

if response.status_code == 200:
    print("Workflow updated successfully with defensive expressions!")
else:
    print(f"Failed to update workflow. Status code: {response.status_code}")
    print(f"Response: {response.text}")
    sys.exit(1)
