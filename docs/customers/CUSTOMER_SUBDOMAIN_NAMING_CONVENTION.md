# 🏷️ **CUSTOMER SUBDOMAIN NAMING CONVENTION**

## 🎯 **STANDARDIZED NAMING RULES**

### **Format**: `[business-name].rensto.com`

**Rules:**
1. **Use business name, not personal name**
2. **Lowercase only**
3. **Hyphens for spaces**
4. **Abbreviations for long names**
5. **No special characters**

---

## 📋 **CURRENT CUSTOMER MAPPING**

### **✅ CORRECT NAMING**

| Customer | Business | Subdomain | Status |
|----------|----------|-----------|---------|
| Ben Ginati | Tax4Us | `tax4us.rensto.com` | ✅ **CORRECT** |
| Shelly Mizrahi | Shelly Cover | `shellycover.rensto.com` | 🔄 **NEEDS UPDATE** |
| Local IL | Local IL | `localil.rensto.com` | 📋 **TO CREATE** |
| Wonder Care | Wonder Care | `wonder-care.rensto.com` | 📋 **TO CREATE** |
| Best Amusement Games | BAG | `bag.rensto.com` | 📋 **TO CREATE** |

### **❌ INCORRECT NAMING (TO FIX)**

| Current (Wrong) | Should Be | Reason |
|-----------------|-----------|---------|
| `ben-ginati.rensto.com` | `tax4us.rensto.com` | Use business name, not personal |
| `shelly-mizrahi.rensto.com` | `shellycover.rensto.com` | Use business name, not personal |

---

## 🔧 **IMPLEMENTATION PLAN**

### **Phase 1: Fix Existing Records**
```bash
# Delete incorrect records
DELETE ben-ginati.rensto.com
DELETE shelly-mizrahi.rensto.com

# Create correct records
CREATE shellycover.rensto.com → Vercel deployment
```

### **Phase 2: Create New Customer Records**
```bash
# New customers
CREATE localil.rensto.com → Vercel deployment
CREATE wonder-care.rensto.com → Vercel deployment  
CREATE bag.rensto.com → Vercel deployment
```

### **Phase 3: Update Documentation**
- Update all references to use correct subdomain names
- Update customer onboarding process
- Update admin dashboard links

---

## 📝 **NAMING CONVENTION EXAMPLES**

### **✅ GOOD EXAMPLES**
```
tax4us.rensto.com          # Business name
shellycover.rensto.com     # Business name
localil.rensto.com         # Business name
wonder-care.rensto.com     # Business name with hyphen
bag.rensto.com             # Abbreviation for long name
```

### **❌ BAD EXAMPLES**
```
ben-ginati.rensto.com      # Personal name
shelly-mizrahi.rensto.com  # Personal name
bestamusementgames.rensto.com  # Too long
wonder.care.rensto.com     # Special characters
```

---

## 🚀 **AUTOMATED CUSTOMER ONBOARDING**

### **Process Flow**
```
1. New Customer Signs Up
2. Extract Business Name
3. Generate Subdomain: [business-name].rensto.com
4. Create DNS Record
5. Deploy Customer Portal
6. Send Welcome Email with Portal URL
```

### **Subdomain Generation Logic**
```typescript
function generateSubdomain(businessName: string): string {
  return businessName
    .toLowerCase()
    .replace(/\s+/g, '-')           // Spaces to hyphens
    .replace(/[^a-z0-9-]/g, '')     // Remove special chars
    .replace(/-+/g, '-')            // Multiple hyphens to single
    .replace(/^-|-$/g, '')          // Remove leading/trailing hyphens
    .substring(0, 50);              // Max 50 characters
}

// Examples:
generateSubdomain("Tax4Us LLC") → "tax4us-llc"
generateSubdomain("Shelly Cover Insurance") → "shelly-cover-insurance"
generateSubdomain("Best Amusement Games Inc") → "best-amusement-games-inc"
```

---

## 📊 **CURRENT DNS STATUS**

### **✅ WORKING CORRECTLY**
- `tax4us.rensto.com` → Customer portal (200 OK)
- `admin.rensto.com` → Admin dashboard (307 Redirect)

### **🔄 NEEDS UPDATE**
- `shelly-mizrahi.rensto.com` → Should be `shellycover.rensto.com`

### **📋 TO CREATE**
- `localil.rensto.com`
- `wonder-care.rensto.com`
- `bag.rensto.com`

---

## 🎯 **IMMEDIATE ACTIONS**

1. **Update Shelly's subdomain** to `shellycover.rensto.com`
2. **Create new customer subdomains** as needed
3. **Update all documentation** with correct naming
4. **Implement automated subdomain generation** for new customers

**Result**: Consistent, professional, and scalable customer portal naming system.
