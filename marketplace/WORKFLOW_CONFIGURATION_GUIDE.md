# Marketplace Workflow Configuration Guide

## Research Summary: Latest Node Versions

- ✅ AI Agent node: **v3** (Latest)
- ✅ OpenAI Chat Model: **v1.3** (Latest)
- ✅ Simple Memory: **v1.3** (Latest - NOT NEEDED)
- ✅ Schedule Trigger: **v1.2** (Latest)
- ✅ Edit Fields (Set): **v3.4** (Latest)
- ✅ n8n node: **v1** (Latest)
- ✅ Code node: **v2** (Latest)

---

## Configuration for Each AI Agent

### 1. AI Agent: Detect Secrets

**Purpose**: Scan workflow JSON for API keys, emails, secrets, credentials

**Configuration**:
```yaml
Node: AI Agent (v3)
Model: OpenAI Chat Model (v1.3)
  - Model: gpt-4o-mini
  - Max Tokens: 2000
  - Temperature: 0.2  # LOW - Need consistent, deterministic detection
  - Top P: 1.0
  
Memory: NONE  # Stateless - each workflow is independent

Tools: NONE  # Pure text analysis, no external API calls needed

Prompt: (already set in your workflow)
```

**Why these settings?**:
- **Temperature 0.2**: Very low for consistency in secret detection. We don't want creativity here, we want it to reliably find the same patterns every time.
- **2000 tokens**: Workflows can have many nodes, need enough tokens to analyze and return full JSON array
- **No Memory**: Each workflow generalization is independent
- **No Tools**: Just analyzing JSON text, no need to call external APIs

---

### 2. AI Agent: Generate Documentation

**Purpose**: Create Markdown setup guides for marketplace customers

**Configuration**:
```yaml
Node: AI Agent (v3)
Model: OpenAI Chat Model (v1.3)
  - Model: gpt-4o-mini
  - Max Tokens: 2500
  - Temperature: 0.7  # MODERATE - Need creative, helpful documentation
  - Top P: 1.0
  
Memory: NONE  # Stateless - each workflow is independent

Tools: NONE  # Pure text generation, no external APIs needed

Prompt: (already set in your workflow)
```

**Why these settings?**:
- **Temperature 0.7**: Moderate creativity for natural, helpful documentation writing
- **2500 tokens**: Setup guides can be lengthy (Overview, Prerequisites, Steps, Variables, Testing, Troubleshooting)
- **No Memory**: Each documentation is self-contained
- **No Tools**: Just generating Markdown text

---

### 3. AI Agent: Calculate Pricing

**Purpose**: Calculate DIY and Full Service pricing based on complexity

**Configuration**:
```yaml
Node: AI Agent (v3)
Model: OpenAI Chat Model (v1.3)
  - Model: gpt-4o-mini
  - Max Tokens: 500
  - Temperature: 0.5  # LOW-MODERATE - Consistent pricing with some reasoning flexibility
  - Top P: 1.0
  
Memory: NONE  # Stateless - each workflow is priced independently

Tools: NONE  # Pure calculation, no external APIs needed

Prompt: (already set in your workflow)
```

**Why these settings?**:
- **Temperature 0.5**: Lower for consistent pricing logic, but enough flexibility for reasoning
- **500 tokens**: Only returning small JSON object + brief reasoning
- **No Memory**: Each pricing calculation is independent
- **No Tools**: Just math and logic based on complexity score

---

## Other Node Configurations

### Schedule Trigger (v1.2)

**Purpose**: Run automatically to process all 5 workflows

**Recommended Configuration**:
```yaml
Trigger Type: Interval
Interval: Every day at 3:00 AM
  OR
Interval: Every Monday at 9:00 AM

Timezone: America/Chicago (your timezone)
```

**Why**:
- Batch process all 5 workflows overnight
- You wake up to 5 WhatsApp pricing approvals
- Low server load time

---

### Set Workflow ID (Edit Fields v3.4)

**Current**: Single workflow ID hardcoded

**Improvement Option**: Loop through all 5
```yaml
# Keep as-is for testing, but could enhance with:
assignments:
  - workflow_id: "cJbG8MpomtNrR1Sa"  # Current
  
# OR use Code node before to loop through array:
workflow_ids: [
  "cJbG8MpomtNrR1Sa",
  "C56KDpSOgzIwf42S", 
  "zgFBKmbMWbnqZiwk",
  "tDkJbZYRVgmGuByz",
  "1ORV3KSLVRwqUbY0"
]
```

---

## Tools Assessment: Do We Need Any?

**Available n8n Tool Types**:
- Calculator Tool
- Code Tool  
- HTTP Request Tool
- Text Classifier Tool
- Vector Store Tool
- Wikipedia Tool
- Wolfram Alpha Tool

**Answer**: ❌ **NONE NEEDED**

**Why**:
- **Detect Secrets**: Just regex/pattern matching in text → No tools
- **Generate Documentation**: Just text generation → No tools  
- **Calculate Pricing**: Simple math based on provided data → No tools

All three agents have everything they need in their prompts and the input data.

---

## Memory Assessment: Do We Need It?

**Simple Memory (v1.3)**: Stores conversation history

**Answer**: ❌ **NOT NEEDED**

**Why**:
- Each workflow generalization is a **one-shot operation**
- No back-and-forth conversation
- No context from previous workflows needed
- Stateless = faster + cheaper

---

## Final Recommended Workflow Structure

```
Trigger: Schedule Trigger (Daily 3 AM)
  ↓
Set Workflow ID (hardcoded or loop)
  ↓
Get a workflow (n8n node - fetch from API)
  ↓
Extract Metadata (Code node)
  ↓
  ├→ AI Agent: Detect Secrets
  │    ├─ OpenAI Chat Model (gpt-4o-mini, temp=0.2, 2000 tokens)
  │    └─ NO Memory, NO Tools
  │    ↓
  │  Apply Sanitization (Code node)
  │    ↓
  │  AI Agent: Generate Docs
  │    ├─ OpenAI Chat Model (gpt-4o-mini, temp=0.7, 2500 tokens)
  │    └─ NO Memory, NO Tools
  │
  └→ Analyze Complexity (Code node)
      ↓
    AI Agent: Calculate Pricing
      ├─ OpenAI Chat Model (gpt-4o-mini, temp=0.5, 500 tokens)
      └─ NO Memory, NO Tools
      
Both paths merge →
Send WhatsApp Notification (WAHA node)
```

---

## Cost Optimization

**Using gpt-4o-mini**:
- **Input**: ~$0.15 / 1M tokens
- **Output**: ~$0.60 / 1M tokens

**Per workflow generalization** (~5000 total tokens):
- Cost: ~$0.003 (less than a penny!)

**All 5 workflows**: ~$0.015 total

**Why not gpt-4o or Claude**:
- gpt-4o: 10x more expensive, overkill for this task
- Claude: Great alternative, but OpenAI credentials already set up
- gpt-4o-mini: Perfect balance of quality + cost

---

## Summary

✅ **Keep**: Schedule Trigger (for automation)  
❌ **Delete**: WAHA Trigger, Form Trigger, Webhook, Chat Trigger (not needed)  

✅ **Configure 3 AI Agents with**:
- OpenAI Chat Model (gpt-4o-mini)
- Different temperatures: 0.2, 0.7, 0.5
- Different max tokens: 2000, 2500, 500
- NO Memory
- NO Tools

✅ **Test**: Run manually first, then enable Schedule Trigger
