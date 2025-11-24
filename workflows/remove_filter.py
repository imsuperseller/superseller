#!/usr/bin/env python3
"""
Remove Filter Empty Items node and connect WAHA Trigger directly to Smart Message Router
"""

import json
from pathlib import Path

def remove_filter_node(workflow_path):
    """Remove Filter Empty Items and restore direct connection."""
    
    with open(workflow_path, 'r') as f:
        workflow = json.load(f)
    
    # Remove Filter Empty Items node
    workflow['nodes'] = [n for n in workflow['nodes'] if n['name'] != 'Filter Empty Items']
    
    # Update connections: WAHA Trigger → Smart Message Router (direct)
    connections = workflow.get('connections', {})
    connections['WAHA Trigger'] = {
        "main": [[{
            "node": "Smart Message Router",
            "type": "main",
            "index": 0
        }]]
    }
    
    # Remove Filter Empty Items from connections
    if 'Filter Empty Items' in connections:
        del connections['Filter Empty Items']
    
    workflow['connections'] = connections
    
    # Save
    output_path = workflow_path.replace('.json', '-NO-FILTER.json')
    with open(output_path, 'w') as f:
        json.dump(workflow, f, indent=2)
    
    print("✅ Removed 'Filter Empty Items' node")
    print("✅ Direct connection: WAHA Trigger → Smart Message Router")
    print(f"✅ Saved to: {output_path}")
    
    return output_path

if __name__ == "__main__":
    workflow_file = "/Users/shaifriedman/New Rensto/rensto/workflows/FINAL-DEPLOY.json"
    
    try:
        output_file = remove_filter_node(workflow_file)
        print(f"\n✅ SUCCESS! Clean workflow:")
        print(f"   {output_file}")
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        import sys
        sys.exit(1)
