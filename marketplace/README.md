# 🏪 Marketplace Platform Configuration

**Purpose:** Platform-level configuration files for marketplace architecture, pricing tiers, and deployment packages.

**Current Size:** ~12K (3 JSON configuration files)

**Last Updated:** September 25, 2025

**Last Audit:** October 5, 2025

---

## 📂 File Structure

```
marketplace/
├── marketplace-config.json      1.7K - Technical architecture configuration
├── pricing-config.json          3.6K - Pricing tiers and bundles
└── deployment-packages.json     2.0K - Deployment options
```

---

## 📄 Configuration Files

### **marketplace-config.json** (1.7K)

**Purpose**: Technical architecture and infrastructure configuration for the marketplace platform

**Sections**:

**Technical Architecture**:
- **Frontend**:
  - Primary: Next.js application (admin.rensto.com)
  - Secondary: Webflow marketing pages (rensto.com)
  - Customer Portals: Vercel-hosted subdomains
  - Mobile: Responsive design with PWA capabilities

- **Backend**:
  - API: Node.js with Express
  - Database: MongoDB (primary), Airtable (secondary)
  - Authentication: NextAuth.js with multiple providers
  - Payments: Stripe integration
  - File Storage: AWS S3 or Cloudflare R2

- **Hosting**:
  - Primary: Vercel (frontend)
  - Secondary: RackNerd VPS (backend services)
  - CDN: Cloudflare
  - SSL: Cloudflare SSL certificates

**Sales Configuration**:
- Product Catalog: Airtable-based product database
- Display: Dynamic product pages
- Search: Elasticsearch integration
- Filtering: Category, complexity, price filters
- Reviews: Customer review system
- Checkout: Stripe Checkout integration
- Payment Methods: Credit cards, PayPal, bank transfers
- Subscriptions: Recurring billing management
- Invoicing: Automated invoice generation

**Customer Management**:
- Database: Airtable (customer records)
- CRM: Integrated customer management
- Segmentation: Tier-based customer groups
- Portal Features: Downloads, setup guides, support tickets, usage analytics, billing management

**Status**: ⚠️ Planning document - Not fully implemented

**Last Modified**: September 25, 2025

---

### **pricing-config.json** (3.6K)

**Purpose**: Pricing tier definitions, features, and bundle configurations

**Pricing Tiers** (4 tiers):

| Tier | Monthly | Annual | Target Audience |
|------|---------|--------|-----------------|
| **Starter** | $97 | $997 | Small businesses, freelancers, startups |
| **Professional** | $297 | $2,997 | Growing businesses, agencies, medium companies |
| **Enterprise** | $797 | $7,997 | Large businesses, enterprise clients, high-volume operations |
| **Custom Enterprise** | $2,997 | $29,997 | Fortune 500, large enterprises, custom requirements |

**Features by Tier**:

**Starter Package**:
- Email Automation Basic (1 persona)
- Simple Business Process Automation
- Basic QuickBooks Integration
- Customer Onboarding Lite
- Email support
- Up to 1,000 email automations/month
- 5 workflow templates
- Basic integrations (5 services)
- Standard deployment (2-3 hours)
- Community support

**Professional Package**:
- AI-Powered Email Persona System (6 personas)
- Complete Business Process Automation
- Advanced QuickBooks Integration
- Customer Lifecycle Management
- Content Generation Basic
- Priority support
- Up to 10,000 email automations/month
- 15 workflow templates
- Advanced integrations (15 services)
- Professional deployment (3-5 hours)
- Monthly optimization calls

**Enterprise Package**:
- All Professional Package products
- Multi-Language Email Automation
- Advanced Content Generation
- Multi-Currency Financial Automation
- Technical Integration Packages
- White-label options
- Dedicated support
- Unlimited email automations
- All 18 workflow templates
- Unlimited integrations
- Enterprise deployment (5-8 hours)
- Dedicated account manager
- Weekly optimization calls
- Custom development (up to 10 hours/month)

**Custom Enterprise Package**:
- Everything in Enterprise Package
- Custom workflow development
- Industry-specific solutions
- Multi-tenant architecture
- Advanced security features
- 24/7 support
- Dedicated infrastructure
- Custom training programs

**Product Bundles** (3 bundles):

| Bundle | Individual Price | Bundle Price | Savings |
|--------|-----------------|--------------|---------|
| **Email Automation Bundle** | $891 | $597 | 33% |
| **Business Process Bundle** | $1,191 | $797 | 33% |
| **Complete Automation Suite** | $6,972 | $3,997 | 43% |

**Status**: ⚠️ **OUTDATED** - Planning document from September 25, 2025 - Does not reflect current business model

**Relationship to Current Business Model**:
- **Current model** (CLAUDE.md, Nov 2025): 5 service types - Marketplace, Ready Solutions, Content AI, Subscriptions, Custom Solutions
- **This config** (Sep 2025): Defines 4 pricing tiers (Starter, Professional, Enterprise, Custom Enterprise) - **OUTDATED**
- **Action Required**: ⚠️ **DO NOT USE** - This config is from old business model. Refer to CLAUDE.md for current pricing structure.

**Last Modified**: September 25, 2025

---

### **deployment-packages.json** (2.0K)

**Purpose**: Deployment package options, pricing, and service levels

**Deployment Packages** (4 packages):

| Package | Price | Setup Time | Support Level |
|---------|-------|------------|---------------|
| **Self-Service** | $0 | 2-8 hours | Community support |
| **Assisted Setup** | $297 | 1-2 hours | Priority email support |
| **Full Service** | $797 | 0 hours | Dedicated support |
| **White-Label** | $1,497 | 0 hours | Dedicated account manager |

**Package Inclusions**:

**Self-Service Package** (Free):
- Downloadable workflow files (JSON)
- Step-by-step setup guides (PDF)
- Video tutorials (MP4)
- Configuration templates
- Community support access
- Basic documentation

**Assisted Setup Package** ($297):
- Everything in Self-Service Package
- 2-hour setup consultation (video call)
- Initial configuration assistance
- Testing and validation
- Priority email support
- 7-day optimization support

**Full Service Package** ($797):
- Everything in Assisted Setup Package
- Complete deployment by Rensto team
- Custom configuration
- Training session (1 hour)
- 30-day optimization support
- Performance monitoring setup

**White-Label Package** ($1,497):
- Everything in Full Service Package
- White-label branding
- Custom domain setup
- Reseller training
- Ongoing support
- Revenue sharing options

**Success Rates**:
- Self-Service: 85%
- Assisted Setup: 95%
- Full Service: 99%
- White-Label: 100%

**Customer Satisfaction** (out of 5):
- Self-Service: 4.2
- Assisted Setup: 4.6
- Full Service: 4.8
- White-Label: 4.9

**Status**: ⚠️ Planning document - Deployment packages need implementation

**Relationship to Current Marketplace**:
- Current marketplace (rensto.com/marketplace) offers:
  - DIY Template: $29-$197 (download JSON, self-install)
  - Full-Service Install: $797-$3,500+ (we install and configure)
- This config aligns with current offering but needs pricing reconciliation

**Last Modified**: September 25, 2025

---

## 🔄 Relationship to Other Folders

### **marketplace/ vs /products/**

**marketplace/** (This folder):
- **Purpose**: Platform-level configurations
- **Contents**: Architecture, pricing tiers, deployment packages
- **Scope**: Marketplace as a whole (platform infrastructure)
- **Files**: JSON configuration files for system-wide settings

**/products/**:
- **Purpose**: Individual product catalog
- **Contents**: Specific products available for purchase
- **Scope**: Individual offerings (templates, packages, solutions)
- **Files**: Product definitions with features, pricing, and metadata

**Analogy**:
- `marketplace/` = Shopping mall infrastructure (building, checkout systems, pricing strategy)
- `products/` = Individual stores and items (what's sold in the mall)

### **Integration Points**

**Webflow (rensto.com/marketplace)**:
- Displays individual products from `/products/` catalog
- Uses pricing strategy from `marketplace/pricing-config.json`
- Offers deployment packages from `marketplace/deployment-packages.json`

**Admin Dashboard (admin.rensto.com)**:
- Should reference `marketplace-config.json` for system architecture
- Should use `pricing-config.json` for revenue projections
- Should track deployment packages from `deployment-packages.json`

**Stripe Integration**:
- Pricing from `pricing-config.json` should match Stripe Price IDs
- Deployment packages should have corresponding Stripe products
- Bundles should be implemented as Stripe coupons or discount codes

---

## ⚠️ Status & Action Items

### **Current Status**: ⚠️ **Planning Documents (Not Fully Implemented)**

**Created**: September 25, 2025
**Last Modified**: September 25, 2025
**Implementation Status**: Partial

### **Known Issues**:

**Issue 1: Business Model Mismatch** ⚠️ **OUTDATED**
- **Problem**: Pricing tiers in `pricing-config.json` do NOT align with current 5-service-type model
- **Current Model** (from CLAUDE.md, Nov 2025): Marketplace, Ready Solutions, Content AI, Subscriptions, Custom Solutions
- **Config Model** (Sep 2025): Starter, Professional, Enterprise, Custom Enterprise (4 tiers) - **OUTDATED**
- **Action**: ⚠️ **DO NOT USE** - This config is outdated. Use CLAUDE.md for current pricing structure.

**Issue 2: Implementation Gap**
- **Problem**: Configs exist but many features not implemented
- **Missing**:
  - Elasticsearch integration
  - Customer review system
  - White-label options
  - Revenue sharing
  - Multi-tenant architecture
  - Advanced security features
- **Action**: Audit which features are implemented vs planned

**Issue 3: Pricing Reconciliation Needed** ⚠️ **OUTDATED**
- **Problem**: Multiple pricing sources (this folder, /products/, Stripe, Webflow)
- **Action**: ⚠️ **DO NOT USE THIS RECOMMENDATION** - Airtable is NOT primary (Boost.space is PRIMARY per CLAUDE.md)
- **Current Strategy** (CLAUDE.md): Boost.space (PRIMARY) for pricing, Airtable (BACKUP only)

### **Action Items**:

**Priority 1: Reconcile Business Model**
1. Compare pricing tiers with current 5-service-type model
2. Update configs to match CLAUDE.md business model
3. Archive outdated pricing if no longer applicable

**Priority 2: Document Implementation Status**
1. Mark each feature as "Implemented", "In Progress", or "Planned"
2. Link to actual implementation (files, APIs, etc.)
3. Create roadmap for unimplemented features

**Priority 3: Integrate with Systems**
1. Connect pricing to Stripe Price IDs
2. Sync deployment packages with admin dashboard
3. Link to Webflow CMS for dynamic pricing display

---

## 📊 Marketplace Audit Score

**Criteria Met**: 12/17 (71%) - ✅ **GOOD**

**Strengths**:
- ✅ Well-structured JSON configuration files
- ✅ Comprehensive pricing and package definitions
- ✅ Proper location (separate from /products/)
- ✅ Properly tracked in git

**Weaknesses**:
- ⚠️ No README.md (fixed Oct 5, 2025)
- ⚠️ Unclear implementation status
- ⚠️ Potential business model mismatch
- ⚠️ Not integrated with Boost.space, Airtable, or Notion
- ⚠️ Not integrated with admin dashboard

---

## 🔧 Usage Instructions

### **Updating Pricing Tiers**

```bash
# Edit pricing config
nano marketplace/pricing-config.json

# Update tier prices, features, or bundles
# Save changes

# Sync to Stripe (not yet automated)
# Sync to Webflow CMS (not yet automated)
# Update admin dashboard (manual)
```

### **Adding New Deployment Package**

```json
{
  "id": "new-package-id",
  "name": "New Package Name",
  "price": 999,
  "setupTime": "1 hour",
  "support": "Support level",
  "includes": [
    "Feature 1",
    "Feature 2"
  ]
}
```

### **Modifying Architecture Config**

```bash
# Edit marketplace config
nano marketplace/marketplace-config.json

# Update technical architecture, hosting, or integrations
# Save changes

# Update documentation if architecture changes significantly
```

---

## 🔗 Related Documentation

- **CLAUDE.md**: Master documentation with current business model (5 service types)
- **products/**: Individual product catalog (8 products defined)
- **Webflow**: https://rensto.com/marketplace (displays products)
- **Admin Dashboard**: https://admin.rensto.com (needs pricing integration)
- **Stripe**: Payment processing (needs pricing sync)

---

## 📞 Questions?

**For pricing updates**: Edit `pricing-config.json` and sync to Stripe/Webflow
**For deployment packages**: Edit `deployment-packages.json`
**For architecture changes**: Edit `marketplace-config.json` and update infrastructure
**For business model questions**: Check CLAUDE.md for current 5-service-type model

---

**Last Updated:** October 5, 2025
**Next Review:** November 2025 (when reconciling business model)
**Maintained By:** Rensto Team
**Configuration Files**: 3 (marketplace-config, pricing-config, deployment-packages)
