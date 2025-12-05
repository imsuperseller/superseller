# Native Node Replacement Guide

**Date**: November 26, 2025  
**Workflow**: `1LWTwUuN6P6uq2Ha` (INT-WHATSAPP-ROUTER-OPTIMIZED)  
**Purpose**: Step-by-step guide to replace Code nodes with native n8n nodes

---

## 📋 Nodes to Add

### Step 1: Add Set Nodes to Replace Code Nodes

Add these **Set** nodes in the following locations:

1. **Replace "✍️ Prepare AI Input2"** (id: `f8b573ab-2a5a-40c2-9f43-582804c33c80`)
   - **Location**: After "🛡️ Guardrails (Inbound)1", before "🧠 AI Agent1"
   - **Name**: "✍️ Prepare AI Input2 (Set)"
   - **Position**: Same as current Code node (5840, -68)

2. **Replace "✍️ Prepare AI Input3"** (id: `5f27b9c0-741a-4853-93e7-3a0b182119c3`)
   - **Location**: After "🖼️ Download Image", before "🛡️ Guardrails (Inbound)1"
   - **Name**: "✍️ Prepare AI Input3 (Set)"
   - **Position**: Same as current Code node (5264, 244)

3. **Replace "🚫 Blocked Response1"** (id: `da5f2cf3-de68-4374-ae19-71b6758fdedb`)
   - **Location**: After "🛡️ Guardrails (Outbound)1" (blocked output)
   - **Name**: "🚫 Blocked Response1 (Set)"
   - **Position**: Same as current Code node (6992, -172)

4. **Replace "🚫 Blocked Input1"** (id: `5b7f8470-a0c1-4202-8096-54634f096950`)
   - **Location**: After "🛡️ Guardrails (Inbound)1" (blocked output)
   - **Name**: "🚫 Blocked Input1 (Set)"
   - **Position**: Same as current Code node (6992, 200)

5. **Replace "🚫 Unsupported Input Type1"** (id: `fb0a43ab-8a6e-4f9f-99d8-cacb608d455b`)
   - **Location**: After "🔀 Message Type Router" (unsupported types output)
   - **Name**: "🚫 Unsupported Input Type1 (Set)"
   - **Position**: Same as current Code node (6992, 440)

---

## 🔗 Connection Changes

After adding the Set nodes, update connections:

### Current Connections (to keep):
- "🛡️ Guardrails (Inbound)1" → "✍️ Prepare AI Input2" → "🧠 AI Agent1"
- "🖼️ Download Image" → "✍️ Prepare AI Input3" → "🛡️ Guardrails (Inbound)1"
- "🛡️ Guardrails (Outbound)1" (blocked) → "🚫 Blocked Response1" → "Voice Response?1"
- "🛡️ Guardrails (Inbound)1" (blocked) → "🚫 Blocked Input1" → "Voice Response?1"
- "🔀 Message Type Router" (unsupported) → "🚫 Unsupported Input Type1" → "Voice Response?1"

### New Connections (Set nodes):
- Same connections, just replace Code nodes with Set nodes

---

## ⚠️ Important Notes

1. **Don't delete old Code nodes yet** - Keep them for reference
2. **Add Set nodes with "(Set)" suffix** - So we can identify them
3. **Keep same positions** - So workflow layout doesn't change
4. **Test after each replacement** - We'll configure one at a time

---

## 📝 Next Steps

1. **You add the 5 Set nodes** in the locations above
2. **Tell me when done** - "I added all 5 Set nodes"
3. **We configure them one by one** - I'll research latest n8n Set node features and guide you through each configuration

---

## 🎯 Configuration Order

We'll configure in this order (easiest to hardest):

1. **🚫 Blocked Response1 (Set)** - Simplest (just error message)
2. **🚫 Blocked Input1 (Set)** - Similar to Blocked Response1
3. **🚫 Unsupported Input Type1 (Set)** - Similar, with message_type variable
4. **✍️ Prepare AI Input2 (Set)** - Medium complexity (string concatenation)
5. **✍️ Prepare AI Input3 (Set)** - Similar to Prepare AI Input2

---

**Ready when you are! Add the 5 Set nodes and let me know.**

