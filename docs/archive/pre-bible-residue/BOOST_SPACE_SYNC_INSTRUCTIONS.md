# Boost.space Product Sync Instructions

**Date**: November 12, 2025  
**Purpose**: Sync real product data from CSV/Airtable to Boost.space

---

## 🚀 **QUICK START**

### **Method 1: Use n8n Workflow** (Recommended)

**Steps**:
1. **Import Workflow**:
   - Go to: http://172.245.56.50:5678
   - Click "Import from File"
   - Select: `workflows/INT-SYNC-002-BOOST-SPACE-MARKETPLACE-IMPORT.json`
   - Click "Import"

2. **Verify CSV File**:
   - CSV should be at: `/home/node/.n8n/data/products.csv`
   - Contains 8 products with complete data

3. **Run Workflow**:
   - Open workflow: "INT-SYNC-002: Boost.space Marketplace Import v1"
   - Click "Execute Workflow" (Manual Trigger)
   - Wait for completion (~30 seconds)

4. **Verify Results**:
   - Check Boost.space: https://superseller.boost.space → Products (Space 51)
   - Should see 8 products with real data

---

### **Method 2: Use Sync Script** (Alternative)

**Steps**:
1. **Set Environment Variables**:
   ```bash
   export AIRTABLE_API_KEY="your_airtable_key"
   export BOOST_SPACE_API_KEY="88c5ff57783912fcc05fec10a22d67b5806d48346ab9ef562f17e2188cc07dba"
   ```

2. **Run Script**:
   ```bash
   cd scripts/boost-space
   node sync-airtable-to-boost-space.js
   ```

3. **Verify Results**:
   - Script will output sync summary
   - Check Boost.space Products module

---

## 📋 **WHAT GETS SYNCED**

**From CSV/Airtable** → **To Boost.space**:

| Field | Source | Destination |
|-------|--------|-------------|
| Workflow Name | CSV/Airtable | `name` |
| Description | CSV/Airtable | `description` |
| Download Price | CSV/Airtable | `unit_price` (cents) |
| Workflow ID | CSV/Airtable | `sku` |
| Category | CSV/Airtable | `metadata.category` |
| Install Price | CSV/Airtable | `metadata.installPrice` (cents) |
| Complexity | CSV/Airtable | `metadata.complexity` |
| Setup Time | CSV/Airtable | `metadata.setupTime` |
| Features | CSV/Airtable | `metadata.features` (array) |
| Status | CSV/Airtable | `status_system_id` (1=Active) |
| n8n Affiliate Link | CSV/Airtable | `metadata.n8nAffiliateLink` |
| Target Market | CSV/Airtable | `metadata.targetMarket` |

---

## ✅ **VERIFICATION CHECKLIST**

After sync:

- [ ] Boost.space Space 51 has 8 products
- [ ] Products have real names (not generic)
- [ ] Products have descriptions (not empty)
- [ ] Products have real prices ($197-$997, not $0)
- [ ] Products have categories (not empty)
- [ ] Products have features (not empty array)
- [ ] Marketplace API returns real data
- [ ] Marketplace page shows real product cards

---

## 🔧 **TROUBLESHOOTING**

### **Issue: Products Still Show $0 or Empty**

**Solution**:
1. Check CSV file format (should have headers)
2. Verify workflow parsed CSV correctly
3. Check Boost.space API response for errors
4. Verify `spaceId: 51` in workflow

### **Issue: Duplicate Products**

**Solution**:
- Workflow filters duplicates by `sku` (Workflow ID)
- Existing products won't be re-imported
- To update: Delete product in Boost.space first, then re-run workflow

### **Issue: Metadata Not Showing**

**Solution**:
- Verify `metadata` field is included in POST request
- Check Boost.space API accepts `metadata` field
- Verify JSON.stringify in workflow code

---

## 📊 **EXPECTED PRODUCTS**

After sync, you should see:

1. **AI-Powered Email Persona System** - $197
2. **Hebrew Email Automation** - $297
3. **Complete Business Process Automation** - $497
4. **Tax4Us Content Automation** - $597
5. **QuickBooks Integration Suite** - $297
6. **Customer Lifecycle Management** - $597
7. **n8n Deployment Package** - $797
8. **MCP Server Integration Suite** - $997

---

**Status**: ✅ **READY TO EXECUTE**  
**Next Step**: Import workflow to n8n and run it

