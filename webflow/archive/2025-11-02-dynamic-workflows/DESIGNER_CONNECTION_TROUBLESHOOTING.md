# 🔧 Webflow Designer Connection Troubleshooting

**Issue**: MCP app not connecting to Webflow Designer  
**Date**: November 2, 2025

---

## ✅ **CHECKLIST**

### **Step 1: Verify App is Running**
1. In Webflow Designer, look for a **notification or popup** at the top
2. Check if there's a **"MCP App"** or **"Extension"** icon in the Designer toolbar
3. Look for any **permission prompts** - click "Allow" if you see one

### **Step 2: Check Browser Console**
1. Open Browser Developer Tools (F12)
2. Go to **Console** tab
3. Look for errors related to:
   - "MCP"
   - "app connection"
   - "permission denied"
   - CORS errors

### **Step 3: Verify URL**
- Make sure you're on: `https://rensto.design.webflow.com`
- The app link should include: `?app=dc8209c65e3ec02254d15275ca056539c89f6d15741893a0adf29ad6f381eb99`

### **Step 4: Refresh and Retry**
1. **Refresh the Designer page** (F5)
2. **Re-click the app link** (if provided)
3. Wait 10 seconds for connection to establish

---

## 🔄 **ALTERNATIVE: Manual Addition**

If the MCP connection isn't working, you can add the container div manually (30 seconds):

### **Quick Steps**:
1. In Designer → **Marketplace** page
2. Click **Add** (+) → **Div Block**
3. Set class: `workflows-container`
4. **Publish**

The script is already registered and will work once the container exists!

---

## 📊 **CURRENT STATUS**

- ✅ Script registered (`marketplace_dynamic_workflows`)
- ✅ Script applied site-wide
- ✅ Site published
- ⏳ Container div needed (can be added manually if MCP doesn't connect)

---

**Time to Complete**: 30 seconds (manual addition)  
**Result**: Workflows will load automatically once container is added

