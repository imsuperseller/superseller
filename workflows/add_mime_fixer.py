#!/usr/bin/env python3
"""
Add MIME Type Fixer node to INT-WHATSAPP-SUPPORT-001-DEBUG.json workflow

This script inserts a Code node between "Download Video" and "Video Analysis Agent"
to fix the MIME type from application/octet-stream to the correct video MIME type.
"""

import json
import sys
from pathlib import Path

def add_mime_fixer_node(workflow_path):
    """Add MIME Type Fixer node to the workflow."""
    
    # Load workflow
    with open(workflow_path, 'r') as f:
        workflow = json.load(f)
    
    # Define the new MIME Type Fixer node
    mime_fixer_node = {
        "parameters": {
            "jsCode": """// Fix Video MIME Type - Preserve correct MIME type from Message Type Router
const videoData = $binary.data;
const routerData = $node['Message Type Router'].json || {};
const correctMimeType = routerData?.mediaInfo?.mimetype || 'video/mp4';

console.log('[Fix MIME] Original mimeType:', videoData?.mimeType);
console.log('[Fix MIME] Correct mimeType from router:', correctMimeType);

// Update binary data with correct MIME type
const result = {
  json: $json,
  binary: {
    data: {
      ...videoData,
      mimeType: correctMimeType,
      fileName: videoData?.fileName || 'video.mp4'
    }
  }
};

console.log('[Fix MIME] Updated mimeType:', result.binary.data.mimeType);
return result;"""
        },
        "id": "fix-video-mime-001",
        "name": "Fix Video MIME Type",
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": [-740, -384]  # Between Download Video and Video Analysis Agent
    }
    
    # Add the node to the workflow
    workflow['nodes'].append(mime_fixer_node)
    
    # Update connections:
    # 1. Download Video should connect to Fix Video MIME Type
    # 2. Fix Video MIME Type should connect to Video Analysis Agent
    
    connections = workflow.get('connections', {})
    
    # Update Download Video connections
    if 'Download Video' in connections:
        connections['Download Video']['main'] = [[{
            "node": "Fix Video MIME Type",
            "type": "main",
            "index": 0
        }]]
    
    # Add Fix Video MIME Type connections
    connections['Fix Video MIME Type'] = {
        "main": [[{
            "node": "Video Analysis Agent",
            "type": "main",
            "index": 0
        }]]
    }
    
    workflow['connections'] = connections
    
    # Save updated workflow
    output_path = workflow_path.replace('.json', '-MIME-FIXED.json')
    with open(output_path, 'w') as f:
        json.dump(workflow, f, indent=2)
    
    print(f"✅ Added 'Fix Video MIME Type' node")
    print(f"✅ Updated connections: Download Video → Fix Video MIME Type → Video Analysis Agent")
    print(f"✅ Saved to: {output_path}")
    
    return output_path

if __name__ == "__main__":
    workflow_file = "/Users/shaifriedman/New Rensto/rensto/workflows/INT-WHATSAPP-SUPPORT-001-DEBUG.json"
    
    if not Path(workflow_file).exists():
        print(f"❌ Workflow file not found: {workflow_file}")
        sys.exit(1)
    
    try:
        output_file = add_mime_fixer_node(workflow_file)
        print(f"\n✅ SUCCESS! Updated workflow saved to:")
        print(f"   {output_file}")
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
