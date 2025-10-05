# 🔧 BOOST.SPACE MCP REBUILD PLAN

**Date**: October 5, 2025
**Issue**: Current migration used direct API calls, not proper MCP tools
**Goal**: Rebuild with full MCP toolset and achieve "100% synced" verification

---

## ❌ WHAT I DID WRONG

**My Approach**:
- Direct `curl` REST API calls
- Manual field mapping in JavaScript
- One-by-one record creation
- No schema validation
- No bulk operations
- No verification tools
- Can't prove "100% synced"

**Problems**:
1. No schema validation → might have wrong field types
2. No bulk operations → slow, inefficient
3. No verification → can't prove data integrity
4. No activity log → can't track what happened
5. No metrics → can't prove "100% complete"

---

## ✅ PROPER APPROACH WITH MCP TOOLS

### **Phase 1: Rebuild MCP Server** (30 min)

Add all 40+ tools to `/infra/mcp-servers/boost-space-mcp-server/server.js`:

**Data Layer (11 tools)**:
- `list_modules()` - Get all available modules
- `describe_module_schema({ module_id })` - Get field schemas
- `query_records({ module_id, filters, sort, limit })` - Query with filters
- `get_record({ module_id, record_id })` - Get single record
- `create_record({ module_id, values })` - Create one record
- `update_record({ module_id, record_id, values })` - Update record
- `delete_record({ module_id, record_id })` - Delete record
- `bulk_upsert_records({ module_id, rows[], key })` - **BULK ETL** ⭐
- `bulk_delete_records({ module_id, record_ids[] })` - Bulk delete
- `add_record_comment({ module_id, record_id, message })` - Add notes
- `attach_file_to_record({ module_id, record_id, file_url, field })` - Upload files

**Search & Analytics (4 tools)**:
- `search_records_fulltext({ module_id, q, limit })` - Full-text search
- `aggregate_records({ module_id, group_by[], metrics[] })` - **VERIFY COUNTS** ⭐
- `get_module_metrics({ module_id, window })` - Get totals by status
- `get_activity_log({ since?, until?, module_id? })` - **AUDIT TRAIL** ⭐

**Automation (5 tools)**:
- `list_scenarios()` - List all scenarios
- `run_scenario({ scenario_id, input })` - Trigger scenario
- `get_run_status({ run_id })` - Check execution
- `cancel_run({ run_id })` - Stop execution
- `trigger_webhook({ url, payload })` - Fire webhooks

**Calendar (5 tools)**:
- `list_calendars()` / `list_events({ calendar_id })`
- `create_calendar_event({ calendar_id, title, start, end })`
- `update_calendar_event({ calendar_id, event_id, patch })`
- `delete_calendar_event({ calendar_id, event_id })`
- `sync_calendar({ mode: "pull"|"push"|"two_way" })`

**Users & Access (3 tools)**:
- `list_users()` / `get_user({ user_id })`
- `set_record_permissions({ module_id, record_id, grants[] })`
- `list_webhooks()` / `register_webhook()` / `delete_webhook()`

**Files (3 tools)**:
- `upload_file({ name, bytes|url, mime })` - Upload file
- `get_file({ file_id })` - Get file
- `delete_file({ file_id })` - Delete file

**HTTP (1 tool)**:
- `http_request({ method, url, headers?, body? })` - Generic API calls

---

### **Phase 2: Verify Current Migration** (10 min)

Use MCP tools to check what's actually in Boost.space:

```javascript
// 1. List all modules
const modules = await mcp.list_modules();
// Expected: product, note, business-case, etc.

// 2. Describe schemas
const productSchema = await mcp.describe_module_schema({ module_id: 'product' });
const noteSchema = await mcp.describe_module_schema({ module_id: 'note' });
const businessCaseSchema = await mcp.describe_module_schema({ module_id: 'business-case' });

// 3. Count records in each space
const productCount = await mcp.aggregate_records({
  module_id: 'product',
  group_by: ['spaces'],
  metrics: [{ field: 'id', op: 'count' }]
});
// Expected: Space 39 = 17 records

const noteCount = await mcp.aggregate_records({
  module_id: 'note',
  group_by: ['spaceId'],
  metrics: [{ field: 'id', op: 'count' }]
});
// Expected: Space 41 = 24 records

// 4. Get activity log
const activity = await mcp.get_activity_log({ since: '2025-10-05T00:00:00Z' });
// See all creates/updates from today
```

**Verification Checklist**:
- [ ] Space 39 has exactly 17 products
- [ ] Space 41 has exactly 24 notes
- [ ] All field types match schema
- [ ] No orphaned records
- [ ] Activity log shows all migrations

---

### **Phase 3: Redo Migration Properly** (30 min)

**NEW: Use bulk_upsert_records instead of one-by-one**

```javascript
// OLD WAY (what I did):
for (const server of mcpServers) {
  await axios.post('/api/product', { name: server.name, ... });
  await sleep(200); // Rate limiting
}
// Result: 17 API calls, 3.4 seconds

// NEW WAY (proper):
const rows = mcpServers.map(server => ({
  name: server['Server Name'],
  sku: server['Server ID'],
  description: buildDescription(server),
  spaces: [39],
  unit: 'pcs',
  unit_name: 'ks'
}));

await mcp.bulk_upsert_records({
  module_id: 'product',
  rows: rows,
  key: 'sku' // Use sku as unique identifier
});
// Result: 1 API call, < 1 second, automatic deduplication
```

**Benefits**:
- ✅ 17x faster
- ✅ Automatic schema validation
- ✅ Deduplication via key
- ✅ Transactional (all-or-nothing)
- ✅ Better error messages

---

### **Phase 4: Rebuild INT-SYNC-001** (20 min)

**OLD: Direct n8n API → Direct Boost.space API**
```javascript
// n8n workflow with direct HTTP requests
GET http://173.254.201.134:5678/api/v1/workflows
POST https://superseller.boost.space/api/business-case
```

**NEW: Use MCP tools**
```javascript
// In n8n Code node:
const workflows = await n8n.getWorkflows();

// Transform
const rows = workflows.map(w => ({
  name: w.name,
  description: `n8n ID: ${w.id} | Active: ${w.active} | Tags: ${w.tags.join(', ')}`,
  spaceId: 43,
  status_system_id: w.active ? 1 : 2
}));

// Bulk upsert via MCP
await mcp.bulk_upsert_records({
  module_id: 'business-case',
  rows: rows,
  key: 'description' // Match on n8n ID in description
});

// Verify
const count = await mcp.aggregate_records({
  module_id: 'business-case',
  metrics: [{ field: 'id', op: 'count' }]
});
// Expected: 56 workflows
```

---

### **Phase 5: Verify 100% Sync** (10 min)

**Run comprehensive verification**:

```javascript
// 1. Count all records
const summary = {
  products: await mcp.aggregate_records({
    module_id: 'product',
    metrics: [{ field: 'id', op: 'count' }]
  }),
  notes: await mcp.aggregate_records({
    module_id: 'note',
    metrics: [{ field: 'id', op: 'count' }]
  }),
  businessCases: await mcp.aggregate_records({
    module_id: 'business-case',
    metrics: [{ field: 'id', op: 'count' }]
  })
};

// 2. Verify expected totals
assert(summary.products.count === 17, 'MCP Servers');
assert(summary.notes.count === 24, 'Business References');
assert(summary.businessCases.count === 56, 'n8n Workflows');

// 3. Get module metrics
const productMetrics = await mcp.get_module_metrics({
  module_id: 'product',
  window: 'today'
});
// Shows: 17 active products in Space 39

// 4. Full-text search verification
const searchResults = await mcp.search_records_fulltext({
  module_id: 'product',
  q: 'n8n-mcp',
  limit: 10
});
// Should find n8n-mcp server

// 5. Activity log audit
const audit = await mcp.get_activity_log({
  since: '2025-10-05T00:00:00Z',
  module_id: 'product'
});
// Should show 17 creates with bulk_upsert_records
```

**100% Sync Criteria**:
- ✅ 17 MCP servers in Space 39 (products)
- ✅ 24 business references in Space 41 (notes)
- ✅ 56 n8n workflows in Space 43 (business-cases)
- ✅ All schemas validated
- ✅ Activity log confirms all operations
- ✅ Full-text search works
- ✅ Metrics show correct totals by space
- ✅ **Total: 97 records, 0 errors, 100% verified**

---

## 🚀 EXECUTION PLAN

### **Step 1: Add All MCP Tools** (NOW - 30 min)
1. Read full Boost.space MCP tool list
2. Add all 40+ tools to `server.js`
3. Add proper JSON schemas for each tool
4. Test tools locally

### **Step 2: Verify Current State** (10 min)
1. Run `list_modules()` - see what exists
2. Run `aggregate_records()` - count current records
3. Document actual vs expected
4. Check for errors/missing data

### **Step 3: Redo Migration** (30 min)
1. Delete current records (or keep as backup)
2. Re-migrate using `bulk_upsert_records`
3. Use proper schema from `describe_module_schema`
4. Verify with `aggregate_records`

### **Step 4: Rebuild INT-SYNC-001** (20 min)
1. Update workflow to use MCP tools
2. Use `bulk_upsert_records` instead of HTTP
3. Add verification step with `aggregate_records`
4. Test manual execution

### **Step 5: Final Verification** (10 min)
1. Run all aggregate queries
2. Check activity log
3. Verify search works
4. Document "100% synced" proof

**Total Time**: ~2 hours to do it properly

---

## 📊 COMPARISON: OLD vs NEW

| Metric | OLD (Direct API) | NEW (MCP Tools) |
|--------|-----------------|-----------------|
| Migration Speed | 3.4 seconds (17 calls) | < 1 second (1 bulk call) |
| Schema Validation | None | Automatic |
| Error Handling | Manual try-catch | Built-in validation |
| Verification | None | aggregate_records, metrics |
| Audit Trail | None | get_activity_log |
| Deduplication | None | Key-based upsert |
| Can Prove 100%? | ❌ No | ✅ Yes |

---

## 🎯 NEXT ACTIONS

**For Me (Claude)**:
1. Build complete Boost.space MCP server with all 40+ tools
2. Run verification queries on current data
3. Redo migration using bulk operations
4. Rebuild INT-SYNC-001 with MCP tools
5. Generate "100% Synced" verification report

**For You (User)**:
1. Approve rebuild plan
2. Let me know if I should keep existing data or start fresh
3. After rebuild: Test in UI and confirm all works

---

**Question**: Should I:
- **Option A**: Keep existing 41 records and just add verification tools?
- **Option B**: Start fresh and redo migration properly with bulk tools?
- **Option C**: Verify first, then decide based on findings?

**My recommendation**: Option C - Let me add tools, verify current state, then we decide together.
