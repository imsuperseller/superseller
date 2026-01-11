# Boost.space Quick Reference - November 14, 2025

## 🔑 Credentials

**API Key**: `88c5ff57783912fcc05fec10a22d67b5806d48346ab9ef562f17e2188cc07dba`  
**Platform URL**: `https://superseller.boost.space`  
**MCP Endpoint**: `https://mcp.boost.space/v1/superseller/sse`

## ✅ Current Status

- **MCP Server**: ✅ Configured in `~/.cursor/mcp.json`
- **Vercel Env Var**: ✅ Exists (all environments)
- **Code Integration**: ✅ Configured in `apps/web/rensto-site/src/app/api/marketplace/workflows/route.ts`

## 🧪 Quick Test

```bash
# Test API key directly
curl -H "Authorization: Bearer 88c5ff57783912fcc05fec10a22d67b5806d48346ab9ef562f17e2188cc07dba" \
     "https://superseller.boost.space/api/product?spaceId=51&limit=3"

# Test Vercel endpoint
curl "https://rensto.com/api/marketplace/workflows?status=Active&limit=3"
```

## 📝 Scripts

- **Add to Vercel**: `scripts/add-boost-space-key-to-vercel.sh`
- **Verify**: `scripts/verify-boost-space-api.sh`

## 🚀 If API Not Working

1. **Redeploy**: `cd apps/web/rensto-site && vercel --prod`
2. **Check Logs**: Vercel Dashboard → Deployments → Latest → Runtime Logs
3. **Verify Env Var**: `cd apps/web/rensto-site && vercel env ls | grep BOOST`

