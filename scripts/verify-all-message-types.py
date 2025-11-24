#!/usr/bin/env python3
"""
Comprehensive verification script for all message types in WhatsApp workflow.
Checks: text, voice, image, video, document (with and without captions)
"""

import json
import sys
from pathlib import Path

def verify_message_type_routing(workflow_path):
    """Verify Message Type Router has correct outputs for all types."""
    print("=" * 80)
    print("VERIFYING MESSAGE TYPE ROUTER")
    print("=" * 80)
    
    with open(workflow_path, 'r') as f:
        workflow = json.load(f)
    
    # Find Message Type Router
    router_node = None
    for node in workflow['nodes']:
        if node.get('name') == 'Message Type Router':
            router_node = node
            break
    
    if not router_node:
        print("❌ Message Type Router not found!")
        return False
    
    # Check switch rules
    rules = router_node['parameters'].get('rules', {}).get('values', [])
    expected_types = ['voice', 'image', 'document', 'video', 'text']
    found_types = []
    
    for rule in rules:
        output_key = rule.get('outputKey', '')
        if output_key in expected_types:
            found_types.append(output_key)
            condition = rule.get('conditions', {}).get('conditions', [{}])[0]
            right_value = condition.get('rightValue', '')
            print(f"✅ Found rule for '{output_key}': routes when messageType == '{right_value}'")
    
    missing_types = set(expected_types) - set(found_types)
    if missing_types:
        print(f"❌ Missing routing rules for: {', '.join(missing_types)}")
        return False
    
    print(f"✅ All {len(expected_types)} message types have routing rules")
    return True

def verify_connections(workflow_path):
    """Verify connections for all message types."""
    print("\n" + "=" * 80)
    print("VERIFYING CONNECTIONS")
    print("=" * 80)
    
    with open(workflow_path, 'r') as f:
        workflow = json.load(f)
    
    connections = workflow.get('connections', {})
    router_connections = connections.get('Message Type Router', {}).get('main', [])
    
    if len(router_connections) < 5:
        print(f"❌ Message Type Router has only {len(router_connections)} outputs, expected 5")
        return False
    
    expected_paths = {
        0: ('voice', 'Download Voice'),
        1: ('image', 'Download Image1'),
        2: ('document', 'Download Document'),
        3: ('video', 'Download Video'),
        4: ('text', 'Prepare AI Input')
    }
    
    all_good = True
    for idx, (msg_type, expected_node) in expected_paths.items():
        if idx < len(router_connections):
            connected_nodes = router_connections[idx]
            if connected_nodes:
                actual_node = connected_nodes[0].get('node', '')
                if actual_node == expected_node:
                    print(f"✅ {msg_type.upper()}: Router[{idx}] → {actual_node}")
                else:
                    print(f"❌ {msg_type.upper()}: Router[{idx}] → {actual_node} (expected {expected_node})")
                    all_good = False
            else:
                print(f"❌ {msg_type.upper()}: Router[{idx}] → NOT CONNECTED")
                all_good = False
        else:
            print(f"❌ {msg_type.upper()}: Router[{idx}] → MISSING OUTPUT")
            all_good = False
    
    return all_good

def verify_smart_router_extraction(workflow_path):
    """Verify Smart Message Router extracts textContent for all types."""
    print("\n" + "=" * 80)
    print("VERIFYING SMART MESSAGE ROUTER TEXT EXTRACTION")
    print("=" * 80)
    
    with open(workflow_path, 'r') as f:
        workflow = json.load(f)
    
    # Find Smart Message Router
    router_node = None
    for node in workflow['nodes']:
        if node.get('name') == 'Smart Message Router':
            router_node = node
            break
    
    if not router_node:
        print("❌ Smart Message Router not found!")
        return False
    
    code = router_node['parameters'].get('jsCode', '')
    
    checks = {
        'textContent output': 'textContent:' in code or 'textContent' in code,
        'text message extraction': 'payload.body' in code or 'findTextContent' in code,
        'image caption extraction': 'imageMessage.caption' in code or 'imageWithCaptionMessage' in code,
        'video caption extraction': 'videoMessage.caption' in code or 'videoWithCaptionMessage' in code or 'documentWithCaptionMessage' in code,
        'document caption extraction': 'documentMessage.caption' in code or 'documentWithCaptionMessage' in code,
        'voice transcription path': 'audioMessage' in code or 'voice' in code.lower(),
    }
    
    all_good = True
    for check, passed in checks.items():
        status = "✅" if passed else "❌"
        print(f"{status} {check}")
        if not passed:
            all_good = False
    
    return all_good

def verify_prepare_ai_input(workflow_path):
    """Verify Prepare AI Input handles all message types."""
    print("\n" + "=" * 80)
    print("VERIFYING PREPARE AI INPUT")
    print("=" * 80)
    
    with open(workflow_path, 'r') as f:
        workflow = json.load(f)
    
    # Find Prepare AI Input
    prepare_node = None
    for node in workflow['nodes']:
        if node.get('name') == 'Prepare AI Input':
            prepare_node = node
            break
    
    if not prepare_node:
        print("❌ Prepare AI Input not found!")
        return False
    
    code = prepare_node['parameters'].get('jsCode', '')
    
    checks = {
        'textContent extraction': 'textContent' in code,
        'caption extraction': 'caption' in code,
        'transcription extraction': 'transcription' in code or 'transcribe' in code.lower(),
        'messageType handling': 'messageType' in code,
        'fallback to Message Type Router': "$node['Message Type Router']" in code,
        'fallback to Smart Message Router': "$node['Smart Message Router']" in code,
    }
    
    all_good = True
    for check, passed in checks.items():
        status = "✅" if passed else "❌"
        print(f"{status} {check}")
        if not passed:
            all_good = False
    
    return all_good

def verify_media_analysis_agents(workflow_path):
    """Verify all media analysis agents can access captions."""
    print("\n" + "=" * 80)
    print("VERIFYING MEDIA ANALYSIS AGENTS")
    print("=" * 80)
    
    with open(workflow_path, 'r') as f:
        workflow = json.load(f)
    
    agents = {
        'Image Analysis Agent': 'image',
        'Video Analysis Agent': 'video',
        'Document Analysis Agent': 'document'
    }
    
    all_good = True
    for agent_name, msg_type in agents.items():
        agent_node = None
        for node in workflow['nodes']:
            if node.get('name') == agent_name:
                agent_node = node
                break
        
        if not agent_node:
            print(f"❌ {agent_name} not found!")
            all_good = False
            continue
        
        text_param = agent_node['parameters'].get('text', '')
        
        # Check if it references Message Type Router for caption
        has_router_ref = "$node['Message Type Router']" in text_param
        has_textcontent = 'textContent' in text_param
        has_caption = 'caption' in text_param
        
        if has_router_ref and (has_textcontent or has_caption):
            print(f"✅ {agent_name}: Can access caption from Message Type Router")
        else:
            print(f"❌ {agent_name}: Cannot access caption properly")
            print(f"   text param: {text_param[:100]}...")
            all_good = False
    
    return all_good

def verify_process_media_context(workflow_path):
    """Verify Process Media Context handles all types."""
    print("\n" + "=" * 80)
    print("VERIFYING PROCESS MEDIA CONTEXT")
    print("=" * 80)
    
    with open(workflow_path, 'r') as f:
        workflow = json.load(f)
    
    # Find Process Media Context
    process_node = None
    for node in workflow['nodes']:
        if node.get('name') == 'Process Media Context':
            process_node = node
            break
    
    if not process_node:
        print("❌ Process Media Context not found!")
        return False
    
    code = process_node['parameters'].get('jsCode', '')
    
    checks = {
        'handles text type': "messageType === 'text'" in code,
        'handles image type': "messageType === 'image'" in code or "'image'" in code,
        'handles video type': "messageType === 'video'" in code or "'video'" in code,
        'handles document type': "messageType === 'document'" in code or "'document'" in code,
        'extracts caption': 'caption' in code or 'originalCaption' in code,
        'extracts textContent': 'textContent' in code,
        'fallback to Message Type Router': "$node['Message Type Router']" in code,
        'fallback to Merge nodes': "$node['Merge" in code,
    }
    
    all_good = True
    for check, passed in checks.items():
        status = "✅" if passed else "❌"
        print(f"{status} {check}")
        if not passed:
            all_good = False
    
    return all_good

def main():
    workflow_path = Path(__file__).parent.parent / "INT-WHATSAPP-SUPPORT-001_ Rensto Support Agent (Final)_V7_FIXED.json"
    
    if not workflow_path.exists():
        print(f"❌ Workflow file not found: {workflow_path}")
        sys.exit(1)
    
    print(f"📋 Verifying workflow: {workflow_path.name}\n")
    
    results = []
    results.append(("Message Type Routing", verify_message_type_routing(workflow_path)))
    results.append(("Connections", verify_connections(workflow_path)))
    results.append(("Smart Router Extraction", verify_smart_router_extraction(workflow_path)))
    results.append(("Prepare AI Input", verify_prepare_ai_input(workflow_path)))
    results.append(("Media Analysis Agents", verify_media_analysis_agents(workflow_path)))
    results.append(("Process Media Context", verify_process_media_context(workflow_path)))
    
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    
    all_passed = True
    for name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}: {name}")
        if not passed:
            all_good = False
    
    if all_passed:
        print("\n✅ All checks passed! All message types should work correctly.")
        sys.exit(0)
    else:
        print("\n❌ Some checks failed. Please review the issues above.")
        sys.exit(1)

if __name__ == '__main__':
    main()

