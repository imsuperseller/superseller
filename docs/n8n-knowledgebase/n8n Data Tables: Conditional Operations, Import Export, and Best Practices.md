# n8n Data Tables: Conditional Operations, Import/Export, and Best Practices

A practical guide to n8n's data tables features including conditional row operations, CSV import/export, and real-world workflow patterns.

---

## Overview

n8n Data Tables provide a built-in database solution with several powerful features:

| Feature | Description |
|---------|-------------|
| **If Row Exists** | Conditional branching when row is found |
| **If Row Does Not Exist** | Conditional branching when row is missing |
| **CSV Import** | Create tables from existing data |
| **CSV Export** | Download table data for external use |
| **Auto-generated Columns** | ID, created_at, updated_at by default |

---

## Conditional Row Operations

### If Row Exists

Checks if a row matching your conditions exists and routes accordingly.

**Node Configuration:**
- Operation: `If Row Exists`
- Data Table: Select your table
- Condition: Field to match (e.g., `name = {{ $json.name }}`)

**Behavior:**
```
[If Row Exists]
├── Row Found → Continue on SUCCESS path (outputs matched row data)
└── Row Not Found → No output on this path
```

### If Row Does Not Exist

The inverse operation—routes when no matching row is found.

**Node Configuration:**
- Operation: `If Row Does Not Exist`
- Data Table: Select your table
- Condition: Field to match

**Behavior:**
```
[If Row Does Not Exist]
├── Row Not Found → Continue on SUCCESS path (outputs input data)
└── Row Found → No output on this path
```

### Key Difference: Output Data

| Operation | When Triggered | Output Data |
|-----------|----------------|-------------|
| If Row Exists | Row found | The matched row from database |
| If Row Does Not Exist | Row not found | The original input data (pass-through) |

This distinction matters when you need the database record (use "exists") versus just needing to know it's missing (use "does not exist").

---

## Comparison: Native Operations vs Manual IF Node

### Traditional Approach (Get Rows + IF Node)

```
[Get Rows] → [IF: Data exists?]
                    ├── TRUE → Process
                    └── FALSE → Handle missing
```

**Configuration Required:**
1. Get Rows node with "Always Output Data" enabled
2. IF node checking if returned data exists
3. Manual condition: `{{ $json.id }}` exists

### New Approach (If Row Exists/Does Not Exist)

```
[If Row Exists] → Process found row
[If Row Does Not Exist] → Handle missing (parallel)
```

**Benefits:**
- Single node instead of two
- Cleaner canvas
- More explicit intent
- Correct output data automatically

---

## Practical Use Case: Duplicate Event Detection

### The Problem

External services (Stripe, GitHub, Twilio) may accidentally send duplicate webhook events. Processing the same event twice could:
- Charge a customer twice
- Create duplicate records
- Trigger duplicate notifications

### The Solution: Event ID Logging

```
[Webhook] → [If Row Does Not Exist (event_id)] 
                    ├── Not Found → [Insert Row] → [Process Event]
                    └── Found → [Log Duplicate] → [Stop/Ignore]
```

### Implementation

**Step 1: Create Events Table**

| Column | Type | Purpose |
|--------|------|---------|
| id | auto | Primary key |
| event_id | string | Stripe/GitHub event ID |
| event_type | string | What happened |
| processed_at | datetime | When we handled it |

**Step 2: Check Before Processing**

```
[Webhook Trigger]
       ↓
[If Row Does Not Exist]
  Table: events
  Condition: event_id = {{ $json.body.event_id }}
       ↓
┌──────┴──────┐
↓             ↓
[NEW]      [DUPLICATE]
↓             ↓
[Insert]   [Log & Stop]
↓
[Process Payment]
```

**Step 3: Insert on First Occurrence**

Only when the event doesn't exist:
```
[Insert Row]
  Table: events
  event_id: {{ $json.body.event_id }}
  event_type: {{ $json.body.type }}
```

**Result:** The same event ID can never be processed twice.

---

## CSV Import: Creating Tables from Existing Data

### Supported Sources

Import data from any system that exports CSV:
- Google Sheets
- Airtable
- Supabase
- Excel
- Any database with CSV export

### Import Process

1. Export your data as CSV from the source system
2. In n8n, go to **Data Tables** section
3. Click **Create New** → **Import from CSV**
4. Drop or select your CSV file
5. Configure column data types
6. Name your table and create

### Data Type Configuration

During import, n8n detects possible types and lets you choose:

| Detected Value | Available Types |
|----------------|-----------------|
| "Bart", "David" | String only |
| "5", "10" | String OR Number |
| "2024-01-15" | String OR Date |
| "true", "false" | String OR Boolean |

**Best Practice:** Choose the most restrictive appropriate type for data integrity.

### Auto-Generated Columns

n8n automatically adds essential database columns:

| Column | Type | Purpose |
|--------|------|---------|
| `id` | UUID | Unique identifier (primary key) |
| `created_at` | Timestamp | When row was created |
| `updated_at` | Timestamp | When row was last modified |

**Why This Matters:**

- **id**: Differentiates records with same values (e.g., two people named "Bart")
- **created_at**: Audit trail for when data entered the system
- **updated_at**: Track modifications over time

These columns are database best practices—n8n handles them automatically.

---

## CSV Export: Extracting Data from Tables

### Use Cases

- Share data with team members without n8n access
- Migrate data to another system
- Create backups
- Compliance and audit reports
- Analysis in external tools (Excel, Google Sheets)

### Export Process

1. Open the Data Table you want to export
2. Click the menu/options button
3. Select **Download as CSV**
4. File downloads with all rows and columns

### Previous Workaround (No Longer Needed)

Before native export, you had to:
```
[Manual Trigger] → [Get All Rows] → [Convert to CSV] → [Write File/Send Email]
```

Now it's a single click in the UI.

---

## Workflow Patterns

### Pattern 1: Upsert (Update or Insert)

Check if record exists, update it or create new:

```
[Webhook with user data]
       ↓
[If Row Exists (user_id)]
       ↓
┌──────┴──────┐
↓             ↓
[EXISTS]   [NOT EXISTS]
↓             ↓
[Update]   [Insert]
Row         New Row
```

### Pattern 2: User Validation

Check if user is authorized before processing:

```
[Webhook with request]
       ↓
[If Row Exists (user_id in allowed_users)]
       ↓
┌──────┴──────┐
↓             ↓
[AUTHORIZED] [UNAUTHORIZED]
↓             ↓
[Process]   [Return 403]
```

### Pattern 3: Rate Limiting / Cooldown

Prevent action if recently performed:

```
[Webhook]
       ↓
[Get Rows: last_action for user]
       ↓
[IF: last_action > 5 min ago?]
       ↓
┌──────┴──────┐
↓             ↓
[ALLOWED]   [RATE LIMITED]
↓             ↓
[Process]   [Return 429]
[Update timestamp]
```

### Pattern 4: Inventory Check

Verify item availability before order:

```
[Order Request]
       ↓
[If Row Exists (product_id)]
       ↓
┌──────┴──────┐
↓             ↓
[IN STOCK]  [NOT FOUND]
↓             ↓
[Check qty] [Return error]
```

---

## Data Tables vs External Databases

### When to Use n8n Data Tables

| Scenario | Recommendation |
|----------|----------------|
| Quick prototyping | ✅ Data Tables |
| Simple key-value storage | ✅ Data Tables |
| Workflow-specific state | ✅ Data Tables |
| Event logging during dev | ✅ Data Tables |
| Team needs direct access | ❌ Use Supabase |
| Complex queries needed | ❌ Use Supabase |
| Public API access | ❌ Use Supabase |
| User authentication | ❌ Use Supabase |

### Migration Path

1. **Development**: Use Data Tables for speed
2. **Testing**: Validate with real-ish data in Data Tables
3. **Production**: Export CSV → Import to Supabase
4. **Update workflow**: Swap Data Tables nodes for Supabase nodes

---

## Best Practices

### Naming Conventions

- Tables: Plural nouns (`users`, `events`, `logs`)
- Be descriptive: `stripe_webhook_events` not `data1`

### Primary Key Strategy

Always use the auto-generated `id` for:
- Updating specific rows
- Deleting specific rows
- Referencing in other tables

Don't rely on business fields (like `name`) as unique identifiers.

### Logging Pattern

For workflow observability, create a `runs` table:

| Column | Type | Content |
|--------|------|---------|
| id | auto | Unique run ID |
| workflow_name | string | Which workflow |
| input_payload | string (JSON) | What was received |
| outcome | string | success/failure |
| error_message | string | If failed, why |
| created_at | auto | When it ran |

### Cleanup Strategy

Data tables can grow large. Consider:
- Archiving old records periodically
- Exporting and clearing logs monthly
- Setting up automated cleanup workflows

---

## Quick Reference

### Available Operations

| Operation | Purpose | Output |
|-----------|---------|--------|
| Get Rows | Retrieve matching rows | Matched rows |
| Insert Row | Add new row | Created row |
| Update Row | Modify existing row | Updated row |
| Delete Row | Remove row | Confirmation |
| If Row Exists | Branch if found | Matched row |
| If Row Does Not Exist | Branch if missing | Input data |

### Condition Types

- **Any Condition**: Match if ANY condition is true (OR)
- **All Conditions**: Match only if ALL conditions are true (AND)

### Output Behavior

| Operation | Row Found | Row Not Found |
|-----------|-----------|---------------|
| If Row Exists | Outputs matched row | No output |
| If Row Does Not Exist | No output | Outputs input data |
| Get Rows (Always Output) | Outputs rows | Outputs empty object |

---

## Summary

n8n Data Tables conditional operations simplify common patterns:

1. **If Row Exists** — Route when data is found, get the record
2. **If Row Does Not Exist** — Route when data is missing, pass through input
3. **CSV Import** — Bootstrap tables from existing data
4. **CSV Export** — Extract data without building workflows

These features reduce node count, clarify intent, and enable patterns like duplicate detection and upserts with minimal configuration.