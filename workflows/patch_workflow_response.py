import json

def patch_workflow():
    input_file = "workflow_current.json"
    output_file = "workflow_patched.json"
    
    with open(input_file, 'r') as f:
        data = json.load(f)
        
    # Handle the case where the API returns { "id": "...", "name": "...", ... } directly 
    # or wrapped in { "data": { ... } } depending on the endpoint version/client.
    # The curl output usually gives the workflow object directly.
    workflow = data
    
    # 1. Update Webhook Node to use 'responseNode' and accept POST
    webhook_node = next((n for n in workflow['nodes'] if n['type'] == 'n8n-nodes-base.webhook'), None)
    if webhook_node:
        webhook_node['parameters']['responseMode'] = 'responseNode'
        webhook_node['parameters']['httpMethod'] = 'POST'
        print("Updated Webhook responseMode to 'responseNode' and httpMethod to 'POST'")
    else:
        print("Error: Webhook node not found")
        return

    # 2. Create 'Respond to Webhook' node
    respond_node = {
        "parameters": {
            "respondWith": "json",
            "responseBody": "={{ $json }}",
            "options": {}
        },
        "id": "respond-to-webhook-auto",
        "name": "Respond to Webhook",
        "type": "n8n-nodes-base.respondToWebhook",
        "typeVersion": 1,
        "position": [460, -96] # Positioned after "Return TaskId Immediately" (approx)
    }
    
    # Check if it already exists to avoid duplicates
    if not any(n['name'] == 'Respond to Webhook' for n in workflow['nodes']):
        workflow['nodes'].append(respond_node)
        print("Added 'Respond to Webhook' node")
    
    # 3. Update Connections
    # We want: Return TaskId Immediately -> Respond to Webhook -> Wait 20s
    
    # Find relevant nodes
    return_task_node_name = "Return TaskId Immediately"
    wait_node_name = "Wait 20s"
    respond_node_name = "Respond to Webhook"
    
    if 'connections' not in workflow:
        workflow['connections'] = {}
        
    # Connect 'Return TaskId Immediately' -> 'Respond to Webhook'
    if return_task_node_name in workflow['connections']:
        # Replace existing connection to 'Wait 20s' with 'Respond to Webhook'
        # Or just overwrite main[0]
        workflow['connections'][return_task_node_name]['main'] = [[{
            "node": respond_node_name,
            "type": "main",
            "index": 0
        }]]
        print(f"Connected '{return_task_node_name}' to '{respond_node_name}'")
        
    # Connect 'Respond to Webhook' -> 'Wait 20s'
    workflow['connections'][respond_node_name] = {
        "main": [[{
            "node": wait_node_name,
            "type": "main",
            "index": 0
        }]]
    }
    print(f"Connected '{respond_node_name}' to '{wait_node_name}'")

    # Use allowlist to ensure only valid keys are sent
    allowed_keys = ['name', 'nodes', 'connections', 'settings']
    
    # Create a new dict with only allowed keys
    clean_workflow = {k: workflow[k] for k in allowed_keys if k in workflow}
    
    # Ensure active is set to true if we want to activate it (optional, might need separate call)
    # clean_workflow['active'] = True 

    with open(output_file, 'w') as f:
        json.dump(clean_workflow, f, indent=2)
    print(f"Saved patched workflow to {output_file} with keys: {list(clean_workflow.keys())}")

if __name__ == "__main__":
    patch_workflow()
