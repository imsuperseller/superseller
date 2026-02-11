# Provision Neon Postgres (Vercel)

**Note**: Vercel Postgres was retired in Dec 2024. Neon is the replacement. Use Neon via Vercel Marketplace.

---

## Steps

1. Open Vercel Dashboard → your project
2. Storage tab → Add Integration (or go to vercel.com/marketplace/neon)
3. Install Neon
4. Choose: Create New Neon Account (billing via Vercel) or Link Existing
5. Connect to your Rensto project; select region; Create
6. Vercel injects POSTGRES_URL and DATABASE_URL
7. Local: copy DATABASE_URL from Vercel env vars into .env

---

## Prisma

After provisioning, update prisma/schema.prisma:
  datasource db { provider = "postgresql"; url = env("DATABASE_URL"); }
Then: npx prisma migrate dev
