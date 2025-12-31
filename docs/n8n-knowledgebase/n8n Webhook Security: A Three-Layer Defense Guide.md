# n8n Webhook Security: A Three-Layer Defense Guide

A comprehensive guide to securing n8n webhooks across server, webhook, and workflow layers—protecting your automations from unauthorized access, data tampering, and malicious attacks.

---

## Overview

When a request hits your self-hosted n8n instance, it passes through three security layers:

```
[Internet] → [Server/Reverse Proxy] → [Webhook Authentication] → [Workflow Validation]
```

Each layer provides distinct protections. Think of it like a bank card:
- **Layer 1 (Server)**: The card itself—physical access control
- **Layer 2 (Webhook)**: The PIN code—authentication requirement
- **Layer 3 (Workflow)**: Daily withdrawal limits—damage control even if breached

---

## Layer 1: Server Security

### Understanding the Docker Architecture

When deploying n8n on Docker, you install two key containers:

| Container | Purpose | Analogy |
|-----------|---------|---------|
| **n8n** | Your automation platform | The office you're visiting |
| **Caddy** | Reverse proxy / security gateway | Reception desk / bouncer |

### What is a Reverse Proxy?

Caddy acts as an "air gap" between the internet and n8n. External traffic never touches n8n directly—it must pass through Caddy first.

```
[Internet] → [Caddy (Bouncer)] → [n8n]
              ↑
              Validates, filters, routes traffic
```

**Analogy**: Like visiting a high-rise office building—you can't go directly to the 5th floor. You check in at reception, show ID, wait for verification, then get escorted up.

### HTTP vs HTTPS

| Protocol | Port | Security Level | Analogy |
|----------|------|----------------|---------|
| HTTP | 80 | Unsecured | Postcard—anyone can read it |
| HTTPS | 443 | Encrypted | Letter in sealed envelope |

**Critical**: Services like Stripe, GitHub, and Twilio will ONLY send webhooks to HTTPS URLs. HTTP won't work with most production integrations.

### Port Configuration in Docker

The key principle: **n8n should only receive traffic from Caddy, never directly from the internet.**

#### Caddy Configuration (Exposed to Internet)
```yaml
caddy:
  ports:
    - "80:80"      # Maps external port 80 → internal port 80
    - "443:443"    # Maps external port 443 → internal port 443
```

This creates tunnels allowing internet traffic into Caddy.

#### n8n Configuration (Internal Only)
```yaml
n8n:
  expose:
    - "5678"    # Only visible within Docker network
                # NOT exposed publicly
```

Using `expose` instead of `ports` means n8n is only accessible within the Docker network—external traffic cannot reach it directly.

### Essential YAML Configuration

```yaml
# Domain configuration
N8N_HOST: n8n.yourdomain.com

# Protocol (use HTTPS for production)
N8N_PROTOCOL: https

# Webhook URL structure
WEBHOOK_URL: https://n8n.yourdomain.com/
```

**DNS Requirement**: Point your domain to your server's IP address for this to work.

### Expanding Your Docker Environment

Docker is versatile—beyond n8n and Caddy, you can add:
- Self-hosted LLMs (free API calls)
- Vector databases for RAG systems
- Other automation tools

All containers communicate within the Docker network while Caddy controls external access.

---

## Layer 2: Webhook Authentication

### The Problem with Unsecured Webhooks

An unsecured webhook accepts requests from anyone who knows the URL:

```
POST https://n8n.yourdomain.com/webhook/abc123
Body: { "message": "hello" }
→ Workflow executes ✓
```

Anyone with the URL can trigger your workflow and potentially:
- Consume your API credits
- Inject malicious data
- Trigger unintended actions

### Setting Up Webhook Authentication

In the webhook node, select an authentication method:

#### Header Authentication (Recommended for Custom Integrations)

**Webhook Configuration:**
- Authentication: Header Auth
- Header Name: `Authorization`
- Header Value: `your-secret-key-12345`

**Testing with Postman:**

Without auth header:
```
POST /webhook/abc123
→ "Authorization data is wrong" (rejected)
```

With auth header:
```
POST /webhook/abc123
Headers: { "Authorization": "your-secret-key-12345" }
→ "Workflow was started" (accepted)
```

### Available Authentication Methods

| Method | Use Case |
|--------|----------|
| Header Auth | Custom integrations, internal systems |
| Basic Auth | Simple username/password protection |
| JWT | Token-based authentication |
| None | Development/testing only |

---

## Layer 3: Workflow Security

Even after passing server and webhook authentication, implement additional validation within your workflow.

### 3.1 Signature Verification (HMAC)

#### What is Signature Verification?

Services like Stripe, GitHub, Twilio, and Zendesk send a cryptographic signature with each webhook. This proves:
1. The request genuinely came from them
2. The payload wasn't tampered with in transit

**Analogy**: You and a friend share a secret sauce recipe. They make a burger with the sauce and send it to you. You remake it with your copy of the recipe. If both taste identical, you know it's authentic and untampered.

#### How It Works

```
[Zendesk] creates signature using:
├── Timestamp
├── Raw body
└── Shared secret key
    ↓
Sends: payload + signature + timestamp

[Your Workflow] recreates signature using:
├── Timestamp (from payload)
├── Raw body (from payload)
└── Shared secret key (configured locally)
    ↓
Compares: your signature vs their signature
    ↓
Match? → Process | No match? → Reject
```

#### Implementation in n8n

**Step 1: Extract Raw Body (Code Node)**

```javascript
// Convert formatted JSON back to raw string
// Removes hidden formatting characters that would break signature comparison
const rawBody = JSON.stringify($input.first().json.body);

return {
  rawBody: rawBody
};
```

**Why this matters**: When n8n receives JSON, it "prettifies" it with newlines and spacing. These invisible characters would make your signature different from the sender's.

**Step 2: Generate Signature (Crypto Node)**

| Setting | Value |
|---------|-------|
| Action | HMAC |
| Type | SHA256 |
| Value | `{{ timestamp }}{{ rawBody }}` |
| Secret | (from webhook provider) |
| Encoding | Base64 |

**Step 3: Compare Signatures (IF Node)**

```
Condition: 
$json.signature === $('Webhook').item.json.headers['x-signature']

True → Continue workflow
False → Log failure + Stop
```

#### Getting the Secret Key

Each service provides this differently:
- **Stripe**: Dashboard → Developers → Webhooks → Signing secret
- **GitHub**: Repository Settings → Webhooks → Secret
- **Zendesk**: Admin → Webhooks → Reveal secret

### 3.2 Payload Validation

Verify the incoming data matches what your workflow expects.

#### Event Type Validation

```javascript
// IF Node condition
$json.body.type === "ticket.created"
```

**Why this matters**:
- Your workflow handles "new ticket" events
- If a "ticket.closed" event arrives, processing it could send confusing responses
- Validating event type prevents logic errors

#### Required Fields Validation

```javascript
// Ensure all required fields exist
$json.body.ticket_id !== undefined &&
$json.body.customer_email !== undefined &&
$json.body.subject !== undefined
```

#### Benefits of Payload Validation

| Benefit | Description |
|---------|-------------|
| **Cost Control** | Don't waste LLM credits on irrelevant events |
| **Customer Safety** | Prevent sending responses to wrong ticket types |
| **Database Integrity** | Keep logs clean with only relevant data |
| **Workflow Stability** | Avoid errors from missing/malformed data |

### 3.3 Timestamp Validation

Webhooks should arrive nearly instantaneously. A delayed webhook might indicate:
- Network interception/tampering
- Replay attacks (reusing old valid requests)
- System issues requiring investigation

#### Implementation

```javascript
// Code Node
const webhookTimestamp = new Date($json.headers['x-timestamp']);
const now = new Date();
const diffSeconds = (now - webhookTimestamp) / 1000;

return {
  isTimely: diffSeconds < 60,  // Accept if under 60 seconds
  delaySeconds: diffSeconds
};
```

#### Handling Delayed Webhooks

```
IF timestamp is recent:
  → Process normally
ELSE:
  → Route to human review queue
  → Log for investigation
```

### 3.4 Event ID Deduplication

Prevent processing the same event twice (e.g., if Stripe accidentally double-sends).

#### Implementation Pattern

```
[Webhook] → [Extract Event ID] → [Check Database] → [Process or Skip]
                                        ↓
                                 [Log Event ID]
```

**Database Check (Google Sheets/Airtable/Supabase):**

```javascript
// IF Node
// Check if event_id already exists in your log
$('Lookup Event').item.json.found === false
```

**Flow:**
1. Receive webhook with `event_id: evt_12345`
2. Query database: "Does evt_12345 exist?"
3. If NO → Process + Log event_id
4. If YES → Skip (duplicate)

---

## Error Logging Strategy

**Critical**: Always log rejected requests to understand what's failing and why.

### Minimum Logging Schema

| Column | Description | Example |
|--------|-------------|---------|
| Date | When it occurred | 2024-01-15 |
| Time | Timestamp | 14:32:07 |
| Reason | Why it failed | `failed_signature` |
| Source IP | Where it came from | 192.168.1.100 |
| Payload | What was sent | `{...}` |

### Log Points in Workflow

```
[Webhook] → [Signature Check] → Failed? → Log "failed_signature"
                ↓
            [Event Type Check] → Failed? → Log "failed_event_type"
                ↓
            [Timestamp Check] → Failed? → Log "failed_timestamp"
                ↓
            [Process Normally]
```

### Why Logging Matters

When you see failures, you can:
1. **Identify attacks**: Multiple failed signatures from same IP
2. **Fix configuration**: Wrong event types being sent upstream
3. **Debug integrations**: Understand what data is actually arriving
4. **Rotate credentials**: If signature fails, someone may have your secret

---

## Rate Limiting

### The Risk

A malicious actor who obtains your webhook URL and credentials could:
- Send thousands of requests per minute
- Rack up massive LLM/API costs
- Overwhelm your system

### Implementation Location

Rate limiting should happen at the **reverse proxy layer** (Caddy), not within n8n workflows.

```
[Internet] → [Caddy + Rate Limiter] → [n8n]
                    ↓
              "Max 20 requests/minute from single IP"
```

### Configuration Options

**In Caddy:**
```
rate_limit {
    zone dynamic {
        key {remote_host}
        events 20
        window 1m
    }
}
```

**In n8n YAML (execution limits):**
```yaml
EXECUTIONS_PROCESS: main
EXECUTIONS_TIMEOUT: 300
EXECUTIONS_TIMEOUT_MAX: 600
```

### Rate Limiting Purposes

| Purpose | Description |
|---------|-------------|
| **Security** | Block rapid-fire malicious requests |
| **Cost Control** | Limit API/LLM credit consumption |
| **Performance** | Prevent server overload |
| **Fair Usage** | Ensure resources for legitimate requests |

---

## Incident Response: When Security Fails

If you detect a breach (failed signatures, suspicious activity):

### Immediate Actions

1. **Rotate Webhook URL**
   - Delete compromised webhook node
   - Create new webhook with fresh URL

2. **Rotate Authentication Credentials**
   - Update header auth value
   - Update in all connected services

3. **Rotate Signing Secret**
   - Generate new secret in provider (Stripe/GitHub/etc.)
   - Update Crypto node with new secret

4. **Review Logs**
   - What was accessed?
   - What data might be compromised?
   - How did they get credentials?

---

## Complete Security Workflow Template

```
┌─────────────────────────────────────────────────────────────────┐
│ WEBHOOK (Header Auth)                                            │
│ Authorization: your-secret-key                                   │
└─────────────────────┬───────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│ CODE: Extract Raw Body                                           │
│ Strips formatting characters for signature comparison            │
└─────────────────────┬───────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│ CRYPTO: Generate HMAC Signature                                  │
│ SHA256(timestamp + rawBody, secretKey)                          │
└─────────────────────┬───────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│ IF: Signature Match?                                             │
│ Compare generated vs received signature                          │
├─────────────────────┬───────────────────────────────────────────┤
│ TRUE                │ FALSE                                      │
│   ↓                 │   ↓                                        │
│ Continue            │ Log "failed_signature" → STOP              │
└─────────────────────┴───────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│ IF: Correct Event Type?                                          │
│ $json.type === "ticket.created"                                  │
├─────────────────────┬───────────────────────────────────────────┤
│ TRUE                │ FALSE                                      │
│   ↓                 │   ↓                                        │
│ Continue            │ Log "failed_event_type" → STOP             │
└─────────────────────┴───────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│ IF: Timestamp Recent? (< 60 seconds)                             │
├─────────────────────┬───────────────────────────────────────────┤
│ TRUE                │ FALSE                                      │
│   ↓                 │   ↓                                        │
│ Continue            │ Route to human review queue                │
└─────────────────────┴───────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│ MAIN WORKFLOW LOGIC                                              │
│ AI Agent, database updates, responses, etc.                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Quick Reference: Security Checklist

### Server Layer
- [ ] Using HTTPS (not HTTP)
- [ ] Reverse proxy (Caddy) configured
- [ ] n8n exposed only within Docker network
- [ ] Ports 80/443 routed through Caddy
- [ ] Rate limiting configured

### Webhook Layer
- [ ] Authentication enabled (Header/Basic/JWT)
- [ ] Strong, unique credentials
- [ ] Test URL disabled in production

### Workflow Layer
- [ ] Signature verification for supported services
- [ ] Event type validation
- [ ] Required field validation
- [ ] Timestamp freshness check
- [ ] Event ID deduplication (if applicable)
- [ ] All failures logged with reason
- [ ] Incident response plan documented

---

## Note on Built-in Triggers

When using n8n's native app triggers (e.g., "On Zendesk Event" node), signature verification is likely handled automatically under the hood. The manual signature verification workflow is necessary when:

- Using generic webhook nodes
- Receiving events not covered by built-in triggers
- Building custom integrations
- Requiring additional validation layers