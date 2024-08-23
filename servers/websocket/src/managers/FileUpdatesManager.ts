import { RedisStore } from "../store/redisStore";
import { FileManager } from "./FileManager";
import { Logger } from "../utils/logger";
import { UserFileStore } from "./UserFiles";
import { GroupFileStore } from "./GroupFiles";

interface FileUpdate {
  ownerId: string;
  ownerType: "user" | "group";
  filename: string;
  content: string;
  lastUpdated: number;
}

export class FileUpdateManager {
  private redisStore: RedisStore;
  private s3UserStore: UserFileStore;
  private s3GroupStore: GroupFileStore;
  private logger: Logger;
  private memoryCache: Map<string, FileUpdate>;
  private redisFlushInterval: NodeJS.Timeout | null = null;
  private s3FlushInterval: NodeJS.Timeout | null = null;

  constructor(redisStore: RedisStore, logger: Logger) {
    this.redisStore = redisStore;
    const s3FileManager = new FileManager();
    this.s3UserStore = s3FileManager.getUserStore();
    this.s3GroupStore = s3FileManager.getGroupStore();
    this.logger = logger;
    this.memoryCache = new Map();
  }

  startUpdateService(
    redisFlushIntervalMs: number = 5000,
    s3FlushIntervalMs: number = 60000
  ) {
    this.redisFlushInterval = setInterval(
      () => this.flushMemoryCacheToRedis(),
      redisFlushIntervalMs
    );

    this.s3FlushInterval = setInterval(
      () => this.flushUpdatesToS3(),
      s3FlushIntervalMs
    );

    this.logger.info("File update service started");
  }

  stopUpdateService() {
    if (this.redisFlushInterval) {
      clearInterval(this.redisFlushInterval);
      this.redisFlushInterval = null;
    }

    if (this.s3FlushInterval) {
      clearInterval(this.s3FlushInterval);
      this.s3FlushInterval = null;
    }

    this.logger.info("File update service stopped");
  }

  async recordFileUpdate(
    ownerId: string,
    ownerType: "user" | "group",
    filename: string,
    content: string
  ): Promise<void> {
    const key = this.getKey(ownerId, ownerType, filename);
    const update: FileUpdate = {
      ownerId,
      ownerType,
      filename,
      content,
      lastUpdated: Date.now(),
    };

    this.memoryCache.set(key, update);
    this.logger.info(`File update recorded in memory cache: ${key}`);

    try {
      await this.redisStore.set(key, JSON.stringify(update));
      this.logger.info(`File update recorded in Redis: ${key}`);
    } catch (err) {
      this.logger.error(`Failed to record file update in Redis: ${key}`, err);
    }
  }

  async getFileContent(
    ownerId: string,
    ownerType: "user" | "group",
    filename: string
  ): Promise<string | null> {
    const key = this.getKey(ownerId, ownerType, filename);

    const cacheUpdate = this.memoryCache.get(key);
    if (cacheUpdate) {
      return cacheUpdate.content;
    }

    try {
      const redisUpdate = await this.getUpdateFromRedis(key);
      if (redisUpdate) {
        return redisUpdate.content;
      }
    } catch (err) {
      this.logger.error(`Failed to get file content from Redis: ${key}`, err);
    }

    try {
      const s3Store =
        ownerType === "user" ? this.s3UserStore : this.s3GroupStore;
      const content = await s3Store.getFileContent(ownerId, filename);
      if (content) {
        // Update the memory cache and Redis with the latest content
        await this.recordFileUpdate(ownerId, ownerType, filename, content);
        return content;
      }
    } catch (err) {
      this.logger.error(`Failed to get file content from S3: ${key}`, err);
    }

    return null;
  }

  private async flushMemoryCacheToRedis(): Promise<void> {
    const updates = Array.from(this.memoryCache.entries());
    if (updates.length === 0) return;

    const pipeline = this.redisStore.pipeline();
    for (const [key, update] of updates) {
      pipeline.set(key, JSON.stringify(update));
    }

    try {
      await pipeline.exec();
      this.logger.info(`Flushed ${updates.length} updates to Redis`);
      this.memoryCache.clear();
    } catch (err) {
      this.logger.error("Failed to flush updates to Redis", err);
    }
  }

  private async flushUpdatesToS3(): Promise<void> {
    const updates = Array.from(this.memoryCache.values());
    if (updates.length === 0) return;

    const s3UserStore = this.s3UserStore;
    const s3GroupStore = this.s3GroupStore;

    const userUpdates = updates.filter((update) => update.ownerType === "user");
    const groupUpdates = updates.filter(
      (update) => update.ownerType === "group"
    );

    await Promise.all([
      this.flushUpdatesToS3Store(userUpdates, s3UserStore),
      this.flushUpdatesToS3Store(groupUpdates, s3GroupStore),
    ]);

    this.logger.info(`Flushed ${updates.length} updates to S3`);
    this.memoryCache.clear();
  }

  private async flushUpdatesToS3Store(
    updates: FileUpdate[],
    s3Store: UserFileStore | GroupFileStore
  ): Promise<void> {
    for (const update of updates) {
      try {
        await s3Store.updateFile(
          update.ownerId,
          update.filename,
          update.content
        );
        this.logger.info(
          `Flushed update to S3: ${update.ownerType}/${update.ownerId}/${update.filename}`
        );
      } catch (err) {
        this.logger.error(
          `Failed to flush update to S3: ${update.ownerType}/${update.ownerId}/${update.filename}`,
          err
        );
      }
    }
  }

  private async clearDataFromCache(
    ownerId: string,
    ownerType: "user" | "group"
  ): Promise<void> {
    for (const [key, update] of this.memoryCache.entries()) {
      if (update.ownerId === ownerId && update.ownerType === ownerType) {
        this.memoryCache.delete(key);
      }
    }
  }

  private async clearDataFromRedis(
    ownerId: string,
    ownerType: "user" | "group"
  ): Promise<void> {
    const pattern = this.getKey(ownerId, ownerType, "*");
    try {
      const keys = await this.redisStore.keys(pattern);
      if (keys.length > 0) {
        const pipeline = this.redisStore.pipeline();
        keys.forEach((key) => pipeline.del(key));
        await pipeline.exec();
        this.logger.info(
          `Cleared ${keys.length} keys from Redis for ${ownerType}: ${ownerId}`
        );
      }
    } catch (err) {
      this.logger.error(
        `Failed to clear Redis data for ${ownerType}: ${ownerId}`,
        err
      );
    }
  }

  private async getUpdateFromRedis(key: string): Promise<FileUpdate | null> {
    const updateJson = await this.redisStore.get(key);
    return updateJson ? JSON.parse(updateJson) : null;
  }

  private getKey(
    ownerId: string,
    ownerType: "user" | "group",
    filename: string
  ): string {
    return `fileUpdate:${ownerType}:${ownerId}:${filename}`;
  }
}
