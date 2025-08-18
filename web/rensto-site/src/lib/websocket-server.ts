import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { AnalyticsCache, PubSubManager } from './redis';

// Optimized WebSocket Server with Redis Backend
export class OptimizedWebSocketServer {
  private io: SocketIOServer;
  private analyticsCache: AnalyticsCache;
  private pubsub: PubSubManager;
  private connectedClients: Map<string, any> = new Map();

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
    });

    this.analyticsCache = new AnalyticsCache();
    this.pubsub = new PubSubManager();

    this.setupEventHandlers();
    this.setupRedisSubscriptions();
  }

  private setupEventHandlers() {
    this.io.on('connection', socket => {
      console.log(`🔌 Client connected: ${socket.id}`);
      this.connectedClients.set(socket.id, socket);

      // Handle client authentication
      socket.on('authenticate', async data => {
        const { userId, organizationId } = data;
        socket.data.userId = userId;
        socket.data.organizationId = organizationId;

        // Join organization room
        socket.join(`org:${organizationId}`);
        socket.join(`user:${userId}`);

        console.log(`✅ Client authenticated: ${userId} (${organizationId})`);

        // Send initial data
        await this.sendInitialData(socket, organizationId);
      });

      // Handle analytics subscription
      socket.on('subscribe-analytics', async data => {
        const { organizationId } = data;
        socket.join(`analytics:${organizationId}`);
        console.log(`📊 Client subscribed to analytics: ${organizationId}`);
      });

      // Handle agent status subscription
      socket.on('subscribe-agent-status', async data => {
        const { agentId } = data;
        socket.join(`agent:${agentId}`);
        console.log(`🤖 Client subscribed to agent status: ${agentId}`);
      });

      // Handle real-time updates subscription
      socket.on('subscribe-realtime', async data => {
        const { organizationId } = data;
        socket.join(`realtime:${organizationId}`);
        console.log(
          `⚡ Client subscribed to real-time updates: ${organizationId}`
        );
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
        this.connectedClients.delete(socket.id);
      });

      // Handle errors
      socket.on('error', error => {
        console.error(`❌ Socket error for ${socket.id}:`, error);
      });
    });
  }

  private setupRedisSubscriptions() {
    // Subscribe to analytics updates
    this.pubsub.subscribe('analytics-update', data => {
      this.broadcastToOrganization(data.orgId, 'analytics-update', data);
    });

    // Subscribe to agent status updates
    this.pubsub.subscribe('agent-status-update', data => {
      this.broadcastToAgent(data.agentId, 'agent-status-update', data);
    });

    // Subscribe to MCP server events
    this.pubsub.subscribe('mcp-server-events', data => {
      this.broadcastToOrganization(data.orgId, 'mcp-event', data);
    });

    // Subscribe to billing updates
    this.pubsub.subscribe('billing-update', data => {
      this.broadcastToUser(data.userId, 'billing-update', data);
    });

    // Subscribe to workflow updates
    this.pubsub.subscribe('workflow-update', data => {
      this.broadcastToOrganization(data.orgId, 'workflow-update', data);
    });
  }

  private async sendInitialData(socket: unknown, organizationId: string) {
    try {
      // Send cached analytics
      const analytics = await this.analyticsCache.getCachedAnalytics(
        organizationId
      );
      if (analytics) {
        socket.emit('initial-analytics', analytics);
      }

      // Send active agent statuses
      const activeAgents = await this.getActiveAgents(organizationId);
      socket.emit('initial-agent-statuses', activeAgents);

      // Send system status
      const systemStatus = await this.getSystemStatus();
      socket.emit('initial-system-status', systemStatus);
    } catch (error) {
      console.error('Error sending initial data:', error);
    }
  }

  // Broadcast to organization
  private broadcastToOrganization(
    organizationId: string,
    event: string,
    data: unknown
  ) {
    this.io.to(`org:${organizationId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  // Broadcast to specific agent
  private broadcastToAgent(agentId: string, event: string, data: unknown) {
    this.io.to(`agent:${agentId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  // Broadcast to specific user
  private broadcastToUser(userId: string, event: string, data: unknown) {
    this.io.to(`user:${userId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  // Broadcast to all connected clients
  private broadcastToAll(event: string, data: unknown) {
    this.io.emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  // Send message to specific client
  public sendToClient(clientId: string, event: string, data: unknown) {
    const socket = this.connectedClients.get(clientId);
    if (socket) {
      socket.emit(event, {
        ...data,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Send message to user
  public sendToUser(userId: string, event: string, data: unknown) {
    this.io.to(`user:${userId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  // Send message to organization
  public sendToOrganization(organizationId: string, event: string, data: unknown) {
    this.io.to(`org:${organizationId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  // Update analytics and broadcast
  public async updateAnalytics(organizationId: string, analyticsData: unknown) {
    try {
      // Cache analytics
      await this.analyticsCache.cacheAnalytics(organizationId, analyticsData);

      // Broadcast to organization
      this.sendToOrganization(
        organizationId,
        'analytics-update',
        analyticsData
      );

      console.log(`📊 Analytics updated for org: ${organizationId}`);
    } catch (error) {
      console.error('Error updating analytics:', error);
    }
  }

  // Update agent status and broadcast
  public async updateAgentStatus(agentId: string, statusData: unknown) {
    try {
      // Cache agent status
      await this.analyticsCache.cacheAgentStatus(agentId, statusData);

      // Broadcast to agent subscribers
      this.broadcastToAgent(agentId, 'agent-status-update', statusData);

      console.log(`🤖 Agent status updated: ${agentId}`);
    } catch (error) {
      console.error('Error updating agent status:', error);
    }
  }

  // Send real-time progress update
  public sendProgressUpdate(organizationId: string, progressData: unknown) {
    this.sendToOrganization(organizationId, 'progress-update', progressData);
  }

  // Send notification
  public sendNotification(userId: string, notification: unknown) {
    this.sendToUser(userId, 'notification', notification);
  }

  // Send system alert
  public sendSystemAlert(organizationId: string, alert: unknown) {
    this.sendToOrganization(organizationId, 'system-alert', alert);
  }

  // Get connected clients count
  public getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  // Get organization clients count
  public getOrganizationClientsCount(organizationId: string): number {
    const room = this.io.sockets.adapter.rooms.get(`org:${organizationId}`);
    return room ? room.size : 0;
  }

  // Get active agents (placeholder - implement based on your data)
  private async getActiveAgents(organizationId: string): Promise<any[]> {
    // This would query your database for active agents
    return [];
  }

  // Get system status (placeholder - implement based on your data)
  private async getSystemStatus(): Promise<any> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        n8n: 'online',
        mongodb: 'online',
        redis: 'online',
      },
    };
  }

  // Health check
  public getHealthStatus() {
    return {
      connectedClients: this.getConnectedClientsCount(),
      rooms: Array.from(this.io.sockets.adapter.rooms.keys()),
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  // Graceful shutdown
  public async shutdown() {
    try {
      // Disconnect all clients
      this.io.disconnectSockets();

      // Close server
      this.io.close();

      console.log('🧹 WebSocket server shutdown completed');
    } catch (error) {
      console.error('Error during WebSocket shutdown:', error);
    }
  }
}

// Export WebSocket server instance
let wsServer: OptimizedWebSocketServer | null = null;

export function initializeWebSocketServer(
  httpServer: HTTPServer
): OptimizedWebSocketServer {
  if (!wsServer) {
    wsServer = new OptimizedWebSocketServer(httpServer);
    console.log('🚀 Optimized WebSocket server initialized');
  }
  return wsServer;
}

export function getWebSocketServer(): OptimizedWebSocketServer | null {
  return wsServer;
}
