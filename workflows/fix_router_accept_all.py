#!/usr/bin/env python3
"""
Fix Smart Message Router to accept ALL WAHA events

The current router only processes events with specific types:
- message
- message.any  
- engine.event

WAHA may be sending different event types, causing messages to be filtered out.

This fix adds:
1. Logging of actual event types received
2. Fallback to process ANY event type
3. Better error handling
"""

import json
import sys
from pathlib import Path

def fix_smart_message_router(workflow_path):
    """Update Smart Message Router to accept all event types."""
    
    with open(workflow_path, 'r') as f:
        workflow = json.load(f)
    
    # Find Smart Message Router node
    router_node = None
    for node in workflow['nodes']:
        if node.get('name') == 'Smart Message Router':
            router_node = node
            break
    
    if not router_node:
        print("❌ Smart Message Router node not found!")
        return None
    
    # Updated code with fallback for ALL event types
    new_code = """// Universal Smart Message Router - Accept ALL WAHA events with fallback
const self = this;
const items = $input.all();
const results = [];

console.log('[Router] ===== STARTING ROUTER (V3 ACCEPT ALL) =====');
console.log('[Router] Input items count:', items.length);

// Log FIRST item to see what we're getting
if (items.length > 0) {
  const first = items[0].json || {};
  console.log('[Router] First item event type:', first.event || 'NO EVENT TYPE');
  console.log('[Router] First item keys:', Object.keys(first).join(', '));
  console.log('[Router] First item JSON:', JSON.stringify(first).substring(0, 500));
}

let staticData;
try {
  staticData = self.getWorkflowStaticData('global');
} catch (error) {
  staticData = {};
}

staticData.processedMessageIds = staticData.processedMessageIds || [];
staticData.processedMessageTimestamps = staticData.processedMessageTimestamps || {};
staticData.rateLimitTracker = staticData.rateLimitTracker || {};

const findTextContent = (obj, depth = 0) => {
  if (!obj || typeof obj !== 'object' || depth > 5) return null;
  if (obj.caption) return obj.caption;
  if (obj.conversation) return obj.conversation;
  if (obj.text && typeof obj.text === 'string') return obj.text;
  if (obj.body && typeof obj.body === 'string') return obj.body;
  
  for (const key in obj) {
    if (key === 'contextInfo' || key === 'quotedMessage') continue;
    const res = findTextContent(obj[key], depth + 1);
    if (res) return res;
  }
  return null;
};

const tryMarkAsProcessed = (keys) => {
  if (!Array.isArray(keys) || keys.length === 0) return false;
  const processed = staticData.processedMessageIds;
  const now = Date.now();
  
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (key && processed.includes(key)) {
      console.log('[Router] ⏭️ Skipping duplicate message:', key);
      return false;
    }
  }
  
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (key && !processed.includes(key)) {
      processed.push(key);
    }
  }
  
  if (processed.length > 1000) {
    processed.splice(0, processed.length - 1000);
  }
  return true;
};

const checkRateLimit = (userId) => {
  const now = Date.now();
  const tracker = staticData.rateLimitTracker;
  
  if (!tracker[userId]) tracker[userId] = [];
  
  const recentMessages = tracker[userId].filter(t => now - t < 60000);
  tracker[userId] = recentMessages;
  
  if (recentMessages.length >= 10) return false;
  
  tracker[userId].push(now);
  return true;
};

// FIXED: Accept ALL events, not just specific types
const extractMessageData = (item) => {
  const msg = item.json || {};
  const eventType = msg.event || 'unknown';
  const payload = msg.payload || msg; // Fallback to msg itself
  
  console.log('[Router] Processing event type:', eventType);
  
  // Try standard WAHA events first
  if (eventType === 'message' || eventType === 'message.any') {
    return {
      payload: payload,
      _data: payload._data || {},
      fromMe: payload.fromMe || false
    };
  }
  
  if (eventType === 'engine.event') {
    let messageData;
    if (payload.event === 'messages.upsert') {
      messageData = payload.data?.messages?.[0];
    } else if (payload.event === 'chats.update') {
      messageData = payload.data?.[0]?.messages?.[0]?.message;
    }
    
    if (messageData) {
      const key = messageData.key || {};
      const message = messageData.message || {};
      const body = findTextContent(message) || '';
      
      return {
        payload: {
          id: key.id || '',
          from: key.remoteJid || '',
          fromMe: key.fromMe || false,
          timestamp: messageData.messageTimestamp || Date.now(),
          body: body,
          hasMedia: !!(message.imageMessage || message.videoMessage || message.documentMessage || message.audioMessage),
          _data: { key, messageTimestamp: messageData.messageTimestamp, message }
        },
        _data: { key, messageTimestamp: messageData.messageTimestamp, message },
        fromMe: key.fromMe || false
      };
    }
  }
  
  // FALLBACK: Try to extract from ANY structure
  console.log('[Router] ⚠️ Unknown event type, trying fallback extraction');
  
  // Check if payload has message-like structure
  const textContent = payload.body || payload.text || payload.conversation || 
                     findTextContent(payload) || '';
  const messageId = payload.id || payload.messageId || '';
  const from = payload.from || payload.remoteJid || '';
  const fromMe = payload.fromMe || false;
  
  if (textContent || messageId || from) {
    console.log('[Router] ✅ Fallback extraction successful');
    return {
      payload: payload,
      _data: payload._data || payload,
      fromMe: fromMe
    };
  }
  
  console.log('[Router] ❌ Could not extract message data');
  return null;
};

for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
  const item = items[itemIndex];
  const messageData = extractMessageData(item);
  
  if (!messageData) {
    console.log('[Router] ⏭️ Skipping item', itemIndex, '- no message data');
    continue;
  }
  
  const payload = messageData.payload || {};
  const _data = messageData._data || {};
  
  if (messageData.fromMe === true) {
    console.log('[Router] ⏭️ Skipping own message');
    continue;
  }
  
  const _dataKey = _data.key || {};
  const actualMessageId = _dataKey.id || payload.id || '';
  const remoteJid = payload.from || _dataKey.remoteJid || '';
  const userId = remoteJid ? String(remoteJid).replace('@s.whatsapp.net', '@c.us') : '';
  const timestamp = payload.timestamp || _data.messageTimestamp || Date.now();
  
  const dedupKeys = [actualMessageId].filter(k => k);
  
  try { self.setWorkflowStaticData('global', staticData); } catch (e) {}
  if (!tryMarkAsProcessed(dedupKeys)) continue;
  try { self.setWorkflowStaticData('global', staticData); } catch (e) {}
  
  if (userId && !checkRateLimit(userId)) {
    console.log('[Router] ⏭️ Rate limit exceeded for', userId);
    continue;
  }
  
  let messageType = 'text';
  let textContent = payload.body || findTextContent(_data.message) || '';
  let mediaUrl = '';
  let mediaInfo = {};
  
  const _dataMessage = _data.message || {};
  
  if (_dataMessage.audioMessage) {
    messageType = 'voice';
    mediaUrl = _dataMessage.audioMessage.url || '';
    mediaInfo = { isPTT: true, mimetype: 'audio/ogg' };
  } else if (_dataMessage.imageMessage) {
    messageType = 'image';
    mediaUrl = _dataMessage.imageMessage.url || '';
    mediaInfo = { mimetype: 'image/jpeg' };
  } else if (_dataMessage.videoMessage) {
    messageType = 'video';
    mediaUrl = _dataMessage.videoMessage.url || '';
    mediaInfo = { mimetype: 'video/mp4' };
  } else if (_dataMessage.documentMessage) {
    messageType = 'document';
    mediaUrl = _dataMessage.documentMessage.url || '';
    mediaInfo = { mimetype: 'application/pdf' };
  }
  
  if (mediaUrl && mediaUrl.includes('localhost')) {
    mediaUrl = mediaUrl.replace('localhost', '173.254.201.134');
  }
  
  staticData.lastMessageMetadata = {
    userId: userId,
    messageId: actualMessageId,
    sessionId: userId,
    requiresVoiceResponse: messageType === 'voice',
    source: 'waha',
    store_name: 'fileSearchStores/rensto-knowledge-base-ndf9fmymwb2p'
  };
  
  try { self.setWorkflowStaticData('global', staticData); } catch (e) {}
  
  console.log('[Router] ✅ Processed:', messageType, 'ID:', actualMessageId, 'Text:', textContent.substring(0, 50));
  
  results.push({
    json: {
      messageId: actualMessageId,
      messageType: messageType,
      source: 'waha',
      userId: userId,
      timestamp: timestamp,
      textContent: textContent,
      mediaUrl: mediaUrl,
      mediaInfo: mediaInfo,
      originalPayload: payload,
      requiresVoiceResponse: messageType === 'voice',
      sessionId: userId
    }
  });
}

console.log('[Router] ===== COMPLETED - Returning', results.length, 'items =====');
return results;"""
    
    router_node['parameters']['jsCode'] = new_code
    
    # Save updated workflow
    output_path = workflow_path.replace('.json', '-FIXED-ROUTER.json')
    with open(output_path, 'w') as f:
        json.dump(workflow, f, indent=2)
    
    print(f"✅ Updated Smart Message Router with fallback logic")
    print(f"✅ Added extensive logging to see actual event types")
    print(f"✅ Saved to: {output_path}")
    
    return output_path

if __name__ == "__main__":
    workflow_file = "/Users/shaifriedman/New Rensto/rensto/workflows/INT-WHATSAPP-SUPPORT-001-NO-DUPES-DEPLOY.json"
    
    if not Path(workflow_file).exists():
        print(f"❌ Workflow file not found: {workflow_file}")
        sys.exit(1)
    
    try:
        output_file = fix_smart_message_router(workflow_file)
        print(f"\n✅ SUCCESS! Updated workflow saved to:")
        print(f"   {output_file}")
        print(f"\n📝 Next: Deploy and test")
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
