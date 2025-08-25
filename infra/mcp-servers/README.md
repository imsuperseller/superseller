# 🤖 MCP Workflow Creation System

## 📋 **OVERVIEW**

This directory contains MCP (Model Context Protocol) servers that enable AI agents to create, manage, and deploy n8n workflows directly from natural language prompts. This system provides the same capabilities shown in the video transcript, allowing you to generate complete workflows with just a single prompt.

## 🚀 **FEATURES**

### **Core Capabilities**
- ✅ **Natural Language to Workflow**: Generate workflows from text descriptions
- ✅ **Direct n8n Integration**: Deploy workflows directly to your n8n instance
- ✅ **Template-Based Generation**: Pre-built templates for common use cases
- ✅ **AI-Powered Analysis**: Smart prompt analysis to select best templates
- ✅ **Real-time Deployment**: Instant workflow creation and activation

### **Available Tools**
- `generate_workflow_from_prompt` - Create workflows from natural language
- `create_email_automation` - Email processing workflows
- `create_social_monitor` - Social media monitoring
- `create_invoice_reminder` - Invoice reminder automation
- `list_workflows` - View all workflows
- `activate_workflow` - Activate workflows
- `health_check` - System health monitoring

## 🏗️ **ARCHITECTURE**

### **MCP Servers**
```
mcp-servers/
├── n8n-mcp-server/          # Core n8n management
│   ├── server.js            # Main server implementation
│   └── package.json         # Dependencies
├── ai-workflow-generator/   # AI-powered workflow creation
│   ├── server.js            # AI workflow generator
│   └── package.json         # Dependencies
└── README.md               # This guide
```

### **Integration Points**
- **n8n API**: Direct workflow creation and management
- **Airtable**: Data storage and CRM integration
- **AI Models**: Natural language processing
- **MCP Protocol**: Standardized tool communication

## 🛠️ **SETUP INSTRUCTIONS**

### **1. Install Dependencies**

```bash
# Navigate to each MCP server directory
cd infra/mcp-servers/n8n-mcp-server
npm install

cd ../ai-workflow-generator
npm install
```

### **2. Configure Environment Variables**

```bash
# Create .env file in each server directory
N8N_URL=http://173.254.201.134:5678
N8N_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMjEwMTliOC1kZTNlLTRlN2QtYmU2MS1mNDg4OTI1ZTI1ZGQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU2MDkyMDIxfQ.YKPTmHyLr1_kXX2JMY7hsPy4jvnCJDL71mOCltoUbQc
N8N_LICENSE_KEY=d21cb1e4-4b41-4b09-8e86-c0021884b446
```

### **3. Start MCP Servers**

```bash
# Start n8n MCP server
cd infra/mcp-servers/n8n-mcp-server
node server.js

# Start AI workflow generator
cd ../ai-workflow-generator
node server.js
```

## 🎯 **USAGE EXAMPLES**

### **Claude Desktop Integration**

1. **Configure Claude Desktop**
   - Open Claude Desktop settings
   - Go to Developer section
   - Edit config file
   - Add MCP server configurations

2. **Example Configuration**
```json
{
  "mcpServers": {
    "n8n-mcp": {
      "command": "node",
      "args": ["/path/to/infra/mcp-servers/n8n-mcp-server/server.js"],
      "env": {
        "N8N_URL": "http://173.254.201.134:5678",
        "N8N_API_KEY": "your-api-key"
      }
    },
    "ai-workflow-generator": {
      "command": "node",
      "args": ["/path/to/infra/mcp-servers/ai-workflow-generator/server.js"],
      "env": {
        "N8N_URL": "http://173.254.201.134:5678",
        "N8N_API_KEY": "your-api-key"
      }
    }
  }
}
```

### **Cursor Integration**

1. **Configure Cursor**
   - Open Cursor settings
   - Go to Tools and Integrations
   - Add custom MCP
   - Use the same configuration as above

2. **Example Usage in Cursor**
```javascript
// Generate workflow from prompt
await mcp.call('generate_workflow_from_prompt', {
  prompt: "Create a workflow that monitors my Gmail inbox for new emails, uses AI to analyze if it's a sale inquiry or customer question, then automatically drafts appropriate responses",
  workflowName: "AI Email Assistant"
});

// List available templates
await mcp.call('list_available_templates');

// Check system health
await mcp.call('health_check');
```

## 🔧 **WORKFLOW TEMPLATES**

### **Email Automation**
- **Trigger**: Webhook
- **Processing**: Email categorization
- **Output**: Lead creation in Airtable
- **Use Case**: Customer support automation

### **Social Media Monitor**
- **Trigger**: Schedule (hourly)
- **Processing**: Social media API calls
- **Output**: Lead creation from mentions
- **Use Case**: Brand monitoring

### **Invoice Reminder**
- **Trigger**: Schedule (daily)
- **Processing**: Airtable queries
- **Output**: Email reminders
- **Use Case**: Payment collection

## 📊 **EXAMPLE PROMPTS**

### **Email Processing**
```
"Create a workflow that monitors my Gmail inbox for new emails, uses AI to analyze if it's a sale inquiry or customer question, then automatically drafts appropriate responses. For sales leads, it should ask qualifying questions about budget, timeline, or needs. For support questions, it should provide helpful answers or escalate to my email if complex."
```

### **Social Media Monitoring**
```
"Create a workflow that monitors Twitter for mentions of my brand 'Rensto', creates leads in Airtable when someone mentions us, and sends me a Slack notification with the mention details."
```

### **Invoice Management**
```
"Create a workflow that checks Airtable daily for unpaid invoices, sends reminder emails to clients, and updates the invoice status when payment is received."
```

## 🚀 **ADVANCED FEATURES**

### **Custom Workflow Generation**
The AI workflow generator can create custom workflows based on any prompt:

```javascript
await mcp.call('generate_workflow_from_prompt', {
  prompt: "Create a workflow that integrates with my CRM, processes customer data, and generates weekly reports",
  workflowName: "CRM Analytics"
});
```

### **Workflow Optimization**
```javascript
await mcp.call('optimize_existing_workflow', {
  workflowId: 'workflow-id',
  optimizationType: 'performance'
});
```

### **System Monitoring**
```javascript
await mcp.call('get_system_status');
await mcp.call('health_check');
await mcp.call('list_workflows');
```

## 🔍 **TROUBLESHOOTING**

### **Common Issues**

1. **MCP Server Not Starting**
   ```bash
   # Check Node.js version
   node --version  # Should be >=18.0.0
   
   # Check dependencies
   npm install
   
   # Check environment variables
   echo $N8N_URL
   echo $N8N_API_KEY
   ```

2. **Workflow Creation Fails**
   ```bash
   # Test n8n connectivity
   curl -H "X-N8N-API-KEY: $N8N_API_KEY" \
        "http://173.254.201.134:5678/api/v1/workflows"
   
   # Check API key validity
   curl -H "X-N8N-API-KEY: $N8N_API_KEY" \
        "http://173.254.201.134:5678/healthz"
   ```

3. **Claude Desktop Not Recognizing Tools**
   - Restart Claude Desktop after configuration
   - Check MCP server is running
   - Verify configuration syntax

### **Debug Mode**
```bash
# Enable debug logging
DEBUG=mcp:* node server.js
```

## 📈 **PERFORMANCE OPTIMIZATION**

### **Best Practices**
1. **Use Specific Prompts**: Detailed prompts generate better workflows
2. **Template Selection**: Let AI choose the best template automatically
3. **Regular Health Checks**: Monitor system status regularly
4. **Workflow Validation**: Test workflows after creation

### **Scaling Considerations**
- Multiple MCP servers for different domains
- Load balancing for high-volume usage
- Caching for frequently used templates
- Rate limiting for API calls

## 🔮 **FUTURE ENHANCEMENTS**

### **Planned Features**
- ✅ **Workflow Optimization**: AI-powered workflow improvement
- ✅ **Documentation Generation**: Automatic workflow documentation
- ✅ **Advanced Templates**: More specialized workflow templates
- ✅ **Integration Testing**: Automated workflow testing
- ✅ **Performance Analytics**: Workflow execution metrics

### **AI Enhancements**
- **Multi-Modal Input**: Support for voice and image prompts
- **Context Awareness**: Better understanding of business context
- **Learning Capabilities**: Improve based on usage patterns
- **Custom Training**: Domain-specific workflow generation

## 📚 **RESOURCES**

### **Documentation**
- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [n8n API Documentation](https://docs.n8n.io/api/)
- [Claude Desktop MCP Guide](https://docs.anthropic.com/claude/docs/mcp)

### **Examples**
- [Workflow Templates](./templates/)
- [Configuration Examples](./examples/)
- [Integration Guides](./integrations/)

---

**This MCP workflow creation system provides the same powerful capabilities shown in the video, enabling AI agents to generate and deploy n8n workflows from natural language prompts.** 🚀
