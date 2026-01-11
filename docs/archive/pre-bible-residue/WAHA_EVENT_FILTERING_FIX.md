# WAHA Event Filtering Fix

**Date**: November 21, 2025  
**Workflow**: INT-WHATSAPP-SUPPORT-001  
**Issue**: Processing ALL event types from WAHA Trigger instead of only 'message' events

---

## 🐛 Problem

**WAHA Trigger Outputs**:
- `event: 'message'` ✅ (should process)
- `event: 'message.any'` ✅ (should process)
- `event: 'creds.update'` ❌ (should skip)
- `event: 'connection.update'` ❌ (should skip)
- `event: 'engine.event'` with various sub-events ❌ (should skip unless it's a message)

**Current Behavior**:
- Processing ALL events, including non-message events
- This causes:
  - Duplicate processing
  - Incorrect message type detection
  - Multiple responses
  - Processing irrelevant events

---

## ✅ Fix Applied

### Smart Message Router - Early Event Filter

**Updated**: Filter to ONLY process `'message'` and `'message.any'` events at the START of the loop

**Key Changes**:
1. ✅ **Early Filter**: Check `eventType` at the START of the loop
2. ✅ **Skip Non-Messages**: Skip `creds.update`, `connection.update`, and other non-message events immediately
3. ✅ **Simplified Logic**: Removed complex `extractMessageData` function - now directly processes message events
4. ✅ **Better Logging**: Log when skipping non-message events

**Code Logic**:
```javascript
// OLD (BROKEN):
const extractMessageData = (item) => {
  // Complex logic handling multiple event types
  if (eventType === 'engine.event') {
    // Tries to extract messages from engine events
  }
  return null; // Returns null for non-messages
};

// NEW (FIXED):
for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
  const item = items[itemIndex];
  const msg = item.json || {};
  const eventType = msg.event || '';
  
  // CRITICAL FIX: Filter to ONLY process 'message' events
  if (eventType !== 'message' && eventType !== 'message.any') {
    console.log('[Router] ⏭️ Skipping non-message event:', eventType);
    continue; // ✅ Skip immediately
  }
  
  // Now we know it's a message event - process it directly
  const payload = msg.payload || {};
  // ... rest of processing
}
```

---

## 📊 Event Types Handled

### ✅ Process These:
- `event: 'message'` - Standard message events
- `event: 'message.any'` - Any message type

### ❌ Skip These:
- `event: 'creds.update'` - Credential updates
- `event: 'connection.update'` - Connection status changes
- `event: 'engine.event'` with non-message sub-events
- Any other non-message events

---

## 🎯 Benefits

1. ✅ **No Duplicate Processing**: Only processes actual messages
2. ✅ **Faster Execution**: Skips irrelevant events immediately
3. ✅ **Cleaner Code**: Removed complex `extractMessageData` function
4. ✅ **Better Logging**: Clear indication of what's being skipped
5. ✅ **Prevents Errors**: No more trying to process non-message events

---

**Status**: ✅ **Fixed - Only processes 'message' events**

