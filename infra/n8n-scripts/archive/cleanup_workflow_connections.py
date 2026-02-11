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

node_names = {n['name'] for n in nodes}
deleted_nodes = {'InitStorage', 'InitStorage1', 'InitStorage11'}

print(f"Workflow has {len(nodes)} nodes.")
print(f"Scanning for connections to deleted nodes: {deleted_nodes}")

# Deep cleanup of connections
new_connections = {}
for source_node, connection_types in connections.items():
    if source_node not in node_names:
        print(f"Removing zombie source node: {source_node}")
        continue
    
    new_types = {}
    for conn_type, outputs in connection_types.items():
        new_outputs = []
        for output_index_list in outputs:
            new_index_list = []
            for connection in output_index_list:
                target_node = connection.get('node')
                if target_node in node_names:
                    new_index_list.append(connection)
                else:
                    print(f"Removing zombie connection: {source_node} -> {target_node}")
            new_outputs.append(new_index_list)
        new_types[conn_type] = new_outputs
    new_connections[source_node] = new_types

wf['connections'] = new_connections

# Clean payload
payload = {
    "name": wf.get("name", "Modified Workflow"),
    "nodes": wf.get("nodes", []),
    "connections": wf.get("connections", {}),
    "settings": {"executionOrder": "v1"} # Keep it minimal
}

print(f"Deploying cleaned workflow to {WORKFLOW_ID}...")
response = requests.put(f"{INSTANCE_URL}/workflows/{WORKFLOW_ID}", json=payload, headers={"X-N8N-API-KEY": API_KEY, "Content-Type": "application/json"})

if response.status_code == 200:
    print("Workflow cleaned and updated successfully!")
else:
    print(f"Failed. Status: {response.status_code}")
    print(f"Response: {response.text}")
    sys.exit(1)
