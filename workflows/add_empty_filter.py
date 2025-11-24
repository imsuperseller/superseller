#!/usr/bin/env python3
"""
Add Filter Empty Items node between WAHA Trigger and Smart Message Router

WAHA Trigger outputs 26 arrays, with only position [25] containing actual data.
The first 25 arrays are empty, causing Smart Message Router to not execute.

Solution: Add a simple Code node that filters out empty items before routing.
"""

import json
from pathlib import Path

def add_empty_filter(workflow_path):
    """Add empty items filter node."""
    
    with open(workflow_path, 'r') as f:
        workflow = json.load(f)
    
    # Add Filter Empty Items node
    filter_node = {
        "parameters": {
            "mode": "runOnceForEachItem",
            "jsCode": "// Filter out empty items from WAHA Trigger\nif (!$json || Object.keys($json).length === 0) {\n  return null; // Skip empty items\n}\nreturn $input.item;"
        },
        "id": "filter-empty-waha",
        "name": "Filter Empty Items",
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": [-1760, -608]
    }
    
    workflow['nodes'].append(filter_node)
    
    # Update connections
    connections = workflow.get('connections', {})
    
    # WAHA Trigger → Filter Empty Items
    connections['WAHA Trigger'] = {
        "main": [[{
            "node": "Filter Empty Items",
            "type": "main",
            "index": 0
        }]]
    }
    
    # Filter Empty Items → Smart Message Router
    connections['Filter Empty Items'] = {
        "main": [[{
            "node": "Smart Message Router",
            "type": "main",
            "index": 0
        }]]
    }
    
    workflow['connections'] = connections
    
    # Save
    output_path = workflow_path.replace('.json', '-FILTERED.json')
    with open(output_path, 'w') as f:
        json.dump(workflow, f, indent=2)
    
    print(f"✅ Added 'Filter Empty Items' node")
    print(f"✅ Updated connections: WAHA Trigger → Filter Empty Items → Smart Message Router")
    print(f"✅ Saved to: {output_path}")
    
    return output_path

if __name__ == "__main__":
    workflow_file = "/Users/shaifriedman/New Rensto/rensto/workflows/INT-WHATSAPP-SUPPORT-001-ACCEPT-ALL-DEPLOY.json"
    
    if not Path(workflow_file).exists():
        print(f"❌ Workflow file not found: {workflow_file}")
        import sys
        sys.exit(1)
    
    try:
        output_file = add_empty_filter(workflow_file)
        print(f"\n✅ SUCCESS! Updated workflow saved to:")
        print(f"   {output_file}")
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        import sys
        sys.exit(1)
