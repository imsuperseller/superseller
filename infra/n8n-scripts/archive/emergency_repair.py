import json
import os

def emergency_repair(input_path, output_path):
    with open(input_path, 'r') as f:
        wf = json.load(f)
    
    # Preserve nodes exactly as they are to avoid type errors and keep IDs
    nodes = wf.get('nodes', [])
    
    # Fix Connections
    orig_connections = wf.get('connections', {})
    clean_connections = {}
    
    def strip_quotes(s):
        if not s: return s
        # Aggressively remove any leading/trailing quotes of any kind
        while s and (s[0] in "'\"" or s[-1] in "'\""):
            s = s.strip("'").strip('"')
        return s.strip()

    for source_node, value in orig_connections.items():
        clean_source = strip_quotes(source_node)
        
        if clean_source not in clean_connections:
            clean_connections[clean_source] = {}
        
        for conn_type, conn_arrays in value.items():
            if conn_type not in clean_connections[clean_source]:
                clean_connections[clean_source][conn_type] = []
            
            # Each entry is a list of targets for an output port
            for targets in conn_arrays:
                new_targets = []
                for target in targets:
                    new_target = target.copy()
                    if 'node' in new_target:
                        new_target['node'] = strip_quotes(new_target['node'])
                    new_targets.append(new_target)
                clean_connections[clean_source][conn_type].append(new_targets)

    # Reconstruct workflow
    new_wf = {
        "nodes": nodes,
        "connections": clean_connections,
        "settings": wf.get('settings', {}),
        "staticData": wf.get('staticData', None),
        "meta": wf.get('meta', None),
        "pinData": wf.get('pinData', None)
    }
    
    # Filter out nulls
    new_wf = {k: v for k, v in new_wf.items() if v is not None}

    with open(output_path, 'w') as f:
        json.dump(new_wf, f, indent=2)
    
    print(f"Repair complete. Saved to {output_path}")

if __name__ == "__main__":
    input_file = "/Users/shaifriedman/.gemini/antigravity/mcp-results/mcp_result_n8n_get_workflow_1769372205119.json"
    output_file = "/Users/shaifriedman/New Rensto/rensto/repaired_workflow_v7.json"
    emergency_repair(input_file, output_file)
