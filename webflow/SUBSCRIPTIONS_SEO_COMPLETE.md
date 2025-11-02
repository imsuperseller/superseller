# 📝 Subscriptions Page - SEO Setup Guide

**Issue**: Meta description missing on subscriptions page  
**Fix**: Add meta description and SEO tags

---

## 🎯 **QUICK FIX** (Webflow SEO Settings)

### **Option 1: Webflow SEO Settings** (Recommended)

1. Go to **Subscriptions Page** in Webflow Designer
2. Click **Page Settings** (gear icon)
3. Go to **SEO Settings** tab
4. Fill in:

**Page Title**:
```
Lead Generation Subscriptions | Automated Lead Delivery | Rensto
```

**Meta Description**:
```
Automate lead generation with Rensto's subscription plans. Get 100-500+ qualified leads per month delivered to your CRM. Choose Starter ($299/mo), Professional ($599/mo), or Enterprise ($1,499/mo) plans. Start your free trial today.
```

**Open Graph Image**: (Upload image or use existing)
- Recommended size: 1200x630px
- File: `/images/subscriptions-og-image.jpg`

5. Click **Save** and **Publish**

---

### **Option 2: Custom Code** (If you want more control)

1. Go to **Subscriptions Page** in Webflow Designer
2. Click **Page Settings** → **Custom Code** tab
3. Paste the code from `webflow/SUBSCRIPTIONS_META_DESCRIPTION.txt` into **Code in `<head> tag`**
4. Click **Save** and **Publish**

---

## 📋 **META DESCRIPTION TEXT**

**Short version** (155 characters - Google recommended):
```
Automate lead generation with Rensto's subscription plans. Get 100-500+ qualified leads per month delivered to your CRM. Choose Starter ($299/mo), Professional ($599/mo), or Enterprise ($1,499/mo).
```

**Full version** (for Open Graph):
```
Automate lead generation with Rensto's subscription plans. Get 100-500+ qualified leads per month delivered to your CRM. Choose Starter ($299/mo), Professional ($599/mo), or Enterprise ($1,499/mo) plans. Start your free trial today.
```

---

## ✅ **VERIFICATION**

After adding:

1. **Check in Webflow**:
   - Page Settings → SEO Settings → Should show meta description

2. **Check on Live Site**:
   - View page source
   - Search for `<meta name="description"`
   - Should see your description

3. **Test with Google Rich Results**:
   - https://search.google.com/test/rich-results
   - Enter `https://rensto.com/subscriptions`
   - Should show meta description

---

## 🎯 **BEST PRACTICES**

✅ **Do**:
- Keep description under 155-160 characters
- Include key benefits (lead generation, CRM delivery)
- Include pricing ranges ($299-$1,499)
- Include call to action ("Start your free trial")
- Use action words ("Automate", "Get", "Choose")

❌ **Don't**:
- Exceed 160 characters (gets truncated in search results)
- Use keyword stuffing
- Make false claims
- Duplicate descriptions from other pages

---

**Files Created**:
- `webflow/SUBSCRIPTIONS_META_DESCRIPTION.txt` - Complete SEO code
- `webflow/SUBSCRIPTIONS_SEO_COMPLETE.md` - This guide

