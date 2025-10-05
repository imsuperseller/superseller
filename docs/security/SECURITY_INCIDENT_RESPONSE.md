# 🚨 SECURITY INCIDENT RESPONSE - API KEY EXPOSURE

**Date**: October 3, 2025  
**Incident**: Multiple API keys exposed in git commit history  
**Status**: 🔴 **CRITICAL - IMMEDIATE ACTION REQUIRED**

---

## 📋 **EXPOSED CREDENTIALS CHECKLIST**

### **🔴 HIGH PRIORITY - Rotate Immediately**

- [ ] **Airtable Personal Access Token**: `pat0dxG1HQcAUz2Kr.*`
  - Go to: https://airtable.com/create/tokens
  - Revoke old token
  - Generate new token
  - Update in environment variables

- [ ] **Stripe API Keys**
  - Go to: https://dashboard.stripe.com/apikeys
  - Roll keys (Developers > API Keys > Roll Secret Key)
  - Update STRIPE_SECRET_KEY in environment
  - Regenerate webhook secret

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
3. **Generate new key with descriptive name** (e.g., "Rensto Production - Oct 2025")
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
# Test Airtable
curl -H "Authorization: Bearer NEW_AIRTABLE_PAT" \
  https://api.airtable.com/v0/meta/bases

# Test Stripe
curl -u "NEW_STRIPE_SECRET_KEY:" \
  https://api.stripe.com/v1/customers

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
  vercel env add STRIPE_SECRET_KEY production
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
  - Review Stripe API logs
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

- **Stripe Support**: https://support.stripe.com/
- **Airtable Support**: support@airtable.com
- **OpenAI Support**: https://help.openai.com/
- **Anthropic Support**: support@anthropic.com

---

**Status**: 🔴 **ACTION REQUIRED**  
**Priority**: 🔥 **CRITICAL**  
**Deadline**: **IMMEDIATE**

**Start with Airtable, Stripe, and OpenAI - these are the most critical!**
