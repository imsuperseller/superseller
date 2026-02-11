import json
import sys

input_path = "/Users/shaifriedman/.gemini/antigravity/mcp-results/mcp_result_n8n_get_workflow_1769408895067.json"
output_path = "/Users/shaifriedman/.gemini/antigravity/mcp-results/final_fixed_workflow.json"

try:
    with open(input_path, 'r') as f:
        workflow = json.load(f)

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
        if node.get('id') in wait_node_ids:
            node['type'] = 'n8n-nodes-base.wait'
            node['typeVersion'] = 1.1
            params = node.get('parameters', {})
            params['resume'] = 'timeInterval'
            params['amount'] = params.get('amount', 1)
            params['unit'] = 'seconds'
            node['parameters'] = params
            if 'waitForPreviousTools' in node: del node['waitForPreviousTools']

        if node.get('id') in http_node_ids:
            node['type'] = 'n8n-nodes-base.httpRequest'
            node['typeVersion'] = 4.3
            if 'waitForPreviousTools' in node: del node['waitForPreviousTools']

    # Final cleanup
    for node in workflow.get('nodes', []):
        if 'waitForPreviousTools' in node: del node['waitForPreviousTools']

    with open(output_path, 'w') as f:
        json.dump(workflow, f, indent=2)

    print("Antigravity Repair: SUCCESS")
except Exception as e:
    print(f"Antigravity Repair: ERROR: {e}")
    sys.exit(1)
