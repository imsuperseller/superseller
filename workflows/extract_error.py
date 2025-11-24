import json
import sys

try:
    with open('/Users/shaifriedman/New Rensto/rensto/workflows/execution_18752_full.json', 'r') as f:
        data = json.load(f)
    
    print(f"Execution ID: {data.get('id')}")
    print(f"Status: {data.get('status')}")
    
    # Check for top-level error
    if 'data' in data and 'resultData' in data['data'] and 'error' in data['data']['resultData']:
        print("Top-level Error found:")
        print(json.dumps(data['data']['resultData']['error'], indent=2))
    
    # Check for node-level errors
    if 'data' in data and 'resultData' in data['data'] and 'runData' in data['data']['resultData']:
        run_data = data['data']['resultData']['runData']
        for node_name, executions in run_data.items():
            for exec_item in executions:
                if 'error' in exec_item:
                    print(f"Error in node '{node_name}':")
                    print(json.dumps(exec_item['error'], indent=2))
                if 'executionStatus' in exec_item and exec_item['executionStatus'] == 'error':
                     print(f"Node '{node_name}' status is error.")

except Exception as e:
    print(f"Error parsing JSON: {e}")
