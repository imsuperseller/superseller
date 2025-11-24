#!/usr/bin/env python3
"""
Fix WAHA Trigger duplicate connections

The WAHA Trigger currently has 4 outputs, each with duplicate connections:
[
  [{Smart Message Router}, {Debug Logger}],
  [{Smart Message Router}, {Debug Logger}],
  [{Smart Message Router}, {Debug Logger}],
  [{Smart Message Router}, {Debug Logger}]
]

This should be simplified to a SINGLE output:
[
  [{Smart Message Router}]
]

The Debug Logger node should be removed or disconnected since:
1. It causes duplicate processing
2. It tries to use 'fs' module which is restricted in n8n
3. We have better debugging via execution logs and API
"""

import json
import sys
from pathlib import Path

def fix_waha_trigger_connections(workflow_path):
    """Fix WAHA Trigger to have single clean output connection."""
    
    with open(workflow_path, 'r') as f:
        workflow = json.load(f)
    
    # Fix WAHA Trigger connections - single output to Smart Message Router only
    connections = workflow.get('connections', {})
    
    print("Current WAHA Trigger connections:")
    print(json.dumps(connections.get('WAHA Trigger', {}), indent=2))
    
    # Set to single, clean connection
    connections['WAHA Trigger'] = {
        "main": [[{
            "node": "Smart Message Router",
            "type": "main",
            "index": 0
        }]]
    }
    
    # Remove Debug Logger from nodes (it's causing issues)
    workflow['nodes'] = [node for node in workflow['nodes'] if node.get('name') != 'Debug Logger']
    
    workflow['connections'] = connections
    
    # Save updated workflow
    output_path = workflow_path.replace('.json', '-FIXED-CONNECTIONS.json')
    with open(output_path, 'w') as f:
        json.dump(workflow, f, indent=2)
    
    print("\n✅ Fixed WAHA Trigger connections:")
    print(json.dumps(connections['WAHA Trigger'], indent=2))
    print(f"\n✅ Removed Debug Logger node")
    print(f"✅ Saved to: {output_path}")
    
    return output_path

if __name__ == "__main__":
    # Work with the currently deployed workflow
    workflow_file = "/Users/shaifriedman/New Rensto/rensto/workflows/INT-WHATSAPP-SUPPORT-001-DEBUG-MIME-FIXED.json"
    
    if not Path(workflow_file).exists():
        print(f"❌ Workflow file not found: {workflow_file}")
        sys.exit(1)
    
    try:
        output_file = fix_waha_trigger_connections(workflow_file)
        print(f"\n✅ SUCCESS! Fixed workflow saved to:")
        print(f"   {output_file}")
        print(f"\n📝 Next: Clean for API and deploy")
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
