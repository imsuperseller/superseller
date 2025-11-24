#!/usr/bin/env python3
"""
Fix Captioned Video Caption Extraction - V7.1

Issue: When videos are wrapped as documentWithCaptionMessage with mimetype video/,
the caption extraction is looking in the wrong place. The caption is at the wrapper
level (_dataMessage.documentWithCaptionMessage.caption), not inside docMsg.caption.
"""

import json
import sys
from pathlib import Path

def fix_caption_extraction(js_code):
    """Fix caption extraction for videos wrapped as documentWithCaptionMessage."""
    
    # Fix: Update caption extraction for videos wrapped as documentWithCaptionMessage
    old_video_caption_extraction = """      if (mimetype.startsWith('video/')) {
        messageType = 'video';
        mediaUrl = docMsg.url || '';
        mediaInfo = { mimetype: mimetype };
        console.log('[Router] 🎥 Video detected wrapped as documentWithCaptionMessage, mimetype:', mimetype);
        // Extract caption if present
        if (docMsg.caption && !textContent) {
          textContent = String(docMsg.caption).trim();
          console.log('[Router] 🎥 Extracted video caption:', textContent);
        }
      }"""
    
    new_video_caption_extraction = """      if (mimetype.startsWith('video/')) {
        messageType = 'video';
        mediaUrl = docMsg.url || '';
        mediaInfo = { mimetype: mimetype };
        console.log('[Router] 🎥 Video detected wrapped as documentWithCaptionMessage, mimetype:', mimetype);
        // CRITICAL FIX V7.1: Extract caption from wrapper level, not docMsg
        // Caption can be at: _dataMessage.documentWithCaptionMessage.caption OR docMsg.caption
        const wrapperCaption = _dataMessage.documentWithCaptionMessage.caption;
        const docCaption = docMsg.caption;
        if (!textContent) {
          if (wrapperCaption) {
            textContent = String(wrapperCaption).trim();
            console.log('[Router] 🎥 Extracted video caption from wrapper:', textContent);
          } else if (docCaption) {
            textContent = String(docCaption).trim();
            console.log('[Router] 🎥 Extracted video caption from docMsg:', textContent);
          }
        }
      }"""
    
    if old_video_caption_extraction in js_code:
        js_code = js_code.replace(old_video_caption_extraction, new_video_caption_extraction)
        print("✅ Fixed caption extraction for videos wrapped as documentWithCaptionMessage")
    else:
        # Check if already fixed
        if "wrapperCaption" in js_code:
            print("✅ Caption extraction already fixed")
        else:
            print("⚠️ Could not find exact match - checking for partial match...")
            # Try partial replacement
            if "docMsg.caption && !textContent" in js_code and "mimetype.startsWith('video/')" in js_code:
                # More flexible replacement
                import re
                pattern = r"(if \(mimetype\.startsWith\('video/'\) \{[^}]*?// Extract caption if present[^}]*?if \(docMsg\.caption && !textContent\) \{[^}]*?\})"
                replacement = """if (mimetype.startsWith('video/')) {
        messageType = 'video';
        mediaUrl = docMsg.url || '';
        mediaInfo = { mimetype: mimetype };
        console.log('[Router] 🎥 Video detected wrapped as documentWithCaptionMessage, mimetype:', mimetype);
        // CRITICAL FIX V7.1: Extract caption from wrapper level, not docMsg
        const wrapperCaption = _dataMessage.documentWithCaptionMessage.caption;
        const docCaption = docMsg.caption;
        if (!textContent) {
          if (wrapperCaption) {
            textContent = String(wrapperCaption).trim();
            console.log('[Router] 🎥 Extracted video caption from wrapper:', textContent);
          } else if (docCaption) {
            textContent = String(docCaption).trim();
            console.log('[Router] 🎥 Extracted video caption from docMsg:', textContent);
          }
        }
      }"""
                js_code = re.sub(pattern, replacement, js_code, flags=re.DOTALL)
                print("✅ Applied flexible fix for caption extraction")
    
    # Update version comment
    if "V7 FIXED" in js_code:
        js_code = js_code.replace("V7 FIXED", "V7.1 FIXED")
        print("✅ Updated router version to V7.1 FIXED")
    
    return js_code

def main():
    workflow_path = Path(__file__).parent.parent / 'INT-WHATSAPP-SUPPORT-001_ Rensto Support Agent (Final)_V7_FIXED.json'
    
    if not workflow_path.exists():
        print(f"❌ Workflow file not found: {workflow_path}")
        sys.exit(1)
    
    print(f"📖 Reading workflow: {workflow_path}")
    with open(workflow_path, 'r', encoding='utf-8') as f:
        workflow = json.load(f)
    
    # Find Smart Message Router node
    nodes = workflow.get('nodes', [])
    router_node = None
    for node in nodes:
        if node.get('name') == 'Smart Message Router':
            router_node = node
            break
    
    if not router_node:
        print("❌ Smart Message Router node not found")
        sys.exit(1)
    
    # Update router code
    print("\n🔧 Fixing caption extraction for captioned videos...")
    js_code = router_node['parameters']['jsCode']
    js_code = fix_caption_extraction(js_code)
    router_node['parameters']['jsCode'] = js_code
    
    # Save updated workflow
    output_path = workflow_path.parent / f"{workflow_path.stem.replace('_V7_FIXED', '')}_V7.1_FIXED.json"
    print(f"\n💾 Saving fixed workflow to: {output_path}")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(workflow, f, indent=2, ensure_ascii=False)
    
    print("\n✅ Fix applied successfully!")
    print(f"📝 Updated workflow saved to: {output_path}")
    print("\n📋 What was fixed:")
    print("  - Caption extraction for videos wrapped as documentWithCaptionMessage")
    print("  - Now checks wrapper level (_dataMessage.documentWithCaptionMessage.caption) first")
    print("  - Falls back to docMsg.caption if wrapper caption not found")

if __name__ == '__main__':
    main()

