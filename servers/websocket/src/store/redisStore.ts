import { Redis, Pipeline, RedisOptions } from "ioredis";
import { pub, redis } from "../config/redis";
import { IDataStore } from "../interface";

export class RedisStore implements IDataStore {
  private client: Redis;
  public readonly pub: Redis;

  constructor() {
    this.client = redis;
    this.pub = pub;
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async set(key: string, value: string, ttlInSeconds?: number): Promise<void> {
    if (ttlInSeconds) {
      await this.client.set(key, value, "EX", ttlInSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async sadd(key: string, member: string): Promise<void> {
    await this.client.sadd(key, member);
  }

  async srem(key: string, member: string): Promise<void> {
    await this.client.srem(key, member);
  }

  async smembers(key: string): Promise<string[]> {
    return await this.client.smembers(key);
  }

  async lpush(groupId: string, message: string): Promise<void> {
    const group = await this.exists(`group:${groupId}`);
    if (group) {
      await this.client.lpush(`group:${groupId}:messages`, message);
    }
  }

  async lrange(groupId: string): Promise<string[]> {
    const groupExists = await this.exists(`group:${groupId}`);
    if (groupExists) {
      return await this.client.lrange(`group:${groupId}:messages`, 0, -1);
    } else {
      return [];
    }
  }

  pipeline(): Pipeline {
    return this.client.pipeline() as Pipeline;
  }
  async keys(pattern: string): Promise<string[]> {
    return await this.client.keys(pattern);
  }
}
