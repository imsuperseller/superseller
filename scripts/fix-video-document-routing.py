#!/usr/bin/env python3
"""
Fix Video and Document Routing Issues in INT-WHATSAPP-SUPPORT-001

Fixes:
1. V7 Fix: Check mimetype when detecting documentMessage - if it's video/, treat as video
2. Add validation to ensure binary data is passed correctly to agents
"""

import json
import sys
from pathlib import Path

def fix_router_code(js_code):
    """Add V7 fix to router code - check mimetype for videos wrapped as documents."""
    
    # Fix 1: Update documentWithCaptionMessage handler to check mimetype
    old_doc_with_caption = """  // Check for documents WITH caption first
  if (_dataMessage.documentWithCaptionMessage && _dataMessage.documentWithCaptionMessage.message) {
    const docMsg = _dataMessage.documentWithCaptionMessage.message.documentMessage;
    if (docMsg) {
      messageType = 'document';
      mediaUrl = docMsg.url || '';
      mediaInfo = { 
        mimetype: docMsg.mimetype || 'application/pdf',
        filename: docMsg.fileName || docMsg.filename || ''
      };
      // Extract caption if present
      if (docMsg.caption && !textContent) {
        textContent = String(docMsg.caption).trim();
        console.log('[Router] 📄 Extracted document caption:', textContent);
      }
    }
  }"""
    
    new_doc_with_caption = """  // Check for documents WITH caption first
  if (_dataMessage.documentWithCaptionMessage && _dataMessage.documentWithCaptionMessage.message) {
    const docMsg = _dataMessage.documentWithCaptionMessage.message.documentMessage;
    if (docMsg) {
      // CRITICAL FIX V7: Check mimetype FIRST - if it's a video, treat as video not document
      const mimetype = docMsg.mimetype || 'application/pdf';
      if (mimetype.startsWith('video/')) {
        messageType = 'video';
        mediaUrl = docMsg.url || '';
        mediaInfo = { mimetype: mimetype };
        console.log('[Router] 🎥 Video detected wrapped as documentWithCaptionMessage, mimetype:', mimetype);
        // Extract caption if present
        if (docMsg.caption && !textContent) {
          textContent = String(docMsg.caption).trim();
          console.log('[Router] 🎥 Extracted video caption:', textContent);
        }
      } else {
        messageType = 'document';
        mediaUrl = docMsg.url || '';
        mediaInfo = { 
          mimetype: mimetype,
          filename: docMsg.fileName || docMsg.filename || ''
        };
        // Extract caption if present
        if (docMsg.caption && !textContent) {
          textContent = String(docMsg.caption).trim();
          console.log('[Router] 📄 Extracted document caption:', textContent);
        }
      }
    }
  }"""
    
    if old_doc_with_caption in js_code:
        js_code = js_code.replace(old_doc_with_caption, new_doc_with_caption)
        print("✅ Applied V7 fix to documentWithCaptionMessage handler")
    else:
        print("⚠️ Could not find documentWithCaptionMessage handler - may already be fixed")
    
    # Fix 2: Update direct documentMessage handler to check mimetype
    old_doc_direct = """    } else if (_dataMessage.documentMessage) {
      messageType = 'document';
      mediaUrl = _dataMessage.documentMessage.url || '';
      mediaInfo = { mimetype: _dataMessage.documentMessage.mimetype || 'application/pdf' };
    }"""
    
    new_doc_direct = """    } else if (_dataMessage.documentMessage) {
      // CRITICAL FIX V7: Check mimetype FIRST - if it's a video, treat as video not document
      const docMimetype = _dataMessage.documentMessage.mimetype || 'application/pdf';
      if (docMimetype.startsWith('video/')) {
        messageType = 'video';
        mediaUrl = _dataMessage.documentMessage.url || '';
        mediaInfo = { mimetype: docMimetype };
        console.log('[Router] 🎥 Video detected wrapped as documentMessage, mimetype:', docMimetype);
      } else {
        messageType = 'document';
        mediaUrl = _dataMessage.documentMessage.url || '';
        mediaInfo = { mimetype: docMimetype };
      }
    }"""
    
    if old_doc_direct in js_code:
        js_code = js_code.replace(old_doc_direct, new_doc_direct)
        print("✅ Applied V7 fix to direct documentMessage handler")
    else:
        print("⚠️ Could not find direct documentMessage handler - checking for existing fix...")
        if "docMimetype.startsWith('video/')" in js_code:
            print("✅ V7 fix already applied to direct documentMessage handler")
        else:
            print("❌ Could not apply V7 fix to direct documentMessage handler")
    
    # Update version comment
    if "V2 ROBUST" in js_code:
        js_code = js_code.replace("V2 ROBUST", "V7 FIXED")
        print("✅ Updated router version to V7 FIXED")
    
    return js_code

def update_agent_prompts(workflow):
    """Update agent prompts to prevent hallucination when binary data is missing."""
    
    nodes = workflow.get('nodes', [])
    
    # Update Video Analysis Agent
    for node in nodes:
        if node.get('name') == 'Video Analysis Agent':
            params = node.get('parameters', {})
            options = params.get('options', {})
            system_msg = options.get('systemMessage', '')
            
            if 'CRITICAL RULES' in system_msg:
                # Add validation instruction
                new_rule = "\n- **CRITICAL**: If you do not receive binary video data, respond with: 'I received your video message but could not process it. Please try sending it again.'\n- **NEVER** hallucinate or make up video content - only analyze what you actually see"
                if 'NEVER hallucinate' not in system_msg:
                    system_msg = system_msg.replace('**CRITICAL RULES:**', f'**CRITICAL RULES:**{new_rule}')
                    options['systemMessage'] = system_msg
                    print("✅ Updated Video Analysis Agent prompt")
                else:
                    print("✅ Video Analysis Agent prompt already updated")
            
            break
    
    # Update Document Analysis Agent
    for node in nodes:
        if node.get('name') == 'Document Analysis Agent':
            params = node.get('parameters', {})
            options = params.get('options', {})
            system_msg = options.get('systemMessage', '')
            
            if 'CRITICAL RULES' in system_msg:
                # Add validation instruction
                new_rule = "\n- **CRITICAL**: If you do not receive binary document data, respond with: 'I received your document but could not process it. Please try sending it again.'\n- **NEVER** hallucinate or make up document content - only analyze what you actually see"
                if 'NEVER hallucinate' not in system_msg:
                    system_msg = system_msg.replace('**CRITICAL RULES:**', f'**CRITICAL RULES:**{new_rule}')
                    options['systemMessage'] = system_msg
                    print("✅ Updated Document Analysis Agent prompt")
                else:
                    print("✅ Document Analysis Agent prompt already updated")
            
            break
    
    return workflow

def main():
    workflow_path = Path(__file__).parent.parent / 'INT-WHATSAPP-SUPPORT-001_ Rensto Support Agent (Final).json'
    
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
    print("\n🔧 Applying V7 fix to Smart Message Router...")
    js_code = router_node['parameters']['jsCode']
    js_code = fix_router_code(js_code)
    router_node['parameters']['jsCode'] = js_code
    
    # Update agent prompts
    print("\n🔧 Updating agent prompts to prevent hallucination...")
    workflow = update_agent_prompts(workflow)
    
    # Save updated workflow
    output_path = workflow_path.parent / f"{workflow_path.stem}_V7_FIXED.json"
    print(f"\n💾 Saving fixed workflow to: {output_path}")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(workflow, f, indent=2, ensure_ascii=False)
    
    print("\n✅ Fixes applied successfully!")
    print(f"📝 Updated workflow saved to: {output_path}")
    print("\n📋 Next steps:")
    print("1. Import the fixed workflow into n8n")
    print("2. Test with a video message (should route to Video Analysis Agent)")
    print("3. Test with a document message (should route to Document Analysis Agent)")
    print("4. Verify agents don't hallucinate when binary data is missing")

if __name__ == '__main__':
    main()

