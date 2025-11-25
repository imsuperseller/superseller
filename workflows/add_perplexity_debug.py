import json

def add_perplexity():
    input_file = "workflow_fixed.json"
    output_file = "workflow_debug_perplexity.json"
    
    with open(input_file, 'r') as f:
        workflow = json.load(f)
    
    # 1. Find nodes
    webhook_node = next(n for n in workflow['nodes'] if n['type'] == 'n8n-nodes-base.webhook')
    perplexity_node = next(n for n in workflow['nodes'] if n['name'] == 'Message a model') # Perplexity
    respond_node = next(n for n in workflow['nodes'] if n['name'] == 'Respond to Webhook')
    
    # 2. Update Respond node to return Perplexity output
    respond_node['parameters']['responseBody'] = '={ "perplexity_output": $json.content, "state": "generating" }'
    
    # 3. Connect: Webhook -> Perplexity -> Respond
    workflow['connections'] = {}
    
    workflow['connections'][webhook_node['name']] = {
        "main": [[{
            "node": perplexity_node['name'],
            "type": "main",
            "index": 0
        }]]
    }
    
    workflow['connections'][perplexity_node['name']] = {
        "main": [[{
            "node": respond_node['name'],
            "type": "main",
            "index": 0
        }]]
    }
    
    with open(output_file, 'w') as f:
        json.dump(workflow, f, indent=2)
    print(f"Created {output_file} - Webhook -> Perplexity -> Respond")

if __name__ == "__main__":
    add_perplexity()
