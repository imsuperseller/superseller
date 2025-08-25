# SHELLY MIZRAHI SYSTEM SPECIFIC DOCUMENTATION

## 📋 **SYSTEM OVERVIEW**
Shelly's Smart Family Profile Generator - AI-powered insurance profile generation system.

## 🏗️ **ARCHITECTURE**

### **3-Component System**
1. **Make.com Scenario 1**: Lead processing and data preparation
2. **n8n Workflow**: AI analysis and profile generation
3. **Make.com Scenario 2**: Final processing and notifications

## ⚙️ **CURRENT CONFIGURATION**

### **n8n Workflow**
- **URL**: https://shellyins.app.n8n.cloud
- **Webhook**: /webhook/shelly-family-profile-upload
- **Nodes**: OpenAI analysis + profile generation + Surense upload
- **Status**: Active

### **Make.com Scenarios**
- **Scenario 1**: HTTP module to trigger n8n webhook
- **Scenario 2**: Email notifications to shellypensia@gmail.com
- **Status**: Active

### **API Credentials**
- **n8n API Key**: [Secured in credentials]
- **OpenAI API**: [Secured in credentials]
- **Surense API**: [Secured in credentials]

## 📁 **NEWEST FILES**

### **Workflow Files**
- **Newest**: ./scripts/create-shelly-workflow-via-mcp.js

### **Configuration Files**
- No config files found

### **Blueprint Files**
- **Newest**: ./data/customers/shelly-mizrahi/shelly-smart-family-profile-blueprint.json

## ⚠️ **CONFLICTS DETECTED**
- Different shellyins.app.n8n.cloud values found (./data/customers/shelly-mizrahi/shelly-smart-family-profile-blueprint.json vs ./scripts/create-shelly-workflow-via-mcp.js)
- Different shellypensia@gmail.com values found (./data/customers/shelly-mizrahi/shelly-smart-family-profile-blueprint.json vs ./scripts/create-shelly-n8n-workflow-correct.js)
- Different shellyins.app.n8n.cloud values found (./data/customers/shelly-mizrahi/shelly-smart-family-profile-blueprint.json vs ./scripts/fix-shelly-n8n-workflow-final.js)
- Different shellyins.app.n8n.cloud values found (./data/customers/shelly-mizrahi/shelly-smart-family-profile-blueprint.json vs ./scripts/fix-shelly-workflow-mcp.js)
- Different shellyins.app.n8n.cloud values found (./data/customers/shelly-mizrahi/shelly-smart-family-profile-blueprint.json vs ./scripts/fix-shelly-email-node.js)
- Different shellyins.app.n8n.cloud values found (./data/customers/shelly-mizrahi/shelly-smart-family-profile-blueprint.json vs ./data/customers/shelly-mizrahi/shelly-workflow-fix-guide.md)
- Different shellypensia@gmail.com values found (./data/customers/shelly-mizrahi/shelly-smart-family-profile-blueprint.json vs ./scripts/fix-shelly-n8n-workflow.js)
- Different shellyins.app.n8n.cloud values found (./data/customers/shelly-mizrahi/shelly-smart-family-profile-blueprint.json vs ./scripts/deploy-shelly-n8n-bmad.js)
- Different shellyins.app.n8n.cloud values found (./data/customers/shelly-mizrahi/shelly-smart-family-profile-blueprint.json vs ./data/customers/shelly-mizrahi/shelly-n8n-workflow-config.json)
- Different shellypensia@gmail.com values found (./data/customers/shelly-mizrahi/shelly-smart-family-profile-blueprint.json vs ./data/customers/shelly-mizrahi/shelly-make-scenario-blueprint.json)
- Different shellyins.app.n8n.cloud values found (./scripts/create-shelly-workflow-via-mcp.js vs ./scripts/create-shelly-n8n-workflow-correct.js)
- Different shellypensia@gmail.com values found (./scripts/create-shelly-workflow-via-mcp.js vs ./data/customers/shelly-mizrahi/shelly-make-final-scenario-blueprint.json)
- Different shellyins.app.n8n.cloud values found (./scripts/create-shelly-workflow-via-mcp.js vs ./scripts/fix-shelly-n8n-workflow-final.js)
- Different shellyins.app.n8n.cloud values found (./scripts/create-shelly-workflow-via-mcp.js vs ./scripts/fix-shelly-workflow-mcp.js)
- Different shellyins.app.n8n.cloud values found (./scripts/create-shelly-workflow-via-mcp.js vs ./scripts/fix-shelly-email-node.js)
- Different shellyins.app.n8n.cloud values found (./scripts/create-shelly-workflow-via-mcp.js vs ./data/customers/shelly-mizrahi/shelly-workflow-fix-guide.md)
- Different shellyins.app.n8n.cloud values found (./scripts/create-shelly-workflow-via-mcp.js vs ./scripts/fix-shelly-n8n-workflow.js)
- Different shellyins.app.n8n.cloud values found (./scripts/create-shelly-workflow-via-mcp.js vs ./scripts/test-shelly-n8n.js)
- Different shellyins.app.n8n.cloud values found (./scripts/create-shelly-workflow-via-mcp.js vs ./scripts/deploy-shelly-n8n-bmad.js)
- Different shellyins.app.n8n.cloud values found (./scripts/create-shelly-workflow-via-mcp.js vs ./data/customers/shelly-mizrahi/shelly-n8n-workflow-config.json)
- Different shellypensia@gmail.com values found (./scripts/create-shelly-n8n-workflow-correct.js vs ./data/customers/shelly-mizrahi/shelly-make-final-scenario-blueprint.json)
- Different shellyins.app.n8n.cloud values found (./scripts/create-shelly-n8n-workflow-correct.js vs ./scripts/fix-shelly-n8n-workflow-final.js)
- Different shellyins.app.n8n.cloud values found (./scripts/create-shelly-n8n-workflow-correct.js vs ./scripts/fix-shelly-workflow-mcp.js)
- Different shellyins.app.n8n.cloud values found (./scripts/create-shelly-n8n-workflow-correct.js vs ./scripts/fix-shelly-email-node.js)
- Different shellyins.app.n8n.cloud values found (./scripts/create-shelly-n8n-workflow-correct.js vs ./data/customers/shelly-mizrahi/shelly-workflow-fix-guide.md)
- Different shellypensia@gmail.com values found (./scripts/create-shelly-n8n-workflow-correct.js vs ./scripts/fix-shelly-n8n-workflow.js)
- Different shellyins.app.n8n.cloud values found (./scripts/create-shelly-n8n-workflow-correct.js vs ./scripts/deploy-shelly-n8n-bmad.js)
- Different shellyins.app.n8n.cloud values found (./scripts/create-shelly-n8n-workflow-correct.js vs ./data/customers/shelly-mizrahi/shelly-n8n-workflow-config.json)
- Different shellypensia@gmail.com values found (./data/customers/shelly-mizrahi/shelly-make-final-scenario-blueprint.json vs ./scripts/fix-shelly-n8n-workflow-final.js)
- Different shellypensia@gmail.com values found (./data/customers/shelly-mizrahi/shelly-make-final-scenario-blueprint.json vs ./scripts/fix-shelly-workflow-mcp.js)
- Different shellypensia@gmail.com values found (./data/customers/shelly-mizrahi/shelly-make-final-scenario-blueprint.json vs ./scripts/fix-shelly-email-node.js)
- Different shellypensia@gmail.com values found (./data/customers/shelly-mizrahi/shelly-make-final-scenario-blueprint.json vs ./data/customers/shelly-mizrahi/shelly-workflow-fix-guide.md)
- Different shellypensia@gmail.com values found (./data/customers/shelly-mizrahi/shelly-make-final-scenario-blueprint.json vs ./scripts/fix-shelly-n8n-workflow.js)
- Different shellypensia@gmail.com values found (./data/customers/shelly-mizrahi/shelly-make-final-scenario-blueprint.json vs ./scripts/deploy-shelly-n8n-bmad.js)
- Different shellypensia@gmail.com values found (./data/customers/shelly-mizrahi/shelly-make-final-scenario-blueprint.json vs ./data/customers/shelly-mizrahi/shelly-make-scenario-blueprint.json)
- Different shellypensia@gmail.com values found (./scripts/fix-shelly-n8n-workflow-final.js vs ./scripts/fix-shelly-email-node.js)
- Different shellyins.app.n8n.cloud values found (./scripts/fix-shelly-n8n-workflow-final.js vs ./data/customers/shelly-mizrahi/shelly-workflow-fix-guide.md)
- Different shellyins.app.n8n.cloud values found (./scripts/fix-shelly-n8n-workflow-final.js vs ./scripts/fix-shelly-n8n-workflow.js)
- Different shellyins.app.n8n.cloud values found (./scripts/fix-shelly-n8n-workflow-final.js vs ./scripts/test-shelly-n8n.js)
- Different shellyins.app.n8n.cloud values found (./scripts/fix-shelly-n8n-workflow-final.js vs ./scripts/deploy-shelly-n8n-bmad.js)
- Different shellypensia@gmail.com values found (./scripts/fix-shelly-n8n-workflow-final.js vs ./data/customers/shelly-mizrahi/shelly-make-scenario-blueprint.json)
- Different shellypensia@gmail.com values found (./scripts/fix-shelly-workflow-mcp.js vs ./scripts/fix-shelly-email-node.js)
- Different shellyins.app.n8n.cloud values found (./scripts/fix-shelly-workflow-mcp.js vs ./data/customers/shelly-mizrahi/shelly-workflow-fix-guide.md)
- Different shellyins.app.n8n.cloud values found (./scripts/fix-shelly-workflow-mcp.js vs ./scripts/fix-shelly-n8n-workflow.js)
- Different shellyins.app.n8n.cloud values found (./scripts/fix-shelly-workflow-mcp.js vs ./scripts/test-shelly-n8n.js)
- Different shellyins.app.n8n.cloud values found (./scripts/fix-shelly-workflow-mcp.js vs ./scripts/deploy-shelly-n8n-bmad.js)
- Different shellypensia@gmail.com values found (./scripts/fix-shelly-workflow-mcp.js vs ./data/customers/shelly-mizrahi/shelly-make-scenario-blueprint.json)
- Different shellyins.app.n8n.cloud values found (./scripts/fix-shelly-email-node.js vs ./data/customers/shelly-mizrahi/shelly-workflow-fix-guide.md)
- Different shellyins.app.n8n.cloud values found (./scripts/fix-shelly-email-node.js vs ./scripts/fix-shelly-n8n-workflow.js)
- Different shellyins.app.n8n.cloud values found (./scripts/fix-shelly-email-node.js vs ./scripts/test-shelly-n8n.js)
- Different shellyins.app.n8n.cloud values found (./scripts/fix-shelly-email-node.js vs ./scripts/deploy-shelly-n8n-bmad.js)
- Different shellyins.app.n8n.cloud values found (./data/customers/shelly-mizrahi/shelly-workflow-fix-guide.md vs ./scripts/fix-shelly-n8n-workflow.js)
- Different shellyins.app.n8n.cloud values found (./data/customers/shelly-mizrahi/shelly-workflow-fix-guide.md vs ./scripts/test-shelly-n8n.js)
- Different shellyins.app.n8n.cloud values found (./data/customers/shelly-mizrahi/shelly-workflow-fix-guide.md vs ./scripts/deploy-shelly-n8n-bmad.js)
- Different shellyins.app.n8n.cloud values found (./data/customers/shelly-mizrahi/shelly-workflow-fix-guide.md vs ./data/customers/shelly-mizrahi/shelly-n8n-workflow-config.json)
- Different shellypensia@gmail.com values found (./data/customers/shelly-mizrahi/shelly-workflow-fix-guide.md vs ./data/customers/shelly-mizrahi/shelly-make-scenario-blueprint.json)
- Different shellyins.app.n8n.cloud values found (./scripts/fix-shelly-n8n-workflow.js vs ./scripts/deploy-shelly-n8n-bmad.js)
- Different shellyins.app.n8n.cloud values found (./scripts/fix-shelly-n8n-workflow.js vs ./data/customers/shelly-mizrahi/shelly-n8n-workflow-config.json)
- Different shellypensia@gmail.com values found (./scripts/fix-shelly-n8n-workflow.js vs ./data/customers/shelly-mizrahi/shelly-make-scenario-blueprint.json)
- Different shellyins.app.n8n.cloud values found (./scripts/test-shelly-n8n.js vs ./scripts/deploy-shelly-n8n-bmad.js)
- Different shellyins.app.n8n.cloud values found (./scripts/test-shelly-n8n.js vs ./data/customers/shelly-mizrahi/shelly-n8n-workflow-config.json)
- Different shellyins.app.n8n.cloud values found (./scripts/deploy-shelly-n8n-bmad.js vs ./data/customers/shelly-mizrahi/shelly-n8n-workflow-config.json)
- Different shellypensia@gmail.com values found (./scripts/deploy-shelly-n8n-bmad.js vs ./data/customers/shelly-mizrahi/shelly-make-scenario-blueprint.json)

## 🔄 **DEPLOYMENT STATUS**
- **n8n Workflow**: ✅ Deployed and active
- **Make.com Scenario 1**: ✅ Updated with HTTP module
- **Make.com Scenario 2**: ✅ Updated with email notifications
- **Email Configuration**: ⚠️ Needs email connection setup

## 🚀 **NEXT STEPS**
1. Import updated Make.com blueprints
2. Configure email connection in Scenario 2
3. Test end-to-end workflow
4. Monitor performance and errors

---
*Last Updated: 2025-08-22T16:58:03.211Z*
*Consolidated from 14 files*
