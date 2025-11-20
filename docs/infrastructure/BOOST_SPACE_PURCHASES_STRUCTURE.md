# 📦 Boost.space Purchases/Orders Structure

**Date**: November 12, 2025  
**Status**: ⏸️ **PENDING** (Orders API verification needed)

---

## 🎯 **PURPOSE**

Document the structure for migrating Marketplace Purchases from Airtable to Boost.space Orders module.

---

## 📋 **CURRENT STATE**

- **Airtable Table**: `Marketplace Purchases` (Base: `app6saCaH88uK3kCO`)
- **CSV Status**: Empty (no purchases yet)
- **Boost.space Target**: Orders module (Space 51)

---

## 🔍 **BOOST.SPACE ORDERS API STATUS**

**Endpoint**: `https://superseller.boost.space/api/orders`

**Status**: ⚠️ **NEEDS VERIFICATION**

**Action Required**: Test if `/api/orders` endpoint exists and works

---

## 📊 **PROPOSED FIELD MAPPING**

### **Airtable → Boost.space Orders**

| Airtable Field | Boost.space Field | Type | Notes |
|----------------|-------------------|------|-------|
| Customer Email | `customer_email` | string | Link to Contact or store as string |
| Product | `product_id` | integer | Link to Boost.space Product (by SKU) |
| Purchase Date | `created` | datetime | ISO format |
| Purchase Type | `metadata.purchaseType` | string | "Download" or "Install" |
| Amount Paid | `total_price` | integer | Convert to cents |
| Stripe Payment Intent ID | `metadata.stripePaymentIntentId` | string | |
| Stripe Session ID | `metadata.stripeSessionId` | string | |
| Download Link | `metadata.downloadLink` | string | |
| Download Link Expiry | `metadata.downloadLinkExpiry` | datetime | ISO format |
| TidyCal Booking Link | `metadata.tidycalLink` | string | |
| Installation Booked | `metadata.installationBooked` | boolean | |
| Installation Date | `metadata.installationDate` | datetime | ISO format |
| Status | `status_system_id` | integer | Map to Boost.space status |
| Access Granted | `metadata.accessGranted` | boolean | |
| Download Count | `metadata.downloadCount` | integer | |
| Last Downloaded | `metadata.lastDownloaded` | datetime | ISO format |
| Invoice ID | `invoice_id` | integer | Link to Boost.space Invoice |
| Support Days Remaining | `metadata.supportDaysRemaining` | integer | |
| Notes | `description` | string | |

---

## 🚀 **IMPLEMENTATION PLAN**

### **Option 1: Use Boost.space Orders API** (If Available)

```javascript
const order = {
  name: `Purchase: ${customerEmail}`,
  description: `Marketplace purchase - ${purchaseType}`,
  spaceId: 51,
  product_id: boostProductId, // Link to Product
  customer_email: customerEmail,
  total_price: Math.round(amountPaid * 100), // cents
  currency: 'USD',
  created: purchaseDate,
  status_system_id: mapStatus(status),
  metadata: {
    purchaseType: purchaseType,
    stripeSessionId: stripeSessionId,
    stripePaymentIntentId: stripePaymentIntentId,
    downloadLink: downloadLink,
    downloadLinkExpiry: downloadLinkExpiry,
    accessGranted: accessGranted,
    tidycalLink: tidycalLink,
    installationBooked: installationBooked,
    installationDate: installationDate,
    downloadCount: downloadCount,
    lastDownloaded: lastDownloaded,
    supportDaysRemaining: supportDaysRemaining
  }
};

// POST to /api/orders
```

### **Option 2: Use Boost.space Business Cases** (Fallback)

If Orders API doesn't exist, use Business Cases as temporary storage:

```javascript
const businessCase = {
  name: `Purchase: ${customerEmail} - ${productName}`,
  description: `Marketplace purchase record`,
  spaceId: 51,
  status_system_id: 1,
  metadata: {
    type: 'marketplace-purchase',
    // ... all purchase fields
  }
};
```

### **Option 3: Use Boost.space Notes** (Fallback)

Store purchase records as Notes:

```javascript
const note = {
  title: `Purchase: ${customerEmail}`,
  content: `Purchase details...`,
  spaceId: 51,
  status_system_id: 1
};
```

---

## ✅ **NEXT STEPS**

1. **Test Boost.space Orders API**:
   ```bash
   curl -X GET "https://superseller.boost.space/api/orders" \
     -H "Authorization: Bearer [TOKEN]"
   ```

2. **If Orders API works**:
   - Create migration workflow: `INT-SYNC-004: Boost.space Purchases Import v1`
   - Map Airtable fields to Boost.space Orders
   - Test with sample purchase

3. **If Orders API doesn't exist**:
   - Use Business Cases or Notes as temporary storage
   - Document workaround in code
   - Plan migration when Orders API becomes available

---

## 📝 **NOTES**

- Purchases CSV is currently empty, so no immediate migration needed
- Download API routes updated to use Boost.space Products (✅ Complete)
- Purchase tracking can use Boost.space Orders when available
- For now, Stripe webhooks can create Orders directly in Boost.space

---

**Last Updated**: November 12, 2025

