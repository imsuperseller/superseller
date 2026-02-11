import json
import re

input_file = 'spaceless_workflow_final.json'
output_file = 'spaceless_consistent.json'

with open(input_file, 'r') as f:
    workflow = json.load(f)

# 1. Identify nodes to rename (those without '1' at the end)
# We exclude specific nodes if needed, but the goal is consistency.
# Current '1' nodes: UploadFloorPlanForm1, ValidateExtractImage1, ConfigurePrompts1, StoreSubmission1, 
# GenerateIsometricwithFloorPlan1, PollStatusHandler1, PollIsometricStatus1, IsometricReady1, Wait3s1, IsometricSuccess1, StoreIsometricURL1, 
# MergeVideosintoTour1, UpdateSuccess1, UpdateFailed1.
# Nodes to rename: AnalyzeFloorPlan, ProcessRoomList, LoopOverItems, GenerateRoomImage, PollRoomImage, CheckRoomImage, RoomReady, WaitRoomImage,
# AnimateRoomVideo, PollRoomVideo, CheckRoomVideo, RoomVideoReady, WaitRoomVideo, CollectRoomVideoURL, WaitforAllVideos.

node_map = {}
nodes = workflow['nodes']

for node in nodes:
    old_name = node['name']
    if not old_name.endswith('1'):
        new_name = old_name + '1'
        node['name'] = new_name
        node_map[old_name] = new_name
    else:
        node_map[old_name] = old_name

# 2. Update Connections
new_connections = {}
for source_node, outputs in workflow['connections'].items():
    new_source = node_map.get(source_node, source_node)
    new_connections[new_source] = {}
    
    for output_name, connections in outputs.items():
        new_conns = []
        for conn in connections:
            for item in conn:
                item['node'] = node_map.get(item['node'], item['node'])
            new_conns.append(conn)
        new_connections[new_source][output_name] = new_conns

workflow['connections'] = new_connections

# 3. Update Text References (Expressions and Custom JS)
# We need to replace string occurrences of "$('OldName')" with "$('NewName')"
# and also specific JSON references if any.

def text_replacer(text):
    if not isinstance(text, str):
        return text
    
    # Replace $('NodeName') patterns
    for old, new in node_map.items():
        if old == new: continue
        # Robust regex for n8n selectors
        # Case 1: $('NodeName')
        pattern1 = re.escape(f"$('{old}')")
        text = re.sub(pattern1, f"$('{new}')", text)
        # Case 2: $("NodeName")
        pattern2 = re.escape(f'$("{old}")')
        text = re.sub(pattern2, f'$("{new}")', text)
        
        # Also simple occurrence in some cases if variable name? (Less likely for n8n)
    
    return text

def recursive_replace(obj):
    if isinstance(obj, dict):
        for k, v in obj.items():
            obj[k] = recursive_replace(v)
    elif isinstance(obj, list):
        for i in range(len(obj)):
            obj[i] = recursive_replace(obj[i])
    elif isinstance(obj, str):
        return text_replacer(obj)
    return obj

workflow['nodes'] = recursive_replace(workflow['nodes'])

# One specific fix: 'roomName' comes from LoopOverItems. 
# "value": "{{ $('LoopOverItems').item.json.roomName }}"
# This should be handled by the recursive replace.

with open(output_file, 'w') as f:
    json.dump(workflow, f, indent=2)

print(f"Created {output_file} with consistent naming.")
print("Renamed nodes:", [k for k, v in node_map.items() if k != v])
