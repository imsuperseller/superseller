#!/usr/bin/env python3
"""
Push a workflow JSON file to the n8n instance.
Usage: python push_workflow.py <workflow.json> [workflow_id]
       If workflow_id is omitted, the workflow ID may be read from the JSON or must be configured.
"""
import os
import sys
import json
import requests

def main():
    filename = sys.argv[1] if len(sys.argv) > 1 else "deploy.json"
    workflow_id = sys.argv[2] if len(sys.argv) > 2 else None

    api_key = os.environ.get("N8N_API_KEY", "").strip()
    base_url = (os.environ.get("N8N_URL") or "http://172.245.56.50:5678/api/v1").rstrip("/")

    if not api_key:
        print("Set N8N_API_KEY in the environment, or edit this script to add a fallback for local use.")
        sys.exit(1)

    with open(filename, "r") as f:
        wf_data = json.load(f)

    if not workflow_id:
        workflow_id = wf_data.get("id")
    if not workflow_id:
        print("Provide workflow_id as second argument or ensure the JSON has an 'id' field.")
        sys.exit(1)

    url = f"{base_url}/workflows/{workflow_id}"
    headers = {
        "X-N8N-API-KEY": api_key,
        "Content-Type": "application/json",
    }
    payload = {
        "name": wf_data.get("name", "Workflow"),
        "nodes": wf_data.get("nodes", []),
        "connections": wf_data.get("connections", {}),
        "settings": wf_data.get("settings", {}),
        "staticData": wf_data.get("staticData", {}),
    }

    response = requests.put(url, headers=headers, json=payload)

    if response.status_code == 200:
        print("Workflow updated successfully.")
        print(response.json())
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
        sys.exit(1)

if __name__ == "__main__":
    main()
