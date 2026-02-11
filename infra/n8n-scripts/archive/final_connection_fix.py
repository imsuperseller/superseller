import json
import re

# Load the source of truth (the successful download from earlier)
with open('/Users/shaifriedman/.gemini/antigravity/mcp-results/mcp_result_n8n_get_workflow_1769458786239.json', 'r') as f:
    wf = json.load(f)

# Whitelist for nodes to keep the payload lean
NODE_WHITELIST = {
    'parameters', 'id', 'name', 'type', 'typeVersion', 
    'position', 'credentials', 'webhookId', 'continueOnFail',
    'notes', 'disabled', 'alwaysOutputData', 'executeOnce'
}

clean_nodes = []
for node in wf.get('nodes', []):
    clean_node = {k: v for k, v in node.items() if k in NODE_WHITELIST}
    clean_nodes.append(clean_node)

# Add local error handler nodes (Rule 58)
clean_nodes.append({
    "parameters": {},
    "id": "err-trig-final",
    "name": "Error Trigger",
    "type": "n8n-nodes-base.errorTrigger",
    "typeVersion": 1,
    "position": [-5696, 14500]
})
clean_nodes.append({
    "parameters": {
        "jsCode": "return { json: { error: 'Caught by INT-TECH-ERR-HANDLER', data: $input.all() } };"
    },
    "id": "err-hdl-final",
    "name": "INT-TECH-ERR-HANDLER",
    "type": "n8n-nodes-base.code",
    "typeVersion": 2,
    "position": [-5472, 14500]
})

# DEEP CLEAN CONNECTIONS
raw_connections = wf.get("connections", {})
connections = {}

def sanitize_name(name):
    # Remove all escaped quotes, literal quotes, and backslashes
    return name.replace('\\"', '').replace('"', '').replace("'", "").strip()

for k, v in raw_connections.items():
    clean_key = sanitize_name(k)
    # Also sanitize node names within the connections
    clean_v = {}
    for conn_type, conn_list in v.items():
        new_list = []
        for branch in conn_list:
            new_branch = []
            for entry in branch:
                new_entry = entry.copy()
                if 'node' in new_entry:
                    new_entry['node'] = sanitize_name(new_entry['node'])
                new_branch.append(new_entry)
            new_list.append(new_branch)
        clean_v[conn_type] = new_list
    connections[clean_key] = clean_v

# Add connection for the Error Trigger
connections["Error Trigger"] = {"main": [[{"node": "INT-TECH-ERR-HANDLER", "type": "main", "index": 0}]]}

final_payload = {
    "name": "SUB-VIDEO-MERGE-011",
    "nodes": clean_nodes,
    "connections": connections,
    "settings": {"executionOrder": "v1"}
}

output_path = '/Users/shaifriedman/.gemini/antigravity/mcp-results/final_restored_workflow.json'
with open(output_path, 'w') as f:
    json.dump(final_payload, f)

print(f"Final restored workflow payload generated at {output_path}")
print("Connection keys and node references are now 100% clean strings.")
