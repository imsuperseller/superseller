# Vercel Environment Variables - Required List

**Last Updated**: November 24, 2025  
**Status**: ✅ KIE_AI_API_KEY added for Veo3.1 integration

---

## ✅ **CURRENTLY CONFIGURED**

| Variable | Environments | Status | Used By |
|----------|-------------|--------|---------|
| `BOOST_SPACE_API_KEY` | All (Dev, Preview, Prod) | ✅ Set | Marketplace API, Testimonials, Scorecard |
| `AIRTABLE_API_KEY` | All (Dev, Preview, Prod) | ✅ Set | Requirements, Proposals, Installation booking |
| `STRIPE_SECRET_KEY` | All (Dev, Preview, Prod) | ✅ Set | Stripe checkout, webhooks |
| `STRIPE_WEBHOOK_SECRET` | All (Dev, Preview, Prod) | ✅ Set | Stripe webhook validation |
| `KIE_AI_API_KEY` | All (Dev, Preview, Prod) | ✅ **JUST ADDED** | Veo3.1 video generation API |

---

## ⚠️ **OPTIONAL / CONDITIONAL**

| Variable | Required For | Status | Notes |
|----------|-------------|--------|-------|
| `OPENAI_API_KEY` | Voice AI consultation | ⚠️ Check | Used in `/api/voice-ai/consultation` |
| `TIDYCAL_API_KEY` | Installation booking | ⚠️ Check | Has fallback to hardcoded token |
| `WEBFLOW_CLIENT_ID` | Webflow OAuth | ⚠️ Check | Used in OAuth flows |
| `WEBFLOW_CLIENT_SECRET` | Webflow OAuth | ⚠️ Check | Used in OAuth flows |
| `WEBFLOW_REDIRECT_URI` | Webflow OAuth | ⚠️ Check | Has default fallback |
| `AIRTABLE_BASE_ID` | Requirements/Proposals | ⚠️ Check | Used in specific endpoints |
| `AIRTABLE_REQUIREMENTS_TABLE` | Requirements capture | ⚠️ Check | Used in specific endpoints |
| `AIRTABLE_PROPOSALS_TABLE` | Proposal generation | ⚠️ Check | Used in specific endpoints |
| `BOOST_SPACE_PLATFORM` | Marketplace downloads | ⚠️ Check | Has default fallback |

---

## 🔧 **HOW TO ADD MISSING VARIABLES**

### Via Vercel CLI:
```bash
cd apps/web/rensto-site

# Add to Production
echo "your-value" | vercel env add VARIABLE_NAME production

# Add to Preview
echo "your-value" | vercel env add VARIABLE_NAME preview

# Add to Development
echo "your-value" | vercel env add VARIABLE_NAME development
```

### Via Vercel Dashboard:
1. Go to: https://vercel.com/dashboard
2. Select project: `rensto-site`
3. Settings → Environment Variables
4. Add new variable
5. Select all environments (Production, Preview, Development)
6. Save

---

## 📋 **VERIFICATION**

After adding variables, **redeploy** for them to take effect:

```bash
cd apps/web/rensto-site
vercel --prod
```

Or trigger via Git push (auto-deploy).

---

## 🚨 **CRITICAL VARIABLES**

These **MUST** be set for production:

1. ✅ `KIE_AI_API_KEY` - Veo3.1 video generation (just added)
2. ✅ `STRIPE_SECRET_KEY` - Payment processing
3. ✅ `STRIPE_WEBHOOK_SECRET` - Webhook security
4. ✅ `BOOST_SPACE_API_KEY` - Marketplace workflows
5. ✅ `AIRTABLE_API_KEY` - Data storage

---

**Note**: Code has fallback values for some variables, but production should use environment variables for security.

