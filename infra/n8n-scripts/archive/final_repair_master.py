import json
import uuid
import sys

# Define path to the input workflow
input_path = '/Users/shaifriedman/.gemini/antigravity/mcp-results/final_fixed_workflow.json'
output_path = '/Users/shaifriedman/.gemini/antigravity/mcp-results/master_repaired_workflow.json'

try:
    with open(input_path, 'r') as f:
        workflow_data = json.load(f)

    workflow = workflow_data if 'nodes' in workflow_data else workflow_data.get('data', workflow_data)

    # -------------------------------------------------------------------------
    # 1. FIX FORM TRIGGER LABELS AND DROPDOWN SCHEMA
    # -------------------------------------------------------------------------
    for node in workflow.get('nodes', []):
        if node.get('name') == 'UploadFloorPlanForm1':
            if 'formFields' not in node['parameters']:
                node['parameters']['formFields'] = {'values': []}

            # Golden Schema: strict explicit labels and clean fieldName for dropdown
            golden_fields = [
                {
                    "fieldName": "Floor Plan",
                    "fieldLabel": "Upload Floor Plan",
                    "label": "Upload Floor Plan",
                    "fieldType": "file",
                    "requiredField": True
                },
                {
                    # Snakecase fieldName to be safe for dropdowns
                    "fieldName": "property_style", 
                    "fieldLabel": "Property Style (e.g. Modern, Ranch)",
                    "label": "Property Style (e.g. Modern, Ranch)",
                    "fieldType": "dropdown",
                    "requiredField": True,
                    "fieldOptions": {
                        "values": [
                            {"name": "Dallas Eclectic", "value": "Dallas Eclectic", "label": "Dallas Eclectic"},
                            {"name": "Modern", "value": "Modern", "label": "Modern"},
                            {"name": "Ranch", "value": "Ranch", "label": "Ranch"},
                            {"name": "Spanish Colonial", "value": "Spanish Colonial", "label": "Spanish Colonial"},
                            {"name": "Traditional", "value": "Traditional", "label": "Traditional"},
                            {"name": "Mid-Century Modern", "value": "Mid-Century Modern", "label": "Mid-Century Modern"},
                            {"name": "Farmhouse", "value": "Farmhouse", "label": "Farmhouse"},
                            {"name": "Contemporary", "value": "Contemporary", "label": "Contemporary"},
                            {"name": "Mediterranean", "value": "Mediterranean", "label": "Mediterranean"},
                            {"name": "Victorian", "value": "Victorian", "label": "Victorian"},
                            {"name": "Industrial", "value": "Industrial", "label": "Industrial"}
                        ]
                    }
                },
                {
                    "fieldName": "address",
                    "fieldLabel": "Property Address",
                    "label": "Property Address",
                    "fieldType": "text",
                    "requiredField": False
                },
                {
                    "fieldName": "Email",
                    "fieldLabel": "Your Email Address",
                    "label": "Your Email Address",
                    "fieldType": "email",
                    "requiredField": True
                }
            ]
            node['parameters']['formFields']['values'] = golden_fields

    # -------------------------------------------------------------------------
    # 2. FIX VALIDATE/EXTRACT NODE TO READ NEW PROPERTY STYLE KEY
    # -------------------------------------------------------------------------
    clean_validate_code = r"""const item = $input.first().json;
    const data = item.body || item;

// Basic data extraction
const email = data.Email || data.email || 'service@rensto.com';
const address = data.address || '';
// Check for various potential keys for property style
const style = data.property_style || data['Property Style'] || data.style || 'Modern';

// Create a timestamp
const timestamp = new Date().toISOString();

// Return strict array properly
return [
  {
    json: {
      floorPlanBase64: 'filesystem-v2',
      floorPlanMimeType: 'image/webp',
      email,
      address,
      hasAddress: !!address && address.length > 5,
      style,
      styleDescription: `${style} mix of contemporary and traditional Texas elements`,
      timestamp
    }
  }
];"""

    for node in workflow.get('nodes', []):
        if node.get('name') == 'ValidateExtractImage2':
            node['parameters']['jsCode'] = clean_validate_code

    # -------------------------------------------------------------------------
    # 3. FIX PROCESS ROOM LIST PARSING
    # -------------------------------------------------------------------------
    process_room_code = r"""
const item = $input.first().json;
// Handle different Gemini output structures
const rawContent = item.output || item.text || item.content || (item.message && item.message.content) || (item.parts && item.parts[0] && item.parts[0].text);

let rawText = '';
if (typeof rawContent === 'string') {
  rawText = rawContent;
} else if (typeof rawContent === 'object' && rawContent !== null) {
  // If we already get an object/array, use it directly
  if (Array.isArray(rawContent)) return formatOutput(rawContent);
  // If it's a single object (not array), wrap it
  return formatOutput([rawContent]);
}

// Cleaning logic for text output
rawText = rawText.trim();
// Remove markdown code blocks if present
if (rawText.startsWith('```')) {
  rawText = rawText.replace(/^```(json)?/, '').replace(/```$/, '');
}

// Find JSON array or object
let jsonStart = rawText.indexOf('[');
let jsonEnd = rawText.lastIndexOf(']');

if (jsonStart === -1 || jsonEnd === -1) {
    // Try finding object
    jsonStart = rawText.indexOf('{');
    jsonEnd = rawText.lastIndexOf('}');
}

if (jsonStart !== -1 && jsonEnd !== -1) {
  rawText = rawText.substring(jsonStart, jsonEnd + 1);
}

try {
  const parsed = JSON.parse(rawText);
  const rooms = Array.isArray(parsed) ? parsed : [parsed];
  return formatOutput(rooms);
} catch (e) {
  // Fallback if JSON parsing fails
  return formatOutput([{
     roomName: "Living Room",
     promptFragment: "spacious living area with modern furniture",
     videoAction: "panning view of main living space"
  }]);
}

function formatOutput(rooms) {
  let style = 'Dallas Eclectic';
  try {
     const promptNode = $('ConfigurePrompts').first();
     if (promptNode) style = promptNode.json.styleDescription || style;
  } catch(e) {}
  
  const totalRooms = rooms.length;
  return rooms.map((room, i) => ({
    json: {
      roomName: room.roomName || `Room ${i+1}`,
      dynamicPrompt: `Eye-level photorealistic interior render of the ${room.roomName || 'room'}. ${room.promptFragment || ''}. ${style}.`,
      videoAction: room.videoAction || 'Cinematic camera movement',
      _totalRooms: totalRooms
    }
  }));
}
"""
    for node in workflow.get('nodes', []):
        if node.get('name') == 'ProcessRoomList':
            node['parameters']['mode'] = 'runOnceForAllItems'
            node['parameters']['jsCode'] = process_room_code

    # -------------------------------------------------------------------------
    # 4. REBUILD CONNECTIONS (Native Loop Pattern)
    # -------------------------------------------------------------------------
    raw_connections = workflow.get("connections", {})
    
    # Helper to add connections safely
    def ensure_connection(source, target, output_index=0):
        if source not in raw_connections: raw_connections[source] = {}
        if "main" not in raw_connections[source]: raw_connections[source]["main"] = []
        while len(raw_connections[source]["main"]) <= output_index:
            raw_connections[source]["main"].append([])
        
        target_conn = {"node": target, "type": "main", "index": 0}
        # Avoid duplicates
        exists = False
        for c in raw_connections[source]["main"][output_index]:
            if c['node'] == target:
                exists = True
                break
        if not exists:
            raw_connections[source]["main"][output_index].append(target_conn)

    # 4.1. HasAddress (Switch) connections
    # Note: If user named it 'Switch' or 'HasAddress', match accordingly
    switch_node_name = 'Switch'
    for node in workflow.get('nodes', []):
        if node.get('name') == 'Switch': switch_node_name = 'Switch'
        if node.get('name') == 'HasAddress': switch_node_name = 'HasAddress'

    ensure_connection(switch_node_name, "FetchExteriorPhotos", 0)
    ensure_connection(switch_node_name, "GenerateIsometric", 0)
    ensure_connection(switch_node_name, "GenerateIsometric", 1) # Fallback if no exterior
    
    # 4.2. Exterior Flow
    ensure_connection("FetchExteriorPhotos", "ExtractExteriorImages", 0)
    ensure_connection("ExtractExteriorImages", "AnimateExterior", 0)
    ensure_connection("AnimateExterior", "PollExteriorStatus", 0)
    ensure_connection("PollExteriorStatus", "CheckExteriorStatus", 0)
    ensure_connection("CheckExteriorStatus", "ExteriorReady1", 0)
    ensure_connection("ExteriorReady1", "CollectExteriorVideos", 0)
    ensure_connection("ExteriorReady1", "WaitExterior", 1)
    ensure_connection("WaitExterior", "PollExteriorStatus", 0)

    # 4.3. Isometric Flow
    ensure_connection("GenerateIsometric", "PollIsometricStatus1", 0)
    ensure_connection("PollIsometricStatus1", "CheckIsometricStatus", 0)
    ensure_connection("CheckIsometricStatus", "IsometricReady", 0)
    ensure_connection("IsometricReady", "StoreIsometricURL", 0)
    ensure_connection("IsometricReady", "WaitIsometric", 1)
    ensure_connection("WaitIsometric", "PollIsometricStatus1", 0)

    # Helper to add connections safely (and optionally overwrite)
    def set_connection(source, transitions):
        # transitions is a list of lists: [[target1, target2], [target3]]
        # where outer list index is the output index of the source node
        if source not in raw_connections: raw_connections[source] = {}
        raw_connections[source]["main"] = []
        for targets in transitions:
            conn_list = []
            for t in targets:
                conn_list.append({"node": t, "type": "main", "index": 0})
            raw_connections[source]["main"].append(conn_list)

    # 4.4. CLEAN NATIVE LOOP FLOW
    # Loop -> Process (Index 0)
    # Loop -> Done (Index 1)
    set_connection("LoopOverRooms", [["GenerateRoomImage"], ["FinalListBuilder1"]])
    
    # End of Loop -> Loop (index 0)
    # We overwrite this to REMOVE AllRoomsDone manual routing
    set_connection("CollectRoomVideo1", [["LoopOverRooms"]])
    
    # Ensure intermediate loop steps 
    set_connection("RoomVideoSuccess", [["CollectRoomVideo1"]])
    
    # 4.5. Final Steps
    set_connection("FinalListBuilder1", [["MergeVideosintoTour1"]])
    set_connection("MergeVideosintoTour1", [["UpdateSuccess"]])


    # Save cleaned connections
    workflow['connections'] = raw_connections

    # 4.6. Configure LoopOverRooms (batchSize: 1)
    for node in workflow.get('nodes', []):
        if node.get('name') == 'LoopOverRooms':
            node['parameters']['batchSize'] = 1

    # 4.7. Clean up redundant nodes
    # Only keep the ones we actually output in the final workflow
    # But usually, keeping them disconnected is fine unless we want a clean file.
    # We'll remove AllRoomsDone if found in nodes list
    workflow['nodes'] = [n for n in workflow.get('nodes', []) if n.get('name') != 'AllRoomsDone']

    collect_exterior_code = r"""
const items = $input.all();
const exteriorVideos = [];

for (const item of items) {
  if (item.json.resultUrl && item.json.resultUrl.length > 5) {
    exteriorVideos.push(item.json.resultUrl);
  }
}

// MUST RETURN AN ARRAY
return [{
    json: { 
        exterior_videos: exteriorVideos, 
        hasExterior: exteriorVideos.length > 0 
    }
}];
"""
    for node in workflow.get('nodes', []):
        if node.get('name') == 'CollectExteriorVideos':
            node['parameters']['jsCode'] = collect_exterior_code

    # -------------------------------------------------------------------------
    # 6. DEDUPLICATE IDs
    # -------------------------------------------------------------------------
    seen_ids = set()
    for node in workflow.get('nodes', []):
        nid = node.get('id')
        if nid in seen_ids:
            node['id'] = str(uuid.uuid4())
        seen_ids.add(node['id'])

    # -------------------------------------------------------------------------
    # 7. SANITIZE FOR API (ULTRA-MINIMAL WHITELIST)
    # -------------------------------------------------------------------------
    # We construct a NEW object with only absolutely essential keys.
    # Exclude active, meta, staticData, tags to be safe.
    # BUT n8n API REQUIRES 'settings'
    allowed_keys = ['name', 'nodes', 'connections', 'settings']
    
    final_payload = {}
    for key in allowed_keys:
        if key in workflow_data:
            final_payload[key] = workflow_data[key]
            
    # Ensure settings is present even if missing in source
    if 'settings' not in final_payload:
        final_payload['settings'] = {
            "executionOrder": "v1",
            "saveDataErrorExecution": "all",
            "saveExecutionProgress": True,
            "saveManualExecutions": True
        }
    else:
        # If it is present, sanitize it to ONLY include safe keys
        safe_settings = [
            'saveDataErrorExecution', 
            'saveExecutionProgress', 
            'saveManualExecutions', 
            'errorWorkflow',
            'timezone',
            'executionOrder'
        ]
        sanitized_settings = {}
        for k, v in final_payload['settings'].items():
            if k in safe_settings:
                sanitized_settings[k] = v
        final_payload['settings'] = sanitized_settings
    
    # Ensure connections is initialized if missing
    if 'connections' not in final_payload:
        final_payload['connections'] = {}

    # -------------------------------------------------------------------------
    # 8. FIX AGGREGATION LOOP (STATIC DATA PATTERN)
    # -------------------------------------------------------------------------

    # 8.1 Initialize Static Data in ProcessRoomList
    process_room_code_updated = r"""
const item = $input.first().json;

// RESET STATIC DATA FOR NEW RUN
const staticData = $getWorkflowStaticData('global');
staticData.roomVideos = [];

// Handle different Gemini output structures
const rawContent = item.output || item.text || item.content || (item.message && item.message.content) || (item.parts && item.parts[0] && item.parts[0].text);

let rawText = '';
if (typeof rawContent === 'string') {
  rawText = rawContent;
} else if (typeof rawContent === 'object' && rawContent !== null) {
  // If we already get an object/array, use it directly
  if (Array.isArray(rawContent)) return formatOutput(rawContent);
  // If it's a single object (not array), wrap it
  return formatOutput([rawContent]);
}

// Cleaning logic for text output
rawText = rawText.trim();
// Remove markdown code blocks if present
if (rawText.startsWith('```')) {
  rawText = rawText.replace(/^```(json)?/, '').replace(/```$/, '');
}

// Find JSON array or object
let jsonStart = rawText.indexOf('[');
let jsonEnd = rawText.lastIndexOf(']');

if (jsonStart === -1 || jsonEnd === -1) {
    // Try finding object
    jsonStart = rawText.indexOf('{');
    jsonEnd = rawText.lastIndexOf('}');
}

if (jsonStart !== -1 && jsonEnd !== -1) {
  rawText = rawText.substring(jsonStart, jsonEnd + 1);
}

try {
  const parsed = JSON.parse(rawText);
  const rooms = Array.isArray(parsed) ? parsed : [parsed];
  return formatOutput(rooms);
} catch (e) {
  // Fallback if JSON parsing fails
  return formatOutput([{
     roomName: "Living Room",
     promptFragment: "spacious living area with modern furniture",
     videoAction: "panning view of main living space"
  }]);
}

function formatOutput(rooms) {
  let style = 'Dallas Eclectic';
  try {
     const promptNode = $('ConfigurePrompts').first();
     if (promptNode) style = promptNode.json.styleDescription || style;
  } catch(e) {}
  
  const totalRooms = rooms.length;
  return rooms.map((room, i) => ({
    json: {
      roomName: room.roomName || `Room ${i+1}`,
      dynamicPrompt: `Eye-level photorealistic interior render of the ${room.roomName || 'room'}. ${room.promptFragment || ''}. ${style}.`,
      videoAction: room.videoAction || 'Cinematic camera movement',
      _totalRooms: totalRooms
    }
  }));
}
"""
    for node in workflow.get('nodes', []):
        if node.get('name') == 'ProcessRoomList':
            node['parameters']['jsCode'] = process_room_code_updated

    # 8.2 Accumulate in CollectRoomVideo1
    collect_room_code = r"""
const staticData = $getWorkflowStaticData('global');
if (!staticData.roomVideos) staticData.roomVideos = [];

if ($json.resultUrl) {
    staticData.roomVideos.push($json.resultUrl);
}

return { json: { videoUrl: $json.resultUrl } };
"""
    for node in workflow.get('nodes', []):
        if node.get('name') == 'CollectRoomVideo1':
            node['parameters']['jsCode'] = collect_room_code

    # 8.3 Final Aggregation in FinalListBuilder1
    final_builder_code = r"""
const staticData = $getWorkflowStaticData('global');
const roomVideos = staticData.roomVideos || [];
const allVideos = [...roomVideos];

// Collect Exterior Videos (from the other merge branch)
try {
  const extItems = $('CollectExteriorVideos').all();
  for (const item of extItems) {
    if (item.json.exterior_videos && Array.isArray(item.json.exterior_videos)) {
        allVideos.push(...item.json.exterior_videos);
    }
  }
} catch(e) {}

// Log for debugging
console.log('Final Video List:', allVideos);

return { json: { video_urls: allVideos } };
"""
    for node in workflow.get('nodes', []):
        if node.get('name') == 'FinalListBuilder1':
            node['parameters']['jsCode'] = final_builder_code
            
    # Write output uppercase
    with open(output_path, 'w') as f:
        json.dump(final_payload, f, indent=2)

    print("Master Repair: SUCCESS")

except Exception as e:
    print(f"Master Repair: ERROR: {str(e)}")
    sys.exit(1)
