import json
import os

input_path = '/Users/shaifriedman/New Rensto/rensto/workflows/rensto_engine_RESTORED_SOURCE.json'
output_path = '/Users/shaifriedman/New Rensto/rensto/workflows/rensto_patched_internal.json'

with open(input_path, 'r') as f:
    wf = json.load(f)

for node in wf['nodes']:
    # 1. Patch Facebook Parameters (Currently empty in your source)
    if node['name'] == 'Facebook: Publish':
        node['parameters'] = {
            'resource': 'pagePost',
            'page': '844266372343077',
            'message': '={{ $(\'Parse AI Blog Content\').first().json.facebook_post }}',
            'link': '={{ \"https://rensto.com/blog/\" + $(\'Parse AI Blog Content\').first().json.slug }}',
            'options': {}
        }
    
    # 2. Add Slug Check instruction to AI Agent without deleting your guidelines
    if node['name'] == 'Rensto Blog AI Agent':
        original_text = node['parameters'].get('text', '')
        if 'slug check' not in original_text.lower():
            node['parameters']['text'] = (
                "**URGENT: SLUG CHECK REQUIREMENT**\n"
                "Before finishing, use the Firestore 'Get many documents' tool on 'content_posts' to check if your 'slug' already exists. If it does, make it unique.\n\n"
                + original_text
            )

    # 3. Ensure Firestore nodes point to 'content_posts'
    # (Checking both main nodes and Tool nodes)
    if node['type'] == 'n8n-nodes-base.googleFirebaseCloudFirestore' or node['type'] == 'n8n-nodes-base.googleFirebaseCloudFirestoreTool':
        p = node['parameters']
        if p.get('collection') == 'content_items':
            p['collection'] = 'content_posts'
        if 'createDetails' in p and p['createDetails'].get('collection') == 'content_items':
            p['createDetails']['collection'] = 'content_posts'

with open(output_path, 'w') as f:
    json.dump(wf, f, indent=2)

print(f"Patched {output_path} successfully while preserving all {len(wf['nodes'])} nodes.")
