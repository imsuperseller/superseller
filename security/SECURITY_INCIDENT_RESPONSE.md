# 🚨 SECURITY INCIDENT RESPONSE - API KEY EXPOSURE

**Date**: October 3, 2025  
**Incident**: Multiple API keys exposed in git commit history  
**Status**: 🔴 **CRITICAL - IMMEDIATE ACTION REQUIRED**

---

## 📋 **EXPOSED CREDENTIALS CHECKLIST**

### **🔴 HIGH PRIORITY - Rotate Immediately**

- [ ] **Aitable.ai API Token** (migrated from Airtable.com):
  - Go to Aitable.ai dashboard → API settings
  - Revoke old token
  - Generate new token
  - Update in environment variables

- [ ] **PayPal API Credentials** (migrated from Stripe Feb 2026)
  - Go to: https://developer.paypal.com/dashboard/applications
  - Regenerate client secret or create new app
  - Update PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_WEBHOOK_ID in environment
  - Note: DB columns retain `stripe*` names but store PayPal IDs

- [ ] **Anthropic API Key**: `sk-ant-*`
  - Go to: https://console.anthropic.com/settings/keys
  - Delete compromised key
  - Generate new key
  - Update ANTHROPIC_API_KEY in environment

- [ ] **OpenAI API Key**: `sk-*`
  - Go to: https://platform.openai.com/api-keys
  - Revoke compromised key
  - Generate new key
  - Update OPENAI_API_KEY in environment

- [ ] **Notion API Token**: `secret_*`
  - Go to: https://www.notion.so/my-integrations
  - Revoke compromised integration
  - Create new integration
  - Update NOTION_API_TOKEN in environment

- [ ] **Typeform Personal Access Token**
  - Go to: https://admin.typeform.com/account#/section/tokens
  - Revoke old token
  - Generate new token
  - Update in environment

- [ ] **Hugging Face User Access Token**
  - Go to: https://huggingface.co/settings/tokens
  - Revoke compromised token
  - Generate new token
  - Update in environment

- [ ] **Docker Personal Access Token**
  - Go to: https://hub.docker.com/settings/security
  - Revoke old token
  - Generate new token
  - Update in CI/CD environment

- [ ] **Apify API Token**
  - Go to: https://console.apify.com/account/integrations
  - Revoke compromised token
  - Generate new token
  - Update in environment

### **🟡 MEDIUM PRIORITY - Review & Rotate**

- [ ] **QuickBooks OAuth Credentials**
  - Review all OAuth connections
  - Re-authenticate if needed
  - Update redirect URIs

- [ ] **n8n API Keys**
  - Check all n8n instances
  - Rotate API keys
  - Update webhook URLs

- [ ] **Database Credentials**
  - Review database access logs
  - Rotate passwords if exposed
  - Enable audit logging

---

## 🔒 **ROTATION PROCEDURE**

For each service:

1. **Log into service dashboard**
2. **Revoke/delete old key immediately**
3. **Generate new key with descriptive name** (e.g., "SuperSeller AI Production - Oct 2025")
4. **Update in all environments**:
   - Local `.env` file
   - Vercel environment variables
   - CI/CD secrets (GitHub Actions)
   - Any MCP servers or automation tools
5. **Test thoroughly** before deploying
6. **Document rotation** in security log

---

## 🧪 **TESTING AFTER ROTATION**

After rotating each key:

```bash
# Test Aitable.ai
curl -H "Authorization: Bearer NEW_AITABLE_TOKEN" \
  https://aitable.ai/fusion/v1/spaces

# Test PayPal
curl -v https://api-m.paypal.com/v1/oauth2/token \
  -H "Accept: application/json" \
  -u "NEW_PAYPAL_CLIENT_ID:NEW_PAYPAL_CLIENT_SECRET" \
  -d "grant_type=client_credentials"

# Test OpenAI
curl -H "Authorization: Bearer NEW_OPENAI_KEY" \
  https://api.openai.com/v1/models

# Test Anthropic
curl -H "x-api-key: NEW_ANTHROPIC_KEY" \
  https://api.anthropic.com/v1/messages
```

---

## 📝 **POST-INCIDENT ACTIONS**

- [ ] **Update Vercel Environment Variables**
  ```bash
  vercel env add AIRTABLE_PAT production
  vercel env add PAYPAL_CLIENT_ID production
  vercel env add PAYPAL_CLIENT_SECRET production
  vercel env add PAYPAL_WEBHOOK_ID production
  vercel env add OPENAI_API_KEY production
  # ... etc
  ```

- [ ] **Update GitHub Secrets**
  - Go to: Settings > Secrets and variables > Actions
  - Update all exposed secrets

- [ ] **Enable Secret Scanning Alerts**
  - Go to: Settings > Code security and analysis
  - Enable "Secret scanning"
  - Enable "Push protection"

- [ ] **Implement Pre-commit Hooks**
  ```bash
  npm install --save-dev @commitlint/config-conventional
  npm install --save-dev husky lint-staged
  ```

- [ ] **Review Access Logs**
  - Check Airtable access logs
  - Review PayPal API logs
  - Check OpenAI usage logs
  - Look for suspicious activity

- [ ] **Document Incident**
  - What happened
  - When discovered
  - Keys rotated
  - Systems affected
  - Prevention measures

---

## 🛡️ **PREVENTION MEASURES**

### **Immediate (This Week)**
1. ✅ Rotate all exposed credentials
2. ✅ Move all secrets to environment variables
3. ✅ Update `.gitignore` to exclude secret files
4. ✅ Enable GitHub Secret Scanning
5. ✅ Implement security fixes from audit

### **Short-term (This Month)**
1. Set up secret scanning in pre-commit hooks
2. Implement automated secret rotation
3. Set up monitoring for suspicious API usage
4. Create incident response procedures
5. Train team on security best practices

### **Long-term (Ongoing)**
1. Regular security audits
2. Automated credential rotation
3. Zero-trust architecture
4. Principle of least privilege
5. Security awareness training

---

## 📞 **CONTACTS**

If you discover suspicious activity:

- **PayPal Support**: https://www.paypal.com/us/smarthelp/contact-us
- **Aitable.ai Support**: support@aitable.ai
- **OpenAI Support**: https://help.openai.com/
- **Anthropic Support**: support@anthropic.com

---

**Status**: 🔴 **ACTION REQUIRED**  
**Priority**: 🔥 **CRITICAL**  
**Deadline**: **IMMEDIATE**

**Start with Airtable, PayPal, and OpenAI - these are the most critical!**
