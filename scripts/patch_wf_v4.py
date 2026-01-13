import json
import os

wf_path = '/Users/shaifriedman/New Rensto/rensto/workflows/rensto_patched_internal.json'

with open(wf_path, 'r') as f:
    wf = json.load(f)

for node in wf['nodes']:
    # Fix Facebook Node
    if node['name'] == 'Facebook: Publish':
        node['parameters'] = {
            'resource': 'pagePost',
            'page': '844266372343077',
            'message': '={{ $(\'Parse AI Blog Content\').first().json.facebook_post }}',
            'link': '={{ \"https://rensto.com/blog/\" + $(\'Parse AI Blog Content\').first().json.slug }}',
            'options': {}
        }
    
    # Audit AI Agent Tools & Description
    if node['name'] == 'Rensto Blog AI Agent':
        node['parameters']['text'] = (
            "You are the Lead Content Strategist for Rensto (rensto.com).\n\n"
            "**BEFORE CREATING A POST:** Use the Firestore tool to check if a document with the same slug already exists in the 'content_posts' collection.\n\n"
            "**RENSTO BRAND GUIDELINES:**\n"
            "- **Mission**: Empowering SMBs with autonomous AI operations.\n"
            "- **Core Pillars**: AI Voice (Autonomous Secretaries), AI Knowledge (RAG), AI Sales (Outbound Lead Gen).\n"
            "- **Tone**: Professional, ROI-focused, cutting-edge.\n\n"
            "**SPECIFIC TOPIC:** {{ $json.topic }}\n\n"
            "**TASK:**\n"
            "Create a COMPREHENSIVE blog post (2000+ words) with full CMS metadata for a Vercel/Next.js site.\n\n"
            "**OUTPUT FORMAT (JSON OBJECT ONLY):**\n"
            "{\n"
            "  \"title\": \"Catchy title with a number\",\n"
            "  \"slug\": \"url-sanitized-slug\",\n"
            "  \"content\": \"Full markdown content with H2/H3 headers\",\n"
            "  \"excerpt\": \"SEO summary (150 chars)\",\n"
            "  \"categories\": [\"List\", \"of\", \"pillars\"],\n"
            "  \"tags\": [\"Keywords\", \"for\", \"navigation\"],\n"
            "  \"focusKeyword\": \"Primary keyword\",\n"
            "  \"seoTitle\": \"Optimized title (50-60 chars)\",\n"
            "  \"seoDescription\": \"Meta description (160 chars)\",\n"
            "  \"image_prompt\": \"Cinematic tech scene reflecting the topic\",\n"
            "  \"video_prompt\": \"Cinematic video intro for the article\",\n"
            "  \"linkedin_post\": \"Professional LinkedIn post\",\n"
            "  \"facebook_post\": \"Engaging Facebook post\"\n"
            "}"
        )

with open(wf_path, 'w') as f:
    json.dump(wf, f, indent=2)

print(f"Patched {wf_path} successfully.")
