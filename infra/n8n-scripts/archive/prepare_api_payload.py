import json
import sys

input_path = "/Users/shaifriedman/.gemini/antigravity/mcp-results/final_fixed_workflow.json"
output_path = "/Users/shaifriedman/.gemini/antigravity/mcp-results/api_payload.json"

try:
    with open(input_path, 'r') as f:
        wf = json.load(f)

    # Minify settings to avoid Public API validation errors
    raw_settings = wf.get("settings", {})
    clean_settings = {}
    if "executionOrder" in raw_settings:
        clean_settings["executionOrder"] = raw_settings["executionOrder"]
    
    # Required fields for public api PUT /workflows/{id}
    payload = {
        "name": wf.get("name"),
        "nodes": wf.get("nodes"),
        "connections": wf.get("connections"),
        "settings": clean_settings
    }

    with open(output_path, 'w') as f:
        json.dump(payload, f)

    print("API Payload Prepared: SUCCESS")
except Exception as e:
    print(f"ERROR: {e}")
    sys.exit(1)
