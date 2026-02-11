import json
import sys

# Load the workflow data
with open('/Users/shaifriedman/.gemini/antigravity/mcp-results/mcp_result_n8n_get_workflow_1769194430347.json', 'r') as f:
    workflow = json.load(f)

# Update the main active status
workflow['active'] = True

# Update the specific node
for node in workflow['nodes']:
    if node['name'] == 'Merge Videos into Tour1':
        node['parameters']['url'] = 'http://172.245.56.50:8080/merge'
        # Explicitly set to string, not expression, unless needed. 
        # But looking at previous: "url": "={{ $env.VIDEO_MERGE_URL || 'https://your-merge-service.com/merge' }}"
        # I'll make it a literal string now as requested.

# Clean up custom settings that might cause validation errors
# Remove availableInMCP, callerPolicy, timeSavedMode
for key in ['availableInMCP', 'callerPolicy', 'timeSavedMode']:
    if key in workflow['settings']:
        del workflow['settings'][key]

# Remove active status from PUT body as it's read-only
if 'active' in workflow:
    del workflow['active']

# Prepare the update object
update_obj = {
    "name": workflow["name"],
    "nodes": workflow["nodes"],
    "connections": workflow["connections"],
    "settings": workflow["settings"]
}

# Output as JSON for the PUT request
print(json.dumps(update_obj))
