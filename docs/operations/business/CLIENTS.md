# 👥 Active Clients

> **Source of Truth for client engagements and their systems.**

---

## ✅ Active Clients

### UAD Garage Doors (David Szender)
- **Status**: Active Partnership
- **Deal**: Partner in leads (Rensto gets paid per lead)
- **System**: FB Marketplace Listing Generator
- **Tech**: Telnyx AI Agent + 4 phone numbers
- **Revenue Model**: Revenue share on leads

### Miss Party (Michal Kacher)
- **Status**: Active
- **Relation**: David Szender's partner
- **System**: Similar to UAD (FB Marketplace listings)
- **Tech**: Separate Telnyx number in Rensto account
- **Testimonial**: "The team understood my needs from day one."

### Tax4Us (Ben Ginati)
- **Status**: Active
- **Hosting**: Client's own cloud n8n (`tax4usllc.app.n8n.cloud`)
- **Agents**: Posts, SEO, FB, LinkedIn, Podcast
- **Note**: Runs on their infrastructure, not Rensto VPS
- **Testimonial**: "The autonomous team handles our WordPress updates like having a full dev team on call 24/7."

### Ardan Engineering (Aviad Hazut)
- **Status**: Active (testimonial)
- **Industry**: Project Management & Engineering
- **Result**: 40% admin work reduction
- **Testimonial**: "Project management automations saved us 40% of admin work. Best investment."

---

## ⏸️ Inactive / Pending Clients

### Shelly (Insurance Agent, Afula)
- **Status**: Inactive (no recent communication)
- **Industry**: Israeli insurance
- **Built**: Workflow delivered
- **Action Needed**: Follow-up

### Golden Art Photography
- **Status**: Pending (showed demo, no response)
- **Built**: Workflow demo
- **Action Needed**: Follow-up

### Wonder.care / Ortal
- **Status**: ❌ Inactive (no plan, no website, no maintenance)
- **Folder**: `/Customers/wonder.care/`, `/Customers/ortal/`
- **Note**: Ortal also works for local-il.com
- **Action Needed**: Remove from active considerations

### Nir Sheinbein
- **Status**: ❌ Prospect only (never converted)
- **Folder**: `/workflows/nir-sheinbein/`
- **Note**: Workflows built but never deployed
- **Action Needed**: Archive workflows or remove

---

## ⚡ Dynamic Synchronization

The Rensto Website's "Industry Leaders" (Logos) and "Testimonials" sections are dynamically synced from Firestore.

- **Collection**: `clients` (Logos)
- **Collection**: `testimonials` (Quotes)
- **Privacy Rule**: For clients requiring privacy (e.g., David Szender), the `privacySettings.hideBusinessName` flag in Firestore ensures their name is used as the entity and labeled purely as "CLIENT".
- **How to Update**: Update the records in Firestore. The website will reflect changes on the next refresh (English and Hebrew versions supported).

---

## 📝 Notes

- **Telnyx Numbers**: Rensto account holds numbers for Rensto (header), UAD, and Miss Party.
- **Partnership Model**: UAD is a revenue-share partnership, not a typical client.
- **n8n Server**: `https://n8n.rensto.com` (172.245.56.50)
- **WAHA Server**: `http://172.245.56.50:3000`

