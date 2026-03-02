# Credential Reference — Location Map

**Purpose**: Agent reference. Every service maps to exactly ONE file where its key lives. **No actual secrets in this file — only paths and key prefixes for identification.**

**CRITICAL DISTINCTION**: SuperSeller AI credentials are Shai's own business. UAD/MissParty (aka "Unique Supplies") credentials belong to client David Szender. NEVER mix them.

---

## SUPERSELLER AI CREDENTIALS (Shai Friedman — own business)

**Business Address**: 309 S. Jupiter Rd, Allen, TX 75002
**LLC**: Rensto LLC (DBA SuperSeller Agency) — legal entity name; all branding uses SuperSeller AI

### Infrastructure

| Service | Key Name | Lives At | Notes |
|---------|----------|----------|-------|
| **RackNerd SSH** | `VPS_PASSWORD` | `.env.racknerd` | SSH key auth is primary. Password is backup. IP: 172.245.56.50 |
| **RackNerd API** | API Key + Hash | User provides in chat | VPS panel API. Not stored in repo. Key: `CU8AI-...` |
| **PostgreSQL** | `DATABASE_URL` | `apps/worker/.env` (worker), `apps/web/superseller-site/.env` (web), Vercel dashboard (prod) | User: `admin`, DB: `app_db`. Same DB, same creds, 3 locations |
| **Redis** | `REDIS_PASSWORD`, `REDIS_URL` | `apps/worker/.env` | Also `REDIS_HOST`+`REDIS_PORT` in `apps/web/superseller-site/.env.local` |
| **Vercel (SuperSeller AI)** | `VERCEL_OIDC_TOKEN` | `apps/web/superseller-site/.env.local` | SuperSeller AI's Vercel token: `vcp_0Pl...`. Rotates on `vercel env pull`. |
| **Docker Hub** | `DOCKER_PAT` | `social app/.env` | Container registry |
| **n8n** | `N8N_API_KEY` | `~/.cursor/mcp.json` | JWT token for n8n.superseller.agency API + MCP |

### AI / LLM (SuperSeller AI)

| Service | Key Name | Lives At | Notes |
|---------|----------|----------|-------|
| **Claude (SuperSeller AI)** | `ANTHROPIC_API_KEY` | `~/.claude/.credentials` or shell env | Key: `sk-ant-api03-GqQf...`. Used by Claude Code. |
| **Gemini (Google)** | `GOOGLE_GENERATIVE_AI_API_KEY` | `apps/worker/.env` | Key: `AIzaSyAz...`. TourReel + Winner Studio brain |
| **OpenAI (SuperSeller AI)** | `OPENAI_API_KEY` | `social app/.env` | SuperSeller AI has 2 OpenAI keys (both in `social app/.env`). Not used in active products |
| **DeepSeek** | `DEEPSEEK_API_KEY` | `social app/.env` | Not used in active products |
| **OpenRouter** | `OPENROUTER_API_KEY` | `social app/.env` | Not used in active products |
| **Ollama** | N/A (local) | RackNerd `http://172.245.56.50:11434` | No API key needed. nomic-embed-text for RAG. |
| **HuggingFace** | `HUGGINGFACE_TOKEN` | `social app/.env` | `hf_mBX...` |
| **Google Stitch** | API Key | `social app/.env` | `AQ.Ab8R...` |

### Video / Media (SuperSeller AI)

| Service | Key Name | Lives At | Notes |
|---------|----------|----------|-------|
| **Kie.ai (SuperSeller AI)** | `KIE_API_KEY` | `apps/worker/.env` (worker), `apps/web/superseller-site/.env.local` (web) | SuperSeller AI key: `cb711f...`. TourReel + Winner Studio. Different from UAD's key. |
| **ElevenLabs** | `ELEVENLABS_API_KEY` | `social app/.env` | SuperSeller AI key: `sk_f0dd...`. Not used in active products |
| **Runware** | `RUNWARE_API_KEY` | `social app/.env` | Not used in active products |
| ~~fal.ai~~ | — | REMOVED | Fully removed Feb 2026 — Kie.ai is the only video provider |
| **Higgsfield** | API Key ID + Secret | `social app/.env` | Not used in active products |
| **PiAPI** | `PIAPI_API_KEY` | `social app/.env` | Not used in active products |

### Storage (SuperSeller AI)

| Service | Key Name | Lives At | Notes |
|---------|----------|----------|-------|
| **Cloudflare R2** | `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`, `R2_BUCKET` | `apps/worker/.env` | Bucket: `zillow-to-video-finals`. Account ID: `46a5b8a6...` |
| **IceDrive** | `ICEDRIVE_ACCESS_KEY` | `social app/.env` | WebDAV backup. Not used in active products. |

### Payments (SuperSeller AI)

| Service | Key Name | Lives At | Notes |
|---------|----------|----------|-------|
| **PayPal** | `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID` | `apps/web/superseller-site/.env.local` (web), Vercel env vars | Live mode only. Product: PROD-4W993698BV951770E. Webhook: 7K1581345X6344910. |
| ~~Stripe~~ | ~~`STRIPE_SECRET_KEY`~~ | ~~Deprecated~~ | **REMOVED Feb 2026** — replaced by PayPal. |

### Communication (SuperSeller AI)

| Service | Key Name | Lives At | Notes |
|---------|----------|----------|-------|
| **WAHA (WhatsApp)** | API Key in URL | `http://172.245.56.50:3000/dashboard?apiKey=4fc7e008...` | Pro license on RackNerd. Shared by SuperSeller AI + FB Bot |
| **Resend** | `RESEND_API_KEY` | `social app/.env` | `re_XQi...`. Email delivery. Sender verification pending. |
| **Telnyx (SuperSeller AI)** | `TELNYX_API_KEY` | `social app/.env`, n8n credentials | Voice AI "Hope" (1 number: +14699299314). Key: `KEY019B6800DE...` |

### Platforms / Social (SuperSeller AI)

| Service | Key Name | Lives At | Notes |
|---------|----------|----------|-------|
| **GitHub (SuperSeller AI)** | `GITHUB_PAT` | `social app/.env` | SuperSeller AI PAT: `github_pat_11AZ2TTMQ0...`. Different from UAD's. |
| **Notion** | `NOTION_TOKEN` | `social app/.env` | `ntn_1307683232...`. Internal integration |
| **Aitable.ai** | `AITABLE_API_KEY` | `social app/.env` | Dashboard only, not production |
| **X/Twitter** | `X_ACCOUNT_ID`, `X_USERNAME`, `X_API_KEY`, `X_API_KEY_SECRET`, `X_CLIENT_ID`, `X_CLIENT_SECRET` | `apps/web/superseller-site/.env.local`, `social app/.env` | Account: `@iamsupersel`. API Key: `v6UJ1...`. Client ID: `MXhuMj...`. SocialHub. |
| **YouTube** | `YOUTUBE_API_KEY`, `YOUTUBE_OAUTH_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET` | `apps/web/superseller-site/.env.local`, `social app/.env` | API Key: `AIzaSyBm...`. OAuth Client: `10651066...`. SocialHub. |
| **TikTok** | Client ID + Secret | `social app/.env` | Developer app ID: `7611282302357899276`. Status: Pending approval. SocialHub Phase 2. |
| **Apify** | `APIFY_API_TOKEN` | `apps/worker/.env` | Zillow scraping for TourReel. User ID: `wjz2NfU1Y0MdMxeey`. Key: `apify_api_gQw...` |

### Auth / OAuth (SuperSeller AI)

| Service | Key Name | Lives At | Notes |
|---------|----------|----------|-------|
| **NextAuth** | `NEXTAUTH_SECRET`, `NEXTAUTH_URL` | `apps/worker/.env` | Auth for worker API |
| **Google Cloud OAuth** | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | `social app/.env` | NotebookLM auth. Client ID: `16639173...` |
| **QuickBooks** | Client ID + Secret | `infra/mcp-servers/quickbooks-online-mcp-server/.env` | OAuth flow. MCP server. Client ID: `ABCqMF...` |

### MCP Servers

| Service | Key Name | Lives At | Notes |
|---------|----------|----------|-------|
| **n8n MCP** | JWT token | `~/.cursor/mcp.json` (via universal-aggregator) | API key + MCP server token (two separate JWTs) |
| ~~Stripe MCP~~ | ~~Stripe key~~ | ~~`~/.cursor/mcp.json`~~ | **DEPRECATED** — Stripe removed Feb 2026. PayPal uses REST API directly, no MCP server. |
| **NotebookLM** | OAuth tokens | `~/.cursor/mcp.json` (notebooklm entry) | Python script handles auth. Run `notebooklm-mcp-auth` if expired. |
| **Boost.space** | `BOOST_SPACE_API_KEY` | `apps/web/superseller-site/.env.local` | MCP integration |

### Monitoring / Misc (SuperSeller AI)

| Service | Key Name | Lives At | Notes |
|---------|----------|----------|-------|
| **Rollbar** | `ROLLBAR_ACCESS_TOKEN` | `social app/.env` | Error tracking. Not wired to active products. |
| **Home Assistant** | Bearer token | `social app/.env` | Home automation. Not business. |
| **APITemplate.io** | API key | `social app/.env` | PDF/image generation |
| **AssemblyAI** | `ASSEMBLYAI_API_KEY` | `social app/.env` | Speech-to-text |
| **eSignatures** | `ESIGNATURES_API_KEY` | `social app/.env` | Contract signing |
| **VerificaEmails** | API key | `social app/.env` | Email verification |
| **AmpleLeads** | API key | `social app/.env` | Lead generation |
| **PartnerStack** | API key | `social app/.env` | Affiliate/partner |
| **TidyCal** | Bearer token | `social app/.env` | Scheduling |
| **UploadPost** | JWT token | `social app/.env` | Social posting |
| **Klaviyo** | API key | `social app/.env` | `pk_7dfb...` |
| **Hyperise** | API key | `social app/.env` | `C1pmw...` |
| **SerpAPI** | `SERPAPI_KEY` | `social app/.env` | Not used in active products |
| **JigsawStack** | `JIGSAWSTACK_API_KEY` | `social app/.env` | Not used in active products |
| **RapidAPI / SearXNG** | API key | `social app/.env` | `c3c7b...` (same key for both) |

---

## UAD / MISSPARTY CREDENTIALS (David Szender — client, aka "Unique Supplies")

These belong to the client. Used ONLY by the FB Marketplace Bot and lead pipeline.

### Core Services (Client-owned accounts)

| Service | Key Name | Lives At | Notes |
|---------|----------|----------|-------|
| **Telnyx (UAD/MissParty)** | `TELNYX_API_KEY` | n8n credential `uadgaragedoors` | Key: `KEY019B52B283...`. 5 numbers (4 UAD + 1 MissParty). Two AI Assistants: UAD (`assistant-5515bf13`), MissParty (`assistant-f1708158`). DIFFERENT account from SuperSeller AI's Telnyx. |
| **Workiz (UAD CRM)** | `WORKIZ_API_TOKEN`, `WORKIZ_API_SECRET` | n8n UAD workflow (HTTP Request node) | Token: `api_uj4t1r0msb...`, Secret: `sec_258867...`. **POST auth: `auth_secret` goes INSIDE JSON body.** PascalCase fields. WORKING. |
| **GoLogin** | `GOLOGIN_TOKEN` | `fb marketplace lister/deploy-package/bot-config.json` | JWT token. Profiles: UAD `694b5e53...`, Miss Party `6949a854...` |
| **Claude (UAD)** | `ANTHROPIC_API_KEY` | Client provides | Key: `sk-ant-api03-Ghts...`. DIFFERENT from SuperSeller AI's Claude key. |
| **Vercel (UAD)** | Vercel token | Client provides | Token: `vcp_4l6...`. DIFFERENT from SuperSeller AI's Vercel. |
| **GitHub (UAD)** | `GITHUB_PAT` | Client provides | PAT: `github_pat_11B6FT76I...`. DIFFERENT from SuperSeller AI's GitHub. |
| **Kie.ai (UAD)** | `KIE_API_KEY` | `/opt/fb-marketplace-bot/.env` (server) | Key: `6bb5a5...`. DIFFERENT from SuperSeller AI's kie.ai key. Used for FB Bot AI copy + image variations. |
| **OpenAI (UAD)** | `OPENAI_API_KEY` | Client provides | Key: `sk-proj-KFun...`. DIFFERENT from SuperSeller AI's OpenAI. |

### FB Marketplace Bot (Client data)

| Service | Key Name | Lives At | Notes |
|---------|----------|----------|-------|
| **FB Credentials (UAD)** | `fbEmail`, `fbPass` | `fb marketplace lister/deploy-package/bot-config.json` | `uad.garage.doors@gmail.com` — NOTE: may not be connected to FB account |
| **FB Credentials (Miss Party)** | `fbEmail`, `fbPass` | `fb marketplace lister/deploy-package/bot-config.json` | `michalkacher2006@gmail.com` |
| **Telnyx Phone Numbers (UAD)** | N/A | `bot-config.json` → `phoneRotation` | 4 numbers: `+1-972-954-2407`, `+1-972-628-3587`, `+1-469-625-0960`, `+1-469-535-7538` |
| **Telnyx Phone Numbers (Miss Party)** | N/A | `bot-config.json` → `phoneRotation` | 1 number: `+1-469-283-9855` |
| **WAHA (FB Bot)** | `wahaApiKey` | `bot-config.json` | Same WAHA instance as SuperSeller AI (`4fc7e008...`). Notification target: `14695885133@c.us` |

### n8n Lead Routing Workflows (LIVE — Feb 22, 2026)

- **UAD Lead Analysis**: `U6EZ2iLQ4zCGg31H` — Telnyx AI → Claude Sonnet 4.5 → Workiz CRM + Outlook email. ACTIVE, 5 triggers.
- **Miss Party Lead Analysis**: `9gfvZo9sB4b3pMWQ` — Telnyx AI → Claude → Outlook email. ACTIVE, 5 triggers. (Old ID `U6LqmzNwiKTkd0gM` deleted.)
- **Telnyx Voice AI "Hope"**: `MqMYMeA9U9PEX1cH` — SuperSeller AI sales agent (NOT UAD/MissParty).

---

## File Summary

| File | What's In It | Owner | Active Products |
|------|-------------|-------|----------------|
| `apps/worker/.env` | DB, Redis, Apify, Kie (SuperSeller AI), Gemini, R2, NextAuth | SuperSeller AI | TourReel, Winner Studio |
| `apps/web/superseller-site/.env` | DATABASE_URL only | SuperSeller AI | superseller-site (web) |
| `apps/web/superseller-site/.env.local` | Airtable, Kie, Redis, PayPal, Vercel, VIDEO_WORKER_URL, Boost | SuperSeller AI | superseller-site (web) |
| `.env.racknerd` | VPS_PASSWORD only | SuperSeller AI | SSH access |
| `social app/.env` | 50+ keys (SuperSeller AI credential dump) | SuperSeller AI | NONE actively — reference only |
| `social app/.env.master` | Same as above (COMMITTED TO GIT — security risk) | SuperSeller AI | NONE |
| `fb marketplace lister/.env` | DB, Redis, GoLogin | UAD/MissParty | FB Bot |
| `fb marketplace lister/deploy-package/bot-config.json` | GoLogin, FB creds, phone rotation, WAHA, webhook URLs | UAD/MissParty | FB Marketplace Bot |
| `/opt/fb-marketplace-bot/.env` | Kie.ai (UAD key), DB connection | UAD/MissParty | FB Bot (server) |
| `~/.cursor/mcp.json` | n8n, NotebookLM MCP configs | SuperSeller AI | Claude Code MCP tools |

---

## Workiz API Auth Pattern (IMPORTANT)

Workiz's API has undocumented auth requirements for POST/write operations:
- **Base URL**: `https://api.workiz.com/api/v1/{api_token}/`
- **GET**: Token in URL path only. No secret needed.
- **POST**: Token in URL path + `auth_secret` field **INSIDE the JSON body** (mandatory). Without it, any `Content-Type: application/json` request gets 401.
- **Fields**: PascalCase — `FirstName`, `LastName`, `Phone`, `Email`, `Address`, `City`, `State`, `PostalCode`, `Company`, `JobType`, `JobSource`
- **Required**: At least `Phone` or `Email` (empty string rejected — omit field or don't call)
- **JobSource**: Must match existing Workiz values. `"OTHER"` always works.
- **Source of truth**: Pipedream open-source SDK `_authData()` method.

---

## Rules

1. **When user gives access: USE it.** Check this map, find the file, read the key. Don't ask.
2. **Never store full secrets in this file.** Only paths and key prefixes for identification.
3. **NEVER mix SuperSeller AI and UAD/MissParty credentials.** They are separate accounts/organizations.
4. **`social app/.env` is a SuperSeller AI credential dump** — most keys there are NOT used by active products. Check `apps/worker/.env` and `apps/web/superseller-site/.env.local` first.
5. **Vercel Dashboard** has production env vars that may differ from local `.env.local`. For prod debugging, check Vercel first.
6. **`social app/.env.master` is committed to git** — this is a security risk. Should be deleted from git history.

---

## TAX4US CREDENTIALS (Tax4Us LLC — separate client system)

**CRITICAL**: These credentials belong to Tax4Us LLC (tax4us.co.il). They are COMPLETELY SEPARATE from SuperSeller AI and UAD/MissParty. NEVER mix them. Tax4Us runs on its own n8n cloud instance and has its own accounts for every service.

**Credential file**: `tax4us/.env` (dedicated directory, NOT in superseller-site or social app)

| Service | Key Name | Value Prefix / Identifier | Notes |
|---------|----------|--------------------------|-------|
| **n8n Cloud** | `N8N_API_TOKEN` | `eyJhbGci...` (sub: `7b60f61d`) | Instance: `tax4usllc.app.n8n.cloud` |
| **n8n MCP Server** | `N8N_MCP_TOKEN` | `eyJhbGci...` (jti: `38940138`) | MCP endpoint: `tax4usllc.app.n8n.cloud/mcp-server/http` |
| **Captivate.fm** | `CAPTIVATE_USER_ID`, `CAPTIVATE_API_KEY` | User: `655c0354...`, Key: `cJ3zT4...` | Podcast hosting (docs.captivate.fm) |
| **Airtable** | `AIRTABLE_TOKEN` | `patnvGcDy...` | Tax4Us Airtable (NOT SuperSeller's Aitable.ai) |
| **OpenRouter** | `OPENROUTER_API_KEY` | `sk-or-v1-7f4fd...` | Tax4Us's own OpenRouter key |
| **Tavily** | `TAVILY_API_KEY` | `tvly-dev-JnJm...` | Web search API |
| **Apify** | `APIFY_USER_ID`, `APIFY_TOKEN` | User: `JpAAvL7...`, Token: `apify_api_hehe...` | Tax4Us's own Apify (NOT SuperSeller's) |
| **WordPress** | `WP_USER`, `WP_APP_PASSWORD` | User: `n8n integration`, Token: `tvFc 8gY1...` | tax4us.co.il WP site |
| **Claude API** | `ANTHROPIC_API_KEY` | `sk-ant-api03-KKELu5...` | Tax4Us's own Claude key (NOT SuperSeller's) |
| **SerpAPI** | `SERPAPI_KEY` | `23a725585c...` | Tax4Us's own SerpAPI |
| **Slack** | `SLACK_CLIENT_ID`, `SLACK_CLIENT_SECRET`, `SLACK_BOT_TOKEN` | Client: `940735...`, Bot: `xoxp-9407...` | Tax4Us Slack workspace |
| **ElevenLabs** | `ELEVENLABS_VOICE_ID`, `ELEVENLABS_API_KEY` | Voice: `ZT9u07...`, Key: `sk_1eff0d...` | Tax4Us's own ElevenLabs (voice + API) |
| **AssemblyAI** | `ASSEMBLYAI_API_KEY` | `6cfb6cea...` | Tax4Us's own AssemblyAI |
| **Kie.ai** | `KIE_API_KEY` | `3ca74c96...` | Tax4Us's own Kie.ai key (NOT SuperSeller's) |
| **Google AI Studio** | `GOOGLE_AI_API_KEY` | `AIzaSyCm2v...` | Tax4Us's own Gemini key |
| **UploadPost** | `UPLOADPOST_API_KEY` | `eyJhbGci...` (email: `ai@tax4us.co.il`) | Social posting API |
| **Facebook** | `FB_PAGE_ID` | `61571773396514` | Tax4Us Facebook page |
| **LinkedIn** | `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET` | Client: `867fvsh...`, Secret: `WPL_AP1.Ga7T...` | Tax4Us LinkedIn OAuth |
| **GitHub** | `GITHUB_PAT` | `github_pat_11BV56LQA0...` | Tax4Us's own GitHub PAT |
| **Vercel** | `VERCEL_TOKEN` | `vcp_6bqbOW...` | Tax4Us's own Vercel token |
| **Stitch** | `STITCH_API_KEY` | `AQ.Ab8RN6...` | Tax4Us's own Stitch API |

---
*Updated: 2026-02-26. Canonical source for credential locations.*
