# 🗺️ Airtable → Boost.space Migration Execution Roadmap

**Date**: November 11, 2025  
**Status**: Ready to Execute  
**Estimated Time**: 15-20 hours total  
**Risk Level**: Medium (with proper backups)

---

## 🎯 **QUICK START GUIDE**

### **Step 1: Verify Prerequisites** (15 min)

```bash
# Check environment variables
echo $BOOST_SPACE_API_KEY
echo $AIRTABLE_API_KEY

# Test Boost.space API
curl -H "Authorization: Bearer $BOOST_SPACE_API_KEY" \
  https://superseller.boost.space/api/user

# Test Airtable API
curl -H "Authorization: Bearer $AIRTABLE_API_KEY" \
  "https://api.airtable.com/v0/app6saCaH88uK3kCO/Marketplace Products?maxRecords=1"
```

### **Step 2: Backup All Data** (30 min)

```bash
# Create backup directory
mkdir -p data/airtable-backups/$(date +%Y-%m-%d)

# Export all bases (use Airtable export feature or API)
# Save to: data/airtable-backups/2025-11-11/
```

### **Step 3: Start Migration** (Follow phases below)

---

## 📋 **PHASE-BY-PHASE EXECUTION**

### **PHASE 1: Marketplace Migration** ⭐ **START HERE** (3-4 hours)

**Why First**: Highest impact, tests Boost.space API with production data

**Script**: `scripts/boost-space/migrate-marketplace-to-boost-space.js`

**Steps**:
1. Run migration script
2. Verify products in Boost.space UI
3. Update `apps/web/rensto-site/src/app/api/marketplace/workflows/route.ts` to use Boost.space
4. Test marketplace page loads correctly
5. Test purchase flow end-to-end

**Verification**:
- [ ] All products visible in Boost.space Space 51
- [ ] Marketplace API returns data from Boost.space
- [ ] Purchase flow works with Boost.space data

**Rollback Plan**: Keep Airtable data for 30 days, switch API back if issues

---

### **PHASE 2: Complete Infrastructure Migration** (2-3 hours)

**Status**: 3/6 tables already migrated

**Remaining**:
- n8n Credentials → Boost.space Notes (Space 39)
- n8n Nodes → Boost.space Notes (Space 39)
- Integrations → Boost.space Notes (Space 39)

**Script**: Create `scripts/boost-space/migrate-remaining-infrastructure.js`

**Steps**:
1. Export credentials/nodes/integrations from Airtable
2. Transform to Boost.space Note format
3. Import to Boost.space Space 39
4. Update any scripts that reference Airtable

**Verification**:
- [ ] All infrastructure data in Boost.space
- [ ] No references to Airtable infrastructure tables

---

### **PHASE 3: Reference Data Migration** (2-3 hours)

**Data**:
- Companies → Boost.space Contacts (Space 50)
- Business References → Boost.space Notes (Space 41) - merge with existing
- Scrapable FB Groups → Boost.space Notes (Space 41)

**Script**: Create `scripts/boost-space/migrate-reference-data.js`

**Steps**:
1. Create Space 50 for Companies/Contacts
2. Migrate Companies → Contacts
3. Merge Business References with existing Space 41 data
4. Migrate FB Groups → Notes

**Verification**:
- [ ] All reference data accessible in Boost.space
- [ ] No duplicate Business References

---

### **PHASE 4: Financial Migration** (2-3 hours)

**Data**:
- Invoices → Boost.space Invoices (Space 52)
- Payments → Link to Invoices
- Expenses → Boost.space Expenses (Space 52)

**Script**: Create `scripts/boost-space/migrate-financial.js`

**Steps**:
1. Create Space 52 for Financial data
2. Migrate Invoices
3. Migrate Payments (link to invoices)
4. Migrate Expenses
5. Update financial workflows

**Verification**:
- [ ] All financial data in Boost.space
- [ ] Invoice-payment relationships preserved

---

### **PHASE 5: Customer/Project Migration** (4-5 hours) ⚠️ **MOST COMPLEX**

**Data**:
- Customers → Boost.space Contacts (Space 53)
- Projects → Boost.space Projects (Space 53)
- Leads → Boost.space Contacts with "Lead" label (Space 53)
- Tasks → Boost.space Todos (Space 53)

**Script**: Create `scripts/boost-space/migrate-customers-projects.js`

**Steps**:
1. Create Space 53 for Operations
2. Migrate Customers → Contacts
3. Migrate Projects
4. Migrate Leads → Contacts (with label)
5. Migrate Tasks → Todos
6. **Update ALL workflows** referencing these tables
7. Test each workflow

**Verification**:
- [ ] All customer/project data in Boost.space
- [ ] All workflows updated and tested
- [ ] No broken workflow references

**Risk**: High - Many workflows depend on this data  
**Mitigation**: Update workflows BEFORE deleting Airtable data

---

### **PHASE 6: Marketing Migration** (1-2 hours)

**Data**:
- Leads → Boost.space Contacts (Space 53)
- Campaigns → Boost.space Business Cases (Space 53)
- Content → Boost.space Notes (Space 41)

**Script**: Create `scripts/boost-space/migrate-marketing.js`

**Steps**:
1. Migrate Leads (merge with Phase 5)
2. Migrate Campaigns → Business Cases
3. Migrate Content → Notes
4. Update marketing workflows

**Verification**:
- [ ] All marketing data in Boost.space
- [ ] Marketing workflows functional

---

### **PHASE 7: Cleanup** (1-2 hours)

**Tasks**:
1. Delete 53 empty tables from remaining Airtable bases
2. Delete 4 unused bases:
   - Entities (`appfpXxb5Vq8acLTy`)
   - Analytics & Monitoring (`app9oouVkvTkFjf3t`)
   - RGID-based entity management (`appCGexgpGPkMUPXF`)
   - Idempotency systems (`app9DhsrZ0VnuEH3t`)
3. Update all workflow references
4. Update documentation

**Script**: Create `scripts/airtable/cleanup-unused-bases.js`

**Verification**:
- [ ] Empty tables deleted
- [ ] Unused bases deleted
- [ ] All workflows updated
- [ ] Documentation updated

---

## 🔄 **WORKFLOW UPDATE STRATEGY**

### **For Each Workflow**:

1. **Identify Airtable Nodes**
   ```bash
   # Search workflow JSON for Airtable base IDs
   grep -r "app6saCaH88uK3kCO\|appQijHhqqP4z6wGe" workflows/
   ```

2. **Replace with Boost.space HTTP Request Nodes**
   - Remove Airtable node
   - Add HTTP Request node
   - Configure Boost.space API endpoint
   - Map fields correctly

3. **Test Workflow**
   - Run test execution
   - Verify data flow
   - Check error handling

4. **Update Documentation**
   - Update workflow comments
   - Update CLAUDE.md

---

## 📊 **PROGRESS TRACKING**

### **Migration Checklist**:

- [ ] **Phase 1**: Marketplace Migration (3-4 hours)
  - [ ] Products migrated
  - [ ] Purchases migrated
  - [ ] Affiliate Links migrated
  - [ ] API routes updated
  - [ ] Purchase flow tested

- [ ] **Phase 2**: Infrastructure Migration (2-3 hours)
  - [ ] Credentials migrated
  - [ ] Nodes migrated
  - [ ] Integrations migrated

- [ ] **Phase 3**: Reference Data Migration (2-3 hours)
  - [ ] Companies migrated
  - [ ] Business References merged
  - [ ] FB Groups migrated

- [ ] **Phase 4**: Financial Migration (2-3 hours)
  - [ ] Invoices migrated
  - [ ] Payments migrated
  - [ ] Expenses migrated

- [ ] **Phase 5**: Customer/Project Migration (4-5 hours)
  - [ ] Customers migrated
  - [ ] Projects migrated
  - [ ] Leads migrated
  - [ ] Tasks migrated
  - [ ] All workflows updated

- [ ] **Phase 6**: Marketing Migration (1-2 hours)
  - [ ] Leads migrated
  - [ ] Campaigns migrated
  - [ ] Content migrated

- [ ] **Phase 7**: Cleanup (1-2 hours)
  - [ ] Empty tables deleted
  - [ ] Unused bases deleted
  - [ ] Documentation updated

---

## ⚠️ **RISK MITIGATION**

### **Before Each Phase**:
1. ✅ Backup Airtable data
2. ✅ Test Boost.space API access
3. ✅ Verify space IDs exist
4. ✅ Test migration script on 1 record first

### **During Migration**:
1. ✅ Monitor error rates
2. ✅ Verify record counts match
3. ✅ Test critical workflows
4. ✅ Keep Airtable data for 30 days

### **After Migration**:
1. ✅ Verify all data accessible
2. ✅ Test all workflows
3. ✅ Update documentation
4. ✅ Monitor for 1 week before deleting Airtable

---

## 🎯 **SUCCESS CRITERIA**

- [ ] 850+ records migrated to Boost.space
- [ ] Airtable bases reduced from 11 → 2-3
- [ ] Airtable cost reduced from $2,640/year → $480-720/year
- [ ] All workflows functional
- [ ] All data preserved
- [ ] Documentation updated

---

## 📞 **SUPPORT & TROUBLESHOOTING**

### **Common Issues**:

**Issue**: Boost.space API returns 401  
**Solution**: Check API key in environment variables

**Issue**: Custom modules not accessible via API  
**Solution**: Use built-in modules (Products, Contacts, Notes) instead

**Issue**: Workflow breaks after migration  
**Solution**: Check field mappings, verify Boost.space API response format

**Issue**: Rate limiting  
**Solution**: Add delays between requests (300ms)

---

**Ready to start? Begin with Phase 1 (Marketplace Migration) - it has the highest impact!**

