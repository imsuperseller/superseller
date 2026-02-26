# Building SuperSeller AI: The SaaS Playbook

A structured approach to evolving the SuperSeller AI ecosystem—turning n8n workflows into a scalable SaaS platform with authentication, databases, and payments.

---

## Overview

**Starting Point:** An automation agency website & marketplace  
**End Result:** A full-stack SaaS platform where users can discover, purchase, and manage "Engines" (n8n workflows), with a seamless admin backend for tracking and management.

**Key Tools:**
- **Google Antigravity:** Agentic development & orchestration
- **PostgreSQL + Redis: Primary database (Firebase retired Feb 2026) (Users, Purchases, Messages)
- **Stripe:** Payments (Marketplace Downloads & Deployment Services)
- **SuperSeller AI Server:** n8n instance for powering backend logic
- **Vercel:** Production deployment

---

## Phase 0: Planning & PRD Development (Current State)

We are unifying the vision across 5 key pillars.

| Page / Module | Type | Goal | Key Features |
| :--- | :--- | :--- | :--- |
| **Home Page** | Landing | High-Impact Conversion | "4 Pillars" concept, Social Proof, Dynamic Hero. |
| **Pillar (Niches)** | Informational | Industry Segmentation | Sector-specific use cases, "Roadmap" visualization. |
| **Marketplace** | core Product | e-Commerce / SaaS | Searchable library, filtering, Stripe checkout, downloading assets. |
| **Custom Page** | Lead Gen | High-Ticket Sales | Qualification quiz, "Discovery Call" booking. |
| **Contact Page** | Support | Relationship Building | Direct communication channels, FAQ. |

**Key Principle:** Every page serves a distinct business outcome. The "Product" is the *Infrastructure* we sell.

---

## Phase 1: Foundation Setup

### Terminal & Security
- **Policy:** Auto-Execution (Agent decides based on risk).
- **Environment:** Next.js 14+ (App Router), TypeScript, Tailwind CSS.

### Rules & Workflows
*Active Rules:*
- Use TypeScript for all new files.
- Follow React best practices (Functional Components, Hooks).
- Use Tailwind CSS for premium, "High-Grade" styling.
- **Language:** English-Only (Global business focus).

---

## Phase 2: Database & Authentication (Firebase)

**Status:** *Partially Implemented (Marketplace reads from Firestore)*

### To-Do:
1.  **User Authentication:**
    *   Enable **Google OAuth** & **Email/Password** for user accounts.
    *   Allow users to "Sign Up" to save their purchased blueprints.
2.  **Firestore Structure:**
    *   `users/{userId}`: User profile, purchase history.
    *   `templates/{templateId}`: Store marketplace items (Done).
    *   `purchases/{purchaseId}`: Record of transactions.
    *   `leads/{leadId}`: Quiz results and contact inquiries.
3.  **Security Rules:**
    *   Lock down `users` to owner-only.
    *   Make `templates` public-read.

```javascript
// Example Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /templates/{templateId} {
      allow read: if true; // Public marketplace
      allow write: if false; // Admin only via Console
    }
    match /leads/{leadId} {
      allow create: if true; // Public submissions
    }
  }
}
```

---

## Phase 3: Core Business Logic (Engine Activation)

*Replacing "Meal Logging" with "Workflow Deployment"*

### Flow A: Marketplace Purchase
1.  User selects an Engine (e.g., "Celebrity Selfie Generator").
2.  Click "Buy Blueprint" (Stripe Checkout).
3.  **Success Webhook:**
    *   n8n receives payment confirmation.
    *   n8n emails the JSON blueprint to the user OR adds it to their User Dashboard.
    *   Firestore updates `users/{uid}/purchases`.

### Flow B: Custom Solution Request
1.  User completes "Qualification Quiz" on Custom Page.
2.  **Submission Webhook:**
    *   Next.js sends data to SuperSeller AI n8n webhook (`/api/webhook/qualify`).
    *   n8n analyzes answers with LLM (OpenAI).
    *   n8n drafts a proposal or schedules a Calendly link.
    *   Data saved to Firestore `leads`.

### Testing Methods
- **Browser Subagent:** Fill out the quiz, check for success redirection.
- **n8n Verification:** Check Execution logs for incoming JSON payload.

---

## Phase 4: n8n Integration Cleanup

### Webhook Configuration
Ensure all frontend forms point to the unified SuperSeller AI production webhooks.

*   **Endpoint:** `https://superseller.agency/api/webhook/...` (Proxied to n8n)
*   **Security:** Implement `X-Webhook-Secret` header in Next.js API routes to prevent spam.

### n8n Workflows to Build/Verify:
-   `[ WEB ] Checkout Success Handler`: Delivering the digital product.
-   `[ WEB ] Contact Form Handler`: Routing support tickets to Slack/Email.
-   `[ WEB ] Quiz Qualifier`: Scoring leads.

---

## Phase 5: Analytics Dashboard (Admin)

**Goal:** A "Mission Control" for the SuperSeller AI Admin.

### Features:
-   **Traffic:** Page views (Home vs. Marketplace).
-   **Sales:** Daily revenue, Top selling Engines.
-   **Leads:** New Custom inquiries vs. "Do it yourself" buyers.
-   **Visuals:** Recharts for "Revenue Trend" (24h, 7d, 30d).

### Data Strategy:
-   Use an Admin SDK in a protected `/admin` route.
-   Generate "Test Data" (Mock Purchases) to verify dashboard layout.

---

## Phase 6: Stripe Payments

### Configuration
-   **Products:** Sync "Template IDs" from Firestore with Stripe Product IDs.
-   **Webhooks:** Listen for `checkout.session.completed`.

### Environment Variables
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Verification Checklist
- [ ] User click "Buy" -> Redirected to Stripe.
- [ ] User pays -> Redirected to `/success`.
- [ ] Webhook fires -> Database updated + Email sent.

---

## Phase 7: Polish & UI Design

**Standard:** "High-Grade", "Premium", "Cyberpunk/Professional".

### Nano Banana (Design & Assets)
-   Use the **Image Generation** tool to create:
    -   Thumbnails for new Marketplace items.
    -   "Architecture Diagrams" for the Pillar page.
    -   Social proof avatars.

### Feedback Loop
1.  Generate Artifact (Screenshot/Mockup).
2.  User reviews.
3.  Refine CSS (Tailwind) to match the approved "Premium" aesthetic.
    *   *Focus:* Gradients, Glassmorphism, Micro-interactions (Framer Motion).

---

## Phase 8: Deployment

### CI/CD Pipeline
1.  **GitHub:** Push all changes to `main`.
2.  **Vercel:** Auto-deploy triggers.
3.  **Environment:** Ensure all `NEXT_PUBLIC_...` vars are set in Vercel.

### Post-Deployment Checks
-   Verify Stripe Live Keys.
-   Test n8n Webhooks with real public URL.
-   Check Mobile Responsiveness on Safari/Chrome (iOS/Android).

---

## Quick Reference: SuperSeller AI Modes

-   **PLANNING:** Building PRDs for new "Engines".
-   **EXECUTION:** Coding the Dashboard, fixing Bugs, wiring Webhooks.
-   **VERIFICATION:** Simulating purchases, filling forms, checking n8n logs.
