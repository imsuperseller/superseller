import json

with open('/Users/shaifriedman/.gemini/antigravity/mcp-results/mcp_result_n8n_get_workflow_1769384809058.json', 'r') as f:
    wf = json.load(f)

# Find StoreSubmission node
for node in wf['nodes']:
    if node['name'] == 'StoreSubmission':
        # Remove problematic columns from the 'value' mapping
        value = node['parameters']['columns']['value']
        to_remove = ['address', 'email', 'style', 'submissionDate']
        for col in to_remove:
            if col in value:
                del value[col]
        print(f"Cleaned node {node['name']} mapping: {value}")

with open('cleaned_wf.json', 'w') as f:
    json.dump(wf, f, indent=2)
