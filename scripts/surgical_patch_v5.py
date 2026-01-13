import json
import os

wf_path = '/Users/shaifriedman/New Rensto/rensto/workflows/rensto_engine_RESTORED_GREEN.json'
output_path = '/Users/shaifriedman/New Rensto/rensto/workflows/rensto_patched_internal.json'

with open(wf_path, 'r') as f:
    wf = json.load(f)

for node in wf['nodes']:
    # 1. Surgical Patch for Facebook Publish
    if node['name'] == 'Facebook: Publish':
        node['parameters'] = {
            'resource': 'pagePost',
            'page': '844266372343077',
            'message': '={{ $(\'Parse AI Blog Content\').first().json.facebook_post }}',
            'link': '={{ \"https://rensto.com/blog/\" + $(\'Parse AI Blog Content\').first().json.slug }}',
            'options': {}
        }
    
    # 2. Refine AI Agent Prompt for Slug Check
    if node['name'] == 'Rensto Blog AI Agent':
        # Add the specific instruction while keeping the tone and branding
        original_text = node['parameters'].get('text', '')
        # Prepend the slug check instruction if not there
        if 'slug check' not in original_text.lower():
            node['parameters']['text'] = (
                "**URGENT: SLUG CHECK REQUIREMENT**\n"
                "Before finalizing a post, use the Firestore 'Get many documents' tool to search the 'content_posts' collection for a document with the same slug. If it exists, append a unique identifier to your new slug.\n\n"
                + original_text
            )
    
    # 3. Collection Sync
    if node['type'] == 'n8n-nodes-base.googleFirebaseCloudFirestore':
        if 'collection' in node['parameters'].get('createDetails', {}):
            node['parameters']['createDetails']['collection'] = 'content_posts'
        if node['parameters'].get('collection') == 'content_items':
            node['parameters']['collection'] = 'content_posts'

with open(output_path, 'w') as f:
    json.dump(wf, f, indent=2)

print(f"Surgically patched {output_path} successfully.")
