
// Add to customer portal tabs
const mcpTab = {
  id: 'mcp-tools',
  name: 'MCP Tools',
  icon: '🔧',
  component: <MCPToolStatus customerId={customerSlug} tools={['n8n-mcp', 'ai-workflow-generator']} />
};

const agentOutputsTab = {
  id: 'agent-outputs',
  name: 'Agent Outputs',
  icon: '📊',
  component: <AgentOutputDisplay customerId={customerSlug} agentType="wordpress" />
};

// Add to customer config tabs array
tabs: [...customerConfig.tabs, mcpTab, agentOutputsTab]
