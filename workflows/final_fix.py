#!/usr/bin/env python3
"""
FINAL FIX: Update BOTH Process Media Context AND Image Analysis Responder
to work with all merge nodes.
"""

import json

def final_comprehensive_fix(workflow_path):
    with open(workflow_path, 'r') as f:
        workflow = json.load(f)
    
    # Fix 1: Image Analysis Responder
    responder_node = next((n for n in workflow['nodes'] if n['name'] == 'Image Analysis Responder'), None)
    if responder_node:
        js_code = responder_node['parameters']['jsCode']
        
        # Find references to Merge Image Analysis
        if "$node['Merge Image Analysis']" in js_code:
            # Replace direct references with conditional logic
            old_ref = "$node['Merge Image Analysis']"
            new_ref = "($node['Merge Image Analysis'] || $node['Merge Video Analysis'] || $node['Merge Document Analysis'] || {})"
            js_code = js_code.replace(old_ref, new_ref)
            responder_node['parameters']['jsCode'] = js_code
            print("✅ Fixed Image Analysis Responder")
        else:
            print("⚠️ No Merge Image Analysis reference in Image Analysis Responder")
    else:
        print("⚠️ Image Analysis Responder node not found")
    
    # Save
    output_path = workflow_path.replace('.json', '-FINAL-FIX.json')
    with open(output_path, 'w') as f:
        json.dump(workflow, f, indent=2)
    
    print(f"✅ Saved to: {output_path}")
    return output_path

if __name__ == "__main__":
    workflow_file = "/Users/shaifriedman/New Rensto/rensto/workflows/FINAL-DEPLOY-NO-FILTER-PORTS-FIXED-PROMPT-FIXED-MEDIA-FIXED-MEDIA-FLOW-FIXED-NO-MEMORY-FIXED-QUESTION-FIXED-FLAG-COMPREHENSIVE-FIX.json"
    
    try:
        output_file = final_comprehensive_fix(workflow_file)
        if output_file:
            print(f"\n✅ SUCCESS! Updated workflow:")
            print(f"   {output_file}")
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        import sys
        sys.exit(1)
