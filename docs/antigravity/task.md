# SuperSeller AI SaaS Task List

## Phase 0: Planning & PRD
- [x] Create SuperSeller AI SaaS Playbook artifact
- [x] Define Phase 0-8 structure
- [x] Create Customer Dashboard PRD
- [x] Create Admin Dashboard PRD

## Phase 1: Foundation Setup
- [x] Remove Hebrew localization (English-only)
- [x] Fix build errors in Marketplace pages
- [x] Verify production build (`npm run build`)

## Phase 2: Database & Auth
- [ ] Configure Firebase Auth (Google/Email)
- [ ] Set up Firestore security rules

## Phase 2.5: Dynamic Dashboard
- [x] Design entitlements schema in Firestore
- [x] Create `/api/dashboard/entitlements` route
- [x] Update `ClientDashboardClient.tsx` for dynamic tabs
- [x] Create `LeadsTab.tsx` component
- [x] Create upsell CTA components
- [x] Wire Free Leads signup to create user entitlements
- [x] Wire Stripe webhook to update entitlements on purchase
- [x] Implement client impersonation (admin view-as-client)
- [x] Add Slack integration for admin alerts
- [x] Create OutreachTab, VoiceTab, ContentTab placeholders

## Phase 3: Core Business Logic (Current)
- [x] Wire Qualification Quiz to API Route (`/api/custom-solutions/intake`)
- [x] Active `SuperSeller AI Master Controller` n8n workflow
- [x] Verify Lead Capture flow (Quiz -> API -> n8n)
- [ ] Implement Marketplace "Buy Blueprint" flow
    - [x] Create "Checkout Success" n8n workflow (`RENSTO-STRIPE-HANDLER`)
    - [x] Link Stripe Webhook to n8n (Separate via `N8N_STRIPE_WEBHOOK_URL`)
    - [ ] Implement digital delivery logic (email/dashboard) -> n8n hooks
- [x] **Implement "10 Free Leads" Trial**
    - [x] Create `/free-leads` page
    - [x] Create API route `/api/free-leads/request`
    - [x] Connect to `universal-lead-machine-v3-optimized` n8n workflow
- [ ] Ensure `N8N_WEBHOOK_URL` is consistent

## Phase 4: n8n Integration Cleanup
- [ ] Audit all Next.js API routes for n8n hooks

## Phase 5: Admin Dashboard
- [ ] Add workflow monitoring (n8n status from dashboard)
- [ ] Implement Recharts analytics charts
- [ ] Add client impersonation link to client detail

## Phase 6: Stripe Payments
- [x] Set up Stripe Webhook handler (entitlements update added)
- [x] Add `pillar-purchase` flowType to checkout API
- [x] Test payments in Sandbox (Verified logic via curl/test events)
- [x] Implement Lead Delivery Options (Email/CRM tiers)
- [x] Refactor Dashboard UI to match Brand Guidelines (Dark Mode)
- [/] Deploy and Verify (In Progress)

## Phase 8: Dashboard Real Data Integration
- [x] Connect "Recent Runs" to `usage_logs` collection
- [x] Connect "Spend" and "Volume" charts to `usage_logs` aggregation
- [x] Connect "Active Agents" list to real `service_instances` (Verified)
- [x] Verify empty state handling (standardize "No data" views)

## Phase 9: Dashboard Pages Expansion
- [ ] Polish 'Agents' page (Dark Mode + Real Data)
- [ ] Polish 'Approvals' page (Dark Mode)
- [ ] Polish 'Runs' page (Dark Mode + Real Data)
- [ ] Polish 'Credentials' page (Dark Mode)
- [ ] Polish 'Reports' page (Dark Mode)
- [ ] Polish 'Billing' page (Dark Mode)
- [ ] Polish 'Team' page (Dark Mode)
- [ ] Polish 'Settings' page (Dark Mode)
- [ ] Polish 'Support' page (Dark Mode)
- [ ] Polish 'Status' page (Dark Mode)

## Phase 7: Polish & Deployment
- [ ] Final UI "High-Grade" review
- [ ] Deploy to Vercel
