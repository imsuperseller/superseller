import json
import sys

def clean_workflow(input_path, output_path):
    with open(input_path, 'r') as f:
        wf = json.load(f)
    
    # 1. Standardize Connections
    orig_connections = wf.get('connections', {})
    clean_connections = {}
    
    for key, val in orig_connections.items():
        # Remove literal quotes from keys like '"Analyze Floor Plan"'
        # and standard keys like 'Analyze Floor Plan'
        clean_key = key.strip('"').strip('\\"')
        
        # Merge if multiple exist
        if clean_key not in clean_connections:
            clean_connections[clean_key] = val
        else:
            # Merging inputs/outputs is tricky, but usually they are identical in the user's JSON
            # We'll just keep the first one or prioritize the one with more nested data
            pass
            
    wf['connections'] = clean_connections
    
    # 2. Ensure all node references in connections match node names
    # n8n usually handles this, but we'll leave it as is if names match.
    
    # 3. Ensure essential settings (and filter additional ones)
    if 'settings' in wf:
        allowed_settings = ['executionOrder', 'callerPolicy']
        wf['settings'] = {k: v for k, v in wf['settings'].items() if k in allowed_settings}
    else:
        wf['settings'] = {'executionOrder': 'v1', 'callerPolicy': 'workflowsFromSameOwner'}
    
    # 4. Remove metadata that n8n API might reject
    wf.pop('updatedAt', None)
    wf.pop('createdAt', None)
    wf.pop('id', None) 
    wf.pop('versionId', None)
    wf.pop('active', None)
    
    with open(output_path, 'w') as f:
        json.dump(wf, f, indent=2)

if __name__ == "__main__":
    clean_workflow(sys.argv[1], sys.argv[2])
