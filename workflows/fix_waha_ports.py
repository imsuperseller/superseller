#!/usr/bin/env python3
"""
Fix WAHA Trigger Connections: Connect ALL output ports to Smart Message Router

The WAHA Trigger node outputs 'message' events on Index 1 (Port 2), 
but the workflow is only listening on Index 0 (Port 1).
This script connects indices 0, 1, 2, and 3 to the Smart Message Router.
"""

import json
from pathlib import Path

def fix_waha_ports(workflow_path):
    """Connect multiple WAHA Trigger outputs to Smart Message Router."""
    
    with open(workflow_path, 'r') as f:
        workflow = json.load(f)
    
    # Define the connection object to Smart Message Router
    router_connection = {
        "node": "Smart Message Router",
        "type": "main",
        "index": 0
    }
    
    # Create connections for ports 0, 1, 2, 3
    # n8n expects: "main": [ [conn0], [conn1], [conn2], [conn3] ]
    main_connections = []
    for _ in range(4):
        main_connections.append([router_connection])
    
    # Update connections
    connections = workflow.get('connections', {})
    connections['WAHA Trigger'] = {
        "main": main_connections
    }
    
    workflow['connections'] = connections
    
    # Save
    output_path = workflow_path.replace('.json', '-PORTS-FIXED.json')
    with open(output_path, 'w') as f:
        json.dump(workflow, f, indent=2)
    
    print(f"✅ Connected WAHA Trigger ports 0-3 to Smart Message Router")
    print(f"✅ Saved to: {output_path}")
    
    return output_path

if __name__ == "__main__":
    workflow_file = "/Users/shaifriedman/New Rensto/rensto/workflows/FINAL-DEPLOY-NO-FILTER.json"
    
    try:
        output_file = fix_waha_ports(workflow_file)
        print(f"\n✅ SUCCESS! Fixed workflow:")
        print(f"   {output_file}")
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        import sys
        sys.exit(1)
