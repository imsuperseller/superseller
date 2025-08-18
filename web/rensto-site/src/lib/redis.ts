import Redis from 'ioredis';

// Redis Configuration
const redisConfig = {
  host: process.env.REDIS_HOST || '173.254.201.134',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
};

// Redis Client Instances
let redisClient: Redis | null = null;
let redisSubscriber: Redis | null = null;
let redisPublisher: Redis | null = null;

// Initialize Redis connections
export function initializeRedis() {
  if (!redisClient) {
    redisClient = new Redis(redisConfig);
    redisSubscriber = new Redis(redisConfig);
    redisPublisher = new Redis(redisConfig);

    console.log('🔌 Redis connections initialized');
  }
  return { redisClient, redisSubscriber, redisPublisher };
}

// Get Redis client
export function getRedisClient(): Redis {
  if (!redisClient) {
    initializeRedis();
  }
  return redisClient!;
}

// Get Redis subscriber
export function getRedisSubscriber(): Redis {
  if (!redisSubscriber) {
    initializeRedis();
  }
  return redisSubscriber!;
}

// Get Redis publisher
export function getRedisPublisher(): Redis {
  if (!redisPublisher) {
    initializeRedis();
  }
  return redisPublisher!;
}

// Cache Management
export class CacheManager {
  private redis: Redis;
  private defaultTTL = 300; // 5 minutes

  constructor() {
    this.redis = getRedisClient();
  }

  // Set cache with TTL
  async set(
    key: string,
    value: unknown,
    ttl: number = this.defaultTTL
  ): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await this.redis.setex(key, ttl, serializedValue);
    } catch (error) {
      console.error('Redis cache set error:', error);
    }
  }

  // Get cache
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis cache get error:', error);
      return null;
    }
  }

  // Delete cache
  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Redis cache delete error:', error);
    }
  }

  // Clear all cache
  async clear(): Promise<void> {
    try {
      await this.redis.flushall();
    } catch (error) {
      console.error('Redis cache clear error:', error);
    }
  }

  // Get cache statistics
  async getStats(): Promise<any> {
    try {
      const info = await this.redis.info();
      const keys = await this.redis.dbsize();
      return { info, keys };
    } catch (error) {
      console.error('Redis stats error:', error);
      return { info: null, keys: 0 };
    }
  }
}

// Pub/Sub Management
export class PubSubManager {
  private publisher: Redis;
  private subscriber: Redis;
  private channels: Map<string, Function[]> = new Map();

  constructor() {
    this.publisher = getRedisPublisher();
    this.subscriber = getRedisSubscriber();
    this.setupSubscriber();
  }

  private setupSubscriber() {
    this.subscriber.on('message', (channel, message) => {
      const callbacks = this.channels.get(channel) || [];
      const data = JSON.parse(message);
      callbacks.forEach(callback => callback(data));
    });
  }

  // Subscribe to channel
  async subscribe(channel: string, callback: Function): Promise<void> {
    try {
      if (!this.channels.has(channel)) {
        this.channels.set(channel, []);
        await this.subscriber.subscribe(channel);
      }
      this.channels.get(channel)!.push(callback);
    } catch (error) {
      console.error('Redis subscribe error:', error);
    }
  }

  // Unsubscribe from channel
  async unsubscribe(channel: string, callback?: Function): Promise<void> {
    try {
      if (callback) {
        const callbacks = this.channels.get(channel) || [];
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
        if (callbacks.length === 0) {
          this.channels.delete(channel);
          await this.subscriber.unsubscribe(channel);
        }
      } else {
        this.channels.delete(channel);
        await this.subscriber.unsubscribe(channel);
      }
    } catch (error) {
      console.error('Redis unsubscribe error:', error);
    }
  }

  // Publish to channel
  async publish(channel: string, data: unknown): Promise<void> {
    try {
      const message = JSON.stringify(data);
      await this.publisher.publish(channel, message);
    } catch (error) {
      console.error('Redis publish error:', error);
    }
  }

  // Get active channels
  getActiveChannels(): string[] {
    return Array.from(this.channels.keys());
  }
}

// Session Management
export class SessionManager {
  private redis: Redis;
  private sessionTTL = 86400; // 24 hours

  constructor() {
    this.redis = getRedisClient();
  }

  // Store session
  async setSession(sessionId: string, data: unknown): Promise<void> {
    try {
      const key = `session:${sessionId}`;
      await this.redis.setex(key, this.sessionTTL, JSON.stringify(data));
    } catch (error) {
      console.error('Redis session set error:', error);
    }
  }

  // Get session
  async getSession(sessionId: string): Promise<any | null> {
    try {
      const key = `session:${sessionId}`;
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis session get error:', error);
      return null;
    }
  }

  // Delete session
  async deleteSession(sessionId: string): Promise<void> {
    try {
      const key = `session:${sessionId}`;
      await this.redis.del(key);
    } catch (error) {
      console.error('Redis session delete error:', error);
    }
  }

  // Extend session
  async extendSession(sessionId: string): Promise<void> {
    try {
      const key = `session:${sessionId}`;
      await this.redis.expire(key, this.sessionTTL);
    } catch (error) {
      console.error('Redis session extend error:', error);
    }
  }
}

// Analytics Cache
export class AnalyticsCache {
  private cache: CacheManager;
  private pubsub: PubSubManager;

  constructor() {
    this.cache = new CacheManager();
    this.pubsub = new PubSubManager();
  }

  // Cache analytics data
  async cacheAnalytics(
    orgId: string,
    data: unknown,
    ttl: number = 300
  ): Promise<void> {
    const key = `analytics:${orgId}`;
    await this.cache.set(key, data, ttl);

    // Broadcast update
    await this.pubsub.publish('analytics-update', {
      orgId,
      timestamp: new Date().toISOString(),
      data,
    });
  }

  // Get cached analytics
  async getCachedAnalytics(orgId: string): Promise<any | null> {
    const key = `analytics:${orgId}`;
    return await this.cache.get(key);
  }

  // Subscribe to analytics updates
  async subscribeToAnalytics(callback: Function): Promise<void> {
    await this.pubsub.subscribe('analytics-update', callback);
  }

  // Cache agent status
  async cacheAgentStatus(agentId: string, status: unknown): Promise<void> {
    const key = `agent:${agentId}:status`;
    await this.cache.set(key, status, 60); // 1 minute TTL

    // Broadcast agent status update
    await this.pubsub.publish('agent-status-update', {
      agentId,
      status,
      timestamp: new Date().toISOString(),
    });
  }

  // Get cached agent status
  async getCachedAgentStatus(agentId: string): Promise<any | null> {
    const key = `agent:${agentId}:status`;
    return await this.cache.get(key);
  }

  // Subscribe to agent status updates
  async subscribeToAgentStatus(callback: Function): Promise<void> {
    await this.pubsub.subscribe('agent-status-update', callback);
  }
}

// Initialize Redis on module load
initializeRedis();

export { CacheManager, PubSubManager, SessionManager, AnalyticsCache };
