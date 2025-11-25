import json

def fix_node_reference():
    input_file = "workflow_current.json"
    output_file = "workflow_fixed.json"
    
    with open(input_file, 'r') as f:
        workflow = json.load(f)
    
    # Find and fix the "Return TaskId Immediately" node
    for node in workflow['nodes']:
        if node['name'] == 'Return TaskId Immediately':
            # Fix the reference from 'Generate Video Kie' to 'Generate Video Kie1'
            old_code = node['parameters']['jsCode']
            new_code = old_code.replace(
                "$('Generate Video Kie')",
                "$('Generate Video Kie1')"
            )
            node['parameters']['jsCode'] = new_code
            print("Fixed node reference in 'Return TaskId Immediately'")
            print(f"Changed: $('Generate Video Kie') -> $('Generate Video Kie1')")
            break
    
    # Use allowlist for clean upload
    allowed_keys = ['name', 'nodes', 'connections', 'settings']
    clean_workflow = {k: workflow[k] for k in allowed_keys if k in workflow}
    
    with open(output_file, 'w') as f:
        json.dump(clean_workflow, f, indent=2)
    print(f"Saved fixed workflow to {output_file}")

if __name__ == "__main__":
    fix_node_reference()
