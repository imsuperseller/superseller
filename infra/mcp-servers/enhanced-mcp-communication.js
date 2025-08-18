const Redis = require('ioredis');
const { EventEmitter } = require('events');

// Enhanced MCP Server Communication Layer
class EnhancedMCPCommunication extends EventEmitter {
  constructor() {
    super();
    this.redis = new Redis({
      host: process.env.REDIS_HOST || '173.254.201.134',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    });

    this.subscriber = new Redis({
      host: process.env.REDIS_HOST || '173.254.201.134',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    });

    this.publisher = new Redis({
      host: process.env.REDIS_HOST || '173.254.201.134',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    });

    this.setupEventHandlers();
    this.initializeHealthCheck();
  }

  setupEventHandlers() {
    // Subscribe to MCP server events
    this.subscriber.subscribe('mcp-server-events', err => {
      if (err) {
        console.error('Failed to subscribe to MCP server events:', err);
      } else {
        console.log('✅ Subscribed to MCP server events');
      }
    });

    this.subscriber.on('message', (channel, message) => {
      try {
        const data = JSON.parse(message);
        this.handleMCPEvent(data);
      } catch (error) {
        console.error('Error parsing MCP event:', error);
      }
    });

    // Handle Redis connection events
    this.redis.on('connect', () => {
      console.log('🔌 Redis connected for MCP communication');
    });

    this.redis.on('error', error => {
      console.error('Redis error:', error);
    });
  }

  handleMCPEvent(data) {
    const { event, server, data: eventData, timestamp } = data;

    console.log(`📡 MCP Event: ${event} from ${server}`);

    // Emit event for local handlers
    this.emit(event, { server, data: eventData, timestamp });

    // Handle specific events
    switch (event) {
      case 'workflow-created':
        this.handleWorkflowCreated(eventData);
        break;
      case 'agent-status-update':
        this.handleAgentStatusUpdate(eventData);
        break;
      case 'analytics-update':
        this.handleAnalyticsUpdate(eventData);
        break;
      case 'billing-update':
        this.handleBillingUpdate(eventData);
        break;
      case 'health-check':
        this.handleHealthCheck(eventData);
        break;
      default:
        console.log(`Unhandled MCP event: ${event}`);
    }
  }

  // Publish MCP server event
  async publishEvent(event, server, data) {
    try {
      const message = JSON.stringify({
        event,
        server,
        data,
        timestamp: new Date().toISOString(),
      });

      await this.publisher.publish('mcp-server-events', message);
      console.log(`📤 Published MCP event: ${event} from ${server}`);
    } catch (error) {
      console.error('Error publishing MCP event:', error);
    }
  }

  // Workflow management events
  async publishWorkflowCreated(workflowData) {
    await this.publishEvent('workflow-created', 'n8n-mcp-server', workflowData);
  }

  async publishWorkflowUpdated(workflowData) {
    await this.publishEvent('workflow-updated', 'n8n-mcp-server', workflowData);
  }

  async publishWorkflowDeleted(workflowId) {
    await this.publishEvent('workflow-deleted', 'n8n-mcp-server', {
      workflowId,
    });
  }

  // Agent management events
  async publishAgentStatusUpdate(agentData) {
    await this.publishEvent(
      'agent-status-update',
      'ai-workflow-generator',
      agentData
    );
  }

  async publishAgentCreated(agentData) {
    await this.publishEvent(
      'agent-created',
      'ai-workflow-generator',
      agentData
    );
  }

  // Analytics events
  async publishAnalyticsUpdate(analyticsData) {
    await this.publishEvent(
      'analytics-update',
      'analytics-reporting-mcp',
      analyticsData
    );
  }

  // Billing events
  async publishBillingUpdate(billingData) {
    await this.publishEvent(
      'billing-update',
      'financial-billing-mcp',
      billingData
    );
  }

  // Health check events
  async publishHealthCheck(serverName, status) {
    await this.publishEvent('health-check', serverName, {
      status,
      timestamp: new Date().toISOString(),
    });
  }

  // Event handlers
  handleWorkflowCreated(data) {
    console.log('🔄 Workflow created:', data.workflowId);
    // Trigger any necessary follow-up actions
    this.emit('workflow-created-handled', data);
  }

  handleAgentStatusUpdate(data) {
    console.log('🤖 Agent status updated:', data.agentId, data.status);
    // Update agent status in database
    this.emit('agent-status-updated', data);
  }

  handleAnalyticsUpdate(data) {
    console.log('📊 Analytics updated for org:', data.orgId);
    // Update analytics cache
    this.emit('analytics-updated', data);
  }

  handleBillingUpdate(data) {
    console.log('💰 Billing updated for customer:', data.customerId);
    // Update billing status
    this.emit('billing-updated', data);
  }

  handleHealthCheck(data) {
    console.log('🏥 Health check from:', data.server, data.status);
    // Update server health status
    this.emit('health-check-received', data);
  }

  // Initialize periodic health checks
  initializeHealthCheck() {
    setInterval(() => {
      this.publishHealthCheck('enhanced-mcp-communication', 'healthy');
    }, 30000); // Every 30 seconds
  }

  // Get server status
  async getServerStatus() {
    try {
      const status = await this.redis.get('mcp-server-status');
      return status ? JSON.parse(status) : { status: 'unknown' };
    } catch (error) {
      console.error('Error getting server status:', error);
      return { status: 'error' };
    }
  }

  // Set server status
  async setServerStatus(status) {
    try {
      await this.redis.setex('mcp-server-status', 60, JSON.stringify(status));
    } catch (error) {
      console.error('Error setting server status:', error);
    }
  }

  // Get active servers
  async getActiveServers() {
    try {
      const servers = await this.redis.smembers('active-mcp-servers');
      return servers;
    } catch (error) {
      console.error('Error getting active servers:', error);
      return [];
    }
  }

  // Register server as active
  async registerServer(serverName) {
    try {
      await this.redis.sadd('active-mcp-servers', serverName);
      await this.redis.expire('active-mcp-servers', 300); // 5 minutes TTL
    } catch (error) {
      console.error('Error registering server:', error);
    }
  }

  // Unregister server
  async unregisterServer(serverName) {
    try {
      await this.redis.srem('active-mcp-servers', serverName);
    } catch (error) {
      console.error('Error unregistering server:', error);
    }
  }

  // Cleanup on shutdown
  async cleanup() {
    try {
      await this.subscriber.unsubscribe('mcp-server-events');
      await this.redis.quit();
      await this.subscriber.quit();
      await this.publisher.quit();
      console.log('🧹 MCP communication cleanup completed');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}

// Export singleton instance
const mcpCommunication = new EnhancedMCPCommunication();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down MCP communication...');
  await mcpCommunication.cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down MCP communication...');
  await mcpCommunication.cleanup();
  process.exit(0);
});

module.exports = mcpCommunication;
