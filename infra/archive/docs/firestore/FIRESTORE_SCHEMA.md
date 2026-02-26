# Database Schema Reference

> **Historical reference.** This file originally documented Firestore collections. The primary database is now **PostgreSQL** (migration completed Feb 2026). For the current schema, see `apps/web/superseller-site/prisma/schema.prisma`.

---

## PostgreSQL Models (Primary)

| Model | Purpose |
| :--- | :--- |
| `User` | Unified identity, entitlements, billing, service status |
| `Template` | Marketplace workflow templates (with visibility rules) |
| `Purchase` | Download tokens and purchase records |
| `Payment` | All Stripe payment events |
| `ServiceInstance` | Active service deployments |
| `Subscription` | Recurring billing subscriptions |
| `Lead` | Lead generation data |
| `Proposal` | Generated proposal documents |
| `OnboardingRequest` | Onboarding and fulfillment flow |
| `CustomizationRequest` | Template modification requests |
| `SupportCase` | Customer support tickets |
| `ContentPost` | Blog and content posts |
| `SecretaryConfig` | Secretary AI configurations |
| `UsageLog` | API usage tracking |
| `AdminConversation` | Admin AI chat conversations |
| `N8nAgentMemory` | Agent state persistence |
| `MagicLinkToken` | Passwordless auth tokens |
| `Download` | Download link tracking |
| `Testimonial` | Client testimonials |
| `Solution` | Ready solution packages |
| `SolutionInstance` | Active solution deployments |
| `WhatsAppInstance` | WhatsApp instance configs |
| `OutreachCampaign` | Outreach campaign data |

## Template Visibility Rules

Each template has visibility flags:
```typescript
showInMarketplace: boolean;      // Public marketplace
showInAdminDashboard: boolean;   // Admin control panel
showInClientDashboard: boolean;  // Client's dashboard
```

Plus ownership tracking:
```typescript
owner: 'superseller' | 'client';
clientId?: string;
department: 'lead_machine' | 'autonomous_secretary' | 'knowledge_engine' | 'content_engine' | 'internal_ops' | 'client_fulfillment';
```

---

## Legacy Collections (Firestore - Retired)

These were the original Firestore collections. Data has been migrated to PostgreSQL.

| Collection | Migrated To |
| :--- | :--- |
| `users` | `User` model |
| `clients` | Merged into `User` |
| `customSolutionsClients` | Merged into `User` |
| `templates` | `Template` model |
| `payments` | `Payment` model |
| `purchases` | `Purchase` model |
| `service_instances` | `ServiceInstance` model |
| `subscriptions` | `Subscription` model |
| `leads` | `Lead` model |
| `magicLinkTokens` | `MagicLinkToken` model |

---

**Canonical schema**: `apps/web/superseller-site/prisma/schema.prisma`
