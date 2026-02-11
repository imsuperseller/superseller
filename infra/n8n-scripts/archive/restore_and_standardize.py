import json

# Reference the known-good functional workflow state
with open('/Users/shaifriedman/.gemini/antigravity/mcp-results/mcp_result_n8n_get_workflow_1769458786239.json', 'r') as f:
    wf = json.load(f)

# Whitelist for nodes
NODE_WHITELIST = {
    'parameters', 'id', 'name', 'type', 'typeVersion', 
    'position', 'credentials', 'webhookId', 'continueOnFail',
    'notes', 'disabled', 'alwaysOutputData', 'executeOnce'
}

clean_nodes = []
for node in wf.get('nodes', []):
    # Keep it simple, just copy the node but filter keys
    clean_node = {k: v for k, v in node.items() if k in NODE_WHITELIST}
    clean_nodes.append(clean_node)

# Add mandated local error handler
err_trig = {
    "parameters": {},
    "id": "err-trig-011",
    "name": "Error Trigger",
    "type": "n8n-nodes-base.errorTrigger",
    "typeVersion": 1,
    "position": [-5696, 14500]
}
err_hdl = {
    "parameters": {
        "jsCode": "return { json: { error: 'Caught by INT-TECH-ERR-HANDLER', data: $input.all() } };"
    },
    "id": "err-hdl-011",
    "name": "INT-TECH-ERR-HANDLER",
    "type": "n8n-nodes-base.code",
    "typeVersion": 2,
    "position": [-5472, 14500]
}
clean_nodes.append(err_trig)
clean_nodes.append(err_hdl)

# CLEAN CONNECTIONS: Remove any escaped quotes and preserve the complex branching
raw_connections = wf.get("connections", {})
connections = {}
for k, v in raw_connections.items():
    # Strip quotes from keys
    clean_key = k.strip('"').strip("'")
    connections[clean_key] = v

# Add error handler connection
connections["Error Trigger"] = {"main": [[{"node": "INT-TECH-ERR-HANDLER", "type": "main", "index": 0}]]}

payload = {
    "name": "SUB-VIDEO-MERGE-011",
    "nodes": clean_nodes,
    "connections": connections,
    "settings": {"executionOrder": "v1"}
}

# Save the absolute truth payload
output_path = '/Users/shaifriedman/.gemini/antigravity/mcp-results/restored_functional_workflow.json'
with open(output_path, 'w') as f:
    json.dump(payload, f)

print(f"Restored workflow payload generated at {output_path}")
print("Connections sanitized and Rule 58 logic restored.")
