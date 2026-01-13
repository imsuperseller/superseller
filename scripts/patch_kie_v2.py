import json

def patch_kie_ai_v2(filepath):
    with open(filepath, 'r') as f:
        wf = json.load(f)

    # API Key from user
    api_key = "cb711f74a221be35a20df8e26e722e04"

    for node in wf['nodes']:
        # 1. Update Video Create Node
        if node['name'] == "Kie.ai: Create Video":
            node['parameters']['url'] = "https://api.kie.ai/api/v1/jobs/createTask"
            node['parameters']['method'] = "POST"
            node['parameters']['sendHeaders'] = True
            node['parameters']['headerParameters'] = {
                "parameters": [
                    {"name": "Authorization", "value": f"Bearer {api_key}"}
                ]
            }
            node['parameters']['jsonBody'] = "={{ {\"model\": \"grok-imagine/text-to-video\", \"input\": {\"prompt\": $json.video_prompt, \"aspect_ratio\": \"16:9\", \"mode\": \"normal\"}} }}"
        
        # 2. Update Video Status Node
        if node['name'] in ["Kie.ai: Get Video Status1", "Kie.ai: Get Video Status"]:
            node['parameters']['url'] = "=https://api.kie.ai/api/v1/jobs/recordInfo?taskId={{ $json.data.taskId }}"
            node['parameters']['method'] = "GET"
            node['parameters']['sendHeaders'] = True
            node['parameters']['headerParameters'] = {
                "parameters": [
                    {"name": "Authorization", "value": f"Bearer {api_key}"}
                ]
            }

        # 3. Update Wait For Video Ready code
        if node['name'] in ["Wait For Video Ready1", "Wait For Video Ready"]:
            node['parameters']['jsCode'] = """const videoData = $input.first().json;
const retryCount = videoData.retryCount || 0;
const stat = videoData.data?.state;
const isSuccess = stat === 'success';
const isFailed = stat === 'fail';

if (isSuccess || isFailed || retryCount >= 10) {
  let resultUrl = "";
  if (isSuccess) {
    try {
      const res = JSON.parse(videoData.data.resultJson);
      resultUrl = res.resultUrls?.[0] || "";
    } catch(e) {}
  }
  return [{ json: { ...videoData, videoReady: isSuccess, videoUrl: resultUrl, retryCount: 0 } }];
}
return [{ json: { ...videoData, videoReady: false, retryCount: retryCount + 1 } }];"""

        # 4. Update Image Create Node
        if node['name'] in ["Create Image Request1", "Create Image Request"]:
            node['parameters']['url'] = "https://api.kie.ai/api/v1/jobs/createTask"
            node['parameters']['method'] = "POST"
            node['parameters']['sendHeaders'] = True
            node['parameters']['headerParameters'] = {
                "parameters": [
                    {"name": "Authorization", "value": f"Bearer {api_key}"}
                ]
            }
            # Note: Using pro-image-to-image without input_urls as instructed, 
            # but usually this requires a reference. If it fails, text-to-image is likely correct.
            node['parameters']['jsonBody'] = "={{ {\"model\": \"flux-2/pro-image-to-image\", \"input\": {\"prompt\": $json.image_prompt, \"aspect_ratio\": \"4:3\", \"resolution\": \"1K\", \"input_urls\": [\"https://rensto.com/favicon.png\"]} } }}"

        # 5. Update Image Status/Get Node
        if node['name'] in ["Get Image1", "Get Image"]:
            node['parameters']['url'] = "=https://api.kie.ai/api/v1/jobs/recordInfo?taskId={{ $json.data.taskId }}"
            node['parameters']['method'] = "GET"
            node['parameters']['sendHeaders'] = True
            node['parameters']['headerParameters'] = {
                "parameters": [
                    {"name": "Authorization", "value": f"Bearer {api_key}"}
                ]
            }

        # 6. Update Check Image Status code
        if node['name'] in ["Check Image Status1", "Check Image Status"]:
            node['parameters']['jsCode'] = """const imageData = $input.first().json;
const MAX_RETRIES = 12;
const retryCount = imageData.retryCount || 0;
const stat = imageData.data?.state;

if (retryCount >= MAX_RETRIES) {
  return [{ json: { skipImage: true, imageReady: false, retryCount: 0, reason: 'Timeout' } }];
}

if (stat === 'fail') {
  return [{ json: { skipImage: true, imageReady: false, retryCount: 0, reason: 'Image generation failed' } }];
}

if (stat !== 'success') {
  return [{ json: { skipImage: false, imageReady: false, continuePolling: true, retryCount: retryCount + 1, data: imageData.data || imageData } }];
}

let imageUrl = "";
try {
  const res = JSON.parse(imageData.data.resultJson);
  imageUrl = res.resultUrls?.[0] || "";
} catch(e) {}

return [{ json: { skipImage: false, imageReady: true, imageUrl: imageUrl, retryCount: 0 } }];"""

    with open(filepath, 'w') as f:
        json.dump(wf, f, indent=2)

if __name__ == "__main__":
    patch_kie_ai_v2('/Users/shaifriedman/New Rensto/rensto/workflows/rensto_patched_internal.json')
    print("Workflow patched with Kie.ai v2 API logic.")
