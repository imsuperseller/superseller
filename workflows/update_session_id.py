#!/usr/bin/env python3
"""
Update WAHA session ID from 'rensto-support' to 'rensto-whatsapp'
"""

import json
import sys
from pathlib import Path

def update_session_id(workflow_path):
    """Update session ID in Send Text Message and Send Voice Message nodes."""
    
    with open(workflow_path, 'r') as f:
        workflow = json.load(f)
    
    updated_nodes = []
    
    for node in workflow['nodes']:
        if node['name'] in ['Send Text Message', 'Send Voice Message']:
            # Update jsCode to use rensto-whatsapp instead of rensto-support
            if 'parameters' in node and 'jsCode' in node['parameters']:
                old_code = node['parameters']['jsCode']
                new_code = old_code.replace(
                    "const sessionId = 'rensto-support';",
                    "const sessionId = 'rensto-whatsapp';"
                )
                node['parameters']['jsCode'] = new_code
                updated_nodes.append(node['name'])
    
    # Save
    output_path = workflow_path.replace('.json', '-SESSION-FIXED.json')
    with open(output_path, 'w') as f:
        json.dump(workflow, f, indent=2)
    
    print(f"✅ Updated session ID in nodes: {', '.join(updated_nodes)}")
    print(f"✅ Changed: rensto-support → rensto-whatsapp")
    print(f"✅ Saved to: {output_path}")
    
    return output_path

if __name__ == "__main__":
    workflow_file = "/Users/shaifriedman/New Rensto/rensto/workflows/INT-WHATSAPP-SUPPORT-001-ACCEPT-ALL-DEPLOY-FILTERED.json"
    
    if not Path(workflow_file).exists():
        print(f"❌ Workflow file not found: {workflow_file}")
        sys.exit(1)
    
    try:
        output_file = update_session_id(workflow_file)
        print(f"\n✅ SUCCESS! Updated workflow:")
        print(f"   {output_file}")
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
