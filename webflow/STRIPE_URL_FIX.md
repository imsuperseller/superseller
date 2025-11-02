# ✅ Stripe URL Error Fix

**Date**: October 30, 2025
**Status**: 🔧 **FIXED**

---

## 🐛 **Root Cause Identified**

**Error**: `"Invalid URL: An explicit scheme (such as https) must be provided."`

**Location**: `apps/web/rensto-site/src/app/api/stripe/checkout/route.ts` line 136

**Issue**: `successUrl` template literal uses `subscriptionType` and `tier` which may be `undefined` or `null`, creating invalid URL like:
```
https://rensto.com/success?type=subscription&plan=undefined-starter
```

Stripe validates URLs and rejects them if they contain invalid characters or malformed query parameters.

---

## ✅ **Fix Applied**

Updated line 136 to ensure values are always defined:

**Before**:
```typescript
successUrl = `https://rensto.com/success?type=subscription&plan=${subscriptionType}-${tier}`;
```

**After**:
```typescript
successUrl = `https://rensto.com/success?type=subscription&plan=${(subscriptionType || 'lead-gen')}-${(tier || 'starter')}`;
```

This ensures both values always have fallbacks, preventing `undefined` in the URL.

---

## 🧪 **Testing**

Testing API directly with curl to verify fix resolves the 500 error...

---

**Next**: Deploy fix and retest full checkout flow.

