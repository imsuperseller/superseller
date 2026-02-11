import json

file_path = "/Users/shaifriedman/.gemini/antigravity/mcp-results/mcp_result_n8n_get_workflow_1769454070054.json"
with open(file_path, 'r') as f:
    wf = json.load(f)

# 1. Update FetchExteriorPhotos to continue on fail
for node in wf['nodes']:
    if node['name'] == 'FetchExteriorPhotos':
        node['continueOnFail'] = True

# 2. Add InitStorage Node
init_storage = {
    "parameters": {
        "mode": "runOnceForAllItems",
        "language": "javaScript",
        "jsCode": "const staticData = $getWorkflowStaticData('global');\nstaticData.roomVideos = [];\nstaticData.exteriorVideos = [];\nstaticData.completedRooms = 0;\nstaticData.totalRooms = 0;\nreturn { json: { initialized: true } };"
    },
    "id": "init-storage-node-id",
    "name": "InitStorage",
    "type": "n8n-nodes-base.code",
    "typeVersion": 2,
    "position": [3880, 16800]
}
wf['nodes'].append(init_storage)

# 3. Modify CollectExteriorVideos code
for node in wf['nodes']:
    if node['name'] == 'CollectExteriorVideos':
        node['parameters']['jsCode'] = """const staticData = $getWorkflowStaticData('global');
if (!staticData.exteriorVideos) staticData.exteriorVideos = [];

const items = $input.all();
for (const item of items) {
  if (item.json.resultUrl && item.json.resultUrl.length > 5) {
    if (!staticData.exteriorVideos.includes(item.json.resultUrl)) {
        staticData.exteriorVideos.push(item.json.resultUrl);
    }
  }
}

return { json: { exterior_videos: staticData.exteriorVideos, exterior_count: staticData.exteriorVideos.length, stored: true } };"""

# 4. Modify FinalListBuilder1 code
for node in wf['nodes']:
    if node['name'] == 'FinalListBuilder1':
        node['parameters']['jsCode'] = """const staticData = $getWorkflowStaticData('global');
let allVideos = [];

// Collect Room Videos
if (staticData.roomVideos && staticData.roomVideos.length > 0) {
  allVideos.push(...staticData.roomVideos);
}

// Collect Exterior Videos
if (staticData.exteriorVideos && staticData.exteriorVideos.length > 0) {
  allVideos.push(...staticData.exteriorVideos);
}

const finalCount = allVideos.length;

// Step 3: Cleanup for next execution (optional but good practice)
// We keep it for now but the InitStorage handles the start-of-run reset.
// Clearing here helps if the workflow ends unexpectedly.

if (finalCount === 0) {
  throw new Error("No videos collected from any branch.");
}

return { 
  json: { 
    video_urls: allVideos,
    skipMerge: finalCount === 1,
    finalVideoUrl: finalCount === 1 ? allVideos[0] : null,
    videoCount: finalCount
  } 
};"""

# 5. Add ShouldMerge IF Node
should_merge = {
    "parameters": {
        "conditions": {
            "options": {
                "caseSensitive": True,
                "leftValue": "",
                "typeValidation": "loose",
                "version": 2
            },
            "conditions": [
                {
                    "id": "skip-merge-check",
                    "leftValue": "={{ $json.skipMerge }}",
                    "operator": {
                        "operation": "equals",
                        "type": "boolean"
                    },
                    "rightValue": True
                }
            ],
            "combinator": "and"
        },
        "looseTypeValidation": True,
        "options": {}
    },
    "id": "should-merge-if-id",
    "name": "ShouldMerge",
    "type": "n8n-nodes-base.if",
    "typeVersion": 2.2,
    "position": [8820, 17150]
}
wf['nodes'].append(should_merge)

# 6. Update UpdateSuccess Node parameter
for node in wf['nodes']:
    if node['name'] == 'UpdateSuccess':
        # Update finalTourUrl to handle both paths
        # It's an array of objects in columns.value
        if 'columns' in node['parameters'] and 'value' in node['parameters']['columns']:
            # Use expression to check both ShouldMerge and MergeVideosintoTour1
            # Actually, simpler: just use {{ $json.finalVideoUrl || $node["MergeVideosintoTour1"].json.video_url }}
            node['parameters']['columns']['value']['finalTourUrl'] = '={{ $json.finalVideoUrl || $node["MergeVideosintoTour1"].json.video_url }}'

# 7. Update Connections

# StoreSubmission -> InitStorage
wf['connections']['StoreSubmission']['main'][0] = [{"node": "InitStorage", "type": "main", "index": 0}]

# InitStorage -> Switch
wf['connections']['InitStorage'] = {"main": [[{"node": "Switch", "type": "main", "index": 0}]]}

# FinalListBuilder1 -> ShouldMerge
wf['connections']['FinalListBuilder1']['main'][0] = [{"node": "ShouldMerge", "type": "main", "index": 0}]

# ShouldMerge Output 0 (True: Skip) -> UpdateSuccess
# ShouldMerge Output 1 (False: Merge) -> MergeVideosintoTour1
wf['connections']['ShouldMerge'] = {
    "main": [
        [{"node": "UpdateSuccess", "type": "main", "index": 0}],
        [{"node": "MergeVideosintoTour1", "type": "main", "index": 0}]
    ]
}

# Fix MergeVideosintoTour1 -> UpdateSuccess (ensure it still connects)
# It was already connected in the original JSON.

with open('modified_wf.json', 'w') as f:
    json.dump(wf, f)
