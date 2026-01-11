# Rensto Web Applications

**Stack:** Next.js + TypeScript + Tailwind CSS + Shadcn UI

## 📋 Overview

This directory contains all Rensto web applications built with Next.js. There are **two separate Next.js applications** here:

1. **admin-dashboard/** - Internal admin dashboard for operations
2. **rensto-site/** - Public-facing Rensto marketing and product site

## 🏗️ Directory Structure

```
apps/web/
├── admin-dashboard/        # Admin dashboard (admin.rensto.com)
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   ├── components/    # React components
│   │   └── lib/           # Utilities and helpers
│   ├── package.json
│   ├── next.config.mjs
│   └── vercel.json        # Deployment config
│
├── rensto-site/           # Main Rensto site (rensto.com)
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   ├── components/    # React components
│   │   └── lib/           # Utilities and helpers
│   ├── package.json
│   ├── next.config.js
│   ├── ENVIRONMENT_SETUP.md
│   └── netlify.toml       # Alternative deployment config
│
├── src/                   # Shared source code (if any)
├── rensto-gallery.html    # Static gallery page
└── STRIPE_SETUP.md        # Stripe integration documentation
```

## 🎯 Applications

### 1. Admin Dashboard (`admin-dashboard/`)

**URL:** https://admin.rensto.com
**Purpose:** Internal operations and management dashboard

**Features:**
- Customer management (view all customers, filter, search)
- Workflow monitoring (n8n workflow status and execution logs)
- Revenue tracking (Stripe integration, financial dashboards)
- Analytics and reporting (business intelligence)
- System management (infrastructure health checks)
- Smart Sync configuration (Airtable, Notion, n8n)
- User roles and permissions
- Settings and configuration

**Tech Stack:**
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Shadcn UI components
- Airtable SDK (for data access)
- Stripe SDK (for financial data)

**Status:** ⚠️ **Needs updating** - Last major update August 2024, business model has changed

**To-Do:**
- [ ] Update for new 4-service-type business model
- [ ] Add Marketplace order management
- [ ] Add Subscriptions dashboard (lead delivery tracking)
- [ ] Add Custom Solutions project management
- [ ] Integrate real-time n8n workflow monitoring
- [ ] Add MCP server health checks
- [ ] Update financial dashboards for all revenue streams

### 2. Rensto Site (`rensto-site/`)

**URL:** https://rensto.com
**Purpose:** Public-facing marketing website and product pages

**Pages:**
- Homepage (value proposition, service types)
- About (team, mission, vision)
- Service Type Pages:
  - Marketplace (/marketplace)
  - Ready Solutions (/ready-solutions)
  - Subscriptions (/subscriptions)
  - Custom Solutions (/custom)
- Niche Pages (Amazon Seller, Dentist, HVAC, Roofer, etc.)
- Legal Pages (Privacy Policy, Terms of Service)
- Blog (if active)
- Help Center / Docs

**Tech Stack:**
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Webflow DevLink (for some pages)
- Stripe Checkout integration
- Typeform integration

**Status:** ✅ **Active** but missing Stripe checkout connections

**To-Do:**
- [ ] Connect all 5 Stripe payment flows
- [ ] Test all Typeforms on mobile
- [ ] Verify Webflow DevLink sync status
- [ ] Add remaining 4 Typeforms (only 1 of 5 created)

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn

### Setup Instructions

#### Admin Dashboard

```bash
cd apps/web/admin-dashboard
npm install
cp .env.example .env  # Configure environment variables
npm run dev
```

Open http://localhost:3001

#### Rensto Site

```bash
cd apps/web/rensto-site
npm install
# Follow ENVIRONMENT_SETUP.md for detailed configuration
npm run dev
```

Open http://localhost:3002

## ⚙️ Environment Variables

### Admin Dashboard

```bash
# Airtable
AIRTABLE_API_KEY=pat...
AIRTABLE_BASE_ID=app...

# Stripe
STRIPE_SECRET_KEY=sk_...

# n8n
N8N_API_URL=http://n8n.rensto.com
N8N_API_KEY=...

# Authentication (if applicable)
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://admin.rensto.com
```

### Rensto Site

```bash
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...

# Webflow (if using DevLink)
WEBFLOW_API_TOKEN=...

# Typeform
TYPEFORM_API_KEY=...

# Analytics (optional)
GOOGLE_ANALYTICS_ID=...
```

## 📦 Build & Deploy

### Admin Dashboard

```bash
cd apps/web/admin-dashboard

# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

**Deployment URL:** admin.rensto.com
**Platform:** Vercel
**Auto-deploy:** Connected to Git (configure in Vercel dashboard)

### Rensto Site

```bash
cd apps/web/rensto-site

# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Alternative: Deploy to Netlify
netlify deploy --prod
```

**Deployment URL:** rensto.com
**Platform:** Vercel (primary) or Netlify (alternative)
**Auto-deploy:** Connected to Git (configure in hosting dashboard)

## 🧪 Testing

```bash
# In each app directory

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix
```

## 📱 Mobile Testing

Both applications **must be tested on mobile** before deployment:

**Test Checklist:**
- [ ] Forms submit successfully
- [ ] Typeforms load correctly
- [ ] Pages load without console errors
- [ ] No horizontal scroll
- [ ] Load time < 3 seconds
- [ ] Images optimized for mobile
- [ ] CTAs clearly visible
- [ ] Stripe checkout flows work on mobile

**Test Tools:**
- Chrome DevTools (mobile emulation)
- Real device testing (iOS Safari, Android Chrome)
- Lighthouse performance audits

## 🔗 Integration Points

### Admin Dashboard Integrations
- **Airtable** - Customer data, workflow tracking, financial records
- **n8n** - Workflow monitoring, execution logs
- **Stripe** - Revenue tracking, subscription management
- **Notion** - Documentation sync (limited)

### Rensto Site Integrations
- **Stripe Checkout** - Payment flows (⚠️ not yet connected)
- **Typeform** - Lead capture forms
- **Webflow DevLink** - CMS content sync
- **n8n webhooks** - Form submission handling

## 📚 Additional Files

### `rensto-gallery.html`
Static HTML gallery page (legacy or one-off page).

**Status:** ⚠️ **Purpose unclear** - audit needed

**Action:** Determine if still needed or can be archived

### `STRIPE_SETUP.md`
Documentation for Stripe integration setup.

**Contains:**
- Stripe API key configuration
- Webhook setup instructions
- Testing checklist

### `src/` Directory
Shared source code between applications (if any).

**Status:** ⚠️ **Needs verification** - check if actually shared

**Action:** If empty or unused, consider removing

## 🤝 Related Services

- **apps/api/** - Backend API for data operations
- **apps/gateway-worker/** - Request routing and orchestration
- **apps/marketplace/** - Marketplace application (separate Next.js app)
- **Webflow** - Some pages hosted on Webflow (hybrid approach)
- **n8n workflows** - Automation triggered by web events

## 🐛 Known Issues

### Admin Dashboard
- [ ] Outdated (last updated August 2024)
- [ ] Business model changed (needs redesign for 4 service types)
- [ ] Missing real-time workflow monitoring
- [ ] No MCP server health checks

### Rensto Site
- [ ] Stripe checkout flows not connected (0 of 5)
- [ ] Missing 4 Typeforms (only 1 of 5 created)
- [ ] Mobile testing not systematic
- [ ] Webflow DevLink sync status unclear

## 📞 Support

For issues related to web applications, contact the Rensto development team or file an issue in the repository.

---

**Last Updated:** October 5, 2025
**Maintained By:** Rensto Team

**Deployed At:**
- Admin Dashboard: https://admin.rensto.com (Vercel)
- Rensto Site: https://rensto.com (Vercel)
