import json

def patch_workflow():
    input_file = "INT-WHATSAPP-SUPPORT-001-OPTIMIZED.json"
    output_file = "INT-WHATSAPP-SUPPORT-001-OPTIMIZED-FIXED.json"
    
    with open(input_file, 'r') as f:
        workflow = json.load(f)
    
    # Find WAHA Trigger node name
    waha_trigger_name = "WAHA Trigger"
    smart_router_name = "Smart Message Router"
    
    # Check if nodes exist
    node_names = [n['name'] for n in workflow['nodes']]
    if waha_trigger_name not in node_names:
        print(f"Error: {waha_trigger_name} not found in workflow")
        return
    if smart_router_name not in node_names:
        print(f"Error: {smart_router_name} not found in workflow")
        return

    # Ensure connections object exists
    if 'connections' not in workflow:
        workflow['connections'] = {}
    
    # Get or create WAHA Trigger connections
    if waha_trigger_name not in workflow['connections']:
        workflow['connections'][waha_trigger_name] = {"main": []}
    
    waha_connections = workflow['connections'][waha_trigger_name]["main"]
    
    # We want 4 outputs connected to Smart Message Router
    # Current structure might be [[{...}], [{...}]]
    
    # Create the connection object
    connection_obj = {
        "node": smart_router_name,
        "type": "main",
        "index": 0
    }
    
    # Ensure we have at least 4 arrays in 'main'
    while len(waha_connections) < 4:
        waha_connections.append([])
        
    # Fill each of the first 4 outputs with the connection if empty
    for i in range(4):
        if not waha_connections[i]:
            waha_connections[i].append(connection_obj)
        else:
            # Check if it's already connected to Smart Message Router
            connected = False
            for conn in waha_connections[i]:
                if conn['node'] == smart_router_name:
                    connected = True
                    break
            if not connected:
                waha_connections[i].append(connection_obj)
                
    print(f"Successfully patched {waha_trigger_name} connections.")
    
    with open(output_file, 'w') as f:
        json.dump(workflow, f, indent=2)
    print(f"Saved patched workflow to {output_file}")

if __name__ == "__main__":
    patch_workflow()
