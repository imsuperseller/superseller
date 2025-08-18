import { EventEmitter } from 'events';

// WebSocket message types
export interface WebSocketMessage {
  type: string;
  data: unknown;
  timestamp: number;
  id?: string;
}

export interface WebSocketEvent {
  agentExecution: {
    agentId: string;
    status: 'started' | 'completed' | 'failed';
    data?: unknown;
  };
  systemUpdate: {
    component: string;
    status: 'online' | 'offline' | 'error';
    message?: string;
  };
  notification: {
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    action?: string;
  };
  dataSync: {
    collection: string;
    action: 'created' | 'updated' | 'deleted';
    documentId: string;
    data?: unknown;
  };
}

// WebSocket client class
export class WebSocketClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private url: string;
  private token: string;

  constructor(url: string, token: string) {
    super();
    this.url = url;
    this.token = token;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(`${this.url}?token=${this.token}`);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.emit('connected');
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.stopHeartbeat();
          this.emit('disconnected', event);
          
          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.emit('error', error);
          reject(error);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(message: WebSocketMessage) {
    this.emit('message', message);
    this.emit(message.type, message.data);
  }

  send(type: string, data: unknown): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        data,
        timestamp: Date.now(),
        id: Math.random().toString(36).substr(2, 9),
      };
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message not sent:', type);
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.send('ping', { timestamp: Date.now() });
    }, 30000); // Send ping every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Scheduling WebSocket reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect().catch((error) => {
        console.error('WebSocket reconnect failed:', error);
      });
    }, delay);
  }

  disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
  }

  // Subscribe to specific events
  subscribe(eventType: string, callback: (data: unknown) => void): void {
    this.on(eventType, callback);
  }

  unsubscribe(eventType: string, callback: (data: unknown) => void): void {
    this.off(eventType, callback);
  }

  // Get connection status
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// WebSocket server utilities (for API routes)
export class WebSocketServer {
  private clients = new Map<string, WebSocket>();
  private eventEmitter = new EventEmitter();

  addClient(id: string, ws: WebSocket): void {
    this.clients.set(id, ws);
    
    ws.on('close', () => {
      this.clients.delete(id);
      this.eventEmitter.emit('clientDisconnected', id);
    });

    ws.on('error', (error) => {
      console.error(`WebSocket client ${id} error:`, error);
      this.clients.delete(id);
    });

    this.eventEmitter.emit('clientConnected', id);
  }

  broadcast(type: string, data: unknown, excludeId?: string): void {
    const message: WebSocketMessage = {
      type,
      data,
      timestamp: Date.now(),
    };

    const messageStr = JSON.stringify(message);

    this.clients.forEach((client, id) => {
      if (id !== excludeId && client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  sendToClient(clientId: string, type: string, data: unknown): boolean {
    const client = this.clients.get(clientId);
    if (client && client.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        data,
        timestamp: Date.now(),
      };
      client.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  getClientCount(): number {
    return this.clients.size;
  }

  getConnectedClients(): string[] {
    return Array.from(this.clients.keys());
  }

  on(event: string, callback: (...args: unknown[]) => void): void {
    this.eventEmitter.on(event, callback);
  }

  off(event: string, callback: (...args: unknown[]) => void): void {
    this.eventEmitter.off(event, callback);
  }
}

// Global WebSocket server instance
export const wsServer = new WebSocketServer();

// WebSocket hook for React components
export function useWebSocket(url: string, token: string) {
  const [client, setClient] = React.useState<WebSocketClient | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const wsClient = new WebSocketClient(url, token);
    
    wsClient.on('connected', () => {
      setIsConnected(true);
      setError(null);
    });

    wsClient.on('disconnected', () => {
      setIsConnected(false);
    });

    wsClient.on('error', (err) => {
      setError(err.message);
      setIsConnected(false);
    });

    setClient(wsClient);

    wsClient.connect().catch((err) => {
      setError(err.message);
    });

    return () => {
      wsClient.disconnect();
    };
  }, [url, token]);

  return {
    client,
    isConnected,
    error,
    send: (type: string, data: unknown) => client?.send(type, data),
    subscribe: (eventType: string, callback: (data: unknown) => void) => {
      client?.subscribe(eventType, callback);
    },
    unsubscribe: (eventType: string, callback: (data: unknown) => void) => {
      client?.unsubscribe(eventType, callback);
    },
  };
}
