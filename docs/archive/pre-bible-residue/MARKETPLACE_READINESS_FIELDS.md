# Marketplace Readiness & Internal-Only Tracking Fields

## Current Fields (What We Have)

### ✅ Existing Fields That Help:

1. **`category`** (Select)
   - Options: `Internal`, `Subscription`, `Marketing`, `Customer`, `Development`
   - **Use:** If `category = "Internal"`, it's likely internal-only
   - **Limitation:** Not explicit enough - "Internal" could mean internal use, not necessarily "not for sale"

2. **`status`** (Select)
   - Options: `✅ Active`, `✅ Successful`, `⚠️ Testing`, `❌ Deprecated`, `📦 Template`
   - **Use:** `📦 Template` suggests marketplace readiness
   - **Limitation:** Not clear if it's ready for marketplace or just a template

3. **`marketplace_status`** (Select)
   - Options: `draft`, `pending_review`, `published`, `archived`
   - **Use:** Tracks marketplace publication status
   - **Limitation:** Doesn't indicate if workflow is internal-only or not ready at all

## ❌ What's Missing

We need clearer fields to distinguish:
- **Internal-only workflows** (never for sale)
- **Not ready for marketplace** (needs work before it can be sold)
- **Ready for marketplace** (ready to be published)
- **Published on marketplace** (already live)

## ✅ Recommended Additional Fields

### Option 1: Add New Fields (Recommended)

Add these 3 fields to make it crystal clear:

1. **`is_internal_only`** (Boolean)
   - `true` = Internal use only, never for marketplace
   - `false` = Can potentially be sold (if ready)
   - **Default:** `false`

2. **`marketplace_readiness`** (Select)
   - Options:
     - `not_ready` - Needs work before it can be sold
     - `ready_for_review` - Ready but needs review/approval
     - `ready_to_publish` - Ready to publish immediately
     - `published` - Already published (use with `marketplace_status`)
     - `not_applicable` - Internal-only (use with `is_internal_only = true`)
   - **Default:** `not_ready`

3. **`marketplace_blockers`** (Textarea)
   - List of things preventing marketplace publication
   - Examples: "Missing documentation", "Needs pricing approval", "Customer-specific data", etc.
   - **Only fill if `marketplace_readiness = not_ready`**

### Option 2: Enhance Existing Fields

Update existing field options:

1. **Enhance `category` field:**
   - Add: `Internal (Never for Sale)` as separate option
   - Keep: `Internal` for internal workflows that could be productized

2. **Enhance `marketplace_status` field:**
   - Add: `not_for_sale` option
   - Add: `not_ready` option
   - Keep: `draft`, `pending_review`, `published`, `archived`

## 🎯 Recommended Approach

**Use Option 1** - Add the 3 new fields because:
- ✅ Clear separation of concerns
- ✅ Easy to filter/query
- ✅ Doesn't break existing data
- ✅ More flexible for future needs

## 📋 Field Definitions

```javascript
// New fields to add:
{ 
  name: 'is_internal_only', 
  type: 'boolean', 
  description: 'Internal use only - never for marketplace sale',
  default: false
},
{ 
  name: 'marketplace_readiness', 
  type: 'select', 
  description: 'Marketplace readiness status',
  options: ['not_ready', 'ready_for_review', 'ready_to_publish', 'published', 'not_applicable'],
  default: 'not_ready'
},
{ 
  name: 'marketplace_blockers', 
  type: 'textarea', 
  description: 'What prevents this from being marketplace-ready? (only if not_ready)'
}
```

## 🔍 Usage Examples

### Internal-Only Workflow
```json
{
  "category": "Internal",
  "is_internal_only": true,
  "marketplace_readiness": "not_applicable",
  "marketplace_status": null
}
```

### Not Ready for Marketplace
```json
{
  "category": "Subscription",
  "is_internal_only": false,
  "marketplace_readiness": "not_ready",
  "marketplace_blockers": "Missing setup guide, needs pricing approval, customer-specific data",
  "marketplace_status": null
}
```

### Ready for Marketplace
```json
{
  "category": "Marketing",
  "is_internal_only": false,
  "marketplace_readiness": "ready_to_publish",
  "marketplace_blockers": null,
  "marketplace_status": "draft"
}
```

### Published on Marketplace
```json
{
  "category": "Lead Generation",
  "is_internal_only": false,
  "marketplace_readiness": "published",
  "marketplace_blockers": null,
  "marketplace_status": "published"
}
```

## 🚀 Next Steps

1. **Add the 3 new fields** to the Products module field group
2. **Update population script** to set defaults:
   - `is_internal_only = false` (unless category is "Internal")
   - `marketplace_readiness = "not_ready"` (default)
   - `marketplace_blockers = null` (empty)
3. **Create filter views** in Boost.space:
   - "Internal Only" (is_internal_only = true)
   - "Not Ready" (marketplace_readiness = not_ready)
   - "Ready for Review" (marketplace_readiness = ready_for_review)
   - "Ready to Publish" (marketplace_readiness = ready_to_publish)
   - "Published" (marketplace_status = published)
