import json

def fix_workflow(input_path, output_path):
    with open(input_path, 'r') as f:
        wf = json.load(f)
    
    # 1. Clean Connections
    orig_connections = wf.get('connections', {})
    clean_connections = {}
    
    # Get all actual node names to ensure we match them
    node_names = {node['name'] for node in wf.get('nodes', [])}
    
    for key, val in orig_connections.items():
        # Strip ALL kinds of quotes and backslashes
        clean_key = key.strip("'").strip('"').strip('\\"')
        
        # If it doesn't match exactly, try to find the closest match in node_names
        # (though stripping should be enough)
        if clean_key in node_names:
            pass
        elif clean_key == "Analyze Floor Plan": # Special case if it was "\"Analyze Floor Plan\""
            pass
            
        if clean_key not in clean_connections:
            clean_connections[clean_key] = val
        else:
            # Merge logic for multiple connections from same node
            for conn_type, outputs in val.items():
                if conn_type not in clean_connections[clean_key]:
                    clean_connections[clean_key][conn_type] = outputs
                else:
                    # Merge indices
                    existing_outputs = clean_connections[clean_key][conn_type]
                    # Ensure same length or extend
                    while len(existing_outputs) < len(outputs):
                        existing_outputs.append([])
                    for i, targets in enumerate(outputs):
                        existing_outputs[i].extend(targets)
                        # Remove duplicates
                        seen = set()
                        unique_targets = []
                        for t in existing_outputs[i]:
                            t_id = f"{t.get('node')}_{t.get('index')}_{t.get('type')}"
                            if t_id not in seen:
                                unique_targets.append(t)
                                seen.add(t_id)
                        existing_outputs[i] = unique_targets

    wf['connections'] = clean_connections
    
    # 2. Settings cleanup
    if 'settings' in wf:
        allowed_settings = ['executionOrder', 'callerPolicy']
        wf['settings'] = {k: v for k, v in wf['settings'].items() if k in allowed_settings}
    
    # 3. Metadata removal (prevent API errors)
    wf.pop('updatedAt', None)
    wf.pop('createdAt', None)
    wf.pop('id', None)
    wf.pop('versionId', None)
    wf.pop('active', None)
    
    with open(output_path, 'w') as f:
        json.dump(wf, f, indent=2)

if __name__ == "__main__":
    import sys
    fix_workflow(sys.argv[1], sys.argv[2])
