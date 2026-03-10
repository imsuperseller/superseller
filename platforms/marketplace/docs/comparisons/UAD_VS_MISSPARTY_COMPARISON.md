# Technical Comparison: UAD vs. Miss Party

This document provides a comprehensive side-by-side analysis of the two Facebook Marketplace bot implementations.

## 1. Core Identity & Accounts

| Feature | UAD (Garage Doors) | Miss Party (Bounce Houses) |
| :--- | :--- | :--- |
| **Owner** | Shai Friedman | Michal Kacher |
| **FB Account** | `shai@superseller.agency` (session-based) | `michalkacher2006@gmail.com` |
| **GoLogin Profile ID** | `694b5e53fcacf3fe4b4ff79c` | `6949a854f4994b150d430f37` |
| **Marketplace Category** | "garage doors" | "party rentals" (or "Toys & Games") |
| **Location Focus** | DFW Metroplex (Dallas focus) | DFW Metroplex (Plano/Frisco focus) |

## 2. Infrastructure (n8n & VPS)

| Component | UAD Implementation | Miss Party Implementation |
| :--- | :--- | :--- |
| **n8n Workflow ID** | `nFGTkjYPOIbFoR82` | `u3VAcu1U5ujkeLqL` |
| **Data Table ID** | `c9z...` (UAD Listings) | `cNJEtuc3uOiFrDsB` (MissParty Listings) |
| **Polling Webhook** | `/v1-get-jobs` | `/9037b3eb-...` (unique ID) |
| **Update Webhook** | `/v1-update-status` | `/9b9fb340-...` (unique ID) |
| **Instance** | `n8n_superseller` (Docker) | `n8n_superseller` (Docker) |
| **Execution Path** | `/opt/fb-marketplace-bot/index.js` | `/opt/fb-marketplace-bot/missparty-bot.js` |

## 3. Data Schema & Generation

| Field | UAD Logic | Miss Party Logic |
| :--- | :--- | :--- |
| **Pricing** | Dynamic (based on dimensions/model) | Fixed ($49.99 flat rate) |
| **Media Handling** | Static master video (`video.mp4`) | Dynamic Kie.ai video URLs |
| **Image Count** | Up to 10 (from n8n logic) | 3 distinct prompts per listing |
| **Copywriting** | Professional/Technical (Claude 4.5) | Festive/Parent-focused (Claude 4.5) |
| **Phone Number** | `14695885133` | `+1-469-814-6509` |
| **Deduplication** | `uniqueHash` (dimensions-based) | `uniqueHash` (scenario-based) |

## 4. Bot Behavior & Stealth

| Behavior | UAD (Legacy) | Miss Party (New Standard) |
| :--- | :--- | :--- |
| **Login Strategy** | Assumes session is valid | Explicit Auto-Login fallback |
| **Typing Style** | Standard `page.type` | Jittery typing with human pauses |
| **Posting Limit** | 5 listings then 15m break | 3 listings then 30m break |
| **Navigation** | Direct goto create page | goto home -> check login -> goto create |
| **Error Recovery** | 30m jail timeout | 30m jail timeout + automated login retry |

## 5. Notification Architecture

| Message Type | UAD Routing | Miss Party Routing |
| :--- | :--- | :--- |
| **WhatsApp Target** | `14695885133@c.us` (Shai) | `14695885133@c.us` (Shai) |
| **WAHA Session** | `superseller-whatsapp` | `superseller-whatsapp` |
| **Status Updates** | Errors & Success Only | Error, Success, and Navigation Logs |
| **Media Proof** | Only final success screenshot | Multi-step progress screenshots |

## Summary of Optimization
The **Unified Master Bot** now bridges these differences by using a polymorphic configuration block while maintaining the strictest stealth settings (Miss Party standard) for both products.
