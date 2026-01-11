# OpenAI Chat Model Node v1.3 - Complete Configuration Guide

**Date**: November 30, 2025  
**Node Version**: `@n8n/n8n-nodes-langchain.lmChatOpenAi` v1.3  
**Workflow**: Boost.space Data Sync AI Agent  
**Purpose**: Optimal model selection and configuration for automated data synchronization

---

## 🎯 Model Selection Recommendation

### **RECOMMENDED: GPT-4o-mini** ✅

**Why GPT-4o-mini is Best for Boost.space Sync**:

1. **Cost Efficiency**: 
   - Input: $0.15 per million tokens
   - Output: $0.60 per million tokens
   - **67x cheaper** than GPT-4o ($2.50/$10.00)
   - For scheduled syncs running every 15 minutes, this saves significant costs

2. **Performance**:
   - Fast execution (3.2x faster than o1-mini in tests)
   - Excellent tool calling/function calling support
   - Reliable for structured, deterministic tasks
   - Sufficient reasoning for data sync operations

3. **Capabilities**:
   - ✅ Supports function calling (required for HTTP Request Tools)
   - ✅ Supports Responses API (new in v1.3)
   - ✅ Good for structured data operations
   - ✅ Handles JSON responses well

4. **Use Case Match**:
   - Data sync is **deterministic** (not creative)
   - **Structured operations** (query, create, update)
   - **Repetitive tasks** (same logic every run)
   - **Cost-sensitive** (runs frequently)

### **Alternative: GPT-4.1-mini** (If Available)

- Newer model (April 2025)
- Similar cost structure to GPT-4o-mini
- Potentially better performance
- **Use if**: Available in your OpenAI account and shows better results

### **NOT Recommended for This Use Case**:

❌ **GPT-4o**: Too expensive ($2.50/$10.00 per M tokens) for repetitive sync tasks  
❌ **o1/o3 Series**: Designed for complex reasoning, overkill for data sync ($15-60 per M tokens)  
❌ **GPT-4 Turbo**: More expensive, not needed for structured tasks  
❌ **GPT-3.5**: Older, less reliable tool calling

---

## ⚙️ Complete Configuration Settings

### **1. Model Selection**

**Setting**: Model (Resource Locator)  
**Value**: `gpt-4o-mini` (or `gpt-4.1-mini` if available)  
**Mode**: `From List` (select from dropdown)

**How to Set**:
1. Click on Model field
2. Select "From List" mode
3. Search for "gpt-4o-mini"
4. Select it from the list

---

### **2. Use Responses API**

**Setting**: Use Responses API  
**Value**: `true` ✅ (ENABLED)

**Why Enable**:
- New feature in v1.3
- Provides better error handling
- Enables advanced features (Conversation ID, Prompt Cache, etc.)
- Better integration with OpenAI's latest API

**Note**: When enabled, unlocks additional options below.

---

### **3. Built-in Tools**

**Setting**: Built-in Tools  
**Configuration**: **DISABLE ALL** ❌

**Web Search**: ❌ Disabled  
**File Search**: ❌ Disabled  
**Code Interpreter**: ❌ Disabled

**Why Disable**:
- Not needed for Boost.space API operations
- Reduces token usage and costs
- Prevents agent from using unnecessary tools
- Keeps agent focused on HTTP Request Tools only

**How to Set**:
- Leave all built-in tools unchecked/disabled
- Only use your custom HTTP Request Tools

---

### **4. Options → Core Parameters**

#### **Frequency Penalty**
**Value**: `0` (default)  
**Range**: -2 to 2  
**Why**: Data sync responses are structured, not creative. No need to penalize repetition.

#### **Maximum Number of Tokens**
**Value**: `2000`  
**Range**: 1 to 32768  
**Why**: 
- Agent needs enough tokens for summaries and reports
- 2000 is sufficient for sync operation summaries
- Prevents overly long responses
- Balances cost and functionality

            #### **Response Format**
            **Value**: `Text` → **Type**: `Text` → **Verbosity**: `Medium` ⭐
            **Options**:
            - **Type**: Text, JSON Object, JSON Schema
            - **Verbosity** (when Type = Text): Low, Medium, High

            **⚠️ CRITICAL**: `gpt-4o-mini` only supports `Medium` verbosity!
            - **Low**: ❌ **NOT SUPPORTED** by `gpt-4o-mini`
            - **Medium**: ✅ **REQUIRED** for `gpt-4o-mini` (only option)
            - **High**: ❌ **NOT SUPPORTED** by `gpt-4o-mini`

            **Why Medium Verbosity**:
            - **Required**: `gpt-4o-mini` only supports `Medium` verbosity
            - **Still concise**: Medium verbosity is still concise enough for automated sync reports
            - **Cost-effective**: `gpt-4o-mini` is the most cost-effective model
            - **Focused**: Gets to the point (created X, updated Y, errors Z)

            **Verbosity Levels by Model**:
            - **gpt-4o-mini**: Only `Medium` ✅
            - **gpt-4o**: `Low`, `Medium`, `High` (all supported)
            - **gpt-4.1-mini**: `Low`, `Medium`, `High` (all supported)
            - **o1/o3**: `Low`, `Medium`, `High` (all supported)

            **Alternative**: If you need `Low` verbosity, switch to `gpt-4o` (higher cost but supports all verbosity levels)

**Why Text Format**:
- Text is sufficient for sync summaries
- Agent reports in natural language
- No need for structured JSON output
- Simpler and more flexible

**Note**: If you need structured output later, can switch to JSON Schema.

#### **Presence Penalty**
**Value**: `0` (default)  
**Range**: -2 to 2  
**Why**: Not needed for structured data sync tasks.

#### **Sampling Temperature**
**Value**: `0.2` ⭐ **CRITICAL**  
**Range**: 0 to 2  
**Default**: 0.7  
**Why**: 
- **Lower = more deterministic** (perfect for data sync)
- **0.2 ensures consistent behavior** across runs
- Reduces variability in tool selection
- More reliable for automated operations
- **0.7 is too high** for structured tasks (too creative)

**Best Practice**: For data sync/automation, use 0.1-0.3. For creative tasks, use 0.7-1.0.

#### **Timeout**
**Value**: `60000` (60 seconds)  
**Default**: 60000  
**Why**: 
- Gives agent enough time for multiple tool calls
- Sync operations may need 10-20 seconds
- 60 seconds is safe without being excessive

#### **Max Retries**
**Value**: `3`  
**Default**: 2  
**Why**: 
- Network/API calls can fail temporarily
- 3 retries handles transient errors
- Important for scheduled workflows (no human intervention)

#### **Top P**
**Value**: `1` (default) or `0.9`  
**Range**: 0 to 1  
**Why**: 
- Default (1) is fine for most cases
- Can lower to 0.9 for slightly more focused responses
- **Don't adjust both Temperature and Top P** - pick one
- Since we're using Temperature 0.2, Top P = 1 is fine

**Best Practice**: Adjust Temperature OR Top P, not both.

---

### **5. Options → Responses API Features** (v1.3)

These options appear when "Use Responses API" is enabled.

#### **Conversation ID**
**Value**: Leave empty (or use expression for multi-turn conversations)  
**Why**: 
- For scheduled sync, each run is independent
- No need for conversation continuity
- Can use if you want to track sync history

**Optional Expression** (if tracking needed):
```javascript
={{ 'sync-' + new Date().toISOString().split('T')[0] }}
```

#### **Prompt Cache Key**
**Value**: Leave empty (or use for caching)  
**Why**: 
- Can cache identical prompts to save costs
- For sync operations, prompts may vary slightly
- **Optional**: Use if you have repetitive prompts

**Optional Expression** (if caching):
```javascript
={{ 'boost-space-sync-v1' }}
```

#### **Safety Identifier**
**Value**: Leave empty  
**Why**: 
- For internal automation, not needed
- Use if you need to track policy violations
- Can set to workflow ID or user identifier

**Optional Expression**:
```javascript
={{ 'workflow-41dvc6epRUoQIyjs' }}
```

#### **Service Tier**
**Value**: `auto` (default)  
**Options**: Auto, Flex, Default, Priority  
**Why**: 
- `auto` lets OpenAI choose optimal tier
- `priority` for faster responses (costs more)
- `flex` for cost optimization
- For scheduled sync, `auto` is fine

**Recommendation**: Keep `auto` unless you have specific latency requirements.

#### **Metadata**
**Value**: `{}` (empty object) or custom JSON  
**Why**: 
- Optional tracking/metadata
- Can store workflow info, run ID, etc.
- Useful for analytics

**Optional Example**:
```json
{
  "workflow_id": "41dvc6epRUoQIyjs",
  "workflow_name": "INT-SYNC-007",
  "sync_type": "n8n-to-boost-space"
}
```

#### **Top Logprobs**
**Value**: `0` (default)  
**Range**: 0 to 20  
**Why**: 
- Only needed for debugging/model analysis
- Returns probability scores for tokens
- **Not needed for production** - adds overhead
- Keep at 0 unless debugging

#### **Prompt** (Reusable Prompt Template)
**Value**: Leave empty  
**Why**: 
- For reusable prompts configured in OpenAI Dashboard
- Not needed if using system message in AI Agent node
- Can use if you have centralized prompt management

---

## 📊 Complete Configuration Summary

### **Recommended Settings for Boost.space Sync**:

| Setting | Value | Notes |
|---------|-------|-------|
| **Model** | `gpt-4o-mini` | Best cost/performance for sync |
| **Use Responses API** | `true` | Enable for v1.3 features |
| **Built-in Tools** | All disabled | Use only HTTP Request Tools |
| **Frequency Penalty** | `0` | Default |
| **Max Tokens** | `2000` | Enough for summaries |
| **Response Format** | `Text` → `Low` verbosity | Concise summaries |
| **Presence Penalty** | `0` | Default |
| **Temperature** | `0.2` | ⭐ Low for deterministic sync |
| **Timeout** | `60000` | 60 seconds |
| **Max Retries** | `3` | Handle transient errors |
| **Top P** | `1` | Default (or 0.9) |
| **Conversation ID** | Empty | Not needed for sync |
| **Prompt Cache Key** | Empty | Optional for caching |
| **Safety Identifier** | Empty | Optional |
| **Service Tier** | `auto` | Let OpenAI optimize |
| **Metadata** | `{}` | Optional tracking |
| **Top Logprobs** | `0` | Not needed |
| **Prompt Template** | Empty | Use system message instead |

---

## 💰 Cost Analysis

### **GPT-4o-mini Costs** (Recommended):

**Per Sync Operation** (estimated):
- Input tokens: ~500-1000 (system message + user prompt + tool calls)
- Output tokens: ~200-500 (summary report)
- **Total**: ~700-1500 tokens per sync

**Cost per sync**:
- Input: 1000 tokens × $0.15/M = $0.00015
- Output: 500 tokens × $0.60/M = $0.0003
- **Total**: ~$0.00045 per sync

**Monthly cost** (every 15 minutes):
- Runs per day: 96 (24 hours × 4 per hour)
- Runs per month: 2,880
- **Monthly cost**: 2,880 × $0.00045 = **~$1.30/month**

### **GPT-4o Costs** (For Comparison):

- Same usage: **~$8.70/month** (6.7x more expensive)
- Not worth it for automated sync

### **o1/o3 Costs** (For Comparison):

- Same usage: **~$43-130/month** (33-100x more expensive)
- Overkill for data sync

---

## 🎯 Why These Settings Work

### **Temperature 0.2**:
- **Deterministic**: Same input → same tool selection
- **Reliable**: Consistent behavior across runs
- **Focused**: Less likely to make creative/unexpected choices
- **Perfect for automation**: Predictable, repeatable results

### **Max Tokens 2000**:
- **Sufficient**: Enough for detailed sync summaries
- **Cost-effective**: Not excessive
- **Flexible**: Can handle complex sync reports

### **Max Retries 3**:
- **Resilient**: Handles temporary API failures
- **Automated**: No human intervention needed
- **Balanced**: Not too many (wasteful) or too few (fragile)

### **Response Format Text**:
- **Natural**: Easy to read sync summaries
- **Flexible**: Can include any information
- **Simple**: No JSON parsing needed

---

## 🔄 Comparison: Temperature Settings

### **Temperature 0.2** (Recommended):
- ✅ Consistent tool selection
- ✅ Predictable behavior
- ✅ Lower cost (fewer retries)
- ✅ Better for automation

### **Temperature 0.7** (Default):
- ⚠️ More variable tool selection
- ⚠️ May choose different tools for same task
- ⚠️ Less predictable
- ✅ Better for creative tasks

### **Temperature 1.0+** (Creative):
- ❌ Too random for sync
- ❌ Unpredictable tool usage
- ❌ Higher chance of errors
- ✅ Only for creative generation

---

## 🚀 Advanced: Optimizing for Your Use Case

### **If Sync Fails Frequently**:
- Increase **Max Retries** to `5`
- Increase **Timeout** to `90000` (90 seconds)
- Check **Temperature** is `0.2` (not higher)

### **If Responses Are Too Long**:
- Decrease **Max Tokens** to `1000`
- Add instruction in system message: "Keep summaries concise"

### **If You Need Structured Output**:
- Change **Response Format** to `JSON Schema`
- Define schema for sync report structure
- Update system message to request JSON format

### **If Costs Are Too High**:
- Verify **Built-in Tools** are all disabled
- Reduce **Max Tokens** to `1000`
- Use **Prompt Cache Key** for identical prompts
- Consider **Service Tier** = `flex` (if available)

### **If Sync Is Too Slow**:
- Verify **Service Tier** = `auto` or `priority`
- Check **Timeout** isn't too high
- Consider **GPT-4.1-mini** if available (may be faster)

---

## ✅ Final Recommendation

### **For Boost.space Sync Workflow**:

**Model**: `gpt-4o-mini`  
**Temperature**: `0.2`  
**Max Tokens**: `2000`  
**Max Retries**: `3`  
**Response Format**: `Text`  
**Built-in Tools**: All disabled  
**Use Responses API**: `true`

**Expected Performance**:
- ✅ Reliable, consistent sync operations
- ✅ Cost-effective (~$1.30/month)
- ✅ Fast execution (~5-15 seconds per sync)
- ✅ Good error handling
- ✅ Clear, readable summaries

---

## 📚 Additional Resources

- **OpenAI Model Comparison**: [OpenAI Models](https://platform.openai.com/docs/models)
- **n8n OpenAI Chat Model Docs**: [n8n Documentation](https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.lmchatopenai/)
- **Temperature Guide**: Lower = deterministic, Higher = creative
- **Responses API**: New in OpenAI API, enables advanced features

---

**Last Updated**: November 30, 2025  
**Status**: Complete Configuration Guide - Ready for Implementation
