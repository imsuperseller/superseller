import json

def replace_with_kieai_node():
    input_file = "workflow_current.json"
    output_file = "workflow_with_kieai.json"
    
    with open(input_file, 'r') as f:
        workflow = json.load(f)
    
    # Find and replace "Generate Video Kie1" HTTP node with proper Kie.ai node
    for i, node in enumerate(workflow['nodes']):
        if node['name'] == 'Generate Video Kie1':
            # Replace with official Kie.ai node
            workflow['nodes'][i] = {
                "parameters": {
                    "operation": "generateVideo",
                    "prompt": "={{ $json.prompt }}",
                    "model": "veo3_fast",
                    "aspectRatio": "16:9",
                    "options": {
                        "enableTranslation": True,
                        "watermark": ""
                    }
                },
                "type": "n8n-nodes-kieai.kieAi",
                "typeVersion": 2,
                "position": node['position'],
                "id": node['id'],
                "name": "Generate Video Kie",
                "credentials": {
                    "kieAiApi": {
                        "id": "kRI7Q7bdV9tEVPNp",
                        "name": "Kie.ai"
                    }
                }
            }
            print("Replaced 'Generate Video Kie1' with official Kie.ai node")
        
        elif node['name'] == 'Poll Video Status1':
            # Replace with Kie.ai Get Video Status node
            workflow['nodes'][i] = {
                "parameters": {
                    "operation": "getVideoStatus",
                    "taskId": "={{ $('Return TaskId Immediately').item.json.taskId }}"
                },
                "type": "n8n-nodes-kieai.kieAi",
                "typeVersion": 2,
                "position": node['position'],
                "id": node['id'],
                "name": "Poll Video Status",
                "credentials": {
                    "kieAiApi": {
                        "id": "kRI7Q7bdV9tEVPNp",
                        "name": "Kie.ai"
                    }
                }
            }
            print("Replaced 'Poll Video Status1' with official Kie.ai node")
    
    # Update Return TaskId node to reference correct name
    for node in workflow['nodes']:
        if node['name'] == 'Return TaskId Immediately':
            # Update to reference the new node name (without "1")
            old_code = node['parameters']['jsCode']
            new_code = old_code.replace(
                "$('Generate Video Kie1')",
                "$('Generate Video Kie')"
            )
            node['parameters']['jsCode'] = new_code
            print("Updated 'Return TaskId Immediately' to reference 'Generate Video Kie'")
    
    # Use allowlist for clean upload
    allowed_keys = ['name', 'nodes', 'connections', 'settings']
    clean_workflow = {k: workflow[k] for k in allowed_keys if k in workflow}
    
    with open(output_file, 'w') as f:
        json.dump(clean_workflow, f, indent=2)
    print(f"\nSaved workflow to {output_file}")

if __name__ == "__main__":
    replace_with_kieai_node()
