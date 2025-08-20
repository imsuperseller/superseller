// Simple WebSocket server utilities for client-side only
export interface WebSocketMessage {
  type: string;
  data: unknown;
  timestamp: number;
  id?: string;
}

// Simple event emitter for client-side only
class SimpleEventEmitter {
  private events: { [key: string]: Function[] } = {};

  on(event: string, listener: Function) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  emit(event: string, ...args: any[]) {
    if (this.events[event]) {
      this.events[event].forEach(listener => listener(...args));
    }
  }

  off(event: string, listener: Function) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(l => l !== listener);
    }
  }
}

// Simple WebSocket server for client-side only
export class WebSocketServer extends SimpleEventEmitter {
  private clients = new Map<string, WebSocket>();

  addClient(id: string, ws: WebSocket): void {
    this.clients.set(id, ws);

    ws.onclose = () => {
      this.clients.delete(id);
      this.emit('clientDisconnected', id);
    };

    ws.onerror = (error) => {
      console.error(`WebSocket client ${id} error:`, error);
      this.clients.delete(id);
    };

    this.emit('clientConnected', id);
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
}

// Global WebSocket server instance
export const wsServer = new WebSocketServer();
