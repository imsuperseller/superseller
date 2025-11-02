# 🚀 Update Stripe Webhook - Right Now!

**Let's do this step-by-step together!**

---

## 📍 **WHERE YOU ARE NOW**

You're looking at: https://dashboard.stripe.com/test/webhooks

You see webhook: `we_1SF5qCDE8rt1dEs1SbZCqETE`
- URL: `https://api.rensto.com/stripe/webhook`
- Currently listening to: `payment_intent.succeeded` only ❌

---

## 🎯 **WHAT TO DO (3 STEPS)**

### **Step 1: Click the Webhook**
- Click on: `https://api.rensto.com/stripe/webhook` (the webhook endpoint)

### **Step 2: Find "Events to send"**
- Look for section labeled **"Events to send"** or **"Events"**
- You should see: `payment_intent.succeeded` listed
- Click **"Edit"** or **"Update events"** button

### **Step 3: Add the Event**
- Click **"+ Add events"** or **"Select events"**
- In the search box, type: `checkout.session.completed`
- **Check the box** next to `checkout.session.completed`
- Click **"Add events"** or **"Save"**

---

## ✅ **WHAT YOU SHOULD SEE AFTER**

**Events list should show**:
- ✅ `checkout.session.completed` (NEW!)
- ✅ `payment_intent.succeeded` (existing)

**That's it!** Click **"Update endpoint"** or **"Save"**

---

## 🧪 **QUICK VERIFY**

After saving:
1. Click **"Send test webhook"** button
2. Select: `checkout.session.completed`
3. Click **"Send test webhook"**
4. Should show: ✅ **"Succeeded"**

---

## 📝 **TELL ME WHEN DONE**

Once you've added `checkout.session.completed`, let me know and I'll help you:
1. Verify it's working
2. Test the full checkout flow
3. Check webhook delivery

**You got this!** 🚀

