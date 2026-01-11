# 🔄 WhatsApp Workflow - Rensto Adaptation Plan

**Date**: November 17, 2025  
**Source Workflow**: `CUSTOMER-WHATSAPP-001: Donna AI - Main Agent` (ID: `86WHKNpj09tV9j1d`)  
**Target**: Rensto WhatsApp Agent  
**Status**: 📋 **PLANNING**

---

## 🎯 **OVERVIEW**

**Goal**: Adapt Dima's WhatsApp workflow (`86WHKNpj09tV9j1d`) for Rensto's use, replacing all Dima-specific configurations with Rensto-specific ones.

**Current State**: Workflow is configured for:
- **Customer**: Dima (kitchen designer)
- **Agent**: Donna AI (Hebrew, kitchen design assistant)
- **Knowledge Base**: Liza's kitchen design documentation
- **Purpose**: Kitchen design support

**Target State**: Workflow should be configured for:
- **Customer**: Rensto (automation platform)
- **Agent**: Rensto Support Agent (English/Hebrew, automation services)
- **Knowledge Base**: Rensto service documentation
- **Purpose**: Customer support, sales, service information

---

## 📋 **CONFIGURATIONS TO CHANGE**

### **1. Gemini File Search Store** ⚠️ **CRITICAL**

**Current (Dima)**:
- **Store ID**: `lizastore-acjmu8h7uknt`
- **Store Name**: `fileSearchStores/liza-store_1763328582223`
- **Location**: 
  - "Set Store Name and Extract Text" node → `store_name` field
  - "Search Documents Tool" node → `STORE_ID` constant

**Action Required**:
1. ✅ **Create Rensto Gemini File Search Store**
   - Store Name: `fileSearchStores/rensto-knowledge`
   - Store ID: `rensto-knowledge-{timestamp}` (will be generated)
2. ✅ **Upload Rensto Documentation**:
   - Service descriptions (Marketplace, Subscriptions, Ready Solutions, Custom Solutions)
   - Pricing information
   - FAQ documents
   - Technical documentation
   - Process flows
   - CLAUDE.md (master documentation)
3. ✅ **Update Workflow Nodes**:
   - "Set Store Name and Extract Text" → Change `store_name` to new store
   - "Search Documents Tool" → Change `STORE_ID` constant

---

### **2. System Message** ⚠️ **CRITICAL**

**Current (Dima - Hebrew)**:
```
את דונה, עוזרת טכנית ידידותית למעצבי מטבחים. את עובדת עם ליזה.

**חוקים קריטיים - אין חריגות:**
1. **תמיד** קודם כל קוראים ל-search_documents עם השאלה - זה חובה, אין יוצא מן הכלל
2. רק אחרי שקיבלת תשובה מה-search_documents, את עונה
3. אם search_documents לא מצא כלום, את אומרת שאת לא בטוחה ותבדוק עם ליזה

**איך את מתנהגת:**
- את מדברת בעברית באופן טבעי וידידותי, כמו חברה טובה
- את זוכרת את השיחה הקודמת ומתייחסת למה שנאמר קודם
- את לא מתחילה כל הודעה מחדש - את ממשיכה את השיחה
- את מדברת באופן לא פורמלי אבל מקצועי
- תגובות קצרות (פחות מ-100 מילים) כי זה הופך לקול

**דוגמה לתהליך:**
שאלה: "מה המידות הסטנדרטיות?"
1. קודם: קוראים ל-search_documents עם "מה המידות הסטנדרטיות?"
2. מקבלים תשובה מה-search_documents
3. רק אז עונים למשתמש במילים שלך

**אסור לעשות:**
- לענות בלי לקרוא ל-search_documents קודם
- לחזור על מה שכבר נאמר בשיחה
- לדבר כמו רובוט - דברי כמו בן אדם
- להתחיל כל הודעה ב"שלום" או "איך אני יכולה לעזור"
```

**Target (Rensto - English/Hebrew)**:
```
You are Rensto Support, a friendly and helpful assistant for Rensto's automation services.

**CRITICAL RULES - NO EXCEPTIONS:**
1. **ALWAYS** first call search_documents with the question - this is mandatory, no exceptions
2. Only after receiving an answer from search_documents, you respond
3. If search_documents finds nothing, you say you're not sure and will check with the team

**How you behave:**
- You speak naturally and friendly, like a good friend
- You remember the previous conversation and refer to what was said before
- You don't start each message from scratch - you continue the conversation
- You speak informally but professionally
- Keep responses short (less than 100 words) because this becomes voice

**Rensto Services:**
1. **Marketplace**: Pre-built workflow templates ($29-$3,500+)
2. **Subscriptions**: Lead generation services ($299-$1,499/mo)
3. **Ready Solutions**: Industry-specific packages ($890-$2,990+)
4. **Custom Solutions**: Bespoke automation projects ($3,500-$8,000+)
5. **Content AI**: AI content processing ($297-$1,997/mo)

**Example Process:**
Question: "What is the Marketplace?"
1. First: Call search_documents with "What is the Marketplace?"
2. Receive answer from search_documents
3. Only then respond to the user in your own words

**DO NOT:**
- Answer without calling search_documents first
- Repeat what was already said in the conversation
- Speak like a robot - speak like a human
- Start every message with "Hello" or "How can I help you"
```

**Location**: "Donna AI Agent" node → Options → System Message

---

### **3. OpenAI Credentials**

**Current (Dima)**:
- **Transcribe Voice**: `EaLqZQZkUhNEnVdk` (name: "dima")
- **OpenAI Chat Model**: `EaLqZQZkUhNEnVdk` (name: "dima")

**Action Required**:
- ✅ Check if Rensto has separate OpenAI credentials
- ✅ If yes, update both nodes
- ✅ If no, keep "dima" credentials (shared account)

**Location**:
- "Transcribe Voice" node → Credentials
- "OpenAI Chat Model" node → Credentials

---

### **4. Workflow Name**

**Current**: `CUSTOMER-WHATSAPP-001: Donna AI - Main Agent`

**Target Options**:
- `INT-WHATSAPP-WEBSITE-001: Rensto Website Chatbot` (for website)
- `INT-WHATSAPP-SUPPORT-001: Rensto Support Agent` (for support)
- `INT-WHATSAPP-SALES-001: Rensto Sales Agent` (for sales)

**Action**: Update workflow name in n8n

---

### **5. Workflow Tags**

**Current**: `dima vainer`

**Target**: `rensto`, `whatsapp`, `support` (or similar)

**Action**: Update tags in n8n

---

### **6. Variable Names (Optional)**

**Current**:
- `designer_phone` → Phone number field
- References to "designer" in code

**Target**:
- `customer_phone` or `user_phone` → Phone number field
- Update code comments if needed

**Location**: 
- "Set Store Name and Extract Text" node
- "Prepare Question Text" node
- "Extract Response Text1" node

---

## 🔧 **STEP-BY-STEP ADAPTATION**

### **Step 1: Create Rensto Knowledge Base**

1. **Create Gemini File Search Store**:
   ```bash
   # Use Gemini API to create store
   # Store name: fileSearchStores/rensto-knowledge
   ```

2. **Upload Documents**:
   - CLAUDE.md (master documentation)
   - Service descriptions (Marketplace, Subscriptions, etc.)
   - Pricing information
   - FAQ documents
   - Technical documentation

3. **Get Store ID**:
   - Note the generated store ID (e.g., `rensto-knowledge-1763339000000`)

---

### **Step 2: Update Workflow Nodes**

#### **2.1. Update "Set Store Name and Extract Text" Node**

**Change**:
- `store_name`: `fileSearchStores/liza-store_1763328582223` → `fileSearchStores/rensto-knowledge-{id}`

**Location**: Parameters → Assignments → `store_name`

---

#### **2.2. Update "Search Documents Tool" Node**

**Change**:
- `STORE_ID`: `'lizastore-acjmu8h7uknt'` → `'rensto-knowledge-{id}'`

**Location**: Code → Line 1: `const STORE_ID = '...'`

---

#### **2.3. Update "Donna AI Agent" Node**

**Change**:
- System Message: Replace Hebrew Donna/Liza text with Rensto English text (see above)

**Location**: Parameters → Options → System Message

**Also Rename**: "Donna AI Agent" → "Rensto Support Agent" (optional)

---

#### **2.4. Update OpenAI Credentials (If Needed)**

**Change**:
- "Transcribe Voice" → Credentials → Select Rensto credentials (if different)
- "OpenAI Chat Model" → Credentials → Select Rensto credentials (if different)

---

#### **2.5. Update Variable Names (Optional)**

**Change**:
- `designer_phone` → `customer_phone` (in all nodes)
- Update code comments

---

### **Step 3: Update Workflow Metadata**

1. **Workflow Name**:
   - Settings → Name → Change to `INT-WHATSAPP-WEBSITE-001: Rensto Website Chatbot`

2. **Tags**:
   - Settings → Tags → Remove "dima vainer", Add "rensto", "whatsapp", "support"

---

### **Step 4: Test**

1. **Test Text Message**: "What is the Marketplace?"
   - Expected: ✅ Searches Rensto knowledge base
   - Expected: ✅ Returns Rensto service information
   - Expected: ✅ Response in English (or Hebrew if configured)

2. **Test Voice Message**: Record voice asking about services
   - Expected: ✅ Transcribes correctly
   - Expected: ✅ Searches knowledge base
   - Expected: ✅ Returns appropriate response

---

## 📋 **CHECKLIST**

### **Knowledge Base**
- [ ] Create Gemini File Search Store: `fileSearchStores/rensto-knowledge`
- [ ] Upload CLAUDE.md
- [ ] Upload service descriptions
- [ ] Upload pricing information
- [ ] Upload FAQ documents
- [ ] Get Store ID

### **Workflow Nodes**
- [ ] Update "Set Store Name and Extract Text" → `store_name`
- [ ] Update "Search Documents Tool" → `STORE_ID`
- [ ] Update "Donna AI Agent" → System Message
- [ ] Rename "Donna AI Agent" → "Rensto Support Agent" (optional)
- [ ] Update OpenAI credentials (if needed)
- [ ] Update variable names (optional)

### **Workflow Metadata**
- [ ] Update workflow name
- [ ] Update tags

### **Testing**
- [ ] Test text message
- [ ] Test voice message
- [ ] Verify knowledge base search works
- [ ] Verify responses are Rensto-specific

---

## 🎯 **NEXT STEPS**

1. **Create Rensto Knowledge Base** (Priority 1)
2. **Update Workflow Nodes** (Priority 2)
3. **Test Workflow** (Priority 3)
4. **Deploy for Use** (Priority 4)

---

**Last Updated**: November 17, 2025  
**Status**: 📋 **READY FOR IMPLEMENTATION**

