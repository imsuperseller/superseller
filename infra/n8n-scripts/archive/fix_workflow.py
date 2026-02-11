import json
import sys

try:
    with open('/Users/shaifriedman/.gemini/antigravity/mcp-results/mcp_result_n8n_get_workflow_1769408895067.json', 'r') as f:
        print("Reading file...")
        content = f.read()
        print("File read. Parsing JSON...")
        workflow = json.loads(content)
        print(f"JSON parsed. Root type: {type(workflow)}")
except Exception as e:
    print(f"ERROR: {e}")
    sys.exit(1)

wait_node_ids = {
    "5f7d2ee6-8da9-4977-8321-df5e975a60df", # RateLimiter1
    "250edc42-cba6-4c2a-ab53-0f8934e1931c", # WaitExterior
    "a2d8be57-729e-493e-8ce8-ff03775f5a87", # WaitIsometric
    "9a98b54e-5ef6-4c65-9265-d12fc9941510", # WaitRoomImage
    "0defe45e-284d-47be-a939-5cb438adb6a7"  # WaitRoomVideo
}

http_node_ids = {
    "9e74b45f-0efe-4640-b835-8c64a75f1deb"  # GenerateRoomImage
}

for node in workflow.get('nodes', []):
    # Fix Wait nodes
    if node.get('id') in wait_node_ids:
        node['type'] = 'n8n-nodes-base.wait'
        node['typeVersion'] = 1.1
        params = node.get('parameters', {})
        params['resume'] = 'timeInterval'
        if params.get('unit') == 'second':
            params['unit'] = 'seconds'
        node['parameters'] = params
        # Clean up any non-n8n properties
        if 'waitForPreviousTools' in node:
            del node['waitForPreviousTools']

    # Fix GenerateRoomImage
    if node.get('id') in http_node_ids:
        node['type'] = 'n8n-nodes-base.httpRequest'
        node['typeVersion'] = 4.3
        # Clean up any non-n8n properties
        if 'waitForPreviousTools' in node:
            del node['waitForPreviousTools']

# Also check for any other nodes that might have the illegal property
for node in workflow.get('nodes', []):
    if 'waitForPreviousTools' in node:
        del node['waitForPreviousTools']

with open('/Users/shaifriedman/.gemini/antigravity/mcp-results/fixed_workflow.json', 'w') as f:
    json.dump(workflow, f, indent=2)

print("SUCCESS: Workflow surgically fixed.")
