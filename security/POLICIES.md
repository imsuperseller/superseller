# 🔐 Security Policies

> **Source of Truth for security practices and access control.**

---

## Access Control

| System | Access Level | Who |
| :--- | :--- | :--- |
| PostgreSQL + Redis | Admin | Founder, Developer (primary) |
| Firestore | Admin | Founder, Developer (legacy; migration in progress) |
| n8n | Admin | Founder, Developer (backup; Antigravity primary) |
| Stripe | Full | Founder |
| Vercel | Deploy | Founder, Developer |
| VPS (SSH) | Root | Founder, Developer |

---

## API Key Management

- **Never** commit API keys to Git.
- Store in `.env.local` for local dev.
- Store in Vercel/n8n environment variables for production.
- Rotate keys annually or after suspected breach.

---

## Data Protection

- **PostgreSQL**: Row-level security; app backends and marketplace. **Firestore**: Legacy; migration in progress.
- **Stripe**: PCI compliance handled by Stripe.
- **GDPR**: User data deleted on request.

---

## Incident Response

1. **Identify**: Detect anomaly (alerts, user reports).
2. **Contain**: Disable affected service/API key.
3. **Investigate**: Review logs, identify root cause.
4. **Remediate**: Apply fix, rotate keys if needed.
5. **Notify**: Inform affected users if required.
