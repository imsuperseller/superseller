import json

file_path = "/Users/shaifriedman/.gemini/antigravity/mcp-results/mcp_result_n8n_get_workflow_1769454070054.json"
with open(file_path, 'r') as f:
    wf = json.load(f)

# 1. Update FetchExteriorPhotos to continue on fail
for node in wf['nodes']:
    if node['name'] == 'FetchExteriorPhotos':
        node['continueOnFail'] = True

# 2. Update CollectExteriorVideos code for robustness
for node in wf['nodes']:
    if node['name'] == 'CollectExteriorVideos':
        node['parameters']['jsCode'] = """const staticData = $getWorkflowStaticData('global');
if (!staticData.exteriorVideos) staticData.exteriorVideos = [];

const items = $input.all();
for (const item of items) {
  // resultUrl comes from the CheckExteriorStatus node which is upstream
  if (item.json.resultUrl && item.json.resultUrl.length > 5) {
    if (!staticData.exteriorVideos.includes(item.json.resultUrl)) {
        staticData.exteriorVideos.push(item.json.resultUrl);
    }
  }
}

return { json: { exterior_videos: staticData.exteriorVideos, exterior_count: staticData.exteriorVideos.length, stored: true } };"""

# 3. Update CheckSkipMerge (IF node) to be more robust
for node in wf['nodes']:
    if node['name'] == 'CheckSkipMerge':
        # Ensure it checks the boolean skipMerge
        node['parameters']['conditions']['conditions'][0]['operator']['operation'] = 'equals'
        node['parameters']['conditions']['conditions'][0]['operator']['type'] = 'boolean'
        node['parameters']['conditions']['conditions'][0]['rightValue'] = True

# 4. Update UpdateSuccess parameters to handle both paths
for node in wf['nodes']:
    if node['name'] == 'UpdateSuccess':
        if 'columns' in node['parameters'] and 'value' in node['parameters']['columns']:
            # Use expression to handle both ShouldMerge and CheckSkipMerge
            # If skipMerge was true, video_url is in current $json.
            # If skipMerge was false, video_url is in MergeVideosintoTour1 output.
            node['parameters']['columns']['value']['finalTourUrl'] = '={{ $json.video_url || $node["MergeVideosintoTour1"].json.video_url }}'

# 5. Fix connections if any are missing or wrong in the source
# The source connections look mostly okay, but let's double check CheckSkipMerge output
# CheckSkipMerge output 0 -> UpdateSuccess
# CheckSkipMerge output 1 -> MergeVideosintoTour1

# 6. Ensure InitStorage is connected correctly if not already
# It seems it is already connected from Switch.

with open('modified_wf_v2.json', 'w') as f:
    json.dump(wf, f)
