import json

def patch_kie_ai_v2_hardened(filepath):
    with open(filepath, 'r') as f:
        wf = json.load(f)

    api_key = "cb711f74a221be35a20df8e26e722e04"

    for node in wf['nodes']:
        # AGGRESSIVE MATCH FOR VIDEO CREATE
        if "Kie.ai" in node['name'] and "Create" in node['name'] and "Video" in node['name']:
            node['parameters']['url'] = "https://api.kie.ai/api/v1/jobs/createTask"
            node['parameters']['method'] = "POST"
            node['parameters']['sendHeaders'] = True
            node['parameters']['headerParameters'] = {
                "parameters": [
                    {"name": "Authorization", "value": f"Bearer {api_key}"}
                ]
            }
            node['parameters']['jsonBody'] = "={{ {\"model\": \"grok-imagine/text-to-video\", \"input\": {\"prompt\": $json.video_prompt, \"aspect_ratio\": \"16:9\", \"mode\": \"normal\"}} }}"
        
        # AGGRESSIVE MATCH FOR VIDEO STATUS
        elif "Kie.ai" in node['name'] and "Get" in node['name'] and "Video" in node['name'] and "Status" in node['name']:
            node['parameters']['url'] = "=https://api.kie.ai/api/v1/jobs/recordInfo?taskId={{ $json.data.taskId }}"
            node['parameters']['method'] = "GET"
            node['parameters']['sendHeaders'] = True
            node['parameters']['headerParameters'] = {
                "parameters": [
                    {"name": "Authorization", "value": f"Bearer {api_key}"}
                ]
            }

        # AGGRESSIVE MATCH FOR IMAGE CREATE
        elif ("Create" in node['name'] or "Request" in node['name']) and "Image" in node['name']:
            node['parameters']['url'] = "https://api.kie.ai/api/v1/jobs/createTask"
            node['parameters']['method'] = "POST"
            node['parameters']['sendHeaders'] = True
            node['parameters']['headerParameters'] = {
                "parameters": [
                    {"name": "Authorization", "value": f"Bearer {api_key}"}
                ]
            }
            node['parameters']['jsonBody'] = "={{ {\"model\": \"flux-2/pro-image-to-image\", \"input\": {\"prompt\": $json.image_prompt, \"aspect_ratio\": \"4:3\", \"resolution\": \"1K\", \"input_urls\": [\"https://rensto.com/favicon.png\"]} } }}"

        # AGGRESSIVE MATCH FOR IMAGE GET
        elif "Get" in node['name'] and "Image" in node['name'] and "Request" not in node['name']:
             node['parameters']['url'] = "=https://api.kie.ai/api/v1/jobs/recordInfo?taskId={{ $json.data.taskId }}"
             node['parameters']['method'] = "GET"
             node['parameters']['sendHeaders'] = True
             node['parameters']['headerParameters'] = {
                "parameters": [
                    {"name": "Authorization", "value": f"Bearer {api_key}"}
                ]
            }

    # Final check for any lingering "veo" URLs in the whole structure
    raw_str = json.dumps(wf)
    if "api/v1/veo" in raw_str:
        raw_str = raw_str.replace("https://api.kie.ai/api/v1/veo/generate", "https://api.kie.ai/api/v1/jobs/createTask")
        raw_str = raw_str.replace("https://api.kie.ai/api/v1/veo/record-info", "https://api.kie.ai/api/v1/jobs/recordInfo")
        raw_str = raw_str.replace("veo3_fast", "grok-imagine/text-to-video")
        wf = json.loads(raw_str)

    with open(filepath, 'w') as f:
        json.dump(wf, f, indent=2)

if __name__ == "__main__":
    patch_kie_ai_v2_hardened('/Users/shaifriedman/New Rensto/rensto/workflows/rensto_patched_internal.json')
    print("Workflow hardened with Kie.ai v2 API logic and Grok models.")
