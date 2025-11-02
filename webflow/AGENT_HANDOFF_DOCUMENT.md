# 🔄 Agent Handoff Document - Webflow Site Development

**Date Created**: October 31, 2025  
**Last Updated**: October 31, 2025  
**Status**: Active Development - Ready for Handoff  
**Project**: Rensto.com Webflow Site - Complete Site Architecture & Deployment

---

## 📋 TABLE OF CONTENTS

1. [Project Overview](#project-overview)
2. [Current Session Summary](#current-session-summary)
3. [Architecture & Technical Decisions](#architecture--technical-decisions)
4. [Completed Work](#completed-work)
5. [In Progress Work](#in-progress-work)
6. [Pending Tasks](#pending-tasks)
7. [File Structure & Locations](#file-structure--locations)
8. [Critical Information](#critical-information)
9. [Step-by-Step Guides](#step-by-step-guides)
10. [Known Issues & Blockers](#known-issues--blockers)
11. [Next Steps](#next-steps)

---

## 🎯 PROJECT OVERVIEW

### **What We're Building**
Complete Rensto.com website on Webflow with:
- 4 main service pages (Marketplace, Subscriptions, Ready Solutions, Custom Solutions)
- 16+ niche industry pages
- Case Studies page
- Homepage
- All pages with Stripe checkout integration
- Complete brand system CSS
- SEO optimization (schema markup, meta tags)
- Mobile-responsive design

### **Business Context**
- **Site**: https://rensto.com
- **Site ID**: `66c7e551a317e0e9c9f906d8`
- **4 Service Types**: Marketplace, Subscriptions, Ready Solutions, Custom Solutions
- **Payment Integration**: Stripe checkout (GitHub CDN scripts)
- **Brand Colors**: Red (#fe3d51), Orange (#bf5700), Blue (#1eaef7), Cyan (#5ffbfd), Dark BG (#110d28)

---

## 📊 CURRENT SESSION SUMMARY

### **Main Accomplishments**
1. ✅ **CSS Alignment Fixes**: Deployed complete brand system with alignment fixes (logo centering, button heights, footer alignment)
2. ✅ **Page Relevance Analysis**: Audited all 49 pages, categorized into relevant/investigate/redundant/templates
3. ✅ **Case Studies Page**: Created complete `/case-studies` page with content, schema markup, and meta tags
4. ✅ **Priority 0 Cleanup**: Set up redirects for redundant pages (`/lead-machine` → `/subscriptions`, `/case-studies-archived` → `/case-studies`)
5. ✅ **Nav & Footer Embed Elements**: Created Designer-visible Code Embed elements for navigation and footer

### **Current Focus**
**Case Studies Page Structure**: Converting nav/footer from Component Instances to Code Embed elements so they're visible in Designer, matching the architecture of other service pages.

---

## 🏗️ ARCHITECTURE & TECHNICAL DECISIONS

### **Webflow Site Structure**

#### **Page Types**
1. **Service Pages** (4 pages - Revenue Critical):
   - `/marketplace` - Pre-built workflow templates
   - `/subscriptions` - Monthly lead generation services
   - `/ready-solutions` - Industry-specific packages
   - `/custom-solutions` - Bespoke automation projects

2. **Supporting Pages** (28 relevant pages):
   - Homepage, About, Contact, Help Center, Blog, Documentation, Case Studies
   - 16 niche industry pages (HVAC, Dentist, Realtor, etc.)
   - Legal pages (Privacy, Terms, Cookie Policy, EULA)

3. **Redundant Pages** (6 pages - Marked for deletion):
   - `/lead-machine` → Redirects to `/subscriptions` (301)
   - `/case-studies-archived` → Redirects to `/case-studies` (301)
   - 4 unused CMS templates

### **Code Deployment Strategy**

#### **Three Deployment Methods Used**

**1. Page Settings → Custom Code** (Most Common)
- **Location**: Page Settings → Custom Code → Before `</body>` tag
- **Used For**: Page-specific content (hero sections, features, CTAs)
- **Example**: `case-studies-page-body-code.txt` → Case Studies page

**2. Site Settings → Custom Code** (Global Styles)
- **Location**: Site Settings → Custom Code → Code in `<head>` tag
- **Used For**: Global CSS, brand system, alignment fixes
- **Example**: `rensto-brand-system-with-alignment-fixes.txt` → Site-wide

**3. Designer Code Embed Elements** (Visible in Designer)
- **Location**: Designer canvas → Add Embed element → Paste code
- **Used For**: Nav, footer, page content (visible in Designer Navigator)
- **Example**: `nav-embed-code.txt`, `footer-embed-code.txt`, `case-studies-page-body-code.txt`

### **Payment Integration Architecture**

**Stripe Checkout Flow**:
```
Webflow Button → CDN Script (checkout.js) → API Call (/api/stripe/checkout) → Stripe Checkout → Webhook → n8n Workflow
```

**Scripts Location**: GitHub CDN (auto-deploy on push)
- Base URL: `https://rensto-webflow-scripts.vercel.app`
- Shared: `/shared/stripe-core.js` (all pages)
- Page-specific: `/marketplace/checkout.js`, `/subscriptions/checkout.js`, etc.

**API Endpoint**: `https://api.rensto.com/api/stripe/checkout` (Vercel Next.js)

### **CSS Architecture**

**Brand System Hierarchy**:
1. **Global CSS** (Site Settings → `<head>`): `rensto-brand-system-with-alignment-fixes.txt`
   - Brand colors, typography, spacing variables
   - Global resets and base styles
   - Alignment fixes (logo centering, button heights)

2. **Page-Specific CSS** (Page Settings → Before `</body>`): Inline styles in page content
   - Scoped to page-specific classes (`.case-studies-page`, etc.)
   - Uses brand system CSS variables

3. **Component CSS** (Code Embed elements): Scoped styles per component
   - Nav styles: `.rensto-header`, `.rensto-nav`
   - Footer styles: `.rensto-footer`
   - Uses `!important` to override Webflow defaults

### **SEO Architecture**

**Schema Markup Strategy**:
- **Service Pages**: `Service` schema + `Offer` schema + `Organization` schema
- **Homepage**: `Organization` schema + `WebSite` schema
- **Case Studies**: `CollectionPage` schema + `Article` schemas (3 items)
- **Location**: Page Settings → Custom Code → Code in `<head>` tag

**Meta Tags**:
- All pages have: Open Graph tags, Twitter Card tags, Canonical URLs
- Meta descriptions: 150-160 characters
- Page titles: "Page Name - Description | Rensto"

---

## ✅ COMPLETED WORK

### **1. CSS & Brand System** ✅

**Files**:
- `webflow/css-audit-results/rensto-brand-system-with-alignment-fixes.txt` (739 lines)
- `webflow/css-audit-results/alignment-fixes-direct-deploy.txt` (245 lines)

**What Was Done**:
- ✅ Complete brand system CSS created
- ✅ Alignment fixes applied (logo vertical centering, button 48px height, footer flexbox)
- ✅ CSS deployed to Site Settings → Custom Code → `<head>` tag
- ✅ CSS verified on all 4 service pages + homepage
- ✅ Selector specificity fixed (added `!important` flags, specific selectors)

**Status**: ✅ **LIVE** - CSS is active on all pages

---

### **2. Page Relevance Analysis** ✅

**File**: `webflow/PAGE_RELEVANCE_ANALYSIS.md`

**What Was Done**:
- ✅ Audited all 49 Webflow pages
- ✅ Categorized: 28 relevant, 8 investigate, 6 redundant, 7 templates
- ✅ Identified redundant pages for cleanup
- ✅ Documented CMS template usage

**Results**:
- **Relevant Pages**: 28 (keep and maintain)
- **Investigate**: 8 (need decisions)
- **Redundant**: 6 (delete after redirects)
- **Templates**: 7 (verify CMS usage)

---

### **3. Priority 0 Cleanup** ✅ (Partial)

**Files**:
- `webflow/PRIORITY_0_CLEANUP_EXECUTION.md`
- `webflow/EXTRACTED_CONTENT_ARCHIVE.md`
- `webflow/REDIRECT_VERIFICATION_REPORT.md`

**What Was Done**:
- ✅ Content extracted from `/lead-machine` and `/case-studies-archived`
- ✅ Redirects set up: `/lead-machine` → `/subscriptions` (301)
- ✅ Redirects set up: `/case-studies-archived` → `/case-studies` (301)
- ✅ Pages saved as draft in Webflow Designer
- ✅ Redirects verified (301 status confirmed)

**Status**: ✅ **COMPLETE** - Redirects are live

---

### **4. Case Studies Page** ✅ (In Final Steps)

**Files**:
- `webflow/deployment-snippets/case-studies-page-body-code.txt` (660 lines)
- `webflow/deployment-snippets/case-studies-schema-head-code.txt` (145 lines)
- `webflow/CASE_STUDIES_COMPLETE_DEPLOYMENT.md`
- `webflow/CASE_STUDIES_COMPLETE_DESIGNER_STRUCTURE.md`

**What Was Done**:
- ✅ Page created in Webflow Designer (`/case-studies`)
- ✅ Content deployed (hero, impact stats, 3 case studies, CTA)
- ✅ Schema markup deployed (CollectionPage + 3 Article schemas)
- ✅ Meta tags deployed (Open Graph, Twitter Card, Canonical)
- ✅ SEO settings configured (page title, meta description)
- ✅ Page published (live at https://rensto.com/case-studies)
- ✅ Conflict analysis complete (no conflicts with global nav/footer)
- ✅ Nav and footer Code Embed elements created

**Current Task**: Converting nav/footer from Component Instances to Code Embed elements for Designer visibility

**Status**: ⏳ **95% COMPLETE** - Final structure update needed

---

### **5. Nav & Footer Embed Elements** ✅ (Created, Needs Deployment)

**Files**:
- `webflow/deployment-snippets/nav-embed-code.txt` (191 lines)
- `webflow/deployment-snippets/footer-embed-code.txt` (209 lines)

**What Was Done**:
- ✅ Navigation Code Embed element created (visible in Designer)
- ✅ Footer Code Embed element created (visible in Designer)
- ✅ Both aligned with brand system CSS variables
- ✅ Both use `!important` flags for Webflow override
- ✅ Both responsive (mobile menu toggle for nav)
- ✅ Footer includes GSAP animations (if GSAP loaded)

**Status**: ✅ **FILES READY** - Needs deployment to Case Studies page

---

### **6. SEO Optimization** ✅

**What Was Done**:
- ✅ Schema markup on all 4 service pages (Service, Offer, Organization)
- ✅ Schema markup on homepage (Organization, WebSite)
- ✅ Schema markup on Case Studies (CollectionPage, Article)
- ✅ Meta descriptions on all priority pages
- ✅ Open Graph tags on all pages
- ✅ Twitter Card tags on all pages
- ✅ Canonical URLs on all pages

**Status**: ✅ **COMPLETE** - All pages optimized

---

## ⏳ IN PROGRESS WORK

### **1. Case Studies Page Structure Update** ⏳

**Current Task**: Update Case Studies page to use Code Embed elements for nav and footer (matching other service pages)

**What's Needed**:
1. In Webflow Designer → Case Studies page
2. Check if `nav` is Component Instance or Embed Element
3. If Component Instance → Delete → Add Embed → Paste `nav-embed-code.txt`
4. Check if `footer` is Component Instance or Embed Element
5. If Component Instance → Delete → Add Embed → Paste `footer-embed-code.txt`
6. Verify all 3 Code Embeds visible in Navigator
7. Save → Publish

**Files**:
- `webflow/deployment-snippets/nav-embed-code.txt`
- `webflow/deployment-snippets/footer-embed-code.txt`
- `webflow/CASE_STUDIES_COMPLETE_DESIGNER_STRUCTURE.md`

**Status**: ⏳ **READY TO EXECUTE**

---

## 📋 PENDING TASKS

### **Priority 1: Standardize All Service Pages**

**Task**: Ensure all 4 service pages use consistent structure (Nav Code Embed → Content Code Embed → Footer Code Embed)

**Pages to Check/Update**:
- ✅ Marketplace (has 3 components - likely correct)
- ⚠️ Subscriptions (has 2 components - needs check)
- ⚠️ Ready Solutions (needs check)
- ⚠️ Custom Solutions (needs check)
- ⏳ Case Studies (in progress)

**Action**: 
1. Verify each page's structure in Designer
2. Add Code Embed elements where missing
3. Standardize nav/footer across all pages

**Estimated Time**: 1-2 hours

---

### **Priority 2: Visual Audit of 28 Relevant Pages**

**Status**: Started (7/49 pages audited, 14% complete)

**What's Needed**:
- Audit remaining 21 relevant pages
- Check for missing images/videos
- Verify alignment and consistency
- Test mobile responsiveness

**File**: `webflow/VISUAL_AUDIT_SUMMARY.md`

**Estimated Time**: 4-6 hours

---

### **Priority 3: Device Testing**

**Task**: Manual device testing on priority pages

**Pages to Test**:
- Homepage
- Marketplace
- Subscriptions
- Ready Solutions
- Custom Solutions
- Case Studies

**What to Test**:
- Forms submit successfully
- Stripe checkout buttons work
- Pages load without console errors
- Responsive layout (no horizontal scroll)
- Load time < 3 seconds
- Images optimized

**File**: `webflow/mobile-perfection-checklist.md`

**Estimated Time**: 2-3 hours

---

### **Priority 4: Lighthouse/PageSpeed Audit**

**Task**: Run performance audits on all priority pages

**Tool**: Lighthouse CLI (needs installation)

**Pages to Audit**:
- Homepage
- 4 service pages
- Case Studies

**What to Check**:
- Performance score (target: 90+)
- Accessibility score (target: 95+)
- Best practices score (target: 95+)
- SEO score (target: 95+)

**File**: `webflow/lighthouse-audit-tool.js`

**Estimated Time**: 1-2 hours

---

### **Priority 5: Content Strategy Integration**

**Task**: Integrate provided content strategy visuals into website

**What's Needed**:
- Review content strategy document
- Identify where videos/graphics should go
- Add visual content to relevant pages
- Ensure brand consistency

**File**: `webflow/CONTENT_STRATEGY_IMPLEMENTATION.md`

**Estimated Time**: 3-4 hours

---

## 📁 FILE STRUCTURE & LOCATIONS

### **Deployment Snippets** (`webflow/deployment-snippets/`)

**Page Content Files**:
- `case-studies-page-body-code.txt` - Case Studies page content (660 lines)
- `homepage-body-code-optimized.txt` - Homepage content (693 lines)
- `homepage-body-code-with-stripe.txt` - Homepage with Stripe scripts (511 lines)

**Schema Markup Files**:
- `case-studies-schema-head-code.txt` - Case Studies schema (145 lines)
- `homepage-schema-head-code.txt` - Homepage schema

**Component Files**:
- `nav-embed-code.txt` - Navigation Code Embed (191 lines)
- `footer-embed-code.txt` - Footer Code Embed (209 lines)

**Other**:
- `DEPLOYMENT_REPORT.json` - Deployment tracking

---

### **CSS Files** (`webflow/css-audit-results/`)

**Main Files**:
- `rensto-brand-system-with-alignment-fixes.txt` - Complete brand system (739 lines)
- `alignment-fixes-direct-deploy.txt` - Alignment fixes only (245 lines)
- `alignment-fixes.css` - Generated alignment fixes

**Audit Results**:
- `css-audit-[timestamp].json` - Audit findings
- `alignment-fixes-injector.js` - JavaScript CSS injector (not used)

---

### **Documentation Files** (`webflow/`)

**Analysis & Planning**:
- `PAGE_RELEVANCE_ANALYSIS.md` - All 49 pages categorized
- `PRIORITY_0_CLEANUP_EXECUTION.md` - Cleanup execution plan
- `EXTRACTED_CONTENT_ARCHIVE.md` - Content from deleted pages
- `CASE_STUDIES_COMPLETE_DESIGNER_STRUCTURE.md` - Current structure guide

**Deployment Guides**:
- `CASE_STUDIES_COMPLETE_DEPLOYMENT.md` - Case Studies deployment
- `CSS_DEPLOYMENT_SUCCESS.md` - CSS deployment status
- `REDIRECT_VERIFICATION_REPORT.md` - Redirect status

**Audit Reports**:
- `VISUAL_AUDIT_SUMMARY.md` - Visual audit progress
- `AUDIT_EXECUTION_SUMMARY.md` - All audits consolidated

---

## 🔑 CRITICAL INFORMATION

### **Webflow Credentials**

**Site Information**:
- **Site ID**: `66c7e551a317e0e9c9f906d8`
- **Site URL**: https://rensto.com
- **Designer URL**: https://rensto.design.webflow.com

**API Keys** (Location: `~/.cursor/mcp.json` or user-provided):
- **Site API Token**: `90b67c9892c0067fde5f716f9a95f2e0b863cbbf496465cdeef5ddc817e4124b`
- **OAuth Client ID**: `9019376a6596d4dff6bc765563e07aee92469e2`

**Note**: v2 Custom Code API requires OAuth token (not Site API token)

---

### **Page IDs** (Important for API calls)

- **Homepage**: Primary page (no specific ID needed)
- **Marketplace**: `68ddb0fb5b6408d0687890dd`
- **Subscriptions**: `68dfc41ffedc0a46e687c84b`
- **Case Studies**: `6905208b87881520f8fb1fa4`

**To Find Other Page IDs**: Use `mcp_webflow_pages_list` tool

---

### **Brand System Colors** (CSS Variables)

```css
--red: #fe3d51;
--orange: #bf5700;
--blue: #1eaef7;
--cyan: #5ffbfd;
--dark-bg: #110d28;
--light-bg: #1a162f;
--light-text: #ffffff;
--gray-text: #a0a0a0;
```

**Font**: 'Outfit', sans-serif

**Button Height**: 48px (minimum, with padding)

---

### **Stripe Integration**

**CDN Scripts** (GitHub/Vercel):
- Base: `https://rensto-webflow-scripts.vercel.app`
- Core: `/shared/stripe-core.js`
- Page-specific: `/{page-name}/checkout.js`

**API Endpoint**: `https://api.rensto.com/api/stripe/checkout`

**Workflow**: Button click → CDN script → API call → Stripe checkout → Webhook → n8n

**Status**: ✅ All 5 payment flows live (19 pages deployed)

---

### **Component IDs** (From API responses)

- **Nav Component**: `19798a5e-deac-69d3-575b-03a89d1fe4e0`
- **Footer Component**: `0b8b7475-7668-458c-e326-a5473489d697`
- **Custom Code Element** (Marketplace): `db7935ff-807b-dab9-ea8f-ac274a1f6187`

**Note**: Component Instances may be replaced with Code Embed elements for Designer visibility

---

## 📖 STEP-BY-STEP GUIDES

### **Guide 1: Deploy Code Embed Elements to Case Studies Page**

**Location**: `webflow/CASE_STUDIES_COMPLETE_DESIGNER_STRUCTURE.md`

**Quick Steps**:
1. Open Case Studies page in Webflow Designer
2. In Navigator, check `nav` element type
3. If Component Instance → Delete → Add Embed → Paste `nav-embed-code.txt`
4. Check `footer` element type
5. If Component Instance → Delete → Add Embed → Paste `footer-embed-code.txt`
6. Verify 3 Code Embeds visible (nav, content, footer)
7. Save → Publish

---

### **Guide 2: Standardize Service Page Structure**

**For Each Service Page** (Marketplace, Subscriptions, Ready Solutions, Custom Solutions):

1. **Open page in Designer**
2. **Check Navigator structure**:
   - Should show: `nav` → `Code Embed` → `footer`
3. **Verify nav**:
   - If Component Instance → Consider replacing with Code Embed for visibility
   - If Code Embed → Verify content matches `nav-embed-code.txt`
4. **Verify footer**:
   - If Component Instance → Consider replacing with Code Embed for visibility
   - If Code Embed → Verify content matches `footer-embed-code.txt`
5. **Verify page content**:
   - Code Embed should contain page-specific content
   - Should not duplicate nav/footer
6. **Save → Publish**

---

### **Guide 3: Add Schema Markup to New Page**

**For Any New Page**:

1. **Create schema markup file**:
   - Location: `webflow/deployment-snippets/{page-name}-schema-head-code.txt`
   - Include: JSON-LD schema, Open Graph tags, Twitter Card tags, Canonical URL

2. **Deploy to page**:
   - Webflow Designer → Page Settings → Custom Code → Code in `<head>` tag
   - Paste entire file
   - Save

3. **Verify**:
   - Publish site
   - Visit page → View source → Check for `application/ld+json` in `<head>`

---

### **Guide 4: Deploy CSS Alignment Fixes**

**If CSS needs updating**:

1. **Edit brand system file**:
   - `webflow/css-audit-results/rensto-brand-system-with-alignment-fixes.txt`

2. **Deploy to Webflow**:
   - Site Settings → Custom Code → Code in `<head>` tag
   - Replace existing CSS with updated version
   - Save → Publish

3. **Verify**:
   - Visit any page → View source → Check for CSS in `<head>`
   - Test alignment (logo centered, buttons 48px height, footer aligned)

---

## ⚠️ KNOWN ISSUES & BLOCKERS

### **Issue 1: Webflow API Rate Limits**

**Problem**: Publishing site via API has rate limits (429 errors)

**Current Status**: Rate limit hit occasionally when publishing multiple times

**Solution**:
- Use manual publish in Designer when rate limited
- Wait 15-30 minutes between API publish attempts
- Use v1 API for publishing (more reliable than v2)

**Workaround**: Manual publish via Designer UI (always works)

---

### **Issue 2: CSS Selector Specificity**

**Problem**: Webflow default styles override custom CSS

**Solution Applied**: Use `!important` flags and specific selectors

**Example**:
```css
.rensto-nav {
    display: flex !important;
    align-items: center !important;
}
```

**Status**: ✅ **RESOLVED** - All CSS uses `!important` where needed

---

### **Issue 3: Code Embed Visibility in Designer**

**Problem**: Code Embed elements show warning: "This `<script>` embed will only appear on published/exported site"

**Status**: ✅ **EXPECTED BEHAVIOR** - Code Embeds work on live site, Designer preview may not show all scripts

**Workaround**: Publish site to see full functionality

---

### **Issue 4: GSAP Animations**

**Problem**: Footer GSAP animations require GSAP library to be loaded

**Solution**: Added conditional check in footer script:
```javascript
if (typeof gsap === 'undefined') {
    return; // Skip animations if GSAP not loaded
}
```

**Status**: ✅ **HANDLED** - Animations gracefully skip if GSAP not available

---

### **Issue 5: Webflow Custom Code API Limitations**

**Problem**: v2 Custom Code API requires OAuth token (not Site API token)

**Current Status**: Using manual deployment in Designer

**Future Solution**: Set up OAuth flow for automated deployment

**Workaround**: Manual paste in Designer (reliable and fast)

---

## 🚀 NEXT STEPS

### **Immediate (Today)**

1. **Complete Case Studies Structure** ⏳
   - Update nav/footer to Code Embed elements
   - Verify all 3 Code Embeds visible in Designer
   - Publish and verify live site

2. **Verify Other Service Pages Structure**
   - Check Marketplace, Subscriptions, Ready Solutions, Custom Solutions
   - Ensure consistent structure across all pages
   - Update if needed

---

### **Short Term (This Week)**

3. **Continue Visual Audit**
   - Audit remaining 21 relevant pages
   - Document missing visuals
   - Create implementation plan

4. **Device Testing**
   - Test priority pages on mobile devices
   - Fix any responsive issues
   - Verify Stripe checkout works on mobile

5. **Lighthouse Audits**
   - Install Lighthouse CLI
   - Run audits on priority pages
   - Fix performance issues

---

### **Medium Term (This Month)**

6. **Content Strategy Integration**
   - Add videos/graphics to relevant pages
   - Ensure brand consistency
   - Optimize visual content

7. **Standardize All Pages**
   - Ensure consistent structure across all 28 relevant pages
   - Verify nav/footer on all pages
   - Document final architecture

8. **Final QA**
   - Comprehensive testing of all pages
   - SEO verification
   - Performance optimization

---

## 🔧 TOOLS & RESOURCES

### **Webflow MCP Tools Available**

**Page Management**:
- `mcp_webflow_pages_list` - List all pages
- `mcp_webflow_pages_get_content` - Get page content/structure
- `mcp_webflow_pages_get_metadata` - Get page SEO settings
- `mcp_webflow_pages_update_page_settings` - Update page settings

**Site Management**:
- `mcp_webflow_sites_publish` - Publish site (rate limited)
- `mcp_webflow_sites_get` - Get site info

**Custom Code**:
- `mcp_webflow_add_inline_site_script` - Add inline script to site
- `mcp_webflow_site_registered_scripts_list` - List registered scripts

**Note**: Page-specific custom code (Before `</body>`) requires manual deployment via Designer

---

### **File References**

**All deployment files**: `webflow/deployment-snippets/`
**All documentation**: `webflow/*.md`
**CSS files**: `webflow/css-audit-results/`

---

## 📝 IMPORTANT NOTES

### **Designer vs. Published Site**

- **Designer Preview**: May not show all scripts/CSS (especially Code Embeds)
- **Published Site**: Shows full functionality
- **Always test on published site** after making changes

---

### **CSS Deployment Method**

**Current Method**: Direct paste into Site Settings → Custom Code → `<head>` tag

**Why**: Webflow's script registration API wraps CSS in `<script>` tags, preventing CSS from applying. Direct paste works reliably.

---

### **Component Instances vs. Code Embeds**

**Component Instances**:
- Global changes (update once, affects all pages)
- Less visible in Designer
- Better for consistency

**Code Embeds**:
- Page-specific customization
- Visible in Designer Navigator
- Better for per-page control

**Recommendation**: Use Code Embeds for nav/footer on service pages (visibility + customization)

---

### **Publishing Workflow**

**Always**:
1. Make changes in Designer
2. Save
3. Publish (manually or via API)
4. Verify on live site
5. Test functionality

**Never**: Skip publishing step - changes won't be live until published

---

## ✅ SUCCESS CRITERIA

### **Case Studies Page**
- [x] Page created and published
- [x] Content visible on live site
- [x] Schema markup deployed
- [x] Meta tags deployed
- [ ] Nav/footer as Code Embeds (in progress)
- [ ] All 3 Code Embeds visible in Designer

### **Site-Wide**
- [x] Brand system CSS deployed
- [x] Alignment fixes applied
- [x] All service pages have Stripe checkout
- [x] SEO optimization complete
- [ ] Consistent page structure (in progress)
- [ ] Visual audit complete
- [ ] Device testing complete
- [ ] Performance audits complete

---

## 🎯 QUICK REFERENCE

### **Common Tasks**

**Add schema to page**: Page Settings → Custom Code → `<head>` → Paste schema file
**Add page content**: Page Settings → Custom Code → Before `</body>` → Paste content file
**Add Code Embed**: Designer → Add Embed → Paste code
**Publish site**: Top-right "Publish" button → Select domains → Publish
**Check page structure**: Navigator panel (left sidebar)

### **Troubleshooting**

**CSS not applying**: Check selector specificity, add `!important`, verify in Site Settings
**Code Embed not visible**: Publish site, Code Embeds work on live site
**Publish fails**: Rate limit - wait 15-30 minutes or use manual publish
**Schema not showing**: Verify pasted in `<head>`, publish site, check page source

---

## 📞 KEY CONTACTS & RESOURCES

**Webflow Dashboard**: https://webflow.com/dashboard
**Designer**: https://rensto.design.webflow.com
**Live Site**: https://rensto.com
**GitHub CDN**: https://rensto-webflow-scripts.vercel.app

**Documentation**:
- Main project docs: `/docs/`
- Webflow-specific: `/webflow/*.md`
- Deployment snippets: `/webflow/deployment-snippets/`

---

**Last Updated**: October 31, 2025  
**Next Review**: After Case Studies structure update complete  
**Status**: Ready for handoff - all information current and actionable

---

## 🔄 AGENT TRANSITION CHECKLIST

**Before Taking Over**:
- [ ] Read this entire document
- [ ] Understand current task (Case Studies structure update)
- [ ] Review file locations in "File Structure" section
- [ ] Check "Known Issues" for any blockers
- [ ] Review "Next Steps" for immediate priorities

**Starting Work**:
- [ ] Check current status in Designer (open Case Studies page)
- [ ] Verify what's been completed (see "Completed Work")
- [ ] Start with "Immediate" tasks in "Next Steps"
- [ ] Update this document as you make progress

**If Stuck**:
- [ ] Review "Step-by-Step Guides" section
- [ ] Check "Known Issues" for similar problems
- [ ] Review file locations and references
- [ ] Check Webflow Designer directly for current state

---

**Ready for handoff!** 🚀

