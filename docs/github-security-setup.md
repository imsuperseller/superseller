# GitHub Security Setup Guide

## 🔒 **Branch Protection Rules**

### **Main Branch Protection**
```yaml
# .github/branch-protection.yml
branches:
  - name: main
    protection:
      required_status_checks:
        strict: true
        contexts:
          - "Duplicate Scanner"
          - "Security Scan"
          - "Code Quality"
      enforce_admins: true
      required_pull_request_reviews:
        required_approving_review_count: 1
        dismiss_stale_reviews: true
        require_code_owner_reviews: true
      restrictions:
        users: []
        teams: []
      allow_force_pushes: false
      allow_deletions: false
```

### **Required Status Checks**
- ✅ **Duplicate Scanner**: Prevents duplicate entities/assets
- ✅ **Security Scan**: Vulnerability detection
- ✅ **Code Quality**: Linting and formatting
- ✅ **Build Test**: Ensures code compiles

## 🔐 **GitHub Secrets Configuration**

### **Required Secrets**
```bash
# Rensto Business Secrets
RENSTO_API_KEY=your_rensto_api_key
RENSTO_WEBHOOK_SECRET=your_webhook_secret

# Database Secrets
DATABASE_URL=postgresql://user:pass@host:port/db
MONGODB_URI=mongodb://user:pass@host:port/db

# External Service Secrets
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
QUICKBOOKS_CLIENT_ID=your_quickbooks_client_id
QUICKBOOKS_CLIENT_SECRET=your_quickbooks_client_secret

# AI Service Secrets
OPENAI_API_KEY=sk-...
OPENROUTER_API_KEY=sk-...
HUGGINGFACE_API_KEY=hf_...

# n8n Integration
N8N_BASE_URL=http://173.254.201.134:5678
N8N_WEBHOOK_SECRET=your_n8n_webhook_secret

# VPS Access
VPS_HOST=173.254.201.134
VPS_USER=root
VPS_PASSWORD=05ngBiq2pTA8XSF76x

# MCP Server Secrets
MCP_SERVER_URLS=your_mcp_server_urls
MCP_API_KEYS=your_mcp_api_keys
```

### **Secret Management Best Practices**
1. **Rotate regularly**: Update secrets every 90 days
2. **Least privilege**: Use minimal required permissions
3. **Environment separation**: Different secrets for dev/staging/prod
4. **Audit access**: Monitor who has access to secrets
5. **Backup securely**: Store secrets in secure backup location

## 🛡️ **Security Workflow**

### **Pre-commit Hooks**
```bash
#!/bin/bash
# .git/hooks/pre-commit

# Run duplicate scanner
node scripts/ci/scan-dupes.mjs

# Check for secrets in code
if grep -r "sk_live\|sk_test\|password\|secret" . --exclude-dir=node_modules; then
  echo "❌ Potential secrets found in code"
  exit 1
fi

# Check file permissions
find . -type f -executable -name "*.sh" | while read file; do
  if [[ ! "$file" =~ ^\./scripts/ ]]; then
    echo "❌ Executable file outside scripts directory: $file"
    exit 1
  fi
done
```

### **Post-merge Checks**
- ✅ **Automated testing**: Run full test suite
- ✅ **Security scan**: Check for vulnerabilities
- ✅ **Performance test**: Ensure no regressions
- ✅ **Deployment test**: Verify deployment works

## 📋 **Implementation Checklist**

- [ ] Set up branch protection rules
- [ ] Configure required status checks
- [ ] Add GitHub secrets
- [ ] Set up pre-commit hooks
- [ ] Configure security scanning
- [ ] Test protection rules
- [ ] Document access procedures
- [ ] Train team on security practices
