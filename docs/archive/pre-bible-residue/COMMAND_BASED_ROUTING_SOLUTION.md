# 🎯 Command-Based Routing Solution - Smart Testing

**Date**: November 25, 2025  
**Problem**: How to test different agents from one phone number  
**Solution**: Command-based routing (`@agent-name` commands)  
**Status**: ✅ **SOLUTION READY**

---

## 🎯 **THE SMART SOLUTION**

### **Command-Based Routing**

**Instead of switching sessions, use commands in your messages**:

```
You send: "@tax4us Hi, test message"
    ↓
Router detects: "@tax4us" command
    ↓
Router routes: To Tax4US Agent (ignores phone mapping)
    ↓
Tax4US Agent responds
```

**Benefits**:
- ✅ No need to switch WhatsApp numbers
- ✅ No need to change demo mode
- ✅ Test any agent instantly
- ✅ Works from any phone number
- ✅ Clear and explicit routing

---

## 🔧 **IMPLEMENTATION**

### **Step 1: Update Router Workflow**

**Add Command Parser Node** (before "Lookup Agent"):

```javascript
// Parse Command from Message
const messageText = $json.message_text || '';
const senderPhone = $json.sender_phone || '';

// Check for command pattern: @agent-name message
const commandPattern = /^@(\w+)\s+(.+)$/;
const match = messageText.match(commandPattern);

let agentOverride = null;
let actualMessage = messageText;

if (match) {
  const command = match[1].toLowerCase();
  actualMessage = match[2]; // Remove command from message
  
  // Map commands to agent IDs
  const commandMap = {
    'tax4us': 'tax4us-ai',
    'tax4': 'tax4us-ai',
    'meatpoint': 'meatpoint-agent',
    'meat': 'meatpoint-agent',
    'rensto': 'rensto-support',
    'support': 'rensto-support',
    'liza': 'liza-ai',
    'default': 'rensto-support'
  };
  
  agentOverride = commandMap[command] || null;
  
  if (agentOverride) {
    console.log(`[Router] 🎯 Command detected: @${command} → ${agentOverride}`);
  } else {
    console.log(`[Router] ⚠️ Unknown command: @${command}`);
  }
}

return {
  json: {
    ...$json,
    message_text: actualMessage, // Message without command
    original_message_text: messageText, // Original with command
    agent_override: agentOverride, // Agent ID if command found
    has_command: !!agentOverride
  }
};
```

### **Step 2: Update Lookup Agent Node**

**Modify to check for command override first**:

```javascript
// Check for command override (highest priority)
if ($json.agent_override) {
  agentId = $json.agent_override;
  console.log(`[Router] 🎯 Using command override: ${agentId}`);
  // Skip demo mode and permanent mappings
} else {
  // Normal routing logic (demo mode → permanent → default)
  // ... existing code ...
}
```

---

## 📱 **USAGE EXAMPLES**

### **Test Tax4US Agent**:
```
You send: "@tax4us Hi, can you help me with taxes?"
Router: Routes to Tax4US Agent
Agent: Responds as Tax4US agent
```

### **Test MeatPoint Agent**:
```
You send: "@meatpoint What's on the menu today?"
Router: Routes to MeatPoint Agent
Agent: Responds as MeatPoint agent
```

### **Test Rensto Support**:
```
You send: "@rensto What is the Marketplace?"
Router: Routes to Rensto Support
Agent: Responds as Rensto Support
```

### **Normal Message (No Command)**:
```
You send: "Hi, I need help"
Router: Uses phone-based routing (your number → Tax4US per permanent mapping)
Agent: Tax4US Agent responds
```

---

## 🎯 **COMMAND REFERENCE**

| Command | Agent | Example |
|---------|-------|---------|
| `@tax4us` or `@tax4` | Tax4US Agent | `@tax4us Hi` |
| `@meatpoint` or `@meat` | MeatPoint Agent | `@meatpoint Menu?` |
| `@rensto` or `@support` | Rensto Support | `@rensto Help` |
| `@liza` | Liza AI | `@liza Design question` |
| `@default` | Rensto Support | `@default Reset` |

---

## ✅ **BENEFITS**

1. **No Session Switching**: Always message the same WhatsApp number
2. **Instant Testing**: Change agent with a simple command
3. **Clear Intent**: Command makes routing explicit
4. **No Demo Mode Needed**: Commands override everything
5. **Works from Any Phone**: Commands work regardless of sender

---

## 🔧 **QUICK IMPLEMENTATION**

**Add this to router workflow**:

1. **Add "Parse Command" node** (Code node) before "Lookup Agent"
2. **Update "Lookup Agent" node** to check for `agent_override` first
3. **Test with commands**: `@tax4us test`, `@meatpoint test`, etc.

**Estimated Time**: 15-20 minutes

---

**Last Updated**: November 25, 2025  
**Status**: ✅ **READY TO IMPLEMENT**

