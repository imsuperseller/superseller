import json

input_file = 'spaceless_fixed_final.json'
output_file = 'spaceless_ready_v2.json'

with open(input_file, 'r') as f:
    d = json.load(f)

def fix_expression(val):
    if isinstance(val, str) and '{{' in val and not val.startswith('='):
        return '=' + val
    return val

for node in d['nodes']:
    # Fix HTTP Request URLs
    if node['type'] == 'n8n-nodes-base.httpRequest':
        for param_key in ['url', 'jsonBody']:
            if param_key in node['parameters']:
                node['parameters'][param_key] = fix_expression(node['parameters'][param_key])
                
    # Fix Set Node assignments
    if node['type'] == 'n8n-nodes-base.set':
        if 'assignments' in node['parameters'] and 'assignments' in node['parameters']['assignments']:
             for assignment in node['parameters']['assignments']['assignments']:
                 if 'value' in assignment:
                     assignment['value'] = fix_expression(assignment['value'])

    # Fix Google/LangChain inputs
    if 'text' in node['parameters']:
        node['parameters']['text'] = fix_expression(node['parameters']['text'])

    # Fix IF Node conditions
    if node['type'] == 'n8n-nodes-base.if':
        if 'conditions' in node['parameters']:
            cond_root = node['parameters']['conditions']
            # Support both v1 (conditions list) and v2? inspecting structure
            # Example: {"conditions": [{"leftValue": "...", "rightValue": "..."}]}
            if 'conditions' in cond_root:
                for cond in cond_root['conditions']:
                    if 'leftValue' in cond:
                        cond['leftValue'] = fix_expression(cond['leftValue'])
                    if 'rightValue' in cond:
                        cond['rightValue'] = fix_expression(cond['rightValue'])

with open(output_file, 'w') as f:
    json.dump(d, f, indent=2)

print(f"Created {output_file}")
