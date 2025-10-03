// WebSocket Service for Real-time Admin Dashboard Updates
class AdminDashboardWebSocket {
  constructor() {
    this.ws = null;
    this.reconnectInterval = 5000;
    this.heartbeatInterval = 30000;
    this.isConnected = false;
    this.listeners = new Map();
  }

  connect() {
    try {
      this.ws = new WebSocket('ws://173.254.201.134:4000/ws');
      
      this.ws.onopen = () => {
        console.log('🔌 WebSocket connected to admin dashboard');
        this.isConnected = true;
        this.startHeartbeat();
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        this.isConnected = false;
        this.emit('disconnected');
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };

    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.scheduleReconnect();
    }
  }

  handleMessage(data) {
    const { type, payload } = data;
    
    switch (type) {
      case 'workflow_update':
        this.emit('workflowUpdate', payload);
        break;
      case 'customer_update':
        this.emit('customerUpdate', payload);
        break;
      case 'mcp_server_update':
        this.emit('mcpServerUpdate', payload);
        break;
      case 'system_health':
        this.emit('systemHealth', payload);
        break;
      case 'revenue_update':
        this.emit('revenueUpdate', payload);
        break;
      default:
        console.log('Unknown WebSocket message type:', type);
    }
  }

  startHeartbeat() {
    setInterval(() => {
      if (this.isConnected) {
        this.ws.send(JSON.stringify({ type: 'heartbeat' }));
      }
    }, this.heartbeatInterval);
  }

  scheduleReconnect() {
    setTimeout(() => {
      if (!this.isConnected) {
        console.log('🔄 Attempting WebSocket reconnection...');
        this.connect();
      }
    }, this.reconnectInterval);
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

export default AdminDashboardWebSocket;
