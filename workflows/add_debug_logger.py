import json
import os

def add_debug_logger():
    input_file = "INT-WHATSAPP-SUPPORT-001-OPTIMIZED-FIXED.json"
    output_file = "INT-WHATSAPP-SUPPORT-001-DEBUG.json"
    
    with open(input_file, 'r') as f:
        workflow = json.load(f)
    
    # Define the debug node
    debug_node = {
        "parameters": {
            "jsCode": "const fs = require('fs');\nconst path = '/Users/shaifriedman/New Rensto/rensto/workflows/waha_debug_log.json';\nconst data = JSON.stringify($input.all(), null, 2);\nfs.appendFileSync(path, data + '\\n---\\n');\nreturn $input.all();"
        },
        "id": "debug-logger-node",
        "name": "Debug Logger",
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": [-1600, -400]
    }
    
    # Add the node
    workflow['nodes'].append(debug_node)
    
    # Connect WAHA Trigger to Debug Logger
    waha_trigger_name = "WAHA Trigger"
    
    if waha_trigger_name not in workflow['connections']:
        workflow['connections'][waha_trigger_name] = {"main": []}
        
    waha_connections = workflow['connections'][waha_trigger_name]["main"]
    
    # Ensure we have 4 outputs
    while len(waha_connections) < 4:
        waha_connections.append([])
        
    # Add connection to Debug Logger for all 4 outputs
    for i in range(4):
        waha_connections[i].append({
            "node": "Debug Logger",
            "type": "main",
            "index": 0
        })
        
    print(f"Added Debug Logger to {output_file}")
    
    with open(output_file, 'w') as f:
        json.dump(workflow, f, indent=2)

if __name__ == "__main__":
    add_debug_logger()
