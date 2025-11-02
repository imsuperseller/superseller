# ✅ Workflow Addition Checklist - Marketplace

**Date Created**: October 31, 2025  
**Purpose**: Step-by-step checklist for adding new workflows to Marketplace  
**Estimated Time**: 30-45 minutes per workflow

---

## 📋 **PRE-FLIGHT CHECKLIST**

Before adding a workflow, ensure:
- [ ] Workflow is tested and working in production
- [ ] Workflow has been cleaned (no customer-specific data)
- [ ] You have all workflow metadata (name, description, features, pricing)
- [ ] You know where the workflow JSON file is located

---

## **STEP 1: PREPARE WORKFLOW JSON FILE** ⏱️ 10 minutes

**Location**: `/workflows/templates/`

**Tasks**:
1. [ ] Export workflow from n8n (Workflow menu → Download)
2. [ ] Open JSON file in text editor
3. [ ] Remove/sanitize customer-specific data:
   - [ ] API keys (replace with placeholder: `"[YOUR_API_KEY]"`)
   - [ ] Customer IDs (replace with placeholder: `"[CUSTOMER_ID]"`)
   - [ ] Specific email addresses (replace with `"[EMAIL]"`)
   - [ ] Customer names (replace with `"[CUSTOMER_NAME]"`)
   - [ ] Custom URLs (replace with `"[BASE_URL]"`)
4. [ ] Add comment at top of JSON file:
   ```json
   {
     "workflow_meta": {
       "name": "[WORKFLOW NAME]",
       "version": "1.0.0",
       "added_date": "[DATE]",
       "complexity": "[Simple | Intermediate | Advanced]",
       "setup_time": "[TIME ESTIMATE]",
       "category": "[CATEGORY]"
     },
     "nodes": [...]
   }
   ```
5. [ ] Save file as: `[workflow-slug].json` (lowercase, hyphens)
   - Example: `email-persona-system.json`

**Verify**:
- [ ] JSON file is valid (test with JSON validator)
- [ ] File is saved in `/workflows/templates/` directory
- [ ] File can be imported back into n8n successfully

---

## **STEP 2: UPDATE PRODUCT CATALOG** ⏱️ 5 minutes

**Location**: `/products/product-catalog.json`

**Tasks**:
1. [ ] Open `product-catalog.json`
2. [ ] Add new entry to `products` array:
   ```json
   {
     "id": "[WORKFLOW-ID]",
     "name": "[WORKFLOW NAME]",
     "category": "[CATEGORY]",
     "source": "workflows/templates/[workflow-slug].json",
     "complexity": "[Simple | Intermediate | Advanced]",
     "setupTime": "[SETUP TIME]",
     "price": [DOWNLOAD-PRICE],
     "installPrice": [INSTALL-PRICE],
     "features": [
       "[FEATURE 1]",
       "[FEATURE 2]",
       "[FEATURE 3]",
       "[FEATURE 4]"
     ],
     "targetMarket": "[TARGET MARKET]",
     "n8nAffiliateLink": "https://tinyurl.com/ym3awuke"
   }
   ```
3. [ ] Update `totalProducts` count in metadata
4. [ ] Save file
5. [ ] Verify JSON is valid

**Verify**:
- [ ] Product entry is correctly formatted
- [ ] All required fields are filled
- [ ] JSON file is still valid

---

## **STEP 3: UPDATE AIRTABLE** ⏱️ 5 minutes

**Base**: Operations & Automation (`app6saCaH88uK3kCO`)  
**Table**: Marketplace Products (verify table name exists)

**Tasks**:
1. [ ] Open Airtable base
2. [ ] Navigate to "Marketplace Products" table
3. [ ] Create new record:
   - [ ] **Name**: [WORKFLOW NAME]
   - [ ] **Category**: [CATEGORY]
   - [ ] **Download Price**: $[DOWNLOAD-PRICE]
   - [ ] **Install Price**: $[INSTALL-PRICE]
   - [ ] **Complexity**: [Simple | Intermediate | Advanced]
   - [ ] **Setup Time**: [SETUP TIME]
   - [ ] **Workflow JSON URL**: Link to file (or stored location)
   - [ ] **n8n Affiliate Link**: `https://tinyurl.com/ym3awuke`
   - [ ] **Features**: [FEATURE LIST]
   - [ ] **Status**: Active
   - [ ] **Added Date**: Today's date

**Verify**:
- [ ] Record created successfully
- [ ] All fields populated
- [ ] Links are clickable and work

---

## **STEP 4: ADD TO MARKETPLACE PAGE** ⏱️ 15 minutes

**Location**: `/webflow/pages/WEBFLOW_EMBED_MARKETPLACE_CVJ.html`  
**Section**: "Featured Templates" or create new "All Workflows" section

**Tasks**:
1. [ ] Open Marketplace page HTML file
2. [ ] Locate "Featured Templates" section (around line 1147)
3. [ ] Copy workflow card template from `/webflow/workflow-card-template.html`
4. [ ] Replace ALL placeholders with actual values:
   - [ ] `[WORKFLOW-ID]` → Actual ID
   - [ ] `[WORKFLOW NAME]` → Actual name
   - [ ] `[CATEGORY]` → Actual category
   - [ ] `[DESCRIPTION]` → Actual description
   - [ ] `[RATING]` → Rating (or "New" if no reviews)
   - [ ] `[REVIEWS]` → Number of reviews (or "0" if new)
   - [ ] `[SETUP-TIME]` → Setup time estimate
   - [ ] `[FEATURE 1-4]` → Top 4 features
   - [ ] `[DOWNLOAD-PRICE]` → Download price
   - [ ] `[INSTALL-PRICE]` → Install price
   - [ ] `[TIER]` → Appropriate tier (simple/advanced/complete)
   - [ ] `[SUPPORT-DAYS]` → Support period
   - [ ] `[TRAINING-TIME]` → Training duration
   - [ ] `[SUPPORT-PERIOD]` → Support period for install
5. [ ] Paste workflow card into templates grid
6. [ ] Verify HTML is valid (check for unclosed tags)

**Verify**:
- [ ] Workflow card appears in correct section
- [ ] All placeholders replaced
- [ ] Buttons have correct data attributes
- [ ] n8n affiliate link is present

---

## **STEP 5: ADD CSS STYLES** ⏱️ 5 minutes

**Location**: Marketplace page HTML file (in `<style>` section)

**Tasks**:
1. [ ] Check if `.workflow-card` styles exist
2. [ ] If not, add CSS for workflow cards:
   ```css
   .workflow-card {
     background: var(--card-bg);
     border: 1px solid rgba(31, 174, 247, 0.2);
     border-radius: 12px;
     padding: 32px;
     margin-bottom: 24px;
   }
   
   .workflow-pricing {
     display: grid;
     grid-template-columns: 1fr 1fr;
     gap: 24px;
     margin-top: 24px;
   }
   
   .affiliate-notice {
     background: rgba(31, 174, 247, 0.1);
     border: 1px solid var(--cyan);
     border-radius: 8px;
     padding: 12px;
     margin: 16px 0;
   }
   
   .tidycal-note {
     font-size: 14px;
     color: var(--gray-text);
     margin-top: 8px;
     font-style: italic;
   }
   ```
3. [ ] Add responsive styles for mobile:
   ```css
   @media (max-width: 768px) {
     .workflow-pricing {
       grid-template-columns: 1fr;
     }
   }
   ```

**Verify**:
- [ ] Styles are added correctly
- [ ] Workflow cards display properly on desktop
- [ ] Workflow cards display properly on mobile

---

## **STEP 6: TEST PURCHASE FLOWS** ⏱️ 10 minutes

### **Test Download Flow**:
1. [ ] Open Marketplace page in browser
2. [ ] Locate new workflow card
3. [ ] Click "Download - $[PRICE]" button
4. [ ] Verify Stripe checkout opens
5. [ ] Complete test payment (use Stripe test card: `4242 4242 4242 4242`)
6. [ ] Check email inbox
7. [ ] Verify email contains:
   - [ ] Download link for workflow JSON
   - [ ] Setup instructions
   - [ ] **n8n affiliate link** (`https://tinyurl.com/ym3awuke`)
   - [ ] Support contact info
8. [ ] Click download link
9. [ ] Verify JSON file downloads correctly
10. [ ] Verify JSON can be imported into n8n

### **Test Install Flow**:
1. [ ] Click "Book Install - $[PRICE]" button
2. [ ] Verify Stripe checkout opens
3. [ ] Complete test payment
4. [ ] Check email inbox
5. [ ] Verify email contains:
   - [ ] **TidyCal booking link** (REQUIRED)
   - [ ] n8n affiliate link
   - [ ] What to prepare for installation call
6. [ ] Click TidyCal link
7. [ ] Verify booking page opens correctly

---

## **STEP 7: UPDATE CATEGORY COUNTS** ⏱️ 2 minutes

**Location**: Marketplace page, Category Cards section

**Tasks**:
1. [ ] Find category card matching workflow category
2. [ ] Update count in category card:
   - Example: `"78 Templates"` → `"79 Templates"`

**Verify**:
- [ ] Count is updated correctly
- [ ] All category counts are accurate

---

## **STEP 8: VERIFY N8N WORKFLOWS** ⏱️ 5 minutes

**Location**: n8n instance (http://173.254.201.134:5678)

**Tasks**:
1. [ ] Verify `INT-STRIPE-MARKETPLACE-TEMPLATE` workflow exists and is active
2. [ ] Verify workflow handles:
   - [ ] Download link generation
   - [ ] Email sending with n8n affiliate link
   - [ ] Airtable record creation
3. [ ] Verify `INT-STRIPE-MARKETPLACE-INSTALL` workflow exists and is active
4. [ ] Verify workflow handles:
   - [ ] TidyCal link generation
   - [ ] Email sending with booking link
   - [ ] Airtable project record creation

**Verify**:
- [ ] Both workflows are active
- [ ] Workflows are connected to correct webhooks
- [ ] Email templates include affiliate link and TidyCal link

---

## **STEP 9: DOCUMENTATION** ⏱️ 5 minutes

**Tasks**:
1. [ ] Add workflow to workflow documentation:
   - [ ] Update `/workflows/README.md` if needed
   - [ ] Add workflow to workflow inventory
2. [ ] Update Marketplace page documentation:
   - [ ] Note workflow added date
   - [ ] Note pricing
   - [ ] Note any special requirements

---

## ✅ **FINAL VERIFICATION**

Before marking workflow as complete:
- [ ] Workflow JSON file is in `/workflows/templates/`
- [ ] Product catalog updated
- [ ] Airtable record created
- [ ] Workflow card added to Marketplace page
- [ ] Download button works (tested)
- [ ] Install button works (tested)
- [ ] Email templates include n8n affiliate link
- [ ] Email templates include TidyCal link (for install)
- [ ] Category count updated
- [ ] CSS styles added (if needed)
- [ ] Page tested on mobile
- [ ] Documentation updated

---

## 🚨 **COMMON ISSUES & FIXES**

### **Issue**: Download link not working in email
**Fix**: Verify n8n workflow generates correct download URL, check file permissions

### **Issue**: TidyCal link missing in install email
**Fix**: Check `INT-STRIPE-MARKETPLACE-INSTALL` workflow includes TidyCal link generation node

### **Issue**: Workflow card looks broken on page
**Fix**: Verify CSS styles are added, check for unclosed HTML tags

### **Issue**: Buttons don't trigger Stripe checkout
**Fix**: Verify button classes match JavaScript selectors (`.workflow-download-btn`, `.workflow-install-btn`)

---

## 📝 **NOTES**

- **Workflow IDs**: Use lowercase, hyphens only (e.g., `email-persona-system`)
- **Pricing**: Download prices typically $29/$97/$197, Install prices $797/$1,997/$3,500+
- **n8n Affiliate Link**: Always use `https://tinyurl.com/ym3awuke`
- **TidyCal**: Booking is REQUIRED for install purchases, link sent in email
- **Support Periods**: 14-90 days for download, 90 days-1 year for install

---

**Last Updated**: October 31, 2025  
**Next Review**: When adding 10th workflow (verify process is still efficient)

