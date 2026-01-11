# Firestore Data to Add

## Missing Testimonials (add to `testimonials` collection)

### 1. Document ID: `client_tax4us_ben_en_0` (Ben Ginati)
```json
{
  "author": "Ben Ginati",
  "clientId": "client_tax4us",
  "imageUrl": "/images/testimonials/client-testimonial-ben.jpg",
  "isActive": true,
  "label": "TAX4US",
  "language": "en",
  "order": 1,
  "quote": "Rensto transformed how we handle client operations. Our efficiency has increased significantly since implementing their solutions.",
  "result": "24/7 Website Support",
  "role": "CEO, Tax4US LLC",
  "createdAt": "2026-01-09T00:00:00Z",
  "updatedAt": "2026-01-09T00:00:00Z"
}
```

### 2. Document ID: `client_miss_party_michal_en_0` (Michal Kacher Szender)
```json
{
  "author": "Michal Kacher Szender",
  "clientId": "client_miss_party",
  "imageUrl": "/images/testimonials/michal-kacher.jpg",
  "isActive": true,
  "label": "MISS PARTY",
  "language": "en",
  "order": 3,
  "quote": "The systems Rensto built saved me hours of manual operations every single day. They understood my vision for Miss Party from day one and executed perfectly.",
  "result": "Operations Automation",
  "role": "CEO, Miss Party",
  "createdAt": "2026-01-09T00:00:00Z",
  "updatedAt": "2026-01-09T00:00:00Z"
}
```

### 3. Document ID: `client_insurance_shelly_en_0` (Shelly Mizrahi)
```json
{
  "author": "Shelly Mizrahi",
  "clientId": "client_insurance",
  "imageUrl": "/images/testimonials/shelly-mizrahi.jpg",
  "isActive": true,
  "label": "INSURANCE",
  "language": "en",
  "order": 4,
  "quote": "The Family Insurance Profiler Agent we built with Rensto is a game-changer. It automates complex client profiling and has transformed how I serve families.",
  "result": "AI Profiler Agent",
  "role": "Insurance Agent",
  "createdAt": "2026-01-09T00:00:00Z",
  "updatedAt": "2026-01-09T00:00:00Z"
}
```

---

## Client Logo Updates

### Clients that SHOULD show logo (set these fields):
For each of these 4 clients, ensure:
- `status: "active"`
- `showLogoOnLanding: true`

| Document ID | logoUrl |
|-------------|---------|
| `client_ardan` | `/images/logos/logo-ardan-optimized.png` |
| `client_tax4us` | `/images/logos/logo-tax4us.png` |
| `client_miss_party` | `/images/logos/logo-miss-party.jpg` |
| `wonder-care` | `/images/logos/logo-wondercare.png` |

### All OTHER clients in the collection:
Set `showLogoOnLanding: false` to hide them from the landing page.

---

## Existing Testimonials to Verify

These should already exist and be correct:
- `client_ardan_en_0` (Aviad Hazout) - order: 2
- `client_szender_en_0` (David Szender) - order: 5

Make sure their `isActive: true` and `language: "en"`.
