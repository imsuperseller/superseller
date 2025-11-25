import json

def create_debug_workflow():
    input_file = "workflow_fixed.json"
    output_file = "workflow_debug_echo.json"
    
    with open(input_file, 'r') as f:
        workflow = json.load(f)
    
    # 1. Find Webhook and Respond nodes
    webhook_node = next(n for n in workflow['nodes'] if n['type'] == 'n8n-nodes-base.webhook')
    respond_node = next(n for n in workflow['nodes'] if n['name'] == 'Respond to Webhook')
    
    # 2. Update Respond node to return static debug data
    respond_node['parameters']['responseBody'] = '={ "taskId": "debug-123", "state": "generating", "message": "Debug Mode: Connection OK" }'
    
    # 3. Direct Connection: Webhook -> Respond to Webhook
    # Clear existing connections
    workflow['connections'] = {}
    
    # Connect Webhook to Respond
    workflow['connections'][webhook_node['name']] = {
        "main": [[{
            "node": respond_node['name'],
            "type": "main",
            "index": 0
        }]]
    }
    
    # Keep other nodes but disconnected (orphaned)
    
    with open(output_file, 'w') as f:
        json.dump(workflow, f, indent=2)
    print(f"Created {output_file} - Webhook connected directly to Respond node")

if __name__ == "__main__":
    create_debug_workflow()
