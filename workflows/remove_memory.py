#!/usr/bin/env python3
"""
Remove unnecessary Simple Memory nodes from Analysis Agents to prevent Session ID errors.
"""

import json

def remove_analysis_memory(workflow_path):
    with open(workflow_path, 'r') as f:
        workflow = json.load(f)
    
    nodes = workflow['nodes']
    connections = workflow['connections']
    
    # Nodes to remove
    memory_nodes = ['Simple Memory', 'Simple Memory1', 'Simple Memory2']
    
    # 1. Remove nodes
    workflow['nodes'] = [n for n in nodes if n['name'] not in memory_nodes]
    print(f"✅ Removed nodes: {memory_nodes}")
    
    # 2. Remove connections
    # We need to remove connections where 'node' is one of the memory nodes
    # AND remove the 'ai_memory' connections from the Agents
    
    agents = ['Image Analysis Agent', 'Video Analysis Agent', 'Document Analysis Agent']
    
    for agent in agents:
        if agent in connections:
            if 'ai_memory' in connections[agent]:
                del connections[agent]['ai_memory']
                print(f"✅ Removed ai_memory connection from {agent}")
    
    # Also clean up any connections pointing TO the memory nodes (though usually there are none for memory nodes)
    for node_name in list(connections.keys()):
        if node_name in memory_nodes:
            del connections[node_name]
            continue
            
        for output_type in list(connections[node_name].keys()):
            new_outputs = []
            for output_group in connections[node_name][output_type]:
                new_group = [conn for conn in output_group if conn['node'] not in memory_nodes]
                new_outputs.append(new_group)
            connections[node_name][output_type] = new_outputs

    # Save
    output_path = workflow_path.replace('.json', '-NO-MEMORY.json')
    with open(output_path, 'w') as f:
        json.dump(workflow, f, indent=2)
    
    print(f"✅ Saved to: {output_path}")
    return output_path

if __name__ == "__main__":
    workflow_file = "/Users/shaifriedman/New Rensto/rensto/workflows/FINAL-DEPLOY-NO-FILTER-PORTS-FIXED-PROMPT-FIXED-MEDIA-FIXED-MEDIA-FLOW-FIXED.json"
    
    try:
        output_file = remove_analysis_memory(workflow_file)
        print(f"\n✅ SUCCESS! Updated workflow:")
        print(f"   {output_file}")
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        import sys
        sys.exit(1)
