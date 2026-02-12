# 🔑 Environment Variables

> **Source of Truth for all required environment variables.**

---

## Public Variables (NEXT_PUBLIC_)

### Site Config
| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SITE_NAME` | `Rensto` | Site name |
| `NEXT_PUBLIC_CONTACT_EMAIL` | `service@rensto.com` | Contact email |
| `NEXT_PUBLIC_SITE_URL` | - | Public site URL |

### Stripe Payment Links
| Variable | Product |
| :--- | :--- |
| `NEXT_PUBLIC_STRIPE_LINK_AUDIT` | Business Audit ($297) |
| `NEXT_PUBLIC_STRIPE_LINK_SPRINT` | Automation Sprint ($1,997) |
| `NEXT_PUBLIC_STRIPE_LINK_CONTENT_STARTER` | Content Starter ($297/mo) |
| `NEXT_PUBLIC_STRIPE_LINK_LEAD_INTAKE` | Lead Intake |
| `NEXT_PUBLIC_STRIPE_LINK_RETAINER_STARTER` | Starter Care ($497/mo) |
| `NEXT_PUBLIC_STRIPE_LINK_RETAINER_GROWTH` | Growth Care ($997/mo) |
| `NEXT_PUBLIC_STRIPE_LINK_RETAINER_SCALE` | Scale Care ($1,997/mo) |
| `NEXT_PUBLIC_STRIPE_LINK_FULL_ECOSYSTEM` | Full Ecosystem ($4,997) |

### Social Links
| Variable | Purpose |
| :--- | :--- |
| `NEXT_PUBLIC_LINKEDIN_URL` | LinkedIn profile |
| `NEXT_PUBLIC_X_URL` | X/Twitter profile |
| `NEXT_PUBLIC_YOUTUBE_URL` | YouTube channel |
| `NEXT_PUBLIC_INSTAGRAM_URL` | Instagram profile |
| `NEXT_PUBLIC_TYPEFORM_CONTACT_URL` | Contact form |

---

## Server-Side Variables

### Stripe
| Variable | Purpose |
| :--- | :--- |
| `STRIPE_SECRET_KEY` | API secret key |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature |

### Firebase
| Variable | Purpose |
| :--- | :--- |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | JSON service account |

### APIs
| Variable | Purpose |
| :--- | :--- |
| `KIE_API_KEY` | Kie.ai (video, music, image generation) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Gemini LLM for prompts |
| `OPENAI_API_KEY` | GPT API access |
| `RESEND_API_KEY` | Email sending |
| `SERPAPI_API_KEY` | Search API |

### n8n Webhooks
| Variable | Purpose |
| :--- | :--- |
| `N8N_WEBHOOK_URL` | General webhook |
| `N8N_LEAD_INTAKE_URL` | Lead intake handler |
| `N8N_FULFILLMENT_WEBHOOK_URL` | Fulfillment orchestrator |
| `N8N_OPTIMIZER_WEBHOOK` | Health alerts |

---

## Removed/Legacy

The following were removed (per comment in `env.ts`):
- `FAL_KEY` (Replaced by Kie.ai)
- `OPENROUTER_API_KEY` (Replaced by Gemini direct)
- `INSTANTLY_API_KEY` (Replaced by Microsoft Outlook)
- `VAPI_API_KEY` (Replaced by Telnyx)
- `TIDYCAL_TOKEN` (Replaced by AI Agent)
- `ESIGNATURES_API_KEY`
- `ASSEMBLYAI_API_KEY`
- `ANDYNOCODE_API_KEY`
- `APIFY_TOKEN` (Use `APIFY_API_KEY` instead)

---

## Where to Set

| Environment | Location |
| :--- | :--- |
| Local | `.env.local` |
| Production | Vercel Environment Variables |
| n8n | n8n Credentials / Environment |
