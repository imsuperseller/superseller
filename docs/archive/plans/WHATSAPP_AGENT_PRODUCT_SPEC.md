# 📱 WhatsApp Agent - Product Specification

**Version**: 1.0  
**Date**: December 22, 2025  
**Status**: 🟢 **DRAFT**

---

## 1. Product Overview

**Name**: SuperSeller AI WhatsApp Agent  
**Value Prop**: Turn WhatsApp into a 24/7 Operating System for your business.  
**Model**: Hybrid SaaS (Monthly Recurring + One-Time Setup).  
**Core Tech**: WAHA Pro (WhatsApp HTTP API) + n8n + SuperSeller AI Cloud.

The product is structured as a **"Base Platform + Add-ons"** menu. Customers MUST purchase the base platform, then can selectively add capabilities as needed.

---

## 2. Feature Inventory (Technical Capabilities)

### Core Capabilities (Included in Base)
- **Messaging**: Send/receive text only.
- **Sessions**: Single WhatsApp number connection.
- **Integration**: 1 Webhook pipeline into SuperSeller AI "Brain" (n8n).
- **Routing**: Basic Open/Closed business hours auto-reply.
- **Safety**: Rate limiting & retries to prevent bans.
- **Logging**: Basic transaction logs (ID, phone, time, status).

### Advanced Capabilities (Add-ons)
- **Media**: Images, Video, Audio, PDF handling.
- **Multi-Session**: Support for multiple phone numbers.
- **Handoff**: Integration with human chat tools (e.g., Chatwoot).
- **Groups**: Group management & listening.
- **Broadcast**: Channels & Status updates.
- **Interactive**: Polls, buttons, lists.
- **Presence**: Typing indicators, online/offline status.
- **Labels**: WhatsApp Business labels management.
- **Read Ops**: Mark as read, bulk read, read receipts.
- **Profile**: Dynamic profile updates (Photo/Bio).
- **Security**: IP allowlisting, HMAC verification.

---

## 3. Pricing Menu structure

### 🅰️ Required Base Plan

| Item | Price | Setup Fee | Description |
|------|-------|-----------|-------------|
| **Basic WhatsApp Agent** | **$249/mo** | **$499** | 1 Number, Text-only, n8n Brain connection, Logging, Routing. |

### 🅱️ Add-ons (Pick-and-Pay)

| Pack ID | Name | Monthly | Setup | Key Features |
|---------|------|---------|-------|--------------|
| **ADD-01** | **Media Messaging** | +$79 | +$199 | Send/receive images, video, audio, files. |
| **ADD-02** | **Multi-Number** | +$149/each | +$99/each | Per additional WhatsApp number session. |
| **ADD-03** | **Human Handoff** | +$199 | +$399 | Sync with inbox tools like Chatwoot. |
| **ADD-04** | **Groups** | +$149 | +$299 | Group listening, posting, moderation. |
| **ADD-05** | **Broadcast** | +$199 | +$299 | Manage Channels & Status updates. |
| **ADD-06** | **Interactive** | +$99 | +$199 | Polls, funnels, quick-choice logic. |
| **ADD-07** | **Presence** | +$99 | +$199 | "Typing...", smart delays, online status. |
| **ADD-08** | **Labels** | +$79 | +$199 | Auto-labeling & CRM stage sync. |
| **ADD-09** | **Read Ops** | +$79 | +$199 | Auto-mark read, unread alerts. |
| **ADD-10** | **Profile Mgmt** | +$49 | +$99 | Programmatic name/pic/bio updates. |
| **ADD-11** | **Reliability** | +$249 | +$499 | Dedicated engine (GOWS), load shaping. |
| **ADD-12** | **Security** | +$149 | +$399 | HMAC, IP Whitelist, Audit Logs. |

---

## 4. Implementation Strategy

### **Page Location**
`superseller.agency/whatsapp` (New Page)

### **Page Logic**
1. **Configurator UI**: "Build Your Agent" calculator.
2. **Default State**: Base Plan selected ($249 + $499).
3. **User Action**: Toggles add-ons.
4. **Live Total**: Updates Monthly and Setup fees in real-time.
5. **CTA**: "Deploy System" -> Stripe Checkout.

### **Technical note suitable for buyers**
*"One-time setup covers: session connect, webhook wiring, n8n workflow build, testing, and rollback plan. Monthly covers: hosting overhead, incident handling, WAHA/n8n upgrades, monitoring, and minor logic tweaks."*

***

## 5. SuperSeller AI Infrastructure Integration

- **Current WAHA**: SuperSeller AI-Internal-WAHA (Docker).
- **Engine**: Recommend `NOWEB` for standard, `GOWS` for Reliability Pack.
- **Hosting**: Existing VPS / Coolify infrastructure.
- **Workflows**: New standardized "Core Router" workflow template needed.
