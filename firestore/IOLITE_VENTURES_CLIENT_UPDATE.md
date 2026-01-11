# 🔥 Firestore Client Update: Iolite Ventures

**Date**: December 11, 2025  
**Action**: Add David Varnai / Iolite Ventures as Active Client  
**Status**: ✅ Ready to sync

---

## 📋 CLIENT DATA

```json
{
  "id": "iolite-ventures",
  "name": "Iolite Ventures",
  "slug": "iolite-ventures",
  "contactName": "David Varnai",
  "contactLocation": "Dallas, TX",
  "industry": "consulting",
  "website": "https://ioliteventures.co",
  "status": "active",
  "tier": "custom",
  "startDate": "2025-12-11",
  "source": "referral",
  "activeWorkflows": 1,
  "totalRevenue": 0,
  "monthlyRevenue": 0,
  "currency": "USD",
  "notes": "CRO Insights Robot project. Replacing Kelly's manual CRO work with automated monthly insights. Has many rich clients. Can bring more projects.",
  "createdAt": "2025-12-11T00:00:00Z",
  "updatedAt": "2025-12-11T00:00:00Z"
}
```

---

## 🔄 SYNC INSTRUCTIONS

### **Option 1: Via n8n Workflow (Recommended)**

Use `SYNC-FIRESTORE-002: Populate Clients Collection v1`:
1. Add Iolite Ventures data to the Code node
2. Execute workflow
3. Verify in Firestore Console

### **Option 2: Via Firebase Console**

1. Go to: https://console.firebase.google.com
2. Select project: `rensto`
3. Navigate: Firestore Database → `clients` collection
4. Click "Add document"
5. Document ID: `iolite-ventures`
6. Paste JSON fields
7. Save

### **Option 3: Via API Route**

```bash
curl -X POST https://rensto.com/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "iolite-ventures",
    "name": "Iolite Ventures",
    "contactName": "David Varnai",
    "contactLocation": "Dallas, TX",
    "industry": "consulting",
    "website": "https://ioliteventures.co",
    "status": "active",
    "tier": "custom"
  }'
```

---

## 📊 UPDATED CLIENT BREAKDOWN

| Status | Count | Clients |
|--------|-------|---------|
| **Active** | 4 | Tax4Us, Dima, MeatPoint, **Iolite Ventures** |
| **Active (Make.com)** | 1 | Wonder.Care |
| **Prospect** | 7 | David Varnai (removed), SureLockKey, Nir Sheinbein, Agam Recycling, EMCA-CPA, Father Insurance, Or-Hair, Ikonic Style |
| **Lead Gen Test** | 2 | Raanan HVAC, Moti Photography |

---

## 🎯 RELATED PROJECTS

- **CRO Insights Robot**: See `/docs/workflows/CRO_INSIGHTS_ROBOT_PLAN.md`
- **Workflow ID**: `CRO-INSIGHTS-001` (to be created)
- **Status**: Planning phase

---

**Next Step**: Sync this data to Firestore using one of the methods above.
