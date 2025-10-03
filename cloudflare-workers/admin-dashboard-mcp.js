// Admin Dashboard MCP Worker
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (url.pathname === '/mcp/admin-dashboard') {
      // Handle admin dashboard MCP requests
      const data = await this.handleAdminDashboardRequest(request);
      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response('Admin Dashboard MCP Worker', { status: 200 });
  },
  
  async handleAdminDashboardRequest(request) {
    // Current MCP Configuration (January 2025):
    // n8n-mcp: Docker-based with 63 tools
    // webflow: NPX webflow-mcp-server@0.6.0 (42 tools)
    // airtable-mcp: NPX airtable-mcp-server
    // stripe: Docker mcp/stripe
    // pd: Pipedream MCP server
    // supabase: NPX @supabase/mcp-server-supabase
    
    return {
      status: 'current_mcp_config',
      message: 'MCP servers configured with Docker and NPX packages',
      timestamp: new Date().toISOString(),
      servers: {
        'n8n-mcp': 'Docker (63 tools)',
        'webflow': 'NPX (42 tools)',
        'airtable-mcp': 'NPX',
        'stripe': 'Docker',
        'pd': 'Pipedream',
        'supabase': 'NPX'
      }
    };
  }
};
