import json

with open('/Users/shaifriedman/New Rensto/rensto/infra/full_complex_marketplace_cleaned.json', 'r') as f:
    wf = json.load(f)

# Add the new Firestore node
firestore_node = {
    "parameters": {
        "authentication": "serviceAccount",
        "operation": "get",
        "projectId": "rensto",
        "collection": "marketplace_configs",
        "documentId": "={{ $json.product }}"
    },
    "id": "firestore-get-restored",
    "name": "Upsert to Firestore",
    "position": [48850, -3328],
    "type": "n8n-nodes-base.googleFirebaseCloudFirestore",
    "typeVersion": 1.1,
    "credentials": {
        "googleApi": {
            "id": "HbI3P6PUIe8ATqzp",
            "name": "Google Service Account account"
        }
    }
}

wf['nodes'].append(firestore_node)

# Update the connections
# Original: Time Check -> Within Operating Hours -> Route to Product
# New: Time Check -> Within Operating Hours -> Upsert to Firestore -> Route to Product

# 1. Find output of Within Operating Hours (id: 55b7e571-f589-406e-b168-106f050c0f61)
# It connected to Route to Product (id: 92b79b3b-7453-49eb-8855-53d77bb14b03)

wf['connections']['Within Operating Hours']['main'][0] = [{"node": "Upsert to Firestore", "type": "main", "index": 0}]
wf['connections']['Upsert to Firestore'] = {"main": [[{"node": "Route to Product", "type": "main", "index": 0}]]}

# Update name to distinguish
wf['name'] = "Unified Marketplace Master [RESTORED FULL + FIRESTORE FIX]"

with open('/Users/shaifriedman/New Rensto/rensto/infra/full_restored_final.json', 'w') as f:
    json.dump(wf, f, indent=2)
