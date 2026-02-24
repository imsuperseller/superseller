import Redis from "ioredis";
import { getEnv } from "./env";

let _redis: Redis | null = null;

export function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis(getEnv().REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 200, 2000),
    });
  }
  return _redis;
}

const PREFIX = "winner:";

export async function getJson<T>(key: string): Promise<T | null> {
  const val = await getRedis().get(PREFIX + key);
  if (!val) return null;
  return JSON.parse(val) as T;
}

export async function setJson(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
  const k = PREFIX + key;
  if (ttlSeconds) {
    await getRedis().set(k, JSON.stringify(value), "EX", ttlSeconds);
  } else {
    await getRedis().set(k, JSON.stringify(value));
  }
}

export async function del(key: string): Promise<void> {
  await getRedis().del(PREFIX + key);
}

export async function incr(key: string, ttlSeconds?: number): Promise<number> {
  const k = PREFIX + key;
  const val = await getRedis().incr(k);
  if (ttlSeconds && val === 1) {
    await getRedis().expire(k, ttlSeconds);
  }
  return val;
}

export async function decr(key: string): Promise<number> {
  return getRedis().decr(PREFIX + key);
}

export async function healthCheck(): Promise<boolean> {
  try {
    const pong = await getRedis().ping();
    return pong === "PONG";
  } catch {
    return false;
  }
}
