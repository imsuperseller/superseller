import json
import os

filepath = '/Users/shaifriedman/.gemini/antigravity/mcp-results/mcp_result_n8n_get_workflow_1769372143919.json'
output_path = '/Users/shaifriedman/New Rensto/rensto/infra/REPAIRED_WORKFLOW.json'

with open(filepath, 'r') as f:
    wf = json.load(f)

# Clean connections
if 'connections' in wf:
    for node_name, connection_data in wf['connections'].items():
        if 'main' in connection_data:
            new_main = []
            for branch in connection_data['main']:
                # Filter out nulls from each branch array
                clean_branch = [item for item in branch if item is not None]
                new_main.append(clean_branch)
            wf['connections'][node_name]['main'] = new_main

# Save repaired workflow
with open(output_path, 'w') as f:
    json.dump(wf, f, indent=2)

print(f"Repaired workflow saved to {output_path}")
