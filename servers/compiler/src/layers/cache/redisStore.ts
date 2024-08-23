import { Pipeline, Redis } from "ioredis";
import { config } from "../../config";
import { Logger } from "../../utils/Logger";
export class RedisStore {
  private redis: Redis;
  private logger: Logger;
  constructor() {
    this.redis = new Redis({
      port: config.redis.port,
      host: config.redis.host,
      password: config.redis.password,
      username: config.redis.username,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });
    this.logger = new Logger();
    this.errorHandler();
  }
  private errorHandler() {
    this.redis.on("error", (error) => {
      this.logger.error(error.message);
    });
  }
  async set(key: string, value: string) {
    await this.redis.set(key, value);
  }
  async del(key: string) {
    await this.redis.del(key);
  }
  async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }
  async exists(key: string): Promise<boolean> {
    return (await this.redis.exists(key)) === 1;
  }
  pipeline(): Pipeline {
    return this.redis.pipeline() as Pipeline;
  }
}
