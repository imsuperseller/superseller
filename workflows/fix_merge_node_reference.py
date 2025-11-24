#!/usr/bin/env python3
"""
Fix Process Media Context to read from the correct merge node based on media type.
Current bug: Always reads from "Merge Image Analysis" even for Video/PDF.
"""

import json

def fix_process_media_context(workflow_path):
    with open(workflow_path, 'r') as f:
        workflow = json.load(f)
    
    # Find Process Media Context node
    process_node = next((n for n in workflow['nodes'] if n['name'] == 'Process Media Context'), None)
    if not process_node:
        print("❌ Process Media Context node not found")
        return None
    
    js_code = process_node['parameters']['jsCode']
    
    # Find the hardcoded line:
    # routerData = $node['Merge Image Analysis'].json || {};
    
    old_line = "  routerData = $node['Merge Image Analysis'].json || {};"
    
    if old_line not in js_code:
        print("❌ Could not find the hardcoded Merge Image Analysis reference")
        print("Trying alternative format...")
        old_line = "routerData = $node['Merge Image Analysis'].json || {};"
        if old_line not in js_code:
            print("❌ Still not found")
            return None
    
    # Replace with conditional logic
    new_code = """// FIXED: Read from the correct merge node based on which one executed
  let routerData = {};
  try {
    // Check which merge node executed (only one will have data)
    if ($node['Merge Image Analysis'] && $node['Merge Image Analysis'].json) {
      routerData = $node['Merge Image Analysis'].json;
      console.log('✅ Using data from Merge Image Analysis');
    } else if ($node['Merge Video Analysis'] && $node['Merge Video Analysis'].json) {
      routerData = $node['Merge Video Analysis'].json;
      console.log('✅ Using data from Merge Video Analysis');
    } else if ($node['Merge Document Analysis'] && $node['Merge Document Analysis'].json) {
      routerData = $node['Merge Document Analysis'].json;
      console.log('✅ Using data from Merge Document Analysis');
    } else {
      console.log('⚠️ No merge node data found, using empty object');
    }
  } catch (error) {
    console.log('⚠️ Error accessing merge nodes:', error.message);
    routerData = {};
  }"""
    
    js_code = js_code.replace(old_line, new_code)
    
    # Update the node
    process_node['parameters']['jsCode'] = js_code
    
    # Save
    output_path = workflow_path.replace('.json', '-FIXED-MERGE.json')
    with open(output_path, 'w') as f:
        json.dump(workflow, f, indent=2)
    
    print(f"✅ Saved to: {output_path}")
    return output_path

if __name__ == "__main__":
    workflow_file = "/Users/shaifriedman/New Rensto/rensto/workflows/FINAL-DEPLOY-NO-FILTER-PORTS-FIXED-PROMPT-FIXED-MEDIA-FIXED-MEDIA-FLOW-FIXED-NO-MEMORY-FIXED-QUESTION-FIXED-FLAG.json"
    
    try:
        output_file = fix_process_media_context(workflow_file)
        if output_file:
            print(f"\n✅ SUCCESS! Updated workflow:")
            print(f"   {output_file}")
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        import sys
        sys.exit(1)
