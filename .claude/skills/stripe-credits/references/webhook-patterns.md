# Stripe Webhook Patterns

## Webhook Endpoint
`POST /api/webhooks/stripe` — handles all Stripe events.

## Events Handled
| Event | Action |
|-------|--------|
| `checkout.session.completed` | Provision subscription, grant credits |
| `invoice.paid` | Renew credits for billing period |
| `customer.subscription.deleted` | Deactivate subscription |
| `customer.subscription.updated` | Update tier/credits |

## Signature Verification
Always verify using `STRIPE_WEBHOOK_SECRET`:
```typescript
const sig = request.headers.get('stripe-signature');
const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
```

## Common Issues

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| Webhook 400 | Missing/wrong STRIPE_WEBHOOK_SECRET | Check Vercel env vars |
| Double provisioning | Webhook retried by Stripe | Idempotency: check if subscription already provisioned |
| Credits not granted | metadata missing userId | Ensure checkout session has userId in metadata |
| Wrong credit amount | Hardcoded instead of tier-based | Read from ProvisioningService tier map |

## Testing Webhooks Locally
```bash
stripe listen --forward-to localhost:3002/api/webhooks/stripe
```
