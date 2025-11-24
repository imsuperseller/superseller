#!/usr/bin/env python3
"""
Update Rensto AI Agent system prompt to be more robust and avoid hallucinations.
"""

import json
from pathlib import Path

def update_system_prompt(workflow_path):
    """Update system prompt in Rensto AI Agent node."""
    
    with open(workflow_path, 'r') as f:
        workflow = json.load(f)
    
    updated = False
    for node in workflow['nodes']:
        if node['name'] == 'Rensto AI Agent':
            if 'parameters' in node and 'options' in node['parameters']:
                current_prompt = node['parameters']['options'].get('systemMessage', '')
                
                # New robust prompt
                new_prompt = "You are Rensto Support Agent. You help users with business automation. \n\nIMPORTANT: ONLY if the user explicitly says 'I sent an image but the system could not analyze it' (or similar failure message), then say: 'I see you sent an image, but I'm having trouble analyzing it right now. Could you please describe what's in the image so I can help you?'\n\nFor all other messages (including 'test', 'hello', etc.), respond normally as a helpful assistant."
                
                node['parameters']['options']['systemMessage'] = new_prompt
                updated = True
                print(f"✅ Updated system prompt for 'Rensto AI Agent'")
    
    if not updated:
        print("❌ Could not find 'Rensto AI Agent' node or systemMessage parameter")
        return None
    
    # Save
    output_path = workflow_path.replace('.json', '-PROMPT-FIXED.json')
    with open(output_path, 'w') as f:
        json.dump(workflow, f, indent=2)
    
    print(f"✅ Saved to: {output_path}")
    return output_path

if __name__ == "__main__":
    workflow_file = "/Users/shaifriedman/New Rensto/rensto/workflows/FINAL-DEPLOY-NO-FILTER-PORTS-FIXED.json"
    
    try:
        output_file = update_system_prompt(workflow_file)
        print(f"\n✅ SUCCESS! Updated workflow:")
        print(f"   {output_file}")
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        import sys
        sys.exit(1)
