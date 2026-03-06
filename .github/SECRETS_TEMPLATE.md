# GitHub Secrets Template
# Add these secrets to your GitHub repository settings
# Align with .env.example and CLAUDE.md

# ============================================
# 🔐 AUTH & SECURITY
# ============================================
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
CREDENTIAL_ENCRYPTION_KEY=generate-with-openssl-rand-hex-64

# ============================================
# 💳 PAYMENTS (PayPal — migrated from Stripe Feb 2026)
# ============================================
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_WEBHOOK_ID=your-paypal-webhook-id
# Note: DB columns retain `stripe*` names but store PayPal IDs (intentional)

# ============================================
# 🗄️ DATABASE & CACHE
# ============================================
# Neon (via Vercel Marketplace) – Vercel Postgres retired Dec 2024; use Neon.
# Provision: Vercel Dashboard → Storage → Add Integration → Neon
# Injected automatically: POSTGRES_URL, DATABASE_URL
DATABASE_URL=postgresql://user:password@host:5432/superseller
# Or separate (if not using Neon integration):
POSTGRES_USER=admin
POSTGRES_PASSWORD=your-postgres-password
REDIS_PASSWORD=your-redis-password

# ============================================
# 🤖 AI & AUTOMATION
# ============================================
OPENAI_API_KEY=sk-...
N8N_API_KEY=your-n8n-api-key-here

# ============================================
# 🌐 DEPLOYMENT (Vercel, Render)
# ============================================
VERCEL_TOKEN=your-vercel-token
RENDER_API_KEY=your-render-api-key-here

# ============================================
# 🖥️ RACKNERD VPS (Admin n8n route SSH)
# ============================================
# Required for /api/admin/n8n (deep diagnostics, restart, upgrade)
# Only needed if admin runs that route; Vercel may not have sshpass.
VPS_PASSWORD=your-racknerd-root-password
RACKNERD_SSH_PASSWORD=alternate-name-for-same
RACKNERD_IP=172.245.56.50

# ============================================
# 📚 OPTIONAL (LightRag, etc.)
# ============================================
LIGHTRAG_WEBHOOK_URL=https://superseller-lightrag.onrender.com/webhook
LIGHTRAG_API_KEY=your-lightrag-api-key-here
GITHUB_TOKEN=your-github-personal-access-token-here
GITHUB_WEBHOOK_SECRET=your-webhook-secret-here
