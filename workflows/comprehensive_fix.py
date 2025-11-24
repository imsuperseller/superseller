#!/usr/bin/env python3
"""
COMPREHENSIVE FIX: Update Process Media Context to work for ALL media types.
This replaces the hardcoded Merge Image Analysis reference with conditional logic
that checks which merge node executed, WITHOUT breaking any existing functionality.
"""

import json

def create_comprehensive_fix(workflow_path):
    with open(workflow_path, 'r') as f:
        workflow = json.load(f)
    
    # Find Process Media Context node
    process_node = next((n for n in workflow['nodes'] if n['name'] == 'Process Media Context'), None)
    if not process_node:
        print("❌ Process Media Context node not found")
        return None
    
    js_code = process_node['parameters']['jsCode']
    
    # Find the problematic section that hardcodes Merge Image Analysis
    old_section = """let routerData = {};
try {
  routerData = $node['Merge Image Analysis'].json || {};
} catch (e) {
  try { routerData = $node['Message Type Router'].json || {}; } catch (e2) { routerData = {}; }
}"""
    
    if old_section not in js_code:
        print("❌ Could not find the expected code section")
        print("Searching for alternative format...")
        # Try without the exact whitespace
        if "$node['Merge Image Analysis'].json" not in js_code:
            print("❌ Merge Image Analysis reference not found at all")
            return None
    
    # New code that works for ALL media types 
    new_section = """let routerData = {};
try {
  // Try each merge node based on which one executed
  if ($node['Merge Image Analysis'] && $node['Merge Image Analysis'].json) {
    routerData = $node['Merge Image Analysis'].json;
    console.log('[Process Media] Using Merge Image Analysis data');
  } else if ($node['Merge Video Analysis'] && $node['Merge Video Analysis'].json) {
    routerData = $node['Merge Video Analysis'].json;
    console.log('[Process Media] Using Merge Video Analysis data');
  } else if ($node['Merge Document Analysis'] && $node['Merge Document Analysis'].json) {
    routerData = $node['Merge Document Analysis'].json;
    console.log('[Process Media] Using Merge Document Analysis data');
  } else {
    // Fallback to Message Type Router if no merge node executed
    try { routerData = $node['Message Type Router'].json || {}; } catch (e2) { routerData = {}; }
    console.log('[Process Media] Using Message Type Router fallback');
  }
} catch (e) {
  try { routerData = $node['Message Type Router'].json || {}; } catch (e2) { routerData = {}; }
  console.log('[Process Media] Exception, using Message Type Router fallback');
}"""
    
    js_code = js_code.replace(old_section, new_section)
    
    # Update the node
    process_node['parameters']['jsCode'] = js_code
    
    # Save
    output_path = workflow_path.replace('.json', '-COMPREHENSIVE-FIX.json')
    with open(output_path, 'w') as f:
        json.dump(workflow, f, indent=2)
    
    print(f"✅ Saved to: {output_path}")
    return output_path

if __name__ == "__main__":
    workflow_file = "/Users/shaifriedman/New Rensto/rensto/workflows/FINAL-DEPLOY-NO-FILTER-PORTS-FIXED-PROMPT-FIXED-MEDIA-FIXED-MEDIA-FLOW-FIXED-NO-MEMORY-FIXED-QUESTION-FIXED-FLAG.json"
    
    try:
        output_file = create_comprehensive_fix(workflow_file)
        if output_file:
            print(f"\n✅ SUCCESS! Updated workflow:")
            print(f"   {output_file}")
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        import sys
        sys.exit(1)
