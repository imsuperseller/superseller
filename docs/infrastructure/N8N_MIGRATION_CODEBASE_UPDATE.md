# n8n Migration - Codebase Update Summary

**Date**: December 5, 2025  
**Migration**: Old VPS (173.254.201.134) → New VPS (172.245.56.50)  
**Domain**: n8n.rensto.com

---

## ✅ Files Updated

### **MCP Server Configuration**
1. ✅ `infra/mcp-servers/n8n-mcp-wrapper/n8n-rensto-wrapper.cjs`
   - Updated: `N8N_API_URL` from `http://173.254.201.134:5678` → `http://n8n.rensto.com`

2. ✅ `rensto-marketplace/plugins/rensto-n8n-agents/mcpServers/n8n-unified-server.js`
   - Updated: Default URL from `http://173.254.201.134:5678` → `http://n8n.rensto.com`

3. ✅ `rensto-marketplace/plugins/rensto-n8n-agents/mcpServers/n8n-unified.json`
   - Updated: `N8N_RENSTO_VPS_URL` from `http://173.254.201.134:5678` → `http://n8n.rensto.com`

### **Scripts & Configuration**
4. ✅ `scripts/n8n/n8n-config.js`
   - Updated: Rensto instance URL from `http://173.254.201.134:5678` → `http://n8n.rensto.com`

### **Vercel API Routes** (apps/web/rensto-site)
5. ✅ `src/app/api/stripe/webhook/route.ts`
   - Updated: `N8N_URL` from `http://173.254.201.134:5678` → `http://n8n.rensto.com`
   - **Impact**: Stripe webhook triggers to n8n workflows

6. ✅ `api-backup/api/n8n/health/route.ts`
   - Updated: `N8N_BASE_URL` from `http://173.254.201.134:5678` → `http://n8n.rensto.com`

7. ✅ `api-backup/api/analytics/facebook-scraping/[orgId]/route.ts`
   - Updated: Default `n8nUrl` from `http://173.254.201.134:5678` → `http://n8n.rensto.com`

8. ✅ `api-backup/api/agents/[id]/run/route.ts`
   - Updated: `n8nWebhookUrl` from `http://173.254.201.134:5678/webhook/facebook-scraper` → `http://n8n.rensto.com/webhook/facebook-scraper`

### **Admin Dashboard**
9. ✅ `apps/web/admin-dashboard/src/app/api/n8n/update/route.ts`
   - Updated: `n8nUrl` from `http://173.254.201.134:5678` → `http://n8n.rensto.com`

### **React Components**
10. ✅ `apps/web/rensto-site/src/components/admin/WorkflowTemplatesManagement.tsx`
    - Updated: 4 instances of old IP → `http://n8n.rensto.com`
    - Webhook URLs and workflow links

---

## 📋 Files NOT Updated (Documentation Only)

The following files contain references to the old IP but are **documentation only** and don't affect functionality:
- `docs/infrastructure/*.md` (various documentation files)
- `CLAUDE.md` (will be updated separately)
- Archive files in `archives/`

---

## 🚀 Deployment Steps

### **1. Commit Changes**
```bash
git add .
git commit -m "🔧 Update n8n server URLs from old VPS to n8n.rensto.com"
git push origin main
```

### **2. Vercel Auto-Deploy**
- ✅ Vercel will automatically deploy on push to `main`
- ✅ All API routes will use new n8n URL
- ✅ Stripe webhooks will route to new server

### **3. Verify Deployment**
1. Check Vercel deployment: https://vercel.com/dashboard
2. Test Stripe webhook: Trigger a test payment
3. Check n8n health: `curl http://n8n.rensto.com/healthz`
4. Verify MCP tools: Restart Cursor to reload MCP config

---

## ⚠️ Important Notes

1. **Local MCP Config**: Update `~/.cursor/mcp.json` manually:
   ```json
   {
     "mcpServers": {
       "n8n-rensto": {
         "env": {
           "N8N_API_URL": "http://n8n.rensto.com"
         }
       }
     }
   }
   ```

2. **Environment Variables**: If any Vercel environment variables reference the old IP, update them:
   - `N8N_BASE_URL`
   - `N8N_API_URL`
   - `N8N_RENSTO_VPS_URL`

3. **HTTPS**: Currently using HTTP (`http://n8n.rensto.com`). For HTTPS:
   - Enable Cloudflare proxy (may cause 521 errors)
   - OR set up Let's Encrypt SSL on server

---

## ✅ Status

- **Codebase**: ✅ All critical files updated
- **GitHub**: ⏳ Ready to commit and push
- **Vercel**: ⏳ Will auto-deploy on push
- **MCP Tools**: ⏳ Requires Cursor restart + manual `~/.cursor/mcp.json` update

---

**Next Steps**: Commit and push to trigger Vercel deployment.
