import json
import sys
import uuid

def remaster_workflow(input_file, output_file):
    with open(input_file, 'r') as f:
        workflow = json.load(f)

    # Core node IDs for the loop-based system
    CORE_IDS = {
        "trigger": "3888d614-aa86-4ab1-9b68-0632cbd36fa5", # Upload Floor Plan Form1
        "validate": "6efffb4e-fefb-418a-883f-80bd21b2fcc3", # Validate & Extract Image1
        "config": "c7d74bba-cf34-46e8-9614-fba63e639f1a", # Configure Prompts1
        "store": "cb4e3f64-871d-41e1-9d79-cf4bf9cd8d8e", # Store Submission1
        "gen_iso": "e482e1ee-9e9e-44b5-8a1e-57efa180acbf", # Generate Isometric
        "poll_iso": "6dbd6d2a-d7c8-4a76-ae94-c7faf9387e32", # Poll Isometric
        "handler": "b58a6064-df8d-43ff-9d6b-79f46b3a1e22", # Poll Status Handler1
        "ready_iso": "5ae2de7f-9ccb-432d-8019-101cc2ac0dc8", # Isometric Ready?1
        "wait_iso": "3bedf88c-8bb6-42f0-bd35-e3c14ec02794", # Wait 3s1
        "success_iso": "17854313-01e9-47a3-83d2-dee4978481d7", # Isometric Success?1
        "store_iso_url": "b062f8d9-8da4-4f0d-adee-497909bdc8f5", # Store Isometric URL1
        "analyze": "e34f53f8-3416-4f59-bc5d-66e60fd68443", # Analyze Floor Plan
        "parse": "8744514c-7656-4306-a8cb-f597054bebfe", # Parse/Process Room List
        "loop": "7550cc43-cdf8-4cfc-88ca-a6dc50e7f9e5", # Loop Over Items
        "gen_room": "99fcdf6e-5d50-42b0-9967-374550e15c36", # Generate Room Image
        "poll_room": "78f5fa06-ba63-49af-9c33-62c13ecf204d", # Poll Room Image
        "check_room": "e522daad-63ea-4c87-8ef6-1a9e2e97ca32", # Check Room Image
        "ready_room": "eb1e2ce1-eb56-4ec6-b5bf-3be78b68db41", # Room Ready?
        "wait_room": "82933d1d-035b-4603-9a8a-fa6c008bcbcb", # Wait Room Image
        "animate": "0eaa0f8d-38f0-4289-96a6-2e3d42c521cf", # Animate Room Video
        "poll_vid": "cc280e94-0f83-4428-ac7b-bfd18e04bb41", # Poll Room Video
        "check_vid": "0cbab51a-243a-483c-9887-99a97a8ec03b", # Check Room Video
        "ready_vid": "06fe807c-7e37-409f-894c-733a6a39501d", # Room Video Ready?
        "wait_vid": "9b5c25b5-2307-42b2-82e0-8270935550be", # Wait Room Video
        "collect_url": "7cc7bcaf-52da-48b6-b7f1-987d5a003fd7", # Collect Room Video URL
        "merge": "07671f5d-7d2e-4da4-beeb-e6264d631bf8", # Merge Videos into Tour1
        "success_final": "51a09aec-6475-4252-b8ae-567371e82b27", # Update Success1
        "fail_final": "836f2169-38ce-4fc6-882f-48b0efb93677", # Update Failed1
    }

    # 1. Filter nodes to KEEP ONLY CORE ONES
    workflow['nodes'] = [n for n in workflow['nodes'] if n['id'] in CORE_IDS.values()]

    # 2. Add the 'Wait for All Videos' node (missing in legacy)
    wait_for_all_id = str(uuid.uuid4())
    wait_node = {
        "parameters": {
            "jsCode": """// Collect all results from the 'Collect Room Video URL' node across all iterations
const allItems = $('Collect Room Video URL').all();
const videoUrls = allItems
  .map(item => item.json.videoUrl)
  .filter(url => url && typeof url === 'string' && url.trim().length > 0);

if (videoUrls.length === 0) {
  throw new Error("No valid videos were generated for merging.");
}

return {
  json: {
    video_urls: videoUrls
  }
};"""
        },
        "id": wait_for_all_id,
        "name": "Wait for All Videos",
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": [3360, 4624]
    }
    workflow['nodes'].append(wait_node)
    CORE_IDS["wait_for_all"] = wait_for_all_id

    # 3. Process node parameters (Cleanup and Genericizing)
    for node in workflow['nodes']:
        # Rename nodes descriptively
        id_reverse = {v: k for k, v in CORE_IDS.items()}
        key = id_reverse.get(node['id'])
        
        name_map = {
            "gen_room": "Generate Room Image",
            "poll_room": "Poll Room Image",
            "check_room": "Check Room Image",
            "ready_room": "Room Ready?",
            "wait_room": "Wait Room Image",
            "animate": "Animate Room Video",
            "poll_vid": "Poll Room Video",
            "check_vid": "Check Room Video",
            "ready_vid": "Room Video Ready?",
            "wait_vid": "Wait Room Video",
            "collect_url": "Collect Room Video URL",
            "parse": "Process Room List"
        }
        if key in name_map:
            node['name'] = name_map[key]

        # Consolidated AI logic
        if key == "parse":
            node['parameters']['jsCode'] = """const item = $input.first().json;
let rawText = item.output || item.text || item.content || (item.message && item.message.content) || "";

// Robust extraction for Gemini/Langchain objects
if (typeof rawText === 'object' && rawText.parts && rawText.parts[0]) {
  rawText = rawText.parts[0].text;
} else if (typeof rawText === 'object' && rawText.text) {
  rawText = rawText.text;
}

const jsonMatch = String(rawText).match(/\\[[\\s\\S]*\\]/);
if (!jsonMatch) throw new Error("No JSON Array found in AI response. Raw Text: " + JSON.stringify(rawText).substring(0, 100));

try {
  const rooms = JSON.parse(jsonMatch[0]);
  const safeRooms = Array.isArray(rooms) ? rooms : [rooms];
  const style = $('Validate & Extract Image1').first().json.styleDescription || "modern style";
  
  return safeRooms.map(room => {
    const cleanName = (room.roomName || 'Room').replace(/["\\n\\r]/g, '');
    const cleanFrag = (room.promptFragment || '').replace(/["\\n\\r]/g, '');
    const cleanAction = (room.videoAction || 'Cinematic camera movement').replace(/["\\n\\r]/g, '');

    return {
      json: {
        ...room,
        roomName: cleanName,
        dynamicPrompt: `Eye-level photorealistic interior render of the ${cleanName}. ${cleanFrag}. ${style} style.`,
        videoAction: cleanAction
      }
    };
  });
} catch (e) {
  throw new Error("Failed to process room data: " + e.message);
}"""

        # Generic collecting node
        if key == "collect_url":
            node['parameters']['assignments']['assignments'] = [
                {"id": "video-url", "name": "videoUrl", "value": "={{ $json.resultUrl }}", "type": "string"},
                {"id": "room-name", "name": "roomName", "value": "={{ $('Loop Over Items').item.json.roomName }}", "type": "string"}
            ]

        # Final merge node
        if key == "merge":
            node['parameters']['jsonBody'] = "={\\n  \\\"video_urls\\\": {{ JSON.stringify($json.video_urls) }}\\n}"
            node['position'] = [3552, 4624]

        # Generic replacements for all logic
        if 'parameters' in node:
            node_str = json.dumps(node)
            node_str = node_str.replace("livingRoomVideoUrl", "videoUrl")
            node_str = node_str.replace("Parse the AI Text", "Process Room List")
            node_str = node_str.replace("Edit Fields", "Process Room List")
            new_node = json.loads(node_str)
            node.update(new_node)

    # 4. REBUILD ALL CONNECTIONS (PURGE OLD ONES)
    new_conns = {
        "Upload Floor Plan Form1": {"main": [[{"node": "Validate & Extract Image1", "type": "main", "index": 0}]]},
        "Validate & Extract Image1": {"main": [[{"node": "Configure Prompts1", "type": "main", "index": 0}]]},
        "Configure Prompts1": {"main": [[{"node": "Store Submission1", "type": "main", "index": 0}]]},
        "Store Submission1": {"main": [[{"node": "Generate Isometric (with Floor Plan)1", "type": "main", "index": 0}]]},
        "Generate Isometric (with Floor Plan)1": {"main": [[{"node": "Poll Isometric Status1", "type": "main", "index": 0}]]},
        "Poll Isometric Status1": {"main": [[{"node": "Poll Status Handler1", "type": "main", "index": 0}]]},
        "Poll Status Handler1": {"main": [[{"node": "Isometric Ready?1", "type": "main", "index": 0}]]},
        "Isometric Ready?1": {"main": [
            [{"node": "Isometric Success?1", "type": "main", "index": 0}],
            [{"node": "Wait 3s1", "type": "main", "index": 0}]
        ]},
        "Wait 3s1": {"main": [[{"node": "Poll Isometric Status1", "type": "main", "index": 0}]]},
        "Isometric Success?1": {"main": [
            [{"node": "Store Isometric URL1", "type": "main", "index": 0}],
            [{"node": "Update Failed1", "type": "main", "index": 0}]
        ]},
        "Store Isometric URL1": {"main": [[{"node": "Analyze Floor Plan", "type": "main", "index": 0}]]},
        "Analyze Floor Plan": {"main": [[{"node": "Process Room List", "type": "main", "index": 0}]]},
        "Process Room List": {"main": [[{"node": "Loop Over Items", "type": "main", "index": 0}]]},
        "Loop Over Items": {"main": [
            [{"node": "Wait for All Videos", "type": "main", "index": 0}],
            [{"node": "Generate Room Image", "type": "main", "index": 0}]
        ]},
        "Generate Room Image": {"main": [[{"node": "Poll Room Image", "type": "main", "index": 0}]]},
        "Poll Room Image": {"main": [[{"node": "Check Room Image", "type": "main", "index": 0}]]},
        "Check Room Image": {"main": [[{"node": "Room Ready?", "type": "main", "index": 0}]]},
        "Room Ready?": {"main": [
            [{"node": "Animate Room Video", "type": "main", "index": 0}],
            [{"node": "Wait Room Image", "type": "main", "index": 0}]
        ]},
        "Wait Room Image": {"main": [[{"node": "Poll Room Image", "type": "main", "index": 0}]]},
        "Animate Room Video": {"main": [[{"node": "Poll Room Video", "type": "main", "index": 0}]]},
        "Poll Room Video": {"main": [[{"node": "Check Room Video", "type": "main", "index": 0}]]},
        "Check Room Video": {"main": [[{"node": "Room Video Ready?", "type": "main", "index": 0}]]},
        "Room Video Ready?": {"main": [
            [{"node": "Collect Room Video URL", "type": "main", "index": 0}],
            [{"node": "Wait Room Video", "type": "main", "index": 0}]
        ]},
        "Wait Room Video": {"main": [[{"node": "Poll Room Video", "type": "main", "index": 0}]]},
        "Collect Room Video URL": {"main": [[{"node": "Loop Over Items", "type": "main", "index": 1}]]},
        "Wait for All Videos": {"main": [[{"node": "Merge Videos into Tour1", "type": "main", "index": 0}]]},
        "Merge Videos into Tour1": {"main": [[{"node": "Update Success1", "type": "main", "index": 0}]]}
    }
    workflow['connections'] = new_conns

    with open(output_file, 'w') as f:
        json.dump(workflow, f, indent=2)

if __name__ == "__main__":
    remaster_workflow(sys.argv[1], sys.argv[2])
