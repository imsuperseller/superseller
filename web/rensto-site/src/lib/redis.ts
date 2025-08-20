// Simple Redis-like cache for client-side only
class SimpleCache {
  private cache = new Map<string, any>();
  private ttl = new Map<string, number>();

  set(key: string, value: any, ttlSeconds: number = 3600): void {
    this.cache.set(key, value);
    this.ttl.set(key, Date.now() + (ttlSeconds * 1000));
  }

  get(key: string): any {
    const expiry = this.ttl.get(key);
    if (expiry && Date.now() > expiry) {
      this.cache.delete(key);
      this.ttl.delete(key);
      return null;
    }
    return this.cache.get(key);
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    this.ttl.delete(key);
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    this.ttl.clear();
  }

  has(key: string): boolean {
    return this.cache.has(key) && this.ttl.get(key)! > Date.now();
  }
}

// Simple analytics cache
export class AnalyticsCache {
  private cache = new SimpleCache();

  async cacheAnalytics(organizationId: string, data: any): Promise<void> {
    this.cache.set(`analytics:${organizationId}`, data, 300); // 5 minutes TTL
  }

  async getCachedAnalytics(organizationId: string): Promise<any> {
    return this.cache.get(`analytics:${organizationId}`);
  }

  async cacheAgentStatus(agentId: string, data: any): Promise<void> {
    this.cache.set(`agent:${agentId}`, data, 60); // 1 minute TTL
  }

  async getCachedAgentStatus(agentId: string): Promise<any> {
    return this.cache.get(`agent:${agentId}`);
  }
}

// Simple pub/sub manager
export class PubSubManager {
  private subscribers = new Map<string, Function[]>();

  subscribe(channel: string, callback: Function): void {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, []);
    }
    this.subscribers.get(channel)!.push(callback);
  }

  unsubscribe(channel: string, callback: Function): void {
    const callbacks = this.subscribers.get(channel);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  publish(channel: string, data: any): void {
    const callbacks = this.subscribers.get(channel);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
}

// Export instances
export const analyticsCache = new AnalyticsCache();
export const pubSubManager = new PubSubManager();
