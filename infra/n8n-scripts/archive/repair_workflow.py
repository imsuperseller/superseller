
import json
import re

wf_path = '/Users/shaifriedman/New Rensto/rensto/infra/rensto_v3_refactored_workflow.json'
with open(wf_path, 'r') as f:
    orig = json.load(f)

def safe_name(s):
    # Standardize to underscores, same as my previous pushes
    cleaned = re.sub(r'[^a-zA-Z0-9]+', '_', s).strip('_')
    return cleaned

# 1. Create a map of Old Name -> Safe Name
name_map = {}
for node in orig['nodes']:
    name_map[node['name']] = safe_name(node['name'])

# 2. Build the new nodes list with ORIGINAL PARAMETERS but NEW NAMES
new_nodes = []
for node in orig['nodes']:
    new_node = json.loads(json.dumps(node)) # Deep copy
    new_node['name'] = safe_name(node['name'])
    new_nodes.append(new_node)

# 3. Build Connections using SAFE NAMES
new_conns = {}
for src_name, data in orig['connections'].items():
    s_src = safe_name(src_name)
    if 'main' in data:
        new_main = []
        for branch in data['main']:
            new_branch = []
            for target in branch:
                t_node = target['node']
                s_target = safe_name(t_node)
                # We also need to be careful about connections that were already cleaned
                # but let's assume orig is in original state or consistent.
                # Just in case, try to find if target exists in our safe names
                target['node'] = s_target
                target['type'] = 'main'
                new_branch.append(target)
            new_main.append(new_branch)
        new_conns[s_src] = {'main': new_main}

# 4. DEEP EXPRESSION REPAIR
# We need to find every occurrence of old names in expressions/code and update them.
# We sort by length descending to ensure 'Every 20 Minutes' is replaced before 'Every'
sorted_names = sorted(name_map.items(), key=lambda x: len(x[0]), reverse=True)

def fix_blob(blob):
    if isinstance(blob, str):
        for old, new in sorted_names:
            if old == new: continue
            # Handle variations of quotes in jsCode and expressions
            # e.g. $node["Main Router"]
            blob = blob.replace('node["' + old + '"]', 'node["' + new + '"]')
            blob = blob.replace('node[\'' + old + '\']', 'node["' + new + '"]')
            # e.g. $('Main Router')
            blob = blob.replace('(\"' + old + '\")', '(\"' + new + '\")')
            blob = blob.replace('(\'' + old + '\')', '(\"' + new + '\")')
            # Handle the specific case from the refactored JSON
            blob = blob.replace('node[\\\"' + old + '\\\"]', 'node[\\\"' + new + '\\\"]')
        return blob
    elif isinstance(blob, list):
        return [fix_blob(i) for i in blob]
    elif isinstance(blob, dict):
        return {k: fix_blob(v) for k, v in blob.items()}
    return blob

# Apply Fixes
final_nodes = fix_blob(new_nodes)
final_conns = fix_blob(new_conns)

final_wf = {
    'nodes': final_nodes,
    'connections': final_conns,
    'settings': orig.get('settings', {
        "callerPolicy": "workflowsFromSameOwner",
        "availableInMCP": False,
        "executionOrder": "v1",
        "saveExecutionProgress": True,
        "saveManualExecutions": True
    }),
    'id': 'nFGTkjYPOIbFoR82',
    'name': 'FB Marketplace Listing Generator (RESTORED)',
    'staticData': orig.get('staticData', {}),
    'meta': orig.get('meta', {})
}

with open('/Users/shaifriedman/New Rensto/rensto/infra/RESTORED_WORKFLOW.json', 'w') as f:
    json.dump(final_wf, f, indent=2)
print('SUCCESS: RESTORED_WORKFLOW.json generated.')
