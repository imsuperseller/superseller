# 👥 Initial Client Data for Firestore

**Purpose**: Seed data for the clients collection

---

## 📋 CLIENTS TO ADD

### 1. Tax4Us (Active Client)
```json
{
  "id": "tax4us",
  "name": "Tax4Us LLC",
  "slug": "tax4us",
  "contact": {
    "name": "Ben Ginati",
    "location": "Allen, TX"
  },
  "industry": "accounting",
  "website": "https://tax4us.co.il",
  "status": "active",
  "tier": "custom",
  "startDate": "2025-11-01",
  "source": "referral",
  "activeWorkflows": 8,
  "notes": "Content pipeline (blog + podcast) + WhatsApp agent. Hebrew + English support.",
  "deployments": [
    { "templateId": "CONTENT-AGENT-001", "name": "Blog Master Pipeline" },
    { "templateId": "CONTENT-WP-001", "name": "WordPress Auto-Publishing" },
    { "templateId": "CONTENT-POD-001", "name": "Podcast Master" },
    { "templateId": "WA-AGENT-005", "name": "WAHA RAG Voice Assistant" },
    { "templateId": "CLIENT-TAX4US-001", "name": "PDF Gemini File Search" }
  ]
}
```

### 2. Dima Vainer (Active Client)
```json
{
  "id": "dima",
  "name": "Dima Vainer",
  "slug": "dima",
  "contact": {
    "name": "Dima Vainer",
    "location": "Haifa, Israel"
  },
  "industry": "consulting",
  "status": "active",
  "tier": "professional",
  "startDate": "2025-11-14",
  "source": "friend",
  "activeWorkflows": 4,
  "notes": "WhatsApp customer agents and right-hand agents. Interested in deploying for his clients.",
  "deployments": [
    { "templateId": "WA-AGENT-002", "name": "Liza AI - Kitchen Design" },
    { "templateId": "WA-AGENT-003A", "name": "Human-in-Loop Question Handler" },
    { "templateId": "WA-AGENT-003B", "name": "Human-in-Loop Answer Handler" },
    { "templateId": "CLIENT-DIMA-001", "name": "PDF Gemini File Search" }
  ]
}
```

### 3. MeatPoint Dallas (Active Client)
```json
{
  "id": "meatpoint",
  "name": "MeatPoint Dallas",
  "slug": "meatpoint",
  "contact": {
    "name": "Yehuda and Lital Alali",
    "location": "Dallas, TX"
  },
  "industry": "restaurant",
  "website": "https://meatpointdallas.com",
  "status": "active",
  "tier": "professional",
  "startDate": "2025-11-24",
  "source": "meeting",
  "activeWorkflows": 4,
  "notes": "WhatsApp agent + Social content creator for Lital. Have 3+ more businesses.",
  "deployments": [
    { "templateId": "WA-AGENT-007", "name": "MeatPoint Agent" },
    { "templateId": "WA-AGENT-008", "name": "MeatPoint Dallas Agent" },
    { "templateId": "CONTENT-VIDEO-002", "name": "Video Ideas Agent" },
    { "templateId": "CLIENT-MEATPOINT-001", "name": "PDF Gemini File Search" }
  ]
}
```

---

## 🎯 PROSPECTS (Potential Clients)

### 4. David Varnai / Iolite Ventures (Active Client)
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
  "deployments": [
    { "templateId": "CRO-INSIGHTS-001", "name": "Monthly CRO Insights Robot", "status": "planning" }
  ]
}
```

### 5. Ortal Flanary / Wonder.Care (Active - Make.com)
```json
{
  "id": "wonder-care",
  "name": "Wonder.Care",
  "slug": "wonder-care",
  "contact": {
    "name": "Ortal Flanary",
    "location": "Rowlett, TX"
  },
  "industry": "healthcare",
  "website": "https://wonder.care",
  "status": "active",
  "platform": "make.com",
  "notes": "Built Google Sheets to Monday automation. Wants more automations. Also works for local-il.com"
}
```

### 6. David Sender / SureLockKey (Prospect)
```json
{
  "id": "surelockkey",
  "name": "SureLockKey",
  "slug": "surelockkey",
  "contact": {
    "name": "David Sender",
    "location": "Dallas, TX"
  },
  "industry": "locksmith",
  "website": "https://surelockkey.com",
  "status": "prospect",
  "interestedIn": ["voice-ai"],
  "notes": "Interested in voice AI agents. Has thousands of monthly calls. Goals: Qualifying leads, Booking appointments."
}
```

### 7. Nir Sheinbein (Prospect)
```json
{
  "id": "nir-sheinbein",
  "name": "Nir Sheinbein",
  "slug": "nir-sheinbein",
  "contact": {
    "name": "Nir Sheinbein",
    "location": "Dallas, TX"
  },
  "industry": "real-estate",
  "status": "prospect",
  "notes": "Creative realtor doing flips in DFW. Would love to have as client."
}
```

### 8. Evyatar Confino / Agam Recycling (Prospect)
```json
{
  "id": "agam-recycling",
  "name": "Agam Recycling",
  "slug": "agam-recycling",
  "contact": {
    "name": "Evyatar Confino",
    "location": "Kfar Saba, Israel"
  },
  "industry": "recycling",
  "website": "https://agamrecycling.com",
  "status": "prospect",
  "notes": "Friend. Would love to have as client."
}
```

### 9. Danny / EMCA-CPA (Prospect)
```json
{
  "id": "emca-cpa",
  "name": "EMCA-CPA",
  "slug": "emca-cpa",
  "contact": {
    "name": "Danny",
    "location": "Israel"
  },
  "industry": "accounting",
  "website": "https://emca-cpa.com",
  "status": "prospect",
  "notes": "Would love to have as client."
}
```

### 10. Father (Prospect)
```json
{
  "id": "father-insurance",
  "name": "Insurance Agent",
  "slug": "father-insurance",
  "contact": {
    "location": "Nofit, Israel"
  },
  "industry": "insurance",
  "status": "prospect",
  "notes": "Father, insurance agent. Would love to have as client."
}
```

### 11. Raanan Okashi (Lead Gen Target)
```json
{
  "id": "raanan-okashi",
  "name": "Raanan HVAC",
  "slug": "raanan-okashi",
  "contact": {
    "name": "Raanan Okashi",
    "location": "Dallas, TX"
  },
  "industry": "hvac",
  "status": "lead-gen-test",
  "notes": "Good friend. HVAC guy. Can use to test lead quality for subscription service."
}
```

### 12. Avi Aflalo / Or-Hair (Prospect)
```json
{
  "id": "or-hair",
  "name": "Or-Hair",
  "slug": "or-hair",
  "contact": {
    "name": "Avi Aflalo",
    "location": "Israel"
  },
  "industry": "salon",
  "website": "https://or-hair.co.il",
  "status": "prospect",
  "interestedIn": ["video-agent"],
  "notes": "Interested in video agent. Would love to have as client."
}
```

### 13. Moti Mizrahi (Lead Gen Target)
```json
{
  "id": "moti-photographer",
  "name": "Moti Photography",
  "slug": "moti-photographer",
  "contact": {
    "name": "Moti Mizrahi",
    "location": "Plano, TX"
  },
  "industry": "photography",
  "status": "lead-gen-test",
  "notes": "Photographer. Would love to get leads to him."
}
```

### 14. Amit Kapulsky / Ikonic Style (Prospect)
```json
{
  "id": "ikonic-style",
  "name": "Ikonic Style",
  "slug": "ikonic-style",
  "contact": {
    "name": "Amit Kapulsky"
  },
  "industry": "fashion",
  "website": "https://ikonicstyle.com",
  "status": "prospect",
  "notes": "Would love to have as client."
}
```

---

## 📊 SUMMARY

| Status | Count | Description |
|--------|-------|-------------|
| **Active** | 4 | Tax4Us, Dima, MeatPoint, Iolite Ventures |
| **Active (Make.com)** | 1 | Wonder.Care |
| **Prospect** | 7 | Potential clients |
| **Lead Gen Test** | 2 | For testing subscription service |

---

## 🔄 SYNC TO FIRESTORE

This data should be synced to Firestore `/clients` collection using:
1. Manual entry via Firebase Console
2. Or n8n workflow with Firestore node

### Collection Structure
```
/clients/{clientId}
  - Basic info
  - Contact
  - Status
  - Notes
  
/clients/{clientId}/deployments/{deploymentId}
  - Workflow mappings
  - Customizations
```
