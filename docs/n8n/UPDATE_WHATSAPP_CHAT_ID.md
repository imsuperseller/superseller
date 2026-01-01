# Update WhatsApp Chat ID in Workflow

**Date**: January 2025  
**Workflow**: `GokbOOc0YpO6xWXH`  
**Task**: Update "Send a text message" node with chat ID from WAHA default session

---

## ✅ **CHAT ID CONFIGURATION**

**Chat ID**: `14695885133@c.us`  
**Session**: `default`  
**WAHA URL**: `http://172.245.56.50:3000`  
**WAHA API Key**: `4fc7e008d7d24fc995475029effc8fa8`

---

## 📋 **MANUAL UPDATE STEPS**

### **Step 1: Open Workflow**
1. Go to: `https://n8n.rensto.com/workflow/GokbOOc0YpO6xWXH`
2. Or: `http://172.245.56.50:5678/workflow/GokbOOc0YpO6xWXH`

### **Step 2: Find "Send a text message" Node**
- Look for a node named "Send a text message" or similar
- It might be a:
  - **Code Node** (n8n-nodes-base.code)
  - **WAHA Node** (@devlikeapro/n8n-nodes-waha.WAHA)
  - **HTTP Request Node** (n8n-nodes-base.httpRequest)

### **Step 3: Update Based on Node Type**

#### **If it's a WAHA Node**:
1. Click on the "Send a text message" node
2. Set the following parameters:
   - **Session**: `default`
   - **Chat ID**: `14695885133@c.us`
   - **Text**: (keep existing expression or set as needed)
3. Click **Save**

#### **If it's a Code Node** (Most Common):
1. Click on the "Send a text message" node
2. In the code, look for a line like:
   ```javascript
   const chatId = $json.userId;
   ```
   or
   ```javascript
   const chatId = $json.chatId || $json.chat_id;
   ```
3. **Option A - Hardcode the chat ID** (if you always want to send to this number):
   ```javascript
   const chatId = '14695885133@c.us';
   ```
4. **Option B - Keep dynamic but add fallback** (if you want to use input when available, otherwise use default):
   ```javascript
   const chatId = $json.userId || $json.chatId || $json.chat_id || '14695885133@c.us';
   ```
5. Also ensure the session is set to `default`:
   ```javascript
   const sessionId = 'default';
   ```
6. Click **Save**

#### **If it's an HTTP Request Node**:
1. Click on the "Send a text message" node
2. **Method**: `POST`
3. **URL**: `http://172.245.56.50:3000/api/sendText`
4. **Headers**:
   - `x-api-key`: `4fc7e008d7d24fc995475029effc8fa8`
   - `Content-Type`: `application/json`
5. **Body** (JSON):
   ```json
   {
     "session": "default",
     "chatId": "14695885133@c.us",
     "text": "{{ $json.text }}"
   }
   ```
6. Click **Save**

---

## 🔧 **AUTOMATED UPDATE (If API Access Works)**

Run the script:
```bash
node scripts/update-waha-chat-id.cjs GokbOOc0YpO6xWXH 14695885133@c.us
```

**Note**: This requires a valid n8n API key. If the API key in the script doesn't work, you'll need to update it or do the manual steps above.

---

## ✅ **VERIFICATION**

After updating:
1. **Test the workflow** by running it manually
2. **Check the node** to ensure chat ID is set correctly
3. **Verify** that the "Send a text message" node is properly configured
4. **Then** you can approve deletion of the "Send a message1" node

---

## 📝 **NOTES**

- **Chat ID Format**: `{phone_number}@c.us` (e.g., `14695885133@c.us`)
- **Session**: Must match the WAHA session name (`default`)
- **WAHA API**: Uses `x-api-key` header for authentication
- **Message Format**: Text messages are sent via `/api/sendText` endpoint

---

## 🚨 **TROUBLESHOOTING**

**If chat ID doesn't work**:
- Verify the phone number is correct
- Check that the session "default" is active in WAHA
- Ensure the WAHA API is accessible at `http://172.245.56.50:3000`

**If node update fails**:
- Check node type and update accordingly
- Verify API key is correct
- Try manual update method instead

