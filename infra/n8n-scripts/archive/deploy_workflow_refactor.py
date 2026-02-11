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

nodes = wf['nodes']
connections = wf['connections']

# 1. Create InitializeGlobalStorage Node (Centralized)
init_node = {
    "parameters": {
        "jsCode": "const staticData = $getWorkflowStaticData('global');\nstaticData.roomVideos = [];\nstaticData.exteriorVideos = [];\nreturn { json: { initialized: true } };"
    },
    "id": "init-global-storage-new",
    "name": "InitializeGlobalStorage",
    "type": "n8n-nodes-base.code",
    "typeVersion": 2,
    "position": [-3800, 15536]
}

# 2. Create SyncBranches (Merge Node)
sync_node = {
    "parameters": {
        "mode": "chooseBranch",
        "options": {}
    },
    "id": "sync-branches-new",
    "name": "SyncBranches",
    "type": "n8n-nodes-base.merge",
    "typeVersion": 3,
    "position": [-2300, 15248]
}

# Add nodes
nodes.append(init_node)
nodes.append(sync_node)

# 3. Structural Rerouting
# A. Route StoreSubmission -> InitializeGlobalStorage -> Switch
if 'StoreSubmission' in connections:
    connections['StoreSubmission']['main'][0] = [{"node": "InitializeGlobalStorage", "type": "main", "index": 0}]

connections['InitializeGlobalStorage'] = {"main": [[{"node": "Switch", "type": "main", "index": 0}]]}

# B. Remove race-prone redundant InitStorage nodes
nodes = [n for n in nodes if n['name'] not in ['InitStorage', 'InitStorage1']]
if 'InitStorage1' in connections: del connections['InitStorage1']
if 'InitStorage' in connections: del connections['InitStorage']

# C. Route ExteriorReady1 -> SyncBranches (Input 1)
# Find ExteriorReady1 output connections
if 'ExteriorReady1' in connections:
    # 0 = true, 1 = false
    # Route BOTH to the sync node to ensure it continues even if no exterior photos found
    connections['ExteriorReady1']['main'][0] = [{"node": "SyncBranches", "type": "main", "index": 1}]
    connections['ExteriorReady1']['main'][1] = [{"node": "SyncBranches", "type": "main", "index": 1}]

# D. Route LoopOverRooms (Done output) -> SyncBranches (Input 0)
if 'LoopOverRooms' in connections:
    # 0 = loop, 1 = done
    connections['LoopOverRooms']['main'][1] = [{"node": "SyncBranches", "type": "main", "index": 0}]

# E. Route SyncBranches -> FinalListBuilder1
connections['SyncBranches'] = {"main": [[{"node": "FinalListBuilder1", "type": "main", "index": 0}]]}

# F. Fix FinalListBuilder1 input - remove direct connection from LoopOverRooms
# (Handled by SyncBranches routing above)

# G. Ensure FinalListBuilder1 DOES NOT clear memory anymore (Refinement)
for node in nodes:
    if node['name'] == 'FinalListBuilder1':
        node['parameters']['jsCode'] = """
const staticData = $getWorkflowStaticData('global');

const roomVideos = staticData.roomVideos || [];
const exteriorVideos = staticData.exteriorVideos || [];
const allVideos = [...exteriorVideos, ...roomVideos];

console.log(`Aggregated ${allVideos.length} videos (${exteriorVideos.length} ext, ${roomVideos.length} room)`);

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

if (allVideos.length === 1) {
    return { 
        json: { 
            video_url: allVideos[0],
            skipMerge: true,
            success: true
        } 
    };
}

return { 
    json: { 
        video_urls: allVideos,
        skipMerge: false,
        success: true
    } 
};
"""

# Re-package
wf['nodes'] = nodes
wf['connections'] = connections

# Clean payload
payload = {
    "name": wf.get("name", "Modified Workflow"),
    "nodes": wf.get("nodes", []),
    "connections": wf.get("connections", {}),
    "settings": {"executionOrder": "v1"}
}

print(f"Deploying structural refactor to {WORKFLOW_ID}...")
response = requests.put(f"{INSTANCE_URL}/workflows/{WORKFLOW_ID}", json=payload, headers={"X-N8N-API-KEY": API_KEY, "Content-Type": "application/json"})

if response.status_code == 200:
    print("Workflow refactored successfully! Centralized init and SyncBranches active.")
else:
    print(f"Failed. Status: {response.status_code}")
    print(f"Response: {response.text}")
    sys.exit(1)
