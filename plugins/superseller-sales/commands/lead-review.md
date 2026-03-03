---
name: Lead Review
description: Review all active leads, their current status, and recommended next actions across PostgreSQL and WhatsApp conversations.
---

# /lead-review

Review the full active lead pipeline for SuperSeller AI. Pull data from PostgreSQL and cross-reference with WhatsApp conversation activity.

## What to do

1. **Query PostgreSQL leads table** for all leads where `status` is NOT 'closed_won', 'closed_lost', or 'archived'. Order by `createdAt` descending.

```sql
SELECT
  l.id,
  l.name,
  l.company,
  l.phone,
  l.email,
  l.source,
  l.status,
  l.qualification_status AS qualification,
  l.notes,
  l.first_contact_at,
  l.first_response_at,
  l.response_time,
  l.created_at,
  l.updated_at,
  l.tags,
  l.metadata
FROM "Lead" l
WHERE l.status NOT IN ('closed_won', 'closed_lost', 'archived')
ORDER BY l.created_at DESC;
```

2. **For each lead**, determine the pipeline stage:

| Status | Stage | Description |
|--------|-------|-------------|
| `new` | Prospect | Just captured, no contact yet |
| `contacted` | Outreach | First message sent, awaiting response |
| `responding` | Engaged | Two-way conversation active |
| `qualified` | Qualified | Confirmed fit, budget, and interest |
| `demo_scheduled` | Demo | Demo or sample creation booked |
| `proposal_sent` | Proposal | Pricing/proposal shared |
| `negotiating` | Negotiation | Terms being discussed |
| `trial` | Trial | Using free trial or sample period |

3. **Check WhatsApp activity** via WAHA for leads that have a `phone` number. Look for:
   - Last message timestamp (are we ghosting them?)
   - Unread messages from the lead (needs response)
   - Conversation tone (positive, neutral, cold)

4. **Flag stale leads** where no activity has occurred in 7+ days.

5. **Recommend next action** for each lead based on stage and activity:
   - New leads: Draft personalized outreach (use `/draft-outreach`)
   - Contacted but no response in 3+ days: Follow-up message
   - Engaged: Schedule demo or create sample deliverable
   - Qualified: Send proposal with pricing
   - Stale: Re-engagement message or archive decision

## Output format

Present as a prioritized table:

```
| Priority | Name | Business | Stage | Last Activity | Days Idle | Next Action |
```

Then provide a summary:
- Total active leads
- Leads needing immediate action (idle 3+ days)
- Leads ready to close
- Revenue potential (count of qualified+ leads x $79/mo starter)

## Cross-reference

- Check `Subscription` table for any leads that already have an active subscription (they converted -- update status to `closed_won`).
- Check `User` table to see if the lead has already created an account.
- Check Aitable datasheet `dstTYYmleksXHj3sCj` for any dashboard-tracked leads not yet in PostgreSQL.

## Notes

- Lead `source` values include: 'whatsapp_group', 'website', 'referral', 'facebook', 'telnyx_voice', 'manual'
- The `tags` field is JSON and may contain industry, location, and priority markers
- The `metadata` field may contain WhatsApp group name, referrer info, or qualification notes
- Priority leads from the Parliament WhatsApp group are documented in the customer avatar -- cross-check names
