import requests
import json
import os

import sys

def push_workflow():
    filename = sys.argv[1] if len(sys.argv) > 1 else 'deploy.json'
    url = "http://172.245.56.50:5678/api/v1/workflows/nFGTkjYPOIbFoR82"
    headers = {
        "X-N8N-API-KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYjRhMzI1MS0yNmY2LTQ2MTctYmNmOS1lMDdmM2NhOTY4YTciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYyOTE2NzEwfQ.JbIeOnRil3E3_P44LjAWhiY9KRcAHkuuVhJghABz3aQ",
        "Content-Type": "application/json"
    }
    
    with open(filename, 'r') as f:
        wf_data = json.load(f)
    
    # Payload for update
    payload = {
        "name": wf_data.get("name", "FB Marketplace V4 (TITANIUM CONNECTED)"),
        "nodes": wf_data.get("nodes"),
        "connections": wf_data.get("connections"),
        "settings": wf_data.get("settings", {}),
        "staticData": wf_data.get("staticData", {})
    }
    
    response = requests.put(url, headers=headers, json=payload)
    
    if response.status_code == 200:
        print("Workflow successfully updated!")
        print(response.json())
    else:
        print(f"Error: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    push_workflow()
