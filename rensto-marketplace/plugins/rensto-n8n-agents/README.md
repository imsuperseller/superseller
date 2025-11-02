# Rensto n8n Agents Plugin v2.0.0

## Overview
Specialized n8n workflow creation and management agents for Rensto with **Docker-based multi-instance support**. This plugin provides direct access to all Rensto n8n instances through specialized Docker-based MCP servers.

## 🚀 Features

### Docker-Based Multi-Instance Support
- **n8n-rensto-vps**: Docker container `3f30fc680c41` → Internal workflows (173.254.201.134:5678)
- **n8n-tax4us-cloud**: Docker container `050063cb179f` → Customer workflows (tax4usllc.app.n8n.cloud)
- **n8n-shelly-cloud**: Docker container `8d519d75af77` → Customer workflows (shellyins.app.n8n.cloud)

### Direct Instance Access
- **Specialized MCP Servers**: Each instance has its own Docker-based MCP server
- **No Conflicts**: Clean separation between instances prevents configuration issues
- **Direct API Access**: Each MCP server connects directly to its specific n8n instance

### Specialized Agents
1. **n8n Workflow Architect**: Design workflow architecture
2. **n8n Implementation**: Build and deploy workflows
3. **n8n Debug**: Diagnose and fix issues

## 🛠️ Installation

### Prerequisites
- Claude Code with plugin support
- Node.js 18+ for MCP server
- Access to Rensto n8n instances

### Setup
1. Install the plugin from the Rensto marketplace
2. Configure environment variables for n8n instances
3. Deploy the unified MCP server

## 🔧 Configuration

### Environment Variables
```bash
# Rensto VPS
N8N_RENSTO_VPS_URL=http://173.254.201.134:5678
N8N_RENSTO_VPS_KEY=your_rensto_vps_api_key

# Tax4Us Cloud
N8N_TAX4US_CLOUD_URL=https://tax4usllc.app.n8n.cloud
N8N_TAX4US_CLOUD_KEY=your_tax4us_cloud_api_key

# Shelly Cloud
N8N_SHELLY_CLOUD_URL=https://shellyins.app.n8n.cloud
N8N_SHELLY_CLOUD_KEY=your_shelly_cloud_api_key
```

## 📋 Available Commands

### `/rensto-n8n-agents:plan`
Initiate planning phase for new n8n workflow
- **Usage**: `/rensto-n8n-agents:plan [workflow_description]`
- **Functionality**: Engages Workflow Architect Agent

### `/rensto-n8n-agents:delegate`
Delegate implementation of planned workflow
- **Usage**: `/rensto-n8n-agents:delegate [workflow_blueprint_id]`
- **Functionality**: Engages Implementation Agent

### `/rensto-n8n-agents:assess`
Assess quality and correctness of n8n workflow
- **Usage**: `/rensto-n8n-agents:assess [workflow_id]`
- **Functionality**: Engages Debug Agent

## 🎯 Smart Routing Examples

### Automatic Instance Detection
```bash
# Internal workflow - routes to Rensto VPS
/rensto-n8n-agents:assess INT-MONITOR-002

# Customer workflow - routes to Tax4Us Cloud
/rensto-n8n-agents:assess eGIGGRqTEzJAqibk

# Customer workflow - routes to Shelly Cloud
/rensto-n8n-agents:assess SHELLY-WORKFLOW-001
```

### Manual Instance Selection
```bash
# Force specific instance
/rensto-n8n-agents:delegate rensto-vps "build lead generation workflow"
/rensto-n8n-agents:delegate tax4us "fix memory issues"
/rensto-n8n-agents:delegate shelly "optimize performance"
```

## 🔍 Workflow ID Patterns

### Rensto VPS (Internal)
- `INT-*`: Internal workflows
- `SUB-*`: Subscription workflows
- `MKT-*`: Marketing workflows
- `DEV-*`: Development workflows

### Tax4Us Cloud (Customer)
- `eGIGGRqTEzJAqibk`: Tax4Us workflow IDs
- Context: `tax4us` in workflow name or description

### Shelly Cloud (Customer)
- `SHELLY-*`: Shelly workflow IDs
- Context: `shelly` in workflow name or description

## 🚀 Usage Examples

### Fix Tax4Us Workflow
```bash
# Automatically routes to Tax4Us Cloud
/rensto-n8n-agents:assess eGIGGRqTEzJAqibk
```

### Build Internal Workflow
```bash
# Automatically routes to Rensto VPS
/rensto-n8n-agents:plan "lead generation system"
```

### Debug Customer Workflow
```bash
# Automatically routes to appropriate customer instance
/rensto-n8n-agents:assess customer-workflow-id
```

## 🔧 MCP Server Tools

### n8n_smart_route
Automatically determine correct n8n instance
- **Input**: workflowId, context
- **Output**: Target instance recommendation

### n8n_get_workflow
Get workflow details from any instance
- **Input**: id, instance (optional)
- **Output**: Workflow configuration

### n8n_get_execution
Get execution details from any instance
- **Input**: id, instance (optional), mode
- **Output**: Execution data

### n8n_update_workflow
Update workflow on any instance
- **Input**: id, instance (optional), updates
- **Output**: Update confirmation

## 🎯 Benefits

1. **✅ Seamless Switching**: No manual configuration needed
2. **✅ Context Awareness**: Automatically detects which instance to use
3. **✅ Unified Interface**: Same commands work across all instances
4. **✅ Credential Management**: Each instance has its own credentials
5. **✅ Error Handling**: Graceful fallback if one instance is unavailable

## 🔧 Troubleshooting

### Common Issues
1. **Instance Not Found**: Check workflow ID pattern
2. **Authentication Failed**: Verify API keys
3. **Connection Timeout**: Check instance availability

### Debug Commands
```bash
# Check instance routing
/rensto-n8n-agents:assess [workflow_id] --debug

# Force specific instance
/rensto-n8n-agents:assess [workflow_id] --instance [instance_name]
```

## 📚 Documentation

- **Architecture**: Multi-instance n8n management
- **Routing**: Smart instance detection logic
- **Security**: Credential management best practices
- **Performance**: Optimization across instances

## 🤝 Support

For issues or questions:
- **Email**: admin@rensto.com
- **Documentation**: See agent-specific guides
- **Debug**: Use `/rensto-n8n-agents:assess` for troubleshooting

---

**Version**: 2.0.0  
**Last Updated**: October 16, 2025  
**Author**: Rensto Team
