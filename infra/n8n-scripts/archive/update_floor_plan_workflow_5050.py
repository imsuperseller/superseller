import json
import sys

# Load the workflow data
# Note: Using the last retrieved workflow definition is safest to avoid overwriting recent changes.
# However, fetching fresh is better practice. For now, I'll assume we are using the fresh fetch result.
# I should re-fetch to be safe, but since I just updated it, I can use the same logic if I fetch first.
# Let's rely on fetching fresh in the pipe. But here I am writing the script.
# I'll point it to 'infra/workflow_update_clean_v2.json' OR I should fetch fresh.
# Given the tool flow, I'll fetch fresh to a new file, then run this script on it.

with open('infra/latest_workflow.json', 'r') as f:
    workflow = json.load(f)

# Update the specific node
for node in workflow['nodes']:
    if node['name'] == 'Merge Videos into Tour1':
        node['parameters']['url'] = 'http://172.245.56.50:5050/merge'

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
