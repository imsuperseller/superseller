# Credential Reference — Location Map

**Purpose**: Agent reference. Every service maps to exactly ONE file where its key lives. **No actual secrets in this file — only paths and key prefixes for identification.**

**CRITICAL DISTINCTION**: Some credentials are SEPARATE per business, others are SHARED (Shai's personal accounts used everywhere).

### Shared vs Separate Keys (GROUND TRUTH — March 2026)

| Service | Status | Key Prefix | Notes |
|---------|--------|------------|-------|
| **Anthropic/Claude** | **SHARED** | `sk-ant-api03-Ghts...` | One Shai-owned account, same key in ALL .env files |
| **OpenAI** | **SHARED** | `sk-proj-KFun...` | One Shai-owned account, same key everywhere |
| **Kie.ai** | **SHARED** | `6bb5a5...` | One Shai-owned account, same key everywhere |
| **GoLogin** | **SHARED** | `eyJhbG...I6hDVY...` | One Shai-owned account, same JWT everywhere |
| **ElevenLabs** | **SHARED** | `sk_f0dd...` | One Shai-owned account |
| **Telnyx** | **SEPARATE** | SuperSeller: `KEY019CACA6A...`, UAD: `KEY019B52B283...` | Two different Telnyx accounts |
| **GitHub** | **SEPARATE** | SuperSeller: `github_pat_11AZ2TTM...` (`imsuperseller`), Rensto: `github_pat_11B7YGIW...` (`renstollc`), Shai Personal: `github_pat_11B7YGZS...` (`1shaifriedman-create`) | Three accounts |
| **Vercel** | **SEPARATE** | SuperSeller: `vcp_0PlCp13...` (team `shais-projects`), Shai Personal: `vcp_4IZWV57b...` (team `1shaifriedman-5302`) | Rensto Vercel = same team as SuperSeller (separation pending) |
| **Workiz** | **UAD ONLY** | `api_uj4t1r0msb...` | Only used by UAD (garage door CRM) |
| **Facebook** | **SEPARATE** | UAD: `1shaifriedman@gmail.com` (Shai's personal), MissParty: `michalkacher2006@gmail.com` | UAD uses Shai's FB because David never provided his own |

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
| **Claude (SHARED)** | `ANTHROPIC_API_KEY` | Root `.env`, `apps/worker/.env`, `fb-marketplace-lister/.env`, server `.env` | Key: `sk-ant-api03-Ghts...`. **ONE account** — Shai's personal, used by ALL projects (SuperSeller + UAD + FB Bot). |
| **Gemini (Google)** | `GOOGLE_GENERATIVE_AI_API_KEY` | `apps/worker/.env` | Key: `AIzaSyAz...`. VideoForge + Winner Studio brain |
| **OpenAI (SHARED)** | `OPENAI_API_KEY` | Root `.env`, `apps/worker/.env`, `fb-marketplace-lister/.env`, server `.env` | Key: `sk-proj-KFun...`. **ONE account** — Shai's personal, used by ALL projects. |
| **DeepSeek** | `DEEPSEEK_API_KEY` | `social app/.env` | Not used in active products |
| **OpenRouter** | `OPENROUTER_API_KEY` | `social app/.env` | Not used in active products |
| **Ollama** | N/A (local) | RackNerd `http://172.245.56.50:11434` | No API key needed. nomic-embed-text for RAG. |
| **HuggingFace** | `HUGGINGFACE_TOKEN` | `social app/.env` | `hf_mBX...` |
| **Google Stitch** | API Key | `social app/.env` | `AQ.Ab8R...` |

### Video / Media (SuperSeller AI)

| Service | Key Name | Lives At | Notes |
|---------|----------|----------|-------|
| **Kie.ai (SHARED)** | `KIE_API_KEY` | Root `.env`, `apps/worker/.env`, `fb-marketplace-lister/.env`, server `.env` | Key: `6bb5a5...`. **ONE account** — Shai's personal, used by ALL projects (VideoForge + FB Bot). |
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
| **Resend** | `RESEND_API_KEY` | `apps/web/superseller-site/.env.local`, `apps/worker/.env`, `social app/.env` | **Rensto account** (service@rensto.com) for ALL brands (SuperSeller, Rensto, etc.). Email delivery. Get key: resend.com → API Keys. |
| **Telnyx (SuperSeller AI)** | `TELNYX_API_KEY_SUPERSELLER` | `apps/worker/.env`, root `.env` | Voice AI "Superseller FrontDesk" (1 number: +14699299314). Key: `KEY019CDA945...`. Worker `TELNYX_API_KEY` uses UAD key (both configured assistants are UAD-account). **Old keys: `KEY019CACA6A...` (revoked Mar 2026), `KEY019B6800DE...` (D17 block) — do NOT use.** |

**Resend (Rensto account only)** — One Resend account (service@rensto.com) for all brands. SuperSeller magic links, worker notifications, Studio emails — all use this. No separate Resend accounts; nothing outside Resend mixes in.

### Platforms / Social (SuperSeller AI)

| Service | Key Name | Lives At | Notes |
|---------|----------|----------|-------|
| **GitHub (SuperSeller AI)** | `GITHUB_PAT` | `social app/.env` | SuperSeller AI PAT: `github_pat_11AZ2TTMQ0...`. Different from UAD's. |
| **Notion** | `NOTION_TOKEN` | `social app/.env` | `ntn_1307683232...`. Internal integration |
| **Aitable.ai** | `AITABLE_API_KEY` | `social app/.env` | Dashboard only, not production |
| **X/Twitter** | `X_ACCOUNT_ID`, `X_USERNAME`, `X_API_KEY`, `X_API_KEY_SECRET`, `X_CLIENT_ID`, `X_CLIENT_SECRET` | `apps/web/superseller-site/.env.local`, `social app/.env` | Account: `@iamsupersel`. API Key: `v6UJ1...`. Client ID: `MXhuMj...`. SocialHub. |
| **YouTube** | `YOUTUBE_API_KEY`, `YOUTUBE_OAUTH_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET` | `apps/web/superseller-site/.env.local`, `social app/.env` | API Key: `AIzaSyBm...`. OAuth Client: `10651066...`. SocialHub. |
| **TikTok** | Client ID + Secret | `social app/.env` | Developer app ID: `7611282302357899276`. Status: Pending approval. SocialHub Phase 2. |
| **Apify** | `APIFY_API_TOKEN` | `apps/worker/.env` | Zillow scraping for VideoForge. User ID: `wjz2NfU1Y0MdMxeey`. Key: `apify_api_gQw...` |

### Auth / OAuth (SuperSeller AI)

| Service | Key Name | Lives At | Notes |
|---------|----------|----------|-------|
| **NextAuth** | `NEXTAUTH_SECRET`, `NEXTAUTH_URL` | `apps/worker/.env` | Auth for worker API |
| **Google Cloud OAuth** | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | `social app/.env` | NotebookLM auth. Client ID: `16639173...` |
| ~~QuickBooks~~ | ~~Client ID + Secret~~ | ~~Deleted~~ | **CANCELLED Mar 8, 2026** (DECISIONS.md §20). MCP server directories removed. |

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
| **Workiz (UAD CRM)** | `WORKIZ_API_TOKEN`, `WORKIZ_API_SECRET` | `/opt/fb-marketplace-bot/.env`, `fb-marketplace-lister/.env`, n8n UAD workflow | Token: `api_uj4t1r0msb...`, Secret: `sec_258867...`. **POST auth: `auth_secret` goes INSIDE JSON body.** PascalCase fields. WORKING. |
| **GoLogin** | `GOLOGIN_TOKEN` | `fb-marketplace-lister/deploy-package/bot-config.json` | JWT token. Profiles: UAD `694b5e53...`, Miss Party `6949a854...` |
| **Claude** | `ANTHROPIC_API_KEY` | `/opt/fb-marketplace-bot/.env`, `fb-marketplace-lister/.env` | Key: `sk-ant-api03-Ghts...`. **SHARED** — same Shai-owned account as SuperSeller AI. |
| **Vercel (UAD)** | Vercel token | Not in any .env (reference only) | Token: `vcp_4l6LW3...`. David's own Vercel. DIFFERENT from SuperSeller AI's. Not used by FB bot. |
| **GitHub (UAD)** | `GITHUB_PAT` | Not in any .env (reference only) | PAT: `github_pat_11B6FT76I...`. David's own GitHub. DIFFERENT from SuperSeller AI's. Not used by FB bot. |
| **Kie.ai** | `KIE_API_KEY` | `/opt/fb-marketplace-bot/.env`, `fb-marketplace-lister/.env` | Key: `6bb5a5...`. **SHARED** — same Shai-owned account as SuperSeller AI. |
| **OpenAI** | `OPENAI_API_KEY` | `/opt/fb-marketplace-bot/.env`, `fb-marketplace-lister/.env` | Key: `sk-proj-KFun...`. **SHARED** — same Shai-owned account as SuperSeller AI. |

### FB Marketplace Bot (Client data)

| Service | Key Name | Lives At | Notes |
|---------|----------|----------|-------|
| **FB Credentials (UAD)** | `fbEmail`, `fbPass` | `fb-marketplace-lister/deploy-package/bot-config.json` | `1shaifriedman@gmail.com` — Shai's personal Facebook (managed by GoLogin profile "uad (shai fb)") |
| **FB Credentials (Miss Party)** | `fbEmail`, `fbPass` | `fb-marketplace-lister/deploy-package/bot-config.json` | `michalkacher2006@gmail.com` |
| **Telnyx Phone Numbers (UAD)** | N/A | `bot-config.json` → `phoneRotation` | 4 numbers: `+1-972-954-2407`, `+1-214-256-3408`, `+1-469-814-6509`, `+1-972-646-6110` |
| **Telnyx Phone Numbers (Miss Party)** | N/A | `bot-config.json` → `phoneRotation` | 1 number: `+1-469-814-6509` |
| **WAHA (FB Bot)** | `wahaApiKey` | `bot-config.json` | Same WAHA instance as SuperSeller AI (`4fc7e008...`). Notification target: `14695885133@c.us` |

### n8n Lead Routing Workflows (LIVE — Feb 22, 2026)

- **UAD Lead Analysis**: `U6EZ2iLQ4zCGg31H` — Telnyx AI → Claude Sonnet 4.5 → Workiz CRM + Outlook email. ACTIVE, 5 triggers.
- **Miss Party Lead Analysis**: `9gfvZo9sB4b3pMWQ` — Telnyx AI → Claude → Outlook email. ACTIVE, 5 triggers. (Old ID `U6LqmzNwiKTkd0gM` deleted.)
- **Telnyx Voice AI "Hope"**: `MqMYMeA9U9PEX1cH` — SuperSeller AI sales agent (NOT UAD/MissParty).

---

## File Summary

| File | What's In It | Owner | Active Products |
|------|-------------|-------|----------------|
| `apps/worker/.env` | DB, Redis, Apify, Kie (shared), OpenAI (shared), Anthropic (shared), Gemini, R2, NextAuth, ElevenLabs | SuperSeller AI | VideoForge, ClaudeClaw |
| `apps/web/superseller-site/.env` | DATABASE_URL only | SuperSeller AI | superseller-site (web) |
| `apps/web/superseller-site/.env.local` | Airtable, Kie, Redis, PayPal, Vercel, VIDEO_WORKER_URL, Boost | SuperSeller AI | superseller-site (web) |
| `.env.racknerd` | VPS_PASSWORD only | SuperSeller AI | SSH access |
| `social app/.env` | 50+ keys (SuperSeller AI credential dump) | SuperSeller AI | NONE actively — reference only |
| `social app/.env.master` | Same as above (COMMITTED TO GIT — security risk) | SuperSeller AI | NONE |
| `fb-marketplace-lister/.env` | DB, Redis, GoLogin, Telnyx (UAD), Kie (shared), OpenAI (shared), Anthropic (shared), Workiz | UAD/MissParty | FB Bot |
| `fb-marketplace-lister/deploy-package/bot-config.json` | GoLogin, FB creds, phone rotation, WAHA, webhook URLs | UAD/MissParty | FB Marketplace Bot |
| `/opt/fb-marketplace-bot/.env` | Kie (shared), GoLogin (shared), Telnyx (UAD), OpenAI (shared), Anthropic (shared), Workiz, DB | UAD/MissParty | FB Bot (server) |
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

---

## CUSTOMER-SPECIFIC CREDENTIALS (Separate accounts — NEVER mix with SuperSeller AI)

### Yoram Friedman (Insurance — `yoramnfridman1`)
| Service | Key/Token | Notes |
|---------|-----------|-------|
| **GitHub PAT** | `github_pat_11BFKCUVI0vd1VwC7qu2O2_...` (provided in chat) | Account: `yoramnfridman1`. Repos: `yoram-landing`, `yoram-friedman-insurance` |
| **Vercel** | See `.env` or chat history (not stored in git) | Project: `yoram-landing` (`prj_5qSPLWMnNWoSEYnc7VXcOz89E6CA`). Live: yoramfriedman.co.il |
| **Apify** | See `.env` or chat history (not stored in git) | Account is empty — 0 actors, 0 tasks. Set up insurance lead/competitor scraping |

### eSignatures.com (SuperSeller AI — for customer contracts)
| Key | Value | Templates |
|-----|-------|-----------|
| `ESIGNATURES_API_KEY` | `08995283-ce2f-4dc4-9a15-7a05b6a72b7d` | **Elite Pro**: "SuperSeller AI Services Agreement" (`99de20b5-2bb9-4439-9532-e00902fe6824`) — created Mar 6, not yet sent. Others: SuperSeller Standard Agreement, SuperSeller Standard Agreement (Full), AI Automation Services Agreement |
| API base | `https://esignatures.com/api/` | Auth: `?token=KEY` param |

---

## Rules

1. **When user gives access: USE it.** Check this map, find the file, read the key. Don't ask.
2. **Never store full secrets in this file.** Only paths and key prefixes for identification.
3. **NEVER mix SuperSeller AI and UAD/MissParty credentials.** They are separate accounts/organizations.
4. **NEVER use Yoram's GitHub/Vercel/Apify for anything SuperSeller-related.** Completely isolated.
5. **`social app/.env` is a SuperSeller AI credential dump** — most keys there are NOT used by active products. Check `apps/worker/.env` and `apps/web/superseller-site/.env.local` first.
6. **Vercel Dashboard** has production env vars that may differ from local `.env.local`. For prod debugging, check Vercel first.
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

## FB Marketplace Bot — Session Management

### How Sessions Work
The FB Marketplace Bot uses GoLogin browser profiles with Facebook cookies for authentication. Each customer (UAD, MissParty) has a dedicated GoLogin profile that stores session cookies.

### Session Establishment
1. Run `session-login.js` on the server: `ssh root@172.245.56.50 'cd /opt/fb-marketplace-bot && rm -f /tmp/gl_lock && DISPLAY=:100 timeout 660 node session-login.js [0|1]'` (0=UAD, 1=MissParty)
2. The script opens a GoLogin browser, navigates to Facebook, and fills in credentials from `bot-config.json`
3. Facebook triggers passkey 2FA — **this CANNOT be automated**. Shai must approve the login on his phone (for UAD) or Michal must approve (for MissParty)
4. Monitor the browser via noVNC at `http://172.245.56.50:6080/vnc.html` to see the 2FA prompt
5. After approval, the script saves cookies to: GoLogin API (S3), `cookies.json` local file, and the GoLogin profile

### Cookie Lifetime
- Facebook session cookies (`c_user`, `xs`) expire in approximately **365 days**
- The `cookie-monitor.js` PM2 job checks cookie health every 6 hours
- Alerts via WhatsApp (WAHA) if cookies are stale (>7 days without successful post) or if failures exceed threshold

### What Causes Session Expiry
- Facebook security checkpoint (unusual location, suspicious activity)
- Manual logout from any device on the same account
- Facebook account lockout or password change
- GoLogin profile corruption (rare)
- Cookie file overwritten with empty/invalid data (mitigated by backup logic)

### How to Restore a Session
1. SSH into RackNerd: `ssh root@172.245.56.50`
2. Run session-login.js: `cd /opt/fb-marketplace-bot && rm -f /tmp/gl_lock && DISPLAY=:100 timeout 660 node session-login.js 0` (0=UAD, 1=MissParty)
3. Open noVNC: `http://172.245.56.50:6080/vnc.html`
4. Wait for 2FA prompt, approve on phone
5. Script auto-saves cookies on success. Verify: `node -e "const c=require('./cookies.json'); console.log(c.filter(x=>x.name==='c_user').length + ' c_user cookies')"`

### Why It Cannot Be Fully Automated
- Facebook uses **passkey 2FA** — requires physical approval on an authenticated device (Shai's phone for UAD, Michal's phone for MissParty)
- The login form is sometimes not present in the DOM on server-side rendering (Facebook serves different HTML to headless/server environments)
- `refresh-session.js` can handle password-only re-authentication modals (no 2FA) but not full login checkpoints

### Session Safety Rules
- **NEVER overwrite `cookies_uad.json` or `cookies_missparty.json`** when existing file has valid `c_user` cookies and new data does not
- Always backup existing cookies to `.bak` before any overwrite
- `uploadCookiesToServer=false` is enforced in all failure paths to prevent broken profiles from overwriting good ones on GoLogin S3
- The bot checks for `c_user` + `xs` presence before proceeding with any posting cycle

---
*Updated: 2026-03-08. Canonical source for credential locations.*
