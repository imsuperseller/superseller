# n8n Multi-Instance Manager - Usage Guide

## 🎉 Recent Update (Oct 8, 2025)

**Critical Bug Fixed**: The `updateMCPConfig()` function now properly updates `~/.cursor/mcp.json` instead of a local config file. Instance switching now works correctly after Cursor restart!

---

## 🎯 Quick Start

You now have a complete system for managing multiple n8n instances with automatic switching and safety isolation!

### Current Status ✅
- **Rensto VPS**: Configured and ready (`http://173.254.201.134:5678`)
- **Current Instance**: Rensto VPS (active)
- **Safety Mode**: Isolation enabled
- **Validation**: Disabled for VPS (can be enabled for customer instances)

## 🚀 Basic Commands

### List All Instances
```bash
cd /Users/shaifriedman/New\ Rensto/rensto/infra/n8n-multi-instance-manager/
node n8n-instance-manager.js list
```

### Switch to Rensto VPS
```bash
node n8n-instance-manager.js switch rensto
```

### Add Customer Instance
```bash
# Interactive setup
node customer-instance-setup.js setup

# Quick setup (when you have the details)
node customer-instance-setup.js quick "CustomerName" "https://customer.n8n.cloud" "api-key"
```

### Run Safety Check
```bash
node safety-guard.js check
```

## 🔄 Daily Workflow

### Morning: Work on Rensto VPS
```bash
# Switch to Rensto VPS (if not already there)
node n8n-instance-manager.js switch rensto

# Output: ✅ Updated ~/.cursor/mcp.json
# ⚠️  IMPORTANT: RESTART CURSOR for MCP changes to take effect!

# Restart Cursor (Cmd+Q and reopen)
# After restart: All n8n MCP tools point to your VPS
# Work on internal workflows, lead generation, etc.
```

### Afternoon: Work on Customer Instance
```bash
# Add customer instance (first time only)
node customer-instance-setup.js quick "Tax4Us" "https://tax4us.n8n.cloud" "their-api-key"

# Switch to customer
node n8n-instance-manager.js switch customer-tax4us

# Output: ✅ Updated ~/.cursor/mcp.json
# ⚠️  IMPORTANT: RESTART CURSOR for MCP changes to take effect!

# Restart Cursor (Cmd+Q and reopen)
# After restart: All n8n MCP tools point to customer instance
# Work on customer-specific workflows
```

### Evening: Switch Back
```bash
# Switch back to Rensto VPS
node n8n-instance-manager.js switch rensto

# Restart Cursor again (Cmd+Q and reopen)
```

## 🛡️ Safety Features

### Automatic Safety Checks
- **Isolation Mode**: Prevents cross-contamination between instances
- **Credential Separation**: Each instance has unique credentials
- **Backup Before Switch**: Automatic backup of current instance
- **Validation**: Optional connection validation (disabled for VPS)

### Safety Commands
```bash
# Check for safety violations
node safety-guard.js check

# Emergency isolation (lock all instances)
node safety-guard.js emergency

# Generate safety report
node safety-guard.js report
```

## 📊 Instance Management

### Current Configuration
```json
{
  "current": "n8n-rensto-vps",
  "instances": {
    "n8n-rensto-vps": {
      "name": "Rensto VPS",
      "type": "vps",
      "url": "http://173.254.201.134:5678",
      "safety": {
        "backupBeforeSwitch": true,
        "validateConnection": false,
        "isolationMode": true
      }
    }
  }
}
```

### Adding More Customers
```bash
# Example: Add Tax4Us customer
node customer-instance-setup.js quick "Tax4Us" "https://tax4us.n8n.cloud" "api-key-here"

# Example: Add Shelly customer  
node customer-instance-setup.js quick "Shelly" "https://shelly.n8n.cloud" "api-key-here"
```

## 🔧 Advanced Usage

### Environment Variables
When you switch instances, the system automatically updates:
```bash
N8N_API_URL=http://173.254.201.134:5678  # or customer URL
N8N_API_KEY=your-api-key
N8N_INSTANCE_TYPE=vps  # or cloud
N8N_INSTANCE_ID=n8n-rensto-vps
```

### MCP Integration
After switching instances and restarting Cursor, all n8n MCP tools automatically use the new instance:
- `mcp_n8n-mcp_list_workflows` - Lists workflows from current instance
- `mcp_n8n-mcp_n8n_get_workflow` - Gets workflow from current instance
- `mcp_n8n-mcp_n8n_create_workflow` - Creates workflow in current instance

**Important**: MCP servers are initialized when Cursor starts. After switching instances, you MUST restart Cursor for the MCP tools to connect to the new instance. This is a limitation of the MCP architecture, not our system.

### Backup System
Automatic backups are created in:
```
backups/
├── n8n-rensto-vps/
│   └── backup-1706342400000.json
├── n8n-customer-tax4us/
│   └── backup-1706349600000.json
└── n8n-customer-shelly/
    └── backup-1706353200000.json
```

## 🚨 Troubleshooting

### Common Issues

1. **"Instance not accessible"**
   ```bash
   # Check if n8n is running on VPS
   ssh root@173.254.201.134 "systemctl status n8n"
   ```

2. **"API validation failed"**
   ```bash
   # Check API key in n8n-instances.json
   # Or disable validation for VPS instances
   ```

3. **"Safety violations detected"**
   ```bash
   # Run safety check to see details
   node safety-guard.js check
   
   # Fix violations before switching
   ```

### Recovery Commands

```bash
# Reset to Rensto VPS
node n8n-instance-manager.js switch rensto

# Emergency unlock (after manual verification)
node safety-guard.js unlock n8n-rensto-vps

# Restore from backup
node n8n-instance-manager.js restore backup-file.json
```

## 📈 Best Practices

1. **Always run safety checks** before switching instances
2. **Keep credentials completely separate** between instances
3. **Use descriptive naming** for workflows and webhooks
4. **Regular backups** of important workflows
5. **Test switching** in a safe environment first

## 🔐 Security Notes

- **API Keys**: Stored securely, never shared between instances
- **Isolation Mode**: Prevents accidental cross-contamination
- **Backup Encryption**: Consider encrypting backup files
- **Access Control**: Limit who can switch instances
- **Audit Trail**: All actions are logged for security review

## 📞 Support

If you encounter issues:

1. **Check the logs**: `safety-log.json` contains all safety events
2. **Run diagnostics**: `node safety-guard.js check`
3. **Verify configuration**: Check `n8n-instances.json`
4. **Test connectivity**: Ensure instances are accessible

---

**🎉 You're all set!** You can now seamlessly switch between your Rensto VPS and customer n8n Cloud instances without any risk of cross-contamination.
