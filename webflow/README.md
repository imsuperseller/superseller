# 🌐 Webflow Deployment Files

**Purpose:** Webflow page embed files, templates, and deployment documentation for rensto.com

**Current Size:** ~988K (31 files)

**Last Updated:** October 5, 2025

**Last Audit:** October 5, 2025

---

## 📁 Directory Structure

```
webflow/
├── pages/          988K - 23 page embed files (WEBFLOW_EMBED_*.html)
├── templates/           - 5 reusable template files
├── docs/                - 2 deployment documentation files
└── README.md            - This file
```

**Total**: 31 files across 4 directories (including root)

## 🚀 How to Deploy

1. **Find your page**: Look in `pages/` directory
2. **Open the file**: Find `WEBFLOW_EMBED_[PAGE_NAME].html`
3. **Copy entire contents**: Including version header
4. **Paste into Webflow**:
   - Open Webflow Designer
   - Go to the page
   - Page Settings → Custom Code
   - Paste in "Before </body> tag"
   - Save and Publish

## 📋 Files with Stripe Integration

✅ **Ready for deployment**:
- `pages/WEBFLOW_EMBED_MARKETPLACE_CVJ.html` (v2.0) - 6 Stripe buttons
- `pages/WEBFLOW_EMBED_SUBSCRIPTIONS_CVJ.html` (v2.0) - 3 Stripe buttons

⏳ **Not yet integrated**:
- All other pages (no Stripe checkout yet)

## 📖 Documentation

- `docs/WEBFLOW_DEPLOYMENT_INSTRUCTIONS.md` - Complete deployment guide
- `docs/WEBFLOW_FILES_SOURCE_OF_TRUTH.md` - File inventory

## ⚠️ Important

- **Never edit files directly in Webflow** - Always update source files here
- **Version headers** - Check version at top of file
- **Test after deploy** - Verify checkout buttons work

---

## 📄 Page Inventory (23 Pages)

### **Service Type Pages** (4 pages):
1. `WEBFLOW_EMBED_MARKETPLACE_CVJ.html` (v2.0) - ✅ Stripe integrated (6 buttons)
2. `WEBFLOW_EMBED_SUBSCRIPTIONS_CVJ.html` (v2.0) - ✅ Stripe integrated (3 buttons)
3. `WEBFLOW_EMBED_CUSTOM_SOLUTIONS_CVJ.html` - ⏳ Needs Stripe integration
4. `WEBFLOW_EMBED_READY_SOLUTIONS_CVJ.html` - ⏳ Needs Stripe integration

### **Industry/Niche Pages** (16 pages):
5. `WEBFLOW_EMBED_AMAZON-SELLER.html` - Amazon Seller automation
6. `WEBFLOW_EMBED_BUSY-MOM.html` - Busy Mom solutions
7. `WEBFLOW_EMBED_BOOKKEEPING.html` - Bookkeeping automation
8. `WEBFLOW_EMBED_DENTIST.html` - Dental practice automation
9. `WEBFLOW_EMBED_ECOMMERCE.html` - E-commerce automation
10. `WEBFLOW_EMBED_FENCE-CONTRACTOR.html` - Fence contractor solutions
11. `WEBFLOW_EMBED_HVAC.html` - HVAC business automation
12. `WEBFLOW_EMBED_INSURANCE.html` - Insurance agency automation
13. `WEBFLOW_EMBED_LAWYER.html` - Law firm automation
14. `WEBFLOW_EMBED_LOCKSMITH.html` - Locksmith business automation
15. `WEBFLOW_EMBED_PHOTOGRAPHER.html` - Photography business automation
16. `WEBFLOW_EMBED_PRODUCT-SUPPLIER.html` - Product supplier solutions
17. `WEBFLOW_EMBED_REALTOR.html` - Real estate automation
18. `WEBFLOW_EMBED_ROOFER.html` - Roofing business automation
19. `WEBFLOW_EMBED_SYNAGOGUE.html` - Synagogue management
20. `WEBFLOW_EMBED_TORAH-TEACHER.html` - Torah teacher solutions

### **Content Pages** (3 pages):
21. `WEBFLOW_EMBED_ABOUT.html` - About page
22. `WEBFLOW_EMBED_PRICING.html` - Pricing page
23. `WEBFLOW_EMBED_HELP_CENTER.html` - Help center page

### **Template Pages** (exists but not in pages/):
- `WEBFLOW_EMBED_BLOG_POST_TEMPLATE.html`
- `WEBFLOW_EMBED_CASE_STUDY_TEMPLATE.html`
- `WEBFLOW_EMBED_DOCS_TEMPLATE.html`
- `WEBFLOW_EMBED_PRODUCT_TEMPLATE.html`

---

## 📋 Template Files (5 Templates)

1. **Blog Post Template** - For blog articles
2. **Case Study Template** - For customer case studies
3. **Docs Template** - For documentation pages
4. **Product Template** - For product pages
5. **[Template 5]** - TBD

---

## 🔗 Page-to-URL Mapping

### **Live URLs** (rensto.com):

**Service Pages**:
- Marketplace: `/marketplace` → WEBFLOW_EMBED_MARKETPLACE_CVJ.html
- Subscriptions: `/subscriptions` → WEBFLOW_EMBED_SUBSCRIPTIONS_CVJ.html
- Custom Solutions: `/custom` → WEBFLOW_EMBED_CUSTOM_SOLUTIONS_CVJ.html
- Ready Solutions: `/ready-solutions` → WEBFLOW_EMBED_READY_SOLUTIONS_CVJ.html

**Niche Pages** (examples):
- Amazon Seller: `/amazon-seller` → WEBFLOW_EMBED_AMAZON-SELLER.html
- HVAC: `/hvac` → WEBFLOW_EMBED_HVAC.html
- Realtor: `/realtor` → WEBFLOW_EMBED_REALTOR.html

**Content Pages**:
- About: `/about` → WEBFLOW_EMBED_ABOUT.html
- Pricing: `/pricing` → WEBFLOW_EMBED_PRICING.html
- Help: `/help` → WEBFLOW_EMBED_HELP_CENTER.html

---

## 📊 Integration Status

### **Stripe Checkout** (9 buttons total):
- ✅ Marketplace: 6 Stripe buttons (v2.0)
- ✅ Subscriptions: 3 Stripe buttons (v2.0)
- ⏳ Custom Solutions: 0 Stripe buttons (needs integration)
- ⏳ Ready Solutions: 0 Stripe buttons (needs integration)
- ⏳ Niche pages: 0 Stripe buttons (16 pages need integration)

### **Typeforms**:
- ⏳ Integration status unknown (needs audit)

### **Content AI**:
- ⏳ Integration status unknown (needs audit)

---

## 🔄 Relationship to Other Folders

### **webflow/ vs /products/ vs /marketplace/**

**webflow/** (This folder):
- **Purpose**: Page embed files for Webflow deployment
- **Contents**: HTML embed code with JavaScript, Stripe buttons, forms
- **Scope**: Website front-end implementation

**/products/**:
- **Purpose**: Product catalog (what's sold)
- **Contents**: JSON with 8 products, pricing, features
- **Scope**: Product data only

**/marketplace/**:
- **Purpose**: Platform configuration (how marketplace works)
- **Contents**: JSON configs for architecture, pricing tiers, deployment packages
- **Scope**: Marketplace system configuration

**Integration**: Webflow pages should dynamically display products from /products/ catalog and use pricing from /marketplace/ configs

---

## 📊 Webflow Audit Score

**Criteria Met**: 13/17 (76%) - ✅ **GOOD**

**Strengths**:
- ✅ Well-organized directory structure
- ✅ README exists and is current (Oct 5, 2025)
- ✅ Deployment documentation exists
- ✅ Version tracking in files
- ✅ Stripe integration documented (2 pages complete)
- ✅ Clear file naming convention (WEBFLOW_EMBED_*.html)

**Weaknesses**:
- ⏳ Only 2 of 4 service pages have Stripe integration
- ⏳ 16 niche pages missing Stripe buttons
- ⏳ No dynamic product loading from /products/ catalog
- ⏳ Integration status for Typeforms and Content AI unknown

---

## ⚠️ Known Issues

### **Issue 1: Incomplete Stripe Integration**
**Impact**: Only Marketplace and Subscriptions can collect payments
**Solution**: Add Stripe buttons to Custom Solutions and Ready Solutions pages
**Status**: ⚠️ **ACTION REQUIRED**

### **Issue 2: Static Content (No Dynamic Loading)**
**Impact**: Pages show hardcoded content, not data from /products/ or /marketplace/
**Solution**: Build n8n workflow to sync product data → Webflow CMS
**Status**: ⚠️ **PLANNED** - See INT-SYNC-003 in CLAUDE.md

### **Issue 3: Niche Pages Missing CTAs**
**Impact**: 16 niche pages may not have clear conversion paths
**Solution**: Audit all niche pages for Stripe buttons or Typeform links
**Status**: ⏳ **VERIFICATION NEEDED**

---

## 🔧 Usage Instructions

### **Deploying a Page Update**

1. **Edit source file** in this folder
2. **Update version number** at top of file
3. **Test locally** if possible
4. **Copy entire file contents**
5. **Open Webflow Designer**
6. **Navigate to page**
7. **Page Settings → Custom Code → Before </body> tag**
8. **Paste code**
9. **Save and Publish**
10. **Test live page** (especially Stripe buttons)

### **Creating a New Page**

1. **Copy existing template** from templates/
2. **Rename** to WEBFLOW_EMBED_[PAGE_NAME].html
3. **Update content** and version number
4. **Add to pages/** directory
5. **Follow deployment steps** above
6. **Update this README** with new page

---

## 🔗 Related Documentation

- **CLAUDE.md**: Master documentation with business model and service types
- **/products/**: Product catalog (8 products)
- **/marketplace/**: Platform configuration (pricing tiers, deployment packages)
- **docs/WEBFLOW_DEPLOYMENT_INSTRUCTIONS.md**: Detailed deployment guide
- **docs/WEBFLOW_FILES_SOURCE_OF_TRUTH.md**: Complete file inventory

---

## 📞 Questions?

**For deployment**: See deployment instructions above or docs/WEBFLOW_DEPLOYMENT_INSTRUCTIONS.md
**For Stripe integration**: Check which pages have v2.0 (Marketplace, Subscriptions complete)
**For dynamic content**: Wait for INT-SYNC-003 workflow (products → Webflow CMS sync)
**For new pages**: Follow "Creating a New Page" instructions above

---

**Last updated**: October 5, 2025 (Phase 2 Audit #16)
**Next Review**: When adding Stripe buttons to remaining 2 service pages + 16 niche pages
**Maintained By**: Rensto Team
**Total Pages**: 23 (4 service, 16 niche, 3 content)
**Stripe Integration**: 2 of 4 service pages complete (50%)
