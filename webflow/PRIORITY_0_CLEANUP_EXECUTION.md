# 🧹 Priority 0 Cleanup - Execution Plan

**Date**: October 31, 2025  
**Status**: ⏳ **Ready to Execute**  
**Pages to Clean**: 2 redundant pages

---

## 📋 **CONTENT EXTRACTED**

### **1. `/lead-machine` → Redirect to `/subscriptions`**

**Content Summary**:
- **H1**: "AI-Powered Lead Generation"
- **Description**: "Transform your business with AI-powered lead generation. Get 5-500 qualified leads automatically with our advanced automation platform."
- **Typeform**: Embedded (`https://form.typeform.com/to/DyDRE3PD`)
- **Purpose**: Lead capture form for lead generation service

**Analysis**: ✅ **CONFIRMED REDUNDANT**
- Overlaps completely with `/subscriptions` page
- Subscriptions page offers 100-500+ leads/month (more comprehensive)
- Typeform can be reused/repurposed if needed

**Action**: Redirect → Delete

---

### **2. `/case-studies-archived` → Redirect to `/case-studies`**

**Content Extracted**: 3 Complete Case Studies

#### **Case Study 1: Shelly (Insurance)**
- **Industry**: Insurance
- **Service**: Custom Solutions
- **Title**: "From Hours of Manual Profiling to Instant Automation"
- **Problem**: 4-5 hours daily on client profiling, manual data entry
- **Solution**: AI-powered client profiling automation
- **Results**: 4.5h saved daily, 90% faster profiling, 300% more client time
- **Quote**: "I used to spend 4-5 hours every day just on client profiling. Now my system does it automatically while I focus on what really matters - building relationships and closing deals."

#### **Case Study 2: Tax4Us (Tax Services)**
- **Industry**: Tax Services
- **Service**: Custom Solutions
- **Title**: "From Manual Content Creation to AI-Powered Content Agents"
- **Problem**: 20+ hours weekly on content creation
- **Solution**: AI-powered WordPress blogs, podcast scripts, social media automation
- **Results**: 20h saved weekly, 5x more content output, 150% engagement increase
- **Quote**: "I was spending 20+ hours a week on content creation. Now my AI agents handle everything - WordPress blogs, podcast scripts, social media posts. I can focus on growing the business instead of creating content."

#### **Case Study 3: Wonder.care (Healthcare)**
- **Industry**: Healthcare
- **Service**: Custom Solutions
- **Title**: "From Spreadsheet Chaos to Intelligent Workflow Management"
- **Problem**: 60% of time spent on data entry and spreadsheet management
- **Solution**: Automated patient data processing, intelligent workflow management
- **Results**: 60% time reduction, 3x more patient focus, 95% accuracy improvement
- **Quote**: "My team was spending 60% of their time on data entry and spreadsheet management. Now they focus on what matters most - patient care. The automation handles everything seamlessly."

**Additional Content**:
- **Stats Section**: "Our Impact in Numbers"
  - 500+ Businesses Transformed
  - 75% Average Time Savings
  - $2.3M Total Cost Savings
  - 98% Customer Satisfaction

**Analysis**: ✅ **CONTENT SHOULD BE PRESERVED**
- 3 valuable case studies (Shelly, Tax4Us, Wonder.care)
- Impact stats section
- Should be moved to `/case-studies` (CMS collection) if not already there

**Action**: Extract → Move to CMS → Redirect → Delete

---

## 🎯 **EXECUTION STEPS**

### **Step 1: Delete or Save Pages as Draft** (5 minutes)

⚠️ **CRITICAL**: You must delete or save pages as draft BEFORE setting up redirects!

According to Webflow documentation:
> "To redirect an existing static page on your Webflow site to a new URL, you'll need to delete or save the page as a draft, or change its slug before setting the redirect."

#### **Option A: Save as Draft** (Recommended - Safer)
1. Open Webflow Designer
2. Go to **Pages** panel (left sidebar)
3. Find **"Lead Machine"** page
4. Click the **three dots** (⋯) next to the page
5. Select **"Save as draft"** or toggle draft mode
6. Repeat for **"Case Studies - Success Stories (ARCHIVED)"** page

#### **Option B: Delete Pages** (If you're confident)
1. Open Webflow Designer
2. Go to **Pages** panel
3. Find **"Lead Machine"** page
4. Right-click → **"Delete"** → Confirm
5. Repeat for **"Case Studies - Success Stories (ARCHIVED)"** page

---

### **Step 2: Set Up Redirects** (5 minutes)

#### **Redirect 1: `/lead-machine` → `/subscriptions`**
**Method**: Webflow Site Settings → Publishing → 301 Redirects

1. Open Webflow Designer
2. Go to **Site Settings** (gear icon in left sidebar)
3. Click **"Publishing"** tab (NOT "Hosting")
4. Scroll to **"301 Redirects"** section
5. Click **"Add redirect path"** button
6. In the modal that appears:
   - **Old path**: `/lead-machine`
   - **Redirect to path**: `/subscriptions`
7. Click **"Add redirect path"** button in modal
8. Redirect is added to the list

#### **Redirect 2: `/case-studies-archived` → `/case-studies`**
1. In the same **"301 Redirects"** section
2. Click **"Add redirect path"** button again
3. In the modal:
   - **Old path**: `/case-studies-archived`
   - **Redirect to path**: `/case-studies`
4. Click **"Add redirect path"** button in modal
5. Both redirects should now appear in the list

---

### **Step 3: Publish Site** (2 minutes)

1. Click **"Publish"** button (top right of Webflow Designer)
2. Select all domains
3. Click **"Publish to production"**
4. Redirects are now live!

---

### **Step 2: Preserve Case Studies Content** (10 minutes)

**If `/case-studies` CMS collection exists**:
1. Open Webflow Designer
2. Go to **CMS Collections**
3. Find **"Case Studies"** collection
4. Check if Shelly, Tax4Us, Wonder.care case studies already exist
5. If missing, create new CMS items with extracted content:
   - **Shelly Case Study**: Insurance, Custom Solutions
   - **Tax4Us Case Study**: Tax Services, Custom Solutions
   - **Wonder.care Case Study**: Healthcare, Custom Solutions

**Note**: Content already extracted in this document for reference.

---

### **Step 3: Verify Redirects** (2 minutes)

1. Visit `https://rensto.com/lead-machine`
   - Should redirect to `https://rensto.com/subscriptions`
   - Check browser network tab → Status should be **301**

2. Visit `https://rensto.com/case-studies-archived`
   - Should redirect to `https://rensto.com/case-studies`
   - Check browser network tab → Status should be **301**

---

### **Step 4: Verify Redirects** (2 minutes)

**After publishing**, test the redirects:

1. Open a new browser tab (or incognito window)
2. Visit `https://rensto.com/lead-machine`
   - Should automatically redirect to `https://rensto.com/subscriptions`
   - Check browser address bar → URL should change
   - Check browser DevTools → Network tab → Status should be **301 Moved Permanently**

3. Visit `https://rensto.com/case-studies-archived`
   - Should automatically redirect to `https://rensto.com/case-studies`
   - Check browser address bar → URL should change
   - Check browser DevTools → Network tab → Status should be **301 Moved Permanently**

---

### **Step 5: Final Page Deletion** (Optional - Only if saved as draft)

**⚠️ IMPORTANT**: Only delete pages if you saved them as draft in Step 1!

If you chose **Option A (Save as Draft)** in Step 1:
- Pages are already saved as drafts → No further action needed
- Draft pages won't appear on live site
- Redirects will work for any old links/bookmarks

If you chose **Option B (Delete)** in Step 1:
- Pages are already deleted → No further action needed
- ✅ Cleanup complete!

---

## ✅ **VERIFICATION CHECKLIST**

After cleanup:
- [ ] Pages saved as draft OR deleted (Step 1 complete)
- [ ] Redirect `/lead-machine` → `/subscriptions` added in Site Settings → Publishing → 301 Redirects
- [ ] Redirect `/case-studies-archived` → `/case-studies` added in Site Settings → Publishing → 301 Redirects
- [ ] Site published (redirects live)
- [ ] Redirect `/lead-machine` → `/subscriptions` works (301 status - tested in browser)
- [ ] Redirect `/case-studies-archived` → `/case-studies` works (301 status - tested in browser)
- [ ] Case studies content preserved in CMS (if applicable)
- [ ] No broken internal links (search site for old URLs)
- [ ] No broken external links (check Google Search Console)

---

## 📊 **EXPECTED RESULTS**

After Priority 0 cleanup:
- ✅ **2 pages saved as draft OR deleted** (reduces 49 → 47 pages)
- ✅ **2 redirects live** (SEO preserved, 301 status)
- ✅ **Content preserved** (case studies archived in `EXTRACTED_CONTENT_ARCHIVE.md`)
- ✅ **No broken links** (all old URLs redirect automatically)
- ✅ **Cleaner site structure** (only relevant pages remain)

---

## ⚠️ **IMPORTANT NOTES**

1. **Order Matters**: Delete/save as draft BEFORE setting redirects
   - Webflow requires pages to be deleted/drafted before redirects can be set
   - If you get an error, the page still exists and needs to be removed first

2. **Redirect Location**: Site Settings → Publishing → 301 Redirects
   - NOT "Hosting" tab (common mistake)
   - NOT "SEO" tab
   - Must be in **"Publishing"** tab

3. **Test Redirects After Publishing**
   - Use incognito window to avoid cached pages
   - Check browser DevTools Network tab for 301 status
   - Both redirects should work immediately after publishing

4. **Check Google Search Console** for any errors (24-48 hours after)
   - Monitor redirect chains
   - Check for crawl errors

5. **Internal Links Audit** (Optional)
   - Search entire site for links to `/lead-machine`
   - Search entire site for links to `/case-studies-archived`
   - Update any found links to point to new URLs (redirects will work, but direct links are better)

---

## 🚀 **NEXT STEPS AFTER CLEANUP**

Once Priority 0 is complete:
1. Continue with **Priority 1**: Verify CMS template usage (7 pages)
2. Continue with **Priority 2**: Review investigate pages (8 pages)
3. Proceed with **visual audit** on 28 relevant pages (reduced scope)

---

**Created**: October 31, 2025  
**Status**: Ready for manual execution or API automation

