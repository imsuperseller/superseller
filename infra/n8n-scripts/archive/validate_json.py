import json
import collections

try:
    with open('/Users/shaifriedman/.gemini/antigravity/mcp-results/master_repaired_workflow.json', 'r') as f:
        data = json.load(f)

    print("JSON is valid syntax.")

    nodes = data.get('nodes', [])
    names = [n['name'] for n in nodes]
    ids = [n['id'] for n in nodes]

    dup_names = [item for item, count in collections.Counter(names).items() if count > 1]
    dup_ids = [item for item, count in collections.Counter(ids).items() if count > 1]

    if dup_names:
        print(f"Duplicate Names: {dup_names}")
    if dup_ids:
        print(f"Duplicate IDs: {dup_ids}")

    # Check If Nodes
    for node in nodes:
        if node['name'] in ['ExteriorReady1', 'IsometricReady']:
            print(f"Node {node['name']} Params: {json.dumps(node.get('parameters'), indent=2)}")

except Exception as e:
    print(f"Error: {e}")
