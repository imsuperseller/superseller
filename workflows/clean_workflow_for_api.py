#!/usr/bin/env python3
"""
Clean workflow JSON for n8n API deployment

Remove fields that the n8n API doesn't accept in PUT requests:
- id (managed by n8n)
- versionId (managed by n8n)
- meta (managed by n8n)
- pinData (test data, not needed for deployment)
"""

import json
import sys
from pathlib import Path

def clean_workflow_for_api(input_path, output_path):
    """Remove API-incompatible fields from workflow JSON."""
    
    with open(input_path, 'r') as f:
        workflow = json.load(f)
    
    # Fields to remove for API compatibility
    fields_to_remove = ['id', 'versionId', 'meta', 'pinData']
    
    cleaned_workflow = {k: v for k, v in workflow.items() if k not in fields_to_remove}
    
    print(f"✅ Removed fields: {', '.join(fields_to_remove)}")
    print(f"✅ Remaining fields: {', '.join(cleaned_workflow.keys())}")
    
    with open(output_path, 'w') as f:
        json.dump(cleaned_workflow, f, indent=2)
    
    print(f"✅ Saved cleaned workflow to: {output_path}")
    
    return output_path

if __name__ == "__main__":
    input_file = "/Users/shaifriedman/New Rensto/rensto/workflows/INT-WHATSAPP-SUPPORT-001-DEBUG-MIME-FIXED.json"
    output_file = "/Users/shaifriedman/New Rensto/rensto/workflows/INT-WHATSAPP-SUPPORT-001-DEBUG-MIME-FIXED-CLEAN.json"
    
    if not Path(input_file).exists():
        print(f"❌ Input file not found: {input_file}")
        sys.exit(1)
    
    try:
        clean_workflow_for_api(input_file, output_file)
        print(f"\n✅ SUCCESS! Deployment-ready workflow:")
        print(f"   {output_file}")
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
