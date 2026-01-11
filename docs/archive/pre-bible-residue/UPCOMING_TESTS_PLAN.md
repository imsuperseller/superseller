# 🧪 Upcoming Tests - WhatsApp Workflows

**Date**: November 25, 2025  
**Status**: ✅ **AUDIT COMPLETE** | 🧪 **READY FOR TESTING**  
**Sessions**: All WORKING (`default`, `tax4us`, `meatpoint`)

---

## 📋 **TESTING PRIORITY**

### **Priority 1: Critical Functionality** (Test First)
1. ✅ Session Status Verification
2. ✅ Router Workflow Message Routing
3. ✅ Rensto Support Workflow (Default Session)
4. ✅ Message Delivery (Text & Voice)

### **Priority 2: Message Types** (Test Second)
5. ✅ Text Messages
6. ✅ Voice Messages
7. ✅ Image Messages
8. ✅ Video Messages
9. ✅ Document/PDF Messages

### **Priority 3: Integration Tests** (Test Third)
10. ✅ Multi-Agent Routing
11. ✅ Webhook Integration
12. ✅ Error Handling

---

## 🧪 **TEST SUITE 1: Session & Infrastructure**

### **Test 1.1: Session Status Verification**
**Objective**: Verify all WAHA sessions are WORKING

**Steps**:
```bash
curl -s -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8" \
  http://172.245.56.50:3000/api/sessions | python3 -m json.tool
```

**Expected Results**:
- ✅ `default`: `"status": "WORKING"`
- ✅ `tax4us`: `"status": "WORKING"`
- ✅ `meatpoint`: `"status": "WORKING"`

**Pass Criteria**: All 3 sessions show `WORKING` status

---

### **Test 1.2: Profile Picture Verification**
**Objective**: Verify logos are set correctly

**Steps**:
```bash
# Check default session profile picture
curl -s -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8" \
  http://172.245.56.50:3000/api/sessions/default | python3 -m json.tool | grep -A 5 "profilePicture"

# Check tax4us session profile picture
curl -s -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8" \
  http://172.245.56.50:3000/api/sessions/tax4us | python3 -m json.tool | grep -A 5 "profilePicture"

# Check meatpoint session profile picture
curl -s -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8" \
  http://172.245.56.50:3000/api/sessions/meatpoint | python3 -m json.tool | grep -A 5 "profilePicture"
```

**Expected Results**:
- ✅ `default`: Has Rensto logo URL
- ✅ `tax4us`: Has Tax4US logo URL
- ✅ `meatpoint`: Has MeatPoint logo URL

**Pass Criteria**: All sessions have profile pictures set

---

### **Test 1.3: Webhook Configuration**
**Objective**: Verify webhook is registered for default session

**Steps**:
```bash
curl -s -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8" \
  http://172.245.56.50:3000/api/sessions/default | python3 -m json.tool | grep -A 10 "webhook"
```

**Expected Results**:
- ✅ Webhook URL: `https://n8n.rensto.com/webhook/976a4187-04c0-458b-b9ba-c7af75ed5de0/waha`
- ✅ Events: `["message", "message.any", "session.status"]`

**Pass Criteria**: Webhook URL matches n8n webhook

---

## 🧪 **TEST SUITE 2: Router Workflow**

### **Test 2.1: Router Workflow Activation**
**Objective**: Verify router workflow is active

**Steps**:
1. Check workflow status: `http://172.245.56.50:5678/workflow/nZJJZvWl0MBe3uT4`
2. Verify WAHA Trigger is configured with `session: "default"`

**Expected Results**:
- ✅ Workflow is ACTIVE
- ✅ WAHA Trigger: `session: "default"`, `events: ["message", "message.any"]`

**Pass Criteria**: Router workflow is active and configured

---

### **Test 2.2: Message Routing - Default (Rensto Support)**
**Objective**: Verify unknown numbers route to Rensto Support

**Test Message**: Send "Hello" from an unknown WhatsApp number

**Expected Flow**:
1. Router receives message
2. Router checks phone number (not in permanent mappings)
3. Router routes to `rensto-support` agent
4. Router calls `INT-WHATSAPP-SUPPORT-001` workflow
5. Rensto Support responds

**Pass Criteria**: 
- ✅ Router workflow executes
- ✅ Routes to Rensto Support workflow
- ✅ Response received from Rensto Support

---

### **Test 2.3: Message Routing - Tax4US**
**Objective**: Verify Tax4US number routes correctly

**Test Message**: Send "Hello" from `4695885133@c.us` (Shai's number)

**Expected Flow**:
1. Router receives message
2. Router identifies `4695885133@c.us` → `tax4us-ai`
3. Router calls Tax4US workflow (`afuwFRbipP3bqNZz`)
4. Tax4US agent responds

**Pass Criteria**:
- ✅ Router routes to Tax4US workflow
- ✅ Tax4US agent responds (not Rensto Support)

---

### **Test 2.4: Message Routing - MeatPoint**
**Objective**: Verify MeatPoint number routes correctly

**Test Message**: Send "Hello" from `19544043156@c.us` (Yehuda's number)

**Expected Flow**:
1. Router receives message
2. Router identifies `19544043156@c.us` → `meatpoint-agent`
3. Router calls MeatPoint workflow (`wctBX3HGve9jhdPG`)
4. MeatPoint agent responds

**Pass Criteria**:
- ✅ Router routes to MeatPoint workflow
- ✅ MeatPoint agent responds (not Rensto Support)

---

## 🧪 **TEST SUITE 3: Rensto Support Workflow**

### **Test 3.1: Text Message Processing**
**Objective**: Verify text messages are processed correctly

**Test Message**: "What is the Marketplace?"

**Expected Flow**:
1. WAHA Trigger receives message (session: `default`)
2. Smart Message Router processes message
3. Message Type Router routes to text branch
4. Prepare AI Input extracts question
5. Rensto AI Agent searches knowledge base
6. Process AI Response formats answer
7. Send Text Message sends reply (session: `default`)

**Pass Criteria**:
- ✅ Workflow executes successfully
- ✅ Knowledge base search performed
- ✅ Response sent via WhatsApp
- ✅ Response contains relevant information about Marketplace

---

### **Test 3.2: Voice Message Processing**
**Objective**: Verify voice messages are transcribed and responded to

**Test Message**: Send voice note saying "Tell me about subscriptions"

**Expected Flow**:
1. WAHA Trigger receives voice message
2. Smart Message Router identifies `messageType: "voice"`
3. Download Voice downloads audio file
4. Transcribe Voice transcribes to text
5. Prepare AI Input processes transcription
6. Rensto AI Agent searches knowledge base
7. Process AI Response formats answer
8. Voice Response Check routes to voice branch
9. Convert text to speech generates audio
10. Send Voice Message sends voice reply

**Pass Criteria**:
- ✅ Voice message transcribed correctly
- ✅ Response generated
- ✅ Voice reply sent (not text)
- ✅ Audio quality is good

---

### **Test 3.3: Image Message Processing**
**Objective**: Verify images are analyzed correctly

**Test Message**: Send image (with or without caption)

**Expected Flow**:
1. WAHA Trigger receives image
2. Smart Message Router identifies `messageType: "image"`
3. Download Image1 downloads image
4. Image Analysis Agent analyzes image
5. Merge Image Analysis combines analysis with metadata
6. Guardrails sanitizes analysis
7. Process Media Context prepares prompt
8. Prepare AI Input builds prompt with image analysis
9. Rensto AI Agent responds (or Image Analysis Responder if analysis only)
10. Send Text Message sends reply

**Pass Criteria**:
- ✅ Image downloaded successfully
- ✅ Image analyzed by AI
- ✅ Response references image content
- ✅ No "message didn't come through" errors

---

### **Test 3.4: Video Message Processing**
**Objective**: Verify videos are analyzed correctly

**Test Message**: Send video (with or without caption)

**Expected Flow**:
1. WAHA Trigger receives video
2. Smart Message Router identifies `messageType: "video"`
3. Guardrails: Video Size checks file size
4. Download Video downloads video
5. Video Analysis Agent analyzes video frames
6. Merge Video Analysis combines analysis
7. Process Media Context prepares prompt
8. Rensto AI Agent responds
9. Send Text Message sends reply

**Pass Criteria**:
- ✅ Video downloaded (if <15MB)
- ✅ Video analyzed by AI
- ✅ Response references video content
- ✅ Large videos (>15MB) are rejected gracefully

---

### **Test 3.5: Document/PDF Processing**
**Objective**: Verify PDFs are analyzed correctly

**Test Message**: Send PDF document (with or without caption)

**Expected Flow**:
1. WAHA Trigger receives document
2. Smart Message Router identifies `messageType: "document"`
3. Guardrails: Doc Size checks file size
4. Download Document downloads PDF
5. Document Analysis Agent extracts text (OCR)
6. Merge Document Analysis combines text
7. Process Media Context prepares prompt
8. Rensto AI Agent responds
9. Send Text Message sends reply

**Pass Criteria**:
- ✅ PDF downloaded (if <10MB)
- ✅ Text extracted via OCR
- ✅ Response references document content
- ✅ Large PDFs (>10MB) are rejected gracefully

---

## 🧪 **TEST SUITE 4: Integration & Edge Cases**

### **Test 4.1: Webhook Integration**
**Objective**: Verify HTTP webhook endpoint works

**Test Request**:
```bash
curl -X POST https://n8n.rensto.com/webhook/70828a52-f4f8-46c4-a69d-dea1be0bc8bc/rensto-support-api \
  -H "Content-Type: application/json" \
  -d '{"question": "What is Rensto?"}'
```

**Expected Flow**:
1. Webhook receives request
2. Normalize HTTP Input converts to WAHA format
3. Smart Message Router processes
4. Rensto AI Agent responds
5. Respond to Webhook returns JSON response

**Pass Criteria**:
- ✅ Webhook accepts POST requests
- ✅ Response returned in JSON format
- ✅ AI agent processes question correctly

---

### **Test 4.2: Error Handling**
**Objective**: Verify errors are handled gracefully

**Test Cases**:
1. **Invalid message format**: Send malformed message
2. **Missing data**: Trigger with incomplete payload
3. **API failure**: Simulate WAHA API error
4. **Timeout**: Simulate slow response

**Expected Results**:
- ✅ Errors logged but don't crash workflow
- ✅ Error messages are user-friendly
- ✅ Workflow continues processing other messages

**Pass Criteria**: All error cases handled gracefully

---

### **Test 4.3: Concurrent Messages**
**Objective**: Verify multiple messages process correctly

**Test**: Send 3 messages simultaneously from different numbers

**Expected Results**:
- ✅ All messages processed
- ✅ No message loss
- ✅ Correct routing for each number
- ✅ Responses sent to correct recipients

**Pass Criteria**: All concurrent messages processed successfully

---

## 📊 **TEST EXECUTION LOG**

### **Session & Infrastructure Tests**
- [ ] Test 1.1: Session Status Verification
- [ ] Test 1.2: Profile Picture Verification
- [ ] Test 1.3: Webhook Configuration

### **Router Workflow Tests**
- [ ] Test 2.1: Router Workflow Activation
- [ ] Test 2.2: Message Routing - Default (Rensto Support)
- [ ] Test 2.3: Message Routing - Tax4US
- [ ] Test 2.4: Message Routing - MeatPoint

### **Rensto Support Workflow Tests**
- [ ] Test 3.1: Text Message Processing
- [ ] Test 3.2: Voice Message Processing
- [ ] Test 3.3: Image Message Processing
- [ ] Test 3.4: Video Message Processing
- [ ] Test 3.5: Document/PDF Processing

### **Integration & Edge Cases**
- [ ] Test 4.1: Webhook Integration
- [ ] Test 4.2: Error Handling
- [ ] Test 4.3: Concurrent Messages

---

## ✅ **SUCCESS CRITERIA**

**All tests must pass for production readiness**:
- ✅ All sessions WORKING
- ✅ All workflows active
- ✅ All message types processed correctly
- ✅ Routing works for all phone numbers
- ✅ Responses delivered successfully
- ✅ No errors in execution logs
- ✅ Error handling works gracefully

---

## 🚨 **CRITICAL TESTS (Must Pass)**

These tests are **MANDATORY** before considering the system production-ready:

1. **Router Workflow**: Routes messages correctly to all agents
2. **Rensto Support**: Text and voice messages work
3. **Session Status**: All sessions remain WORKING
4. **Message Delivery**: Responses are sent successfully

---

## 📝 **TEST EXECUTION NOTES**

**Date**: _______________  
**Tester**: _______________  
**Environment**: Production (172.245.56.50)

**Results**:
- Total Tests: 15
- Passed: ___
- Failed: ___
- Skipped: ___

**Issues Found**:
1. 
2. 
3. 

**Next Steps**:
1. 
2. 
3. 

---

**Last Updated**: November 25, 2025  
**Status**: 🧪 **READY FOR TESTING**

