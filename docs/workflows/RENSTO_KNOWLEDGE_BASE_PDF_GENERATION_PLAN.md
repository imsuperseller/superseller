# 📄 Rensto Knowledge Base - PDF Generation Plan

**Date**: November 17, 2025  
**Purpose**: Create PDF files from codebase documentation for Gemini File Search Store  
**Target Store**: `fileSearchStores/rensto-knowledge-base-ndf9fmymwb2p`  
**Status**: 📋 **PLANNING**

---

## 🎯 **OVERVIEW**

**Goal**: Convert key Rensto documentation files to PDF format and upload them to the Gemini File Search Store for the WhatsApp agent to use.

**Approach**:
1. Identify essential documentation files
2. Convert markdown files to PDF
3. Upload via File Upload Form in workflow
4. Verify documents are searchable

---

## 📋 **DOCUMENTATION TO CONVERT**

### **Priority 1: Core Business Documentation** (Essential)

| File | Size | Priority | Description |
|------|------|----------|-------------|
| `CLAUDE.md` | ~1MB | ⭐⭐⭐⭐⭐ | Master documentation - MUST HAVE |
| `docs/business/RENSTO_BUSINESS_ROADMAP_2025.md` | ~50KB | ⭐⭐⭐⭐⭐ | Business strategy |
| `docs/business/BUSINESS_MODEL_CANVAS.md` | ~30KB | ⭐⭐⭐⭐ | Business model |
| `docs/business/IMPLEMENTATION_AUDIT_2025.md` | ~40KB | ⭐⭐⭐⭐ | Implementation status |

### **Priority 2: Service Documentation** (High)

| File | Size | Priority | Description |
|------|------|----------|-------------|
| `docs/products/CONTENT_AI_SYSTEM_OVERVIEW.md` | ~20KB | ⭐⭐⭐⭐ | Content AI service |
| `docs/website/RENSTO_WEBSITE_AGENT_MASTER_PLAN.md` | ~30KB | ⭐⭐⭐ | Website agent info |
| Service descriptions (from CLAUDE.md) | ~50KB | ⭐⭐⭐⭐⭐ | Marketplace, Subscriptions, etc. |

### **Priority 3: Technical Documentation** (Medium)

| File | Size | Priority | Description |
|------|------|----------|-------------|
| `docs/infrastructure/WEBSITE_CURRENT_STATUS.md` | ~15KB | ⭐⭐⭐ | Current architecture |
| `docs/n8n/` (key files) | ~100KB | ⭐⭐⭐ | n8n workflow docs |
| `docs/workflows/WHATSAPP_MULTI_AGENT_ARCHITECTURE.md` | ~20KB | ⭐⭐⭐ | WhatsApp architecture |

### **Priority 4: FAQ & Support** (Medium)

| File | Size | Priority | Description |
|------|------|----------|-------------|
| `README.md` | ~10KB | ⭐⭐⭐ | Quick reference |
| FAQ documents (if exist) | TBD | ⭐⭐⭐ | Common questions |

---

## 🔧 **PDF GENERATION METHODS**

### **Method 1: Markdown to PDF (Recommended)**

**Tools**:
- **Pandoc** (command-line, best quality)
- **Markdown PDF** (npm package)
- **md-to-pdf** (npm package)

**Command** (Pandoc):
```bash
pandoc CLAUDE.md -o CLAUDE.pdf \
  --pdf-engine=xelatex \
  --variable mainfont="Arial" \
  --variable fontsize=11pt \
  -V geometry:margin=1in
```

**Command** (md-to-pdf):
```bash
npx md-to-pdf CLAUDE.md --pdf-options '{"format": "A4", "margin": {"top": "20mm", "right": "20mm", "bottom": "20mm", "left": "20mm"}}'
```

---

### **Method 2: Browser Print to PDF**

**Steps**:
1. Open markdown file in VS Code with Markdown Preview
2. Right-click → "Open Preview"
3. Right-click preview → "Print" or Cmd+P
4. Save as PDF

**Pros**: Simple, no tools needed  
**Cons**: Manual, one file at a time

---

### **Method 3: Script-Based Batch Conversion**

**Create script** to:
1. Find all markdown files
2. Convert each to PDF
3. Save to `docs/pdfs/` directory
4. Generate upload checklist

---

## 📂 **RECOMMENDED FILE STRUCTURE**

```
docs/
├── pdfs/                    # Generated PDFs (gitignored)
│   ├── CLAUDE.pdf
│   ├── RENSTO_BUSINESS_ROADMAP_2025.pdf
│   ├── BUSINESS_MODEL_CANVAS.pdf
│   ├── SERVICE_DESCRIPTIONS.pdf
│   └── ...
└── scripts/
    └── generate-pdfs.js     # PDF generation script
```

---

## 🎯 **UPLOAD STRATEGY**

### **Option 1: Single Consolidated PDF** (Recommended)

**Create**: `RENSTO_COMPLETE_KNOWLEDGE_BASE.pdf`
- Combine all essential docs into one PDF
- Easier to manage
- Single upload
- Better for search (all content in one place)

**Contents**:
1. CLAUDE.md (master doc)
2. Business Roadmap
3. Service Descriptions
4. FAQ
5. Technical Overview

---

### **Option 2: Multiple Focused PDFs** (Alternative)

**Create separate PDFs**:
- `RENSTO_BUSINESS_OVERVIEW.pdf` (business model, roadmap)
- `RENSTO_SERVICES.pdf` (all 5 service types)
- `RENSTO_TECHNICAL.pdf` (architecture, tech stack)
- `RENSTO_FAQ.pdf` (common questions)

**Pros**: More organized, easier to update individual sections  
**Cons**: More uploads, need to maintain multiple files

---

## 🔧 **IMPLEMENTATION PLAN**

### **Phase 1: Setup PDF Generation**

1. **Install Tools**:
   ```bash
   # Option A: Pandoc (best quality)
   brew install pandoc basictex  # macOS
   
   # Option B: npm packages
   npm install -g md-to-pdf
   ```

2. **Create Script**: `scripts/generate-rensto-pdfs.js`
   - Reads list of files to convert
   - Converts each to PDF
   - Saves to `docs/pdfs/`
   - Generates upload checklist

---

### **Phase 2: Generate PDFs**

1. **Priority 1 Files** (Essential):
   - CLAUDE.md → `CLAUDE.pdf`
   - Business Roadmap → `RENSTO_BUSINESS_ROADMAP_2025.pdf`
   - Business Model → `BUSINESS_MODEL_CANVAS.pdf`

2. **Priority 2 Files** (High):
   - Service descriptions → `RENSTO_SERVICES.pdf`
   - Content AI → `CONTENT_AI_SYSTEM_OVERVIEW.pdf`

3. **Priority 3 Files** (Medium):
   - Technical docs → `RENSTO_TECHNICAL.pdf`
   - Workflow docs → `RENSTO_WORKFLOWS.pdf`

---

### **Phase 3: Upload to Store**

1. **Access File Upload Form**:
   - URL: `http://173.254.201.134:5678/form/0509cfab-f2e9-40fc-a268-8b966efb8305`
   - Or: Workflow → "File Upload Form" node → Copy webhook URL

2. **Upload Each PDF**:
   - Drag and drop or browse
   - Wait for confirmation
   - Verify in Gemini dashboard (if accessible)

3. **Test Search**:
   - Send WhatsApp message: "What is the Marketplace?"
   - Verify agent finds relevant info

---

## 📋 **CHECKLIST**

### **PDF Generation**
- [ ] Install PDF generation tool (Pandoc or md-to-pdf)
- [ ] Create `scripts/generate-rensto-pdfs.js`
- [ ] Generate Priority 1 PDFs
- [ ] Generate Priority 2 PDFs
- [ ] Generate Priority 3 PDFs (optional)
- [ ] Verify PDF quality (readable, formatted correctly)

### **Upload**
- [ ] Upload CLAUDE.pdf
- [ ] Upload Business Roadmap PDF
- [ ] Upload Service Descriptions PDF
- [ ] Upload FAQ PDF (if created)
- [ ] Verify all uploads successful

### **Testing**
- [ ] Test search: "What is the Marketplace?"
- [ ] Test search: "What are your subscription plans?"
- [ ] Test search: "How much does Custom Solutions cost?"
- [ ] Verify responses are accurate and helpful

---

## 🎯 **RECOMMENDED APPROACH**

**Start with Single Consolidated PDF**:

1. **Create**: `RENSTO_COMPLETE_KNOWLEDGE_BASE.pdf`
   - Combine CLAUDE.md + key business docs
   - Single file, easier to manage
   - Better search results (all context in one place)

2. **Upload**: One upload via File Upload Form

3. **Test**: Verify agent can answer Rensto questions

4. **Expand**: Add more PDFs later if needed

---

**Last Updated**: November 17, 2025  
**Status**: 📋 **READY FOR IMPLEMENTATION**

