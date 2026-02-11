# Rensto Product Map

This document is the **Authoritative Source of Truth** for all active and planned Rensto products. It bridges the gap between Business Strategy and Technical Implementation.

## 🚀 1. Core Service Pillars

### 🏛️ Pillar A: The Lead Machine
*Focus: Automated sourcing and outreach.*

| Product | ID | Pricing | Technical Status | authoritative Workflow |
| :--- | :--- | :--- | :--- | :--- |
| **Abraham-Reach** | `lead-machine` | $297 (1k leads) / $997/mo | ✅ Active | `x7GwugG3fzdpuC4f` |
| **FB Autoposter (Universal)** | `fb-marketplace-autoposter` | $497 setup / $297/mo | ✅ Active | `saas-engine/` |
| **UAD Specialized Lister** | `uad-fb-autoposter` | $997 setup / $497/mo | ⚠️ Testing | `platforms/marketplace/` |
| **Meta Ad Analyzer** | `meta-ad-analyzer` | $47 / run | 🧪 Beta | - |

---

### 📞 Pillar B: Autonomous Secretary
*Focus: Voice AI, Scheduling, and CRM Sync.*

| Product | ID | Pricing | Technical Status | Integrated Tools |
| :--- | :--- | :--- | :--- | :--- |
| **Sarah-Inbound** | `autonomous-secretary` | $197 setup / $497/mo | 🧪 Beta | Telnyx, GoogleCal |
| **Martha-Ear (Lead Analyzer)**| `voice-lead-analyzer` | $97 (100 calls) | 🧪 Beta | Telnyx, CRM |
| **Naomi-Sync (Booking)** | `appointment-assistant` | $47 / run | 🧪 Beta | Calendly/TidyCal |
| **WhatsApp Agent** | `whatsapp-agent` | Included in Secretary | 🧪 Beta | WhatsApp (n8n) |

---

### 🧠 Pillar C: Knowledge Engine
*Focus: Internal intelligence and RAG systems.*

| Product | ID | Pricing | Technical Status | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Solomon-Brain** | `knowledge-engine` | $497 setup / $1497/mo | 🧪 Beta | Enterprise RAG sync |
| **Elijah-Clone (YT/Doc)** | `youtube-clone` | $347 one-time | 🧪 Beta | YT -> Digital Expert |
| **Behavioral Audit Bot** | `growth-insights-bot` | $247/mo | 🧪 Beta | Revenue Leak Scanner |

---

### 🎨 Pillar D: Content Engine
*Focus: AI Video, Image Gen, and Real Estate Visuals.*

| Product | ID | Pricing | Technical Status | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Abraham-Impact** | `content-engine` | $397 (20 videos) / $1497/mo | ✅ Active | Omnichannel Authority |
| **David-Tour (RE Video)** | `property-tour-gen` | $197 / tour | 🧪 Beta | 2D Plans -> 4K Tours |
| **Celebrity Selfie Genie** | `celebrity-selfie` | $297 (50 videos) | 🧪 Beta | Viral Engagement |

---

## 🔒 2. Commercial Enforcement (Stripe)

| Product | Stripe Live Price ID |
| :--- | :--- |
| **Lead Machine Credits** | `price_abe_credits` |
| **Voice AI Analyzer** | `price_martha_credits` |
| **RE Video Tour** | `price_david_tour` |

> [!IMPORTANT]
> All Stripe interactions must use the keys stored in `docs/vault/FINANCIAL_VAULT.md`.

## 🛠️ 3. Implementation Status & "The Mess" Cleanup

### Current Anomalies (The Residue)
1. **Duplicate Marketplace Logic**: Code exists in both `platforms/marketplace/` and `apps/web/rensto-site/src/app/api/marketplace`.
2. **Ghost Workflows**: Multiple versions of "Lead Machine" in n8n.
3. **Incomplete Billing**: Stripe IDs are referenced as variables but not fully linked in the checkout flow.

### Cleanup Protocol
- **Rule 1**: Only use `platforms/marketplace/` for the standalone engine.
- **Rule 2**: `rensto-site` is the ONLY frontend.
- **Rule 3**: Update existing files in `src/app/dashboard` instead of creating new tabs.
