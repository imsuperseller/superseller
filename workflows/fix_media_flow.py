#!/usr/bin/env python3
"""
Fix Media Workflow:
1. Add missing 'Download Image' node.
2. Enable binary input (passthroughBinaryImages) for all Analysis Agents.
"""

import json
import uuid

def fix_media_workflow(workflow_path):
    with open(workflow_path, 'r') as f:
        workflow = json.load(f)
    
    nodes = workflow['nodes']
    connections = workflow['connections']
    
    # 1. Find reference nodes
    download_video_node = next((n for n in nodes if n['name'] == 'Download Video'), None)
    router_node = next((n for n in nodes if n['name'] == 'Message Type Router'), None)
    image_agent_node = next((n for n in nodes if n['name'] == 'Image Analysis Agent'), None)
    video_agent_node = next((n for n in nodes if n['name'] == 'Video Analysis Agent'), None)
    doc_agent_node = next((n for n in nodes if n['name'] == 'Document Analysis Agent'), None)
    
    if not download_video_node or not router_node or not image_agent_node:
        print("❌ Critical nodes missing")
        return None

    # 2. Create 'Download Image' node (clone of Download Video)
    download_image_node = json.loads(json.dumps(download_video_node))
    download_image_node['id'] = str(uuid.uuid4())
    download_image_node['name'] = 'Download Image'
    # Position it between Router and Agent
    download_image_node['position'] = [
        image_agent_node['position'][0] - 200,
        image_agent_node['position'][1]
    ]
    nodes.append(download_image_node)
    print("✅ Created 'Download Image' node")
    
    # 3. Update Connections for Image Flow
    # Remove direct connection Router -> Image Agent
    if 'Message Type Router' in connections and 'main' in connections['Message Type Router']:
        outputs = connections['Message Type Router']['main']
        if len(outputs) > 1:
            # Index 1 is Image
            image_output = outputs[1]
            # Filter out the connection to Image Analysis Agent
            outputs[1] = [conn for conn in image_output if conn['node'] != 'Image Analysis Agent']
            
            # Add connection Router -> Download Image
            outputs[1].append({
                "node": "Download Image",
                "type": "main",
                "index": 0
            })
    
    # Add connection Download Image -> Image Analysis Agent
    if 'Download Image' not in connections:
        connections['Download Image'] = {"main": [[], [], [], []]} # Initialize with empty arrays just in case
        
    connections['Download Image'] = {
        "main": [
            [
                {
                    "node": "Image Analysis Agent",
                    "type": "main",
                    "index": 0
                }
            ]
        ]
    }
    print("✅ Updated Image Flow connections")

    # 4. Enable Binary Input for Agents
    def enable_binary(node):
        if 'parameters' not in node:
            node['parameters'] = {}
        if 'options' not in node['parameters']:
            node['parameters']['options'] = {}
        
        node['parameters']['options']['passthroughBinaryImages'] = True
        print(f"✅ Enabled binary input for '{node['name']}'")

    if image_agent_node: enable_binary(image_agent_node)
    if video_agent_node: enable_binary(video_agent_node)
    if doc_agent_node: enable_binary(doc_agent_node)

    # Save
    output_path = workflow_path.replace('.json', '-MEDIA-FLOW-FIXED.json')
    with open(output_path, 'w') as f:
        json.dump(workflow, f, indent=2)
    
    print(f"✅ Saved to: {output_path}")
    return output_path

if __name__ == "__main__":
    workflow_file = "/Users/shaifriedman/New Rensto/rensto/workflows/FINAL-DEPLOY-NO-FILTER-PORTS-FIXED-PROMPT-FIXED-MEDIA-FIXED.json"
    
    try:
        output_file = fix_media_workflow(workflow_file)
        print(f"\n✅ SUCCESS! Updated workflow:")
        print(f"   {output_file}")
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        import sys
        sys.exit(1)
