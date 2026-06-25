import { createClient, type RedisClientType } from "redis";
import { logger } from "../utils/logger";

class RedisService {
  private client: RedisClientType;
  private connected = false;

  constructor() {
    this.client = createClient({ url: process.env.REDIS_URL ?? "redis://localhost:6379/0" }) as RedisClientType;

    this.client.on("error", (err) => logger.error("Redis error", err));
    this.client.on("connect", () => {
      this.connected = true;
      logger.info("Redis connected");
    });
    this.client.on("end", () => {
      this.connected = false;
    });
  }

  async connect(): Promise<void> {
    if (!this.connected) await this.client.connect();
  }

  async ping(): Promise<boolean> {
    try {
      const res = await this.client.ping();
      return res === "PONG";
    } catch {
      return false;
    }
  }

  // ── Core ────────────────────────────────────────────────────────────────

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  /** Atomic get+delete — returns the value before deletion. Returns null if key did not exist. */
  async getdel(key: string): Promise<string | null> {
    return this.client.getDel(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.setEx(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length) await this.client.del(keys);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.client.expire(key, ttlSeconds);
  }

  async pexpire(key: string, ttlMs: number): Promise<void> {
    await this.client.pExpire(key, ttlMs);
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  // ── JSON helpers ────────────────────────────────────────────────────────

  async getJson<T>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async setJson<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    await this.set(key, JSON.stringify(value), ttlSeconds);
  }

  // ── List helpers ────────────────────────────────────────────────────────

  async lpush(key: string, ...values: string[]): Promise<void> {
    await this.client.lPush(key, values);
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.client.lRange(key, start, stop);
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
  }
}

export const redis = new RedisService();
