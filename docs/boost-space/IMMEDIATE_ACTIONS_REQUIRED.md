# Immediate Actions Required - Boost.space Restructure

## 🚨 Critical Finding

**Products Module is Misused:**
- 112 workflows stored in Products module (WRONG)
- 77 actual products stored in Products module (CORRECT)
- **Workflows should be in "Deployed Workflows" module per schema**

---

## 📋 Products Module Field Analysis

### ✅ **Keep These Fields** (Relevant for Products)
- `name`, `description`, `sku`, `unit_price`, `vat`, `discount`
- `invoice_description`, `status_system_id`
- Custom field groups: Marketing, Sales, Tracking

### ❌ **Irrelevant Fields for Workflows** (But Keep for Products)
- `quantity`, `default_quantity` - Inventory management (needed for products)
- `ratioQuantity`, `ratioUnit`, `ratioPrice` - Inventory ratios (needed for products)
- `quantitiesOnStock` - Stock tracking (needed for products)
- `reservable`, `hasVariants` - Product features (needed for products)
- `part_number`, `ean_code` - Product codes (needed for products)

**Note:** These fields are NOT irrelevant - they're for actual products! The issue is workflows shouldn't be in Products module.

---

## 🎯 What Needs to Happen

### 1. Create "Deployed Workflows" Module (CRITICAL)
**Why:** Schema says workflows should be here, not in Products  
**Action:** Create custom module, migrate 112 workflows

### 2. Products Module is Actually Correct
**Keep:** All inventory fields (they're for actual products)  
**Action:** Just remove workflows, keep everything else

### 3. Missing Modules (Per Schema)
- Leads (pre-qualification)
- Subscriptions (active plans)
- Orders (one-time purchases)
- WAHA Instances (WhatsApp deployments)
- Support Tickets
- Usage Logs

### 4. Features Needing User Action
- ✅ Module relationships (links between modules)
- ✅ Calculated fields (formulas like total_ltv, mrr)
- ✅ Views & dashboards (Sales Pipeline, Customer Health, etc.)
- ✅ Status systems (configure per module)
- ✅ Automation triggers (n8n webhooks)

---

## 💡 Recommendation

**Don't modify Products module fields** - they're correct for actual products!

**Instead:**
1. Create "Deployed Workflows" custom module
2. Migrate 112 workflows from Products → Deployed Workflows
3. Keep Products module for actual products (marketplace items, niche packs)
4. Create missing modules per schema
5. Set up relationships, formulas, views, status systems, webhooks

---

**The schema is excellent - it just needs to be implemented!**
