import { RedisStore } from "./redisStore";
import crypto from "crypto";
export class CacheLayer {
  private store: RedisStore;
  constructor() {
    this.store = new RedisStore();
  }

  async set(cacheKey: string, code: string) {
    await this.store.set(cacheKey, code);
  }
  async getCacheKey(code: string, langauge: string) {
    return crypto
      .createHash("sha256")
      .update(`${code}${langauge}`)
      .digest("hex");
  }
  async getCacheResult(cacheKey: string) {
    return await this.store.get(cacheKey);
  }
  async InitCacheLayer(payload: { code: string; langauge: string }) {
    const { code, langauge } = payload;
    const cacheKey = await this.getCacheKey(code, langauge);
    const isCache = await this.store.exists(cacheKey);
    if (isCache) {
      return await this.getCacheResult(cacheKey);
    }
    return null;
  }
}
