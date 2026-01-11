# Stripe Setup Instructions

## Environment Variables Required

Add these to your `.env.local` file:

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# n8n Webhook URL
N8N_WEBHOOK_URL=http://n8n.rensto.com/webhook/lead-enrichment-saas

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

## Stripe Setup Steps

1. **Create Stripe Account**
   - Go to https://stripe.com
   - Create account and get API keys

2. **Get API Keys**
   - Go to Stripe Dashboard → Developers → API Keys
   - Copy Publishable Key and Secret Key

3. **Setup Webhook**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhook/stripe`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy webhook secret

4. **Test Mode**
   - Use test keys for development
   - Use test card numbers: 4242 4242 4242 4242

## Pricing Configuration

The system is configured with these pricing tiers:

- **Basic**: $19/month - 10 leads
- **Professional**: $49/month - 100 leads  
- **Enterprise**: $99/month - 500 leads

You can modify these in:
- `apps/web/src/components/LeadGenLanding.tsx` (frontend display)
- `apps/web/src/app/api/create-payment-intent/route.ts` (backend pricing)
