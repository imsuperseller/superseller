# Lead Machine - Go-to-Market Strategy

## The Core Problem You Identified

> "How will they know it's working? Why would they pay so much upfront?"

**Answer**: They won't. Nobody should pay $297-$1,297 for something unproven.

---

## The Solution: **Free Sample First**

### The Customer Journey:

```
┌─────────────────────────────────────────────────────────────┐
│  1. FREE TRIAL                                                │
│     "Get 10 verified leads free, see the quality"            │
│                        ↓                                      │
│  2. PAY-PER-LEAD                                              │
│     "Love it? Buy packs of 50, 100, 500 at $2-5/lead"        │
│                        ↓                                      │
│  3. SUBSCRIPTION                                              │
│     "Want unlimited? Subscribe from $97/mo"                   │
│                        ↓                                      │
│  4. OWN THE SYSTEM                                            │
│     "Want total control? Buy the workflow for $1,297"        │
└─────────────────────────────────────────────────────────────┘
```

---

## Pricing Tiers

### Tier 1: Free Trial
| Feature | Included |
|:--------|:---------|
| Leads | 10 verified leads |
| Sources | Google Maps only |
| Icebreakers | Yes (AI-generated) |
| Email verified | Yes |
| Delivery | CSV download or Instantly |
| **Price** | **$0** |

**Purpose**: Prove quality, build trust

---

### Tier 2: Pay-Per-Lead (No commitment)

| Pack | Leads | Price | Per Lead |
|:-----|:------|:------|:---------|
| Starter | 50 | $149 | $2.98 |
| Growth | 100 | $249 | $2.49 |
| Scale | 500 | $999 | $1.99 |
| Bulk | 1,000 | $1,499 | $1.49 |

**Includes**:
- Google Maps OR LinkedIn source
- Email verification
- AI icebreakers
- Delivery to Instantly or CSV

---

### Tier 3: Subscription (Recurring)

| Plan | Leads/Month | Sources | Price | Per Lead |
|:-----|:------------|:--------|:------|:---------|
| Starter | 100 | Google Maps | $97/mo | $0.97 |
| Growth | 500 | Google Maps + LinkedIn | $297/mo | $0.59 |
| Scale | 2,000 | All sources | $597/mo | $0.29 |

**Includes everything in Pay-Per-Lead plus**:
- Priority support
- Custom prompts
- WhatsApp delivery option
- Dashboard access
- Rollover credits (up to 50%)

---

### Tier 4: Own The System (One-time)

| Option | What You Get | Price |
|:-------|:-------------|:------|
| Download | Workflow JSON, docs, DIY setup | $297 |
| Installed | We set it up on your n8n | $797 |
| Full Setup | Setup + training + 30-day support | $1,297 |
| White-label | Resell rights + custom branding | $2,997 |

---

## Competitive Positioning

| Us vs Them | Clay | Apollo | Smartlead | **Lead Machine** |
|:-----------|:-----|:-------|:----------|:-----------------|
| Free trial | No | Limited | No | **10 leads free** |
| Pay-per-lead | No | No | No | **Yes** |
| Own the system | No | No | No | **Yes** |
| Self-hosted | No | No | No | **Yes** |
| No monthly lock-in | No | No | No | **Yes** |
| Starting price | $149/mo | $49/mo | $39/mo | **$0** |

---

## Test Campaign for Rensto

### Campaign Settings:

**Name**: `rensto-lead-machine-test-jan-2026`

**Target**: Marketing agencies in Dallas, TX

**Source**: Google Maps

**Lead Count**: 25

**Instantly Sequence**:
```
Day 0: Initial outreach
Day 3: Follow-up #1 (if no reply)
Day 7: Follow-up #2 (if no reply)
```

**Icebreaker Template**:
```
Subject: Quick question about {{ company_name }}

{{ icebreaker }}

We help agencies like yours automate lead generation. 
Would you be open to a quick chat?

- Shai, Rensto
```

---

## To-Do List

1. [ ] Fix Instantly API key (might need new one from app.instantly.ai)
2. [ ] Run test campaign with 25 leads
3. [ ] Create landing page for Free Trial
4. [ ] Set up Stripe for Pay-Per-Lead purchases
5. [ ] Track: cost, verification rate, reply rate
6. [ ] Iterate based on results

---

## Answering Objections

| Objection | Answer |
|:----------|:-------|
| "How do I know it works?" | Get 10 leads free, see for yourself |
| "I don't want monthly lock-in" | Buy lead packs, no subscription |
| "What if I want to own it?" | One-time purchase, runs on YOUR n8n |
| "Is it better than Apollo/Clay?" | We do the same thing, you own the data |
| "What's the catch?" | None. Free trial is free. Cancel anytime. |
