import json
import re

# Source of truth: the clean download before I broke it
input_file = '/Users/shaifriedman/.gemini/antigravity/mcp-results/mcp_result_n8n_get_workflow_1769458786239.json'
output_file = '/Users/shaifriedman/New Rensto/rensto/complete_spaceless_workflow.json'

with open(input_file, 'r') as f:
    wf = json.load(f)

def clean_name(name):
    # Remove all non-alphanumeric except underscores, then replace spaces with underscores
    s = name.strip("'").strip('"').strip()
    s = s.replace(' ', '_').replace('-', '_').replace('&', 'And')
    s = re.sub(r'[^a-zA-Z0-9_]', '', s)
    return s

nodes = wf.get('nodes', [])
name_map = {}

# 1. Transform Nodes and build name mapping
for node in nodes:
    old_name = node['name']
    new_name = clean_name(old_name)
    name_map[old_name] = new_name
    node['name'] = new_name

# Add required Rule 58 nodes (with clean names)
nodes.append({
    "parameters": {},
    "id": "err_trig_011",
    "name": "Error_Trigger",
    "type": "n8n-nodes-base.errorTrigger",
    "typeVersion": 1,
    "position": [-5696, 14500]
})
nodes.append({
    "parameters": {
        "jsCode": "return { json: { error: 'Caught by INT-TECH-ERR-HANDLER', data: $input.all() } };"
    },
    "id": "err_hdl_011",
    "name": "INT_TECH_ERR_HANDLER",
    "type": "n8n-nodes-base.code",
    "typeVersion": 2,
    "position": [-5472, 14500]
})

# 2. Transform Connections
raw_connections = wf.get('connections', {})
connections = {}

def get_mapped_name(name):
    stripped = name.strip("'").strip('"').strip()
    # Check map first
    if stripped in name_map:
        return name_map[stripped]
    # Fallback to cleaning
    return clean_name(stripped)

for source, value in raw_connections.items():
    clean_source = get_mapped_name(source)
    clean_v = {}
    for conn_type, conn_list in value.items():
        new_list = []
        for branch in conn_list:
            new_branch = []
            for entry in branch:
                new_entry = entry.copy()
                if 'node' in new_entry:
                    new_entry['node'] = get_mapped_name(new_entry['node'])
                new_branch.append(new_entry)
            new_list.append(new_branch)
        clean_v[conn_type] = new_list
    connections[clean_source] = clean_v

# Add connection for Error Trigger
connections["Error_Trigger"] = {"main": [[{"node": "INT_TECH_ERR_HANDLER", "type": "main", "index": 0}]]}

# Update internal expressions/code referencing node names
nodes_str = json.dumps(nodes)
for old, new in name_map.items():
    if old == new: continue
    # Patterns like $('Old Name') or $node["Old Name"]
    nodes_str = nodes_str.replace(f"$('{old}')", f"$('{new}')")
    nodes_str = nodes_str.replace(f'$("{old}")', f'$("{new}")')
    nodes_str = nodes_str.replace(f'$node["{old}"]', f'$node["{new}"]')

nodes = json.loads(nodes_str)

final_payload = {
    "name": "SUB-VIDEO-MERGE-011",
    "nodes": nodes,
    "connections": connections,
    "settings": {"executionOrder": "v1"}
}

with open(output_file, 'w') as f:
    json.dump(final_payload, f, indent=2)

print(f"Spaceless workflow generated at {output_file}")
