import json

# Load the workflow
source_path = "/Users/shaifriedman/.gemini/antigravity/mcp-results/mcp_result_n8n_get_workflow_1769355171982.json"
dest_path = "/Users/shaifriedman/New Rensto/rensto/infra/rensto_v3_refactored_workflow.json"

with open(source_path, 'r') as f:
    wf = json.load(f)

nodes = wf['nodes']

# helper to find node by name
def find_node(name):
    for n in nodes:
        if n['name'] == name:
            return n
    return None

# 1. Update "Main Router" - Remove hardcoded context
router = find_node("Main Router")
if router:
    print("Patching Main Router...")
    # New code just passes product. Firestore lookup handles the rest.
    router['parameters']['jsCode'] = """// 1. Capture Product from Webhook or default
const product = $json.params?.product || "uad";
const mode = $json.body?.mode || "generate"; // Default to generate

// 2. Pass to Firestore Node
// We NO LONGER hardcode tableId here. We let the next node fetch it.
return [{ json: { product, mode } }];"""

# 2. Update "Route to Product" - Switch based on flowType (Data vs Logic)
switcher = find_node("Route to Product")
if switcher:
    print("Patching Route to Product...")
    # Output 0 (Image/UAD), Output 1 (Video/Missparty)
    # matching logic: if flowType == 'IMAGE' -> 0, else 1
    switcher['parameters']['output'] = "={{ $node[\"Upsert to Firestore\"].json.flowType === 'IMAGE' ? 0 : 1 }}"

# 3. Update UAD "Get Existing Listings1" (Node: 9fa11be8...)
uad_list = find_node("Get Existing Listings1")
if uad_list:
    print("Patching UAD Get Listings...")
    # Only update if it has dataTableId
    if 'dataTableId' in uad_list['parameters']:
         uad_list['parameters']['dataTableId']['value'] = "={{ $node[\"Upsert to Firestore\"].json.tableId }}"
         uad_list['parameters']['dataTableId']['mode'] = "id" # Ensure mode is 'id' for expression

# 4. Update Missparty "Get Existing Listings" (Node: 10f13b11...)
mp_list = find_node("Get Existing Listings")
if mp_list:
    print("Patching Missparty Get Listings...")
    if 'dataTableId' in mp_list['parameters']:
         mp_list['parameters']['dataTableId']['value'] = "={{ $node[\"Upsert to Firestore\"].json.tableId }}"
         mp_list['parameters']['dataTableId']['mode'] = "id"

# 5. Update Upsert Node Logic (Node: 49e286de... "API Update Row") 
# It seems this one already uses expression: ={{ $node["Upsert to Firestore"].json.dataTableId }}
# Checking...
update_row = find_node("API Update Row")
if update_row:
     val = update_row['parameters'].get('dataTableId', {}).get('value', '')
     if 'Upsert to Firestore' in val:
         print("API Update Row is already dynamic.")
     else:
         print("Patching API Update Row...")
         update_row['parameters']['dataTableId']['value'] = "={{ $node[\"Upsert to Firestore\"].json.tableId }}"
         update_row['parameters']['dataTableId']['mode'] = "id"

# 6. Update "Upsert to Firestore" to actually be a GET (It is named Upsert but does GET?)
firestore = find_node("Upsert to Firestore")
if firestore:
    # Ensure it fetches!
    if firestore['parameters'].get('operation') != 'get':
         print("WARNING: Firestore node operation is not GET. Fixing...")
         firestore['parameters']['operation'] = 'get'

# Save
with open(dest_path, 'w') as f:
    json.dump(wf, f, indent=2)

print(f"✅ patched workflow saved to {dest_path}")
