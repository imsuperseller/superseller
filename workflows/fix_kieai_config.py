import json

def fix_kieai_nodes():
    input_file = "workflow_current.json"
    output_file = "workflow_kieai_fixed.json"
    
    with open(input_file, 'r') as f:
        workflow = json.load(f)
    
    # Remove duplicate Generate Video Kie nodes and fix the configuration
    nodes_to_keep = []
    found_generate = False
    found_poll = False
    
    for node in workflow['nodes']:
        # Skip old duplicate nodes
        if node['name'] in ['Generate Video Kie1', 'Poll Video Status1']:
            continue
            
        # Fix the Generate Video Kie node
        if node['name'] == 'Generate Video Kie' and not found_generate:
            node['parameters'] = {
                "resource": "veo3",
                "veoUiMode": "advanced",
                "veoPrompt": "={{ $json.prompt }}",
                "veoModel": "veo3_fast",
                "veoAspectRatio": "16:9"
            }
            node['type'] = "n8n-nodes-kieai.kieAi"
            node['typeVersion'] = 2
            print("Fixed 'Generate Video Kie' node configuration")
            found_generate = True
            nodes_to_keep.append(node)
            
        # Fix the Poll Video Status node
        elif node['name'] == 'Poll Video Status' and not found_poll:
            node['parameters'] = {
                "resource": "veo3",
                "operation": "details",
                "veoUiMode": "advanced",
                "veoTaskId": "={{ $('Generate Video Kie').item.json.taskId }}"
            }
            node['type'] = "n8n-nodes-kieai.kieAi"
            node['typeVersion'] = 2
            print("Fixed 'Poll Video Status' node configuration")
            found_poll = True
            nodes_to_keep.append(node)
            
        # Fix Return TaskId node to reference correct name
        elif node['name'] == 'Return TaskId Immediately':
            old_code = node['parameters']['jsCode']
            # Make sure it references the right node
            new_code = old_code.replace("$('Generate Video Kie1')", "$('Generate Video Kie')")
            node['parameters']['jsCode'] = new_code
            print("Updated 'Return TaskId Immediately' references")
            nodes_to_keep.append(node)
            
        else:
            nodes_to_keep.append(node)
    
    workflow['nodes'] = nodes_to_keep
    print(f"\nTotal nodes after cleanup: {len(nodes_to_keep)}")
    
    # Use allowlist for clean upload
    allowed_keys = ['name', 'nodes', 'connections', 'settings']
    clean_workflow = {k: workflow[k] for k in allowed_keys if k in workflow}
    
    with open(output_file, 'w') as f:
        json.dump(clean_workflow, f, indent=2)
    print(f"Saved workflow to {output_file}")

if __name__ == "__main__":
    fix_kieai_nodes()
