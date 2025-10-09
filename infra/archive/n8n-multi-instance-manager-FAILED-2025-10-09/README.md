# n8n Multi-Instance Manager

A secure, automated system for managing multiple n8n instances (Rensto VPS + Customer n8n Cloud) with safety isolation and cross-contamination prevention.

## 🎯 Purpose

This system allows you to:
- **Seamlessly switch** between Rensto VPS and customer n8n Cloud instances
- **Prevent cross-contamination** between different customer environments
- **Maintain security isolation** with automated safety checks
- **Backup workflows** before switching instances
- **Validate connections** to ensure instances are accessible

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    n8n Multi-Instance Manager              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Rensto VPS    │  │  Customer A     │  │  Customer B  │ │
│  │ 173.254.201.134 │  │  n8n.cloud     │  │  n8n.cloud   │ │
│  │                 │  │                 │  │              │ │
│  │ • 68 workflows  │  │ • Customer     │  │ • Customer   │ │
│  │ • Internal ops  │  │   workflows    │  │   workflows  │ │
│  │ • Lead gen     │  │ • Isolated     │  │ • Isolated   │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ Safety Guard    │  │ Instance Mgr    │  │ Customer     │ │
│  │                 │  │                 │  │ Setup        │ │
│  │ • Cross-contam  │  │ • Auto-switch   │  │ • Quick add  │ │
│  │   prevention     │  │ • Backup        │  │ • Validation │ │
│  │ • Isolation     │  │ • Validation    │  │ • Safety     │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🎉 Recent Updates

**Oct 8, 2025, 6:45 PM**: Fixed critical bug in `updateMCPConfig()` function
- **Bug**: Was updating local config instead of `~/.cursor/mcp.json`
- **Fix**: Now properly updates Cursor's MCP configuration file
- **Result**: Instance switching now works correctly (after Cursor restart)

---

## 🚀 Quick Start

### 1. Initialize Rensto VPS Instance

```bash
cd /Users/shaifriedman/New\ Rensto/rensto/infra/n8n-multi-instance-manager/

# Add Rensto VPS instance
node n8n-instance-manager.js add-rensto
```

### 2. Add Customer Instance

```bash
# Interactive setup
node customer-instance-setup.js setup

# Quick setup
node customer-instance-setup.js quick "Tax4Us" "https://tax4us.n8n.cloud" "api-key-here"
```

### 3. Switch Between Instances

```bash
# List all instances
node n8n-instance-manager.js list

# Switch to Rensto VPS
node n8n-instance-manager.js switch rensto

# Switch to customer
node n8n-instance-manager.js switch customer-tax4us
```

## 🛡️ Safety Features

### Automatic Safety Checks

Before switching instances, the system automatically:

1. **Validates Connection** - Ensures target instance is accessible
2. **Checks Active Workflows** - Warns about running workflows
3. **Backs Up Current Instance** - Creates backup before switching
4. **Isolates Credentials** - Prevents credential sharing
5. **Validates Workflow Naming** - Ensures no cross-contamination

### Safety Guard

```bash
# Run safety check
node safety-guard.js check

# Emergency isolation (lock all instances)
node safety-guard.js emergency

# Generate safety report
node safety-guard.js report
```

## 📋 Instance Management

### Current Instances

| Instance | Type | URL | Status | Workflows |
|----------|------|-----|--------|-----------|
| Rensto VPS | VPS | http://173.254.201.134:5678 | 🟢 Active | 68 |
| Customer: Tax4Us | Cloud | https://tax4us.n8n.cloud | ⚪ Inactive | 12 |
| Customer: Shelly | Cloud | https://shelly.n8n.cloud | ⚪ Inactive | 8 |

### Switching Workflow

```bash
# 1. Check current instance
node n8n-instance-manager.js list

# 2. Run safety check
node safety-guard.js check

# 3. Switch to customer instance
node n8n-instance-manager.js switch customer-tax4us

# Output:
# ✅ Updated ~/.cursor/mcp.json
# ⚠️  IMPORTANT: RESTART CURSOR for MCP changes to take effect!

# 4. Restart Cursor (Cmd+Q and reopen)
# After restart, all n8n MCP tools will point to customer instance

# 5. Work on customer workflows
# (MCP tools now connected to customer instance)

# 6. Switch back to Rensto
node n8n-instance-manager.js switch rensto
# (Restart Cursor again)
```

## 🔧 Configuration

### Instance Configuration

Each instance is configured with:

```json
{
  "id": "n8n-customer-tax4us",
  "name": "Customer: Tax4Us",
  "type": "cloud",
  "url": "https://tax4us.n8n.cloud",
  "apiKey": "api-key-here",
  "credentials": {
    "airtable": "customer-airtable-token",
    "notion": "customer-notion-token",
    "stripe": "customer-stripe-key"
  },
  "safety": {
    "backupBeforeSwitch": true,
    "validateConnection": true,
    "isolationMode": true
  }
}
```

### Environment Variables

When switching instances, the system updates:

```bash
N8N_API_URL=https://customer.n8n.cloud
N8N_API_KEY=customer-api-key
N8N_INSTANCE_TYPE=cloud
N8N_INSTANCE_ID=n8n-customer-tax4us
```

## 🚨 Safety Protocols

### Cross-Contamination Prevention

1. **Credential Isolation** - Each instance has unique credentials
2. **Workflow Naming** - Strict naming conventions prevent mixing
3. **Webhook Isolation** - Unique webhook URLs per instance
4. **Backup Before Switch** - Automatic backup of current instance
5. **Validation Checks** - Verify instance accessibility before switching

### Emergency Procedures

```bash
# If cross-contamination detected
node safety-guard.js emergency

# This will:
# - Lock all instances
# - Enable isolation mode
# - Require manual intervention to unlock
```

## 📊 Monitoring & Logging

### Safety Log

All safety checks and violations are logged:

```json
{
  "violations": [
    {
      "type": "shared_credentials",
      "message": "Shared credentials detected",
      "severity": "high",
      "timestamp": "2025-01-27T10:00:00.000Z"
    }
  ],
  "warnings": [
    {
      "type": "isolation_disabled",
      "message": "Isolation mode disabled",
      "severity": "medium"
    }
  ],
  "lastCheck": "2025-01-27T10:00:00.000Z"
}
```

### Backup System

Automatic backups are created before switching:

```
backups/
├── n8n-rensto-vps/
│   ├── backup-1706342400000.json
│   └── backup-1706346000000.json
├── n8n-customer-tax4us/
│   └── backup-1706349600000.json
└── n8n-customer-shelly/
    └── backup-1706353200000.json
```

## 🔄 Workflow Examples

### Daily Workflow

```bash
# Morning: Switch to Rensto VPS
node n8n-instance-manager.js switch rensto
# Work on internal workflows, lead generation, etc.

# Afternoon: Switch to customer
node n8n-instance-manager.js switch customer-tax4us
# Work on customer-specific workflows

# Evening: Switch back to Rensto
node n8n-instance-manager.js switch rensto
# Review and optimize internal workflows
```

### Customer Onboarding

```bash
# 1. Setup new customer instance
node customer-instance-setup.js setup

# 2. Configure customer-specific workflows
node n8n-instance-manager.js switch customer-new-customer

# 3. Test and validate
node safety-guard.js check

# 4. Hand over to customer
# (Customer gets their own n8n Cloud access)
```

## 🛠️ Troubleshooting

### Common Issues

1. **Connection Refused**
   ```bash
   # Check instance URL and API key
   node n8n-instance-manager.js list
   ```

2. **Safety Violations**
   ```bash
   # Run safety check
   node safety-guard.js check
   
   # Fix violations before switching
   ```

3. **Backup Failures**
   ```bash
   # Check disk space and permissions
   ls -la backups/
   ```

### Recovery Procedures

```bash
# Restore from backup
node n8n-instance-manager.js restore <backup-file>

# Emergency unlock (after manual verification)
node safety-guard.js unlock <instance-id>
```

## 📈 Best Practices

1. **Always run safety checks** before switching instances
2. **Keep credentials completely separate** between instances
3. **Use descriptive naming** for workflows and webhooks
4. **Regular backups** of important workflows
5. **Monitor safety logs** for potential issues
6. **Test switching** in a safe environment first

## 🔐 Security Considerations

- **API Keys**: Stored securely, never shared between instances
- **Isolation Mode**: Prevents accidental cross-contamination
- **Backup Encryption**: Consider encrypting backup files
- **Access Control**: Limit who can switch instances
- **Audit Trail**: All actions are logged for security review

---

**⚠️ Important**: This system is designed for your specific use case. Always test in a safe environment before using with production customer data.
