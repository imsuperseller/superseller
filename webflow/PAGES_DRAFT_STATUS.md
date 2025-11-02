# 📋 Pages Draft Status - Priority 0 Cleanup

**Date**: October 31, 2025  
**Status**: ⚠️ **Requires Manual Action** (Webflow API limitation)

---

## 🚨 **API LIMITATION DISCOVERED**

**Issue**: Webflow API `pages_update_page_settings` only works for **secondary locales**, not the primary locale.

**Your Site**: Has only a **primary locale** (English), no secondary locales.

**Solution**: Must use **Webflow Designer UI** to save pages as draft.

---

## 📝 **MANUAL INSTRUCTIONS**

### **Method 1: Using Pages Panel Toggle** (Easiest)

1. **Open Webflow Designer**
   - Go to https://designer.webflow.com
   - Open your "Rensto" site

2. **Access Pages Panel**
   - Look at the **left sidebar**
   - Find the **"Pages"** panel (icon with stacked pages)

3. **Find "Lead Machine" Page**
   - Scroll through the pages list
   - Locate **"Lead Machine - AI-Powered Lead Generation"**
   - Look for a **toggle switch** or **draft indicator** next to it

4. **Toggle Draft Mode**
   - Click the **toggle switch** to enable draft mode, OR
   - Right-click the page → Select **"Save as draft"** or **"Unpublish"**
   - Page should show a **"Draft"** badge or be grayed out

5. **Repeat for "Case Studies - Success Stories (ARCHIVED)"**
   - Find the page in the Pages panel
   - Toggle draft mode the same way

---

### **Method 2: Using Page Settings** (Alternative)

1. **Open "Lead Machine" Page**
   - Click on **"Lead Machine"** in the Pages panel to open it

2. **Access Page Settings**
   - Click the **gear icon** (⚙️) in the top-right of the Designer
   - OR click **"Page Settings"** from the Pages panel menu

3. **Enable Draft**
   - In Page Settings, look for **"Draft"** or **"Unpublish"** toggle
   - Enable it
   - Click **"Save"**

4. **Repeat for "Case Studies - Success Stories (ARCHIVED)"**
   - Open the page
   - Access Page Settings
   - Enable Draft mode

---

## ✅ **VERIFICATION CHECKLIST**

After saving both pages as draft:

- [ ] "Lead Machine" shows "Draft" badge or is grayed out in Pages panel
- [ ] "Case Studies - Success Stories (ARCHIVED)" shows "Draft" badge or is grayed out
- [ ] Both pages are no longer accessible on live site (will return 404)
- [ ] Ready to proceed with redirect setup

---

## 🚀 **NEXT STEP**

Once both pages are saved as draft:

1. ✅ Proceed to **Step 2**: Set up redirects
2. Go to: **Site Settings** → **Publishing** tab → **301 Redirects**
3. Add redirects:
   - `/lead-machine` → `/subscriptions`
   - `/case-studies-archived` → `/case-studies`
4. **Publish** the site

See `PRIORITY_0_CLEANUP_EXECUTION.md` for detailed redirect instructions.

---

**Note**: If you prefer to **delete** pages instead of saving as draft, that also works. In the Pages panel, right-click → **Delete** → Confirm. Both methods allow redirects to be set up.

