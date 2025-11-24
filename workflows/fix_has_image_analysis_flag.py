#!/usr/bin/env python3
"""
Fix hasImageAnalysis flag setting in Prepare AI Input.
When question comes from Process Media Context, we should set hasImageAnalysis=true.
"""

import json
import re

def fix_has_image_analysis_flag(workflow_path):
    with open(workflow_path, 'r') as f:
        workflow = json.load(f)
    
    # Find Prepare AI Input node
    prepare_node = next((n for n in workflow['nodes'] if n['name'] == 'Prepare AI Input'), None)
    if not prepare_node:
        print("❌ Prepare AI Input node not found")
        return None
    
    js_code = prepare_node['parameters']['jsCode']
    
    # Find where we extract question from Process Media Context
    # After we extract the question, we need to ALSO extract imageAnalysis
    # and set hasImageAnalysis = true
    
    # Look for our new code block:
    # // FIXED: Check ALL possible question fields from Process Media Context
    #   const questionFields = ['question', 'processedText', 'originalQuestion', 'originalCaption'];
    #   for (let i = 0; i < questionFields.length; i++) {
    #     const field = questionFields[i];
    #     const value = processMediaData.json[field];
    #     if (value && String(value).trim()) {
    #       question = String(value).trim();
    #       questionMethod = 'Process Media Context.' + field;
    #       console.log('✅ Found question from Process Media Context.' + field + ':', question.substring(0, 100) + '...');
    #       break;
    #     }
    #   }
    
    # We need to ADD imageAnalysis extraction right after the break
    marker = "console.log('✅ Found question from Process Media Context.' + field + ':', question.substring(0, 100) + '...');\n          break;"
    
    if marker not in js_code:
        print("❌ Could not find the marker for Process Media Context question extraction")
        return None
    
    # Add imageAnalysis extraction and hasImageAnalysis flag setting
    new_code = """console.log('✅ Found question from Process Media Context.' + field + ':', question.substring(0, 100) + '...');
          
          // CRITICAL: Also extract imageAnalysis and set hasImageAnalysis flag
          imageAnalysis = processMediaData.json.geminiAnalysis || processMediaData.json.imageAnalysis || processMediaData.json.question || processMediaData.json.processedText || null;
          hasImageAnalysis = imageAnalysis ? true : false;
          console.log('✅ Set hasImageAnalysis =', hasImageAnalysis, '(imageAnalysis length:', imageAnalysis ? imageAnalysis.length : 0, ')');
          break;"""
    
    js_code = js_code.replace(marker, new_code)
    
    # Update the node
    prepare_node['parameters']['jsCode'] = js_code
    
    # Save
    output_path = workflow_path.replace('.json', '-FIXED-FLAG.json')
    with open(output_path, 'w') as f:
        json.dump(workflow, f, indent=2)
    
    print(f"✅ Saved to: {output_path}")
    return output_path

if __name__ == "__main__":
    workflow_file = "/Users/shaifriedman/New Rensto/rensto/workflows/FINAL-DEPLOY-NO-FILTER-PORTS-FIXED-PROMPT-FIXED-MEDIA-FIXED-MEDIA-FLOW-FIXED-NO-MEMORY-FIXED-QUESTION.json"
    
    try:
        output_file = fix_has_image_analysis_flag(workflow_file)
        if output_file:
            print(f"\n✅ SUCCESS! Updated workflow:")
            print(f"   {output_file}")
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        import sys
        sys.exit(1)
