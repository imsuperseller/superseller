#!/usr/bin/env python3
"""
Fix Smart Message Router to prioritize WAHA media URLs over raw WhatsApp URLs.
"""

import json
from pathlib import Path

def fix_media_url_extraction(workflow_path):
    """Update Smart Message Router to prefer payload.media.url."""
    
    with open(workflow_path, 'r') as f:
        workflow = json.load(f)
    
    updated = False
    for node in workflow['nodes']:
        if node['name'] == 'Smart Message Router':
            if 'parameters' in node and 'jsCode' in node['parameters']:
                code = node['parameters']['jsCode']
                
                # We need to modify the extraction logic
                # Current logic extracts from _data.message first
                
                new_code = code.replace(
                    "let mediaUrl = '';",
                    "let mediaUrl = (payload.media && payload.media.url) ? payload.media.url : '';"
                )
                
                # Also need to make sure we don't overwrite it with the raw URL if we already have a good one
                # The current code does:
                # if (_dataMessage.audioMessage) { ... mediaUrl = _dataMessage.audioMessage.url ... }
                
                # We'll modify the blocks to only set mediaUrl if it's empty
                new_code = new_code.replace(
                    "mediaUrl = _dataMessage.audioMessage.url || '';",
                    "if (!mediaUrl) mediaUrl = _dataMessage.audioMessage.url || '';"
                )
                new_code = new_code.replace(
                    "mediaUrl = _dataMessage.imageMessage.url || '';",
                    "if (!mediaUrl) mediaUrl = _dataMessage.imageMessage.url || '';"
                )
                new_code = new_code.replace(
                    "mediaUrl = _dataMessage.videoMessage.url || '';",
                    "if (!mediaUrl) mediaUrl = _dataMessage.videoMessage.url || '';"
                )
                new_code = new_code.replace(
                    "mediaUrl = _dataMessage.documentMessage.url || '';",
                    "if (!mediaUrl) mediaUrl = _dataMessage.documentMessage.url || '';"
                )
                
                node['parameters']['jsCode'] = new_code
                updated = True
                print(f"✅ Updated media extraction logic for 'Smart Message Router'")
    
    if not updated:
        print("❌ Could not find 'Smart Message Router' node")
        return None
    
    # Save
    output_path = workflow_path.replace('.json', '-MEDIA-FIXED.json')
    with open(output_path, 'w') as f:
        json.dump(workflow, f, indent=2)
    
    print(f"✅ Saved to: {output_path}")
    return output_path

if __name__ == "__main__":
    workflow_file = "/Users/shaifriedman/New Rensto/rensto/workflows/FINAL-DEPLOY-NO-FILTER-PORTS-FIXED-PROMPT-FIXED.json"
    
    try:
        output_file = fix_media_url_extraction(workflow_file)
        print(f"\n✅ SUCCESS! Updated workflow:")
        print(f"   {output_file}")
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        import sys
        sys.exit(1)
