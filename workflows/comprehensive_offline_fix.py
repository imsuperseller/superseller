#!/usr/bin/env python3
"""
FINAL COMPREHENSIVE FIX - Offline Analysis and Repair

This script will:
1. Load the baseline workflow where Images worked
2. Find ALL nodes that reference "Merge Image Analysis"
3. Replace with conditional logic that checks all merge nodes
4. Preserve ALL other functionality
5. Output a detailed report of changes
"""

import json
import re

def analyze_and_fix_workflow(baseline_path):
    print("=" * 80)
    print("COMPREHENSIVE WORKFLOW ANALYSIS AND FIX")
    print("=" * 80)
    
    with open(baseline_path, 'r') as f:
        workflow = json.load(f)
    
    nodes = workflow['nodes']
    
    # Find ALL nodes with JavaScript code
    js_nodes = [(n['name'], n) for n in nodes if 'jsCode' in n.get('parameters', {})]
    
    print(f"\nFound {len(js_nodes)} nodes with JavaScript code")
    print("\nAnalyzing for 'Merge Image Analysis' references...")
    
    problematic_nodes = []
    fixes_applied = []
    
    for node_name, node in js_nodes:
        js_code = node['parameters']['jsCode']
        
        # Check for problematic references
        if "Merge Image Analysis" in js_code:
            lines_with_ref = []
            for i, line in enumerate(js_code.split('\n'), 1):
                if "Merge Image Analysis" in line:
                    lines_with_ref.append((i, line.strip()))
            
            problematic_nodes.append({
                'name': node_name,
                'references': lines_with_ref
            })
            
            print(f"\n❌ FOUND: {node_name}")
            for line_no, line in lines_with_ref:
                print(f"   Line {line_no}: {line[:100]}")
    
    print(f"\n\nTotal problematic nodes: {len(problematic_nodes)}")
    
    # Now apply fixes
    print("\n" + "=" * 80)
    print("APPLYING FIXES")
    print("=" * 80)
    
    for item in problematic_nodes:
        node_name = item['name']
        node = next(n for n in nodes if n['name'] == node_name)
        js_code = node['parameters']['jsCode']
        
        original_code = js_code
        
        if node_name == "Process Media Context":
            # Fix the routerData assignment
            old_pattern = """let routerData = {};
try {
  routerData = $node['Merge Image Analysis'].json || {};
} catch (e) {
  try { routerData = $node['Message Type Router'].json || {}; } catch (e2) { routerData = {}; }
}"""
            
            new_pattern = """let routerData = {};
try {
  // Conditional: Check which merge node executed based on media type
  if ($node['Merge Image Analysis'] && $node['Merge Image Analysis'].json) {
    routerData = $node['Merge Image Analysis'].json;
  } else if ($node['Merge Video Analysis'] && $node['Merge Video Analysis'].json) {
    routerData = $node['Merge Video Analysis'].json;
  } else if ($node['Merge Document Analysis'] && $node['Merge Document Analysis'].json) {
    routerData = $node['Merge Document Analysis'].json;
  } else {
    // Fallback to Message Type Router
    try { routerData = $node['Message Type Router'].json || {}; } catch (e2) { routerData = {}; }
  }
} catch (e) {
  try { routerData = $node['Message Type Router'].json || {}; } catch (e2) { routerData = {}; }
}"""
            
            if old_pattern in js_code:
                js_code = js_code.replace(old_pattern, new_pattern)
                fixes_applied.append(f"✅ {node_name}: Updated routerData assignment")
            else:
                fixes_applied.append(f"⚠️ {node_name}: Pattern not found (may already be fixed)")
        
        elif node_name == "Image Analysis Responder":
            # Replace all $node['Merge Image Analysis'] references with fallback
            js_code = js_code.replace(
                "$node['Merge Image Analysis']",
                "($node['Merge Image Analysis'] || $node['Merge Video Analysis'] || $node['Merge Document Analysis'] || {})"
            )
            fixes_applied.append(f"✅ {node_name}: Added fallback for merge node access")
        
        # Update the node
        if js_code != original_code:
            node['parameters']['jsCode'] = js_code
    
    # Print summary
    print("\nFixes Applied:")
    for fix in fixes_applied:
        print(f"  {fix}")
    
    # Save
    output_path = baseline_path.replace('.json', '-COMPREHENSIVE-OFFLINE-FIX.json')
    with open(output_path, 'w') as f:
        json.dump(workflow, f, indent=2)
    
    print(f"\n✅ Saved fixed workflow to:")
    print(f"   {output_path}")
    
    # Create a report
    report_path = baseline_path.replace('.json', '-FIX-REPORT.md')
    with open(report_path, 'w') as f:
        f.write("# Workflow Fix Report\n\n")
        f.write("## Problematic Nodes Found\n\n")
        for item in problematic_nodes:
            f.write(f"### {item['name']}\n\n")
            for line_no, line in item['references']:
                f.write(f"- Line {line_no}: `{line}`\n")
            f.write("\n")
        
        f.write("## Fixes Applied\n\n")
        for fix in fixes_applied:
            f.write(f"- {fix}\n")
        
        f.write("\n## Testing Checklist\n\n")
        f.write("- [ ] Text message\n")
        f.write("- [ ] Voice message\n")
        f.write("- [ ] Uncaptioned image\n")
        f.write("- [ ] Captioned image\n")
        f.write("- [ ] Uncaptioned video\n")
        f.write("- [ ] Captioned video\n")
        f.write("- [ ] Uncaptioned PDF\n")
        f.write("- [ ] Captioned PDF\n")
    
    print(f"\n✅ Created fix report:")
    print(f"   {report_path}")
    
    return output_path, report_path

if __name__ == "__main__":
    baseline = "/Users/shaifriedman/New Rensto/rensto/workflows/FINAL-DEPLOY-NO-FILTER-PORTS-FIXED-PROMPT-FIXED-MEDIA-FIXED-MEDIA-FLOW-FIXED-NO-MEMORY-FIXED-QUESTION-FIXED-FLAG.json"
    
    try:
        workflow_path, report_path = analyze_and_fix_workflow(baseline)
        print("\n" + "=" * 80)
        print("✅ SUCCESS!")
        print("=" * 80)
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
