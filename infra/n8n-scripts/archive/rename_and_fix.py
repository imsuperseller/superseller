import json
import re

def sanitize_name(name):
    # Keep only alphanumeric characters to ensure 100% safety with quotes and spaces
    clean = re.sub(r'[^a-zA-Z0-9]', '', name)
    return clean

def transform_workflow(input_path, output_path):
    with open(input_path, 'r') as f:
        wf = json.load(f)
    
    # 1. Map old names to new names
    name_map = {}
    for node in wf.get('nodes', []):
        old_name = node['name']
        new_name = sanitize_name(old_name)
        name_map[old_name] = new_name
        node['name'] = new_name
        # Cleanup node metadata
        node.pop('id', None) # Let n8n assign new IDs to be safe
    
    # 2. Update connections
    orig_connections = wf.get('connections', {})
    new_connections = {}
    
    for old_sender_raw, types in orig_connections.items():
        # Match the sender name
        sender_clean = old_sender_raw.strip("'").strip('"').strip('\\')
        # Try to find it in the current map or match by logic
        new_sender = sanitize_name(sender_clean)
        
        updated_types = {}
        for conn_type, outputs in types.items():
            updated_outputs = []
            for output_group in outputs:
                updated_group = []
                for target in output_group:
                    target_name = target['node']
                    # Some targets might already be cleaned or slightly different
                    new_target = sanitize_name(target_name)
                    updated_group.append({
                        "node": new_target,
                        "type": target['type'],
                        "index": target['index']
                    })
                updated_outputs.append(updated_group)
            updated_types[conn_type] = updated_outputs
        
        if new_sender not in new_connections:
            new_connections[new_sender] = updated_types
        else:
            # Merge logic for duplicate senders (if quotes caused duplication)
            pass 

    wf['connections'] = new_connections
    
    # 3. Update internal references in parameters (JS code, expressions)
    wf_string = json.dumps(wf)
    for old_name, new_name in name_map.items():
        # Replace $('Old Name') with $('NewName')
        # We use a regex to handle different quoting styles in expressions
        wf_string = wf_string.replace(f"$('{old_name}')", f"$('{new_name}')")
        wf_string = wf_string.replace(f'$("{old_name}")', f'$("{new_name}")')
        # Also catch just the name if it's in a string field like dataTableId or similar
        # But be careful not to over-replace.
    
    final_wf = json.loads(wf_string)
    
    # 4. Final settings cleanup
    if 'settings' in final_wf:
        final_wf['settings'] = {
            "executionOrder": "v1",
            "callerPolicy": "workflowsFromSameOwner"
        }
    
    # Remove n8n internal noise
    final_wf.pop('id', None)
    final_wf.pop('createdAt', None)
    final_wf.pop('updatedAt', None)
    final_wf.pop('versionId', None)
    final_wf.pop('active', None)
    
    with open(output_path, 'w') as f:
        json.dump(final_wf, f, indent=2)

if __name__ == "__main__":
    import sys
    transform_workflow(sys.argv[1], sys.argv[2])
