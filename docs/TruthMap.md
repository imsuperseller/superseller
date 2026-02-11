# Rensto Primary Source of Truth (PSOT)

To maintain a high-performance autonomous system, we follow the **Single Source of Truth** principle. If information exists in two places, the secondary is considered "Ghost Data" and should be purged or synchronized.

## 🏛️ 1. Structural & Technical Truth
| Domain | Authoritative Path |
| :--- | :--- |
| **System Map** | [ARCHITECTURE.md](file:///Users/shaifriedman/New%20Rensto/rensto/ARCHITECTURE.md) |
| **Production API** | `apps/web/rensto-site/src/app/api/` |
| **Bilingual Schema** | `apps/web/rensto-site/src/types/firestore.ts` |
| **Infra Credentials** | [Admin Dashboard / Vault] + [Firestore `restricted/` collection] |

## 💰 2. Financial & Business Truth
| Domain | Authoritative Path |
| :--- | :--- |
| **Revenue (MRR)** | Stripe Dashboard (Synced to [Treasury Management]) |
| **Operational Costs** | Rensto Vault -> `restricted/infrastructure/items/` |
| **Business Strategy** | `docs/operations/business/` |
| **Marketing Logic** | `scripts/marketing/` |

## 👤 3. Relationship & Client Truth
| Domain | Authoritative Path |
| :--- | :--- |
| **Active Clients** | [Admin Dashboard / CRM] + [Firestore `clients/` collection] |
| **Custom Workflows** | `library/client-workflows/` |
| **Public Testimonials**| [Admin Dashboard / Landing Content] + [Firestore `testimonials/` collection] |

## 🛠️ 4. Automation Truth (n8n)
| Domain | Authoritative Path |
| :--- | :--- |
| **Workflow Logic** | n8n Cloud / Self-Hosted Instance (Instance: `rensto`) |
| **Managed Credentials**| n8n Credential Store (Synced with Vault) |
| **MCP Integration** | `scripts/n8n/core/universal-aggregator-mcp.mjs` |

---

## 🔒 Enforcement Rules
1. **Terry's Memory**: All AI models must prioritize the `docs/` folder for business context.
2. **No Local Env**: Shared secrets belong in the **Vault**, never in local `.env` files.
3. **Draft First**: Significant changes to business or technical logic must be reflected in `docs/` before implementation.
