import { OwnerType } from "../interface";
import { FilesStore, StoreType } from "../store/FilesStore";
import { RedisStore } from "../store/redisStore";
import { Cache } from "./CacheManger";
import { Logger } from "../utils/logger";
import { FlushManager } from "./FlushManager";

export class FilesManager {
  private cache: Cache;
  private redisStore: RedisStore;
  private filesStore: (type: StoreType) => FilesStore;
  private logger: Logger;
  private flushManager: FlushManager;

  constructor() {
    this.cache = new Cache();
    this.redisStore = new RedisStore();
    this.filesStore = (type: StoreType) => new FilesStore(type);
    this.logger = new Logger();
    this.flushManager = new FlushManager(
      this.cache,
      this.redisStore,
      this.filesStore,
      this.logger
    );
  }

  startUpdateService(s3FlushIntervalMs: number = 60000) {
    this.flushManager.startIntervalFlush(s3FlushIntervalMs);
  }

  stopUpdateService() {
    this.flushManager.stopIntervalFlush();
  }

  async recordFileUpdate(
    ownerId: string,
    ownerType: OwnerType,
    filename: string,
    content: string
  ) {
    this.updateCache(ownerId, ownerType, filename, content);
    await this.updateRedis(ownerId, ownerType, filename, content);
    this.flushManager.triggerFlush(ownerId, ownerType);
  }

  private updateCache(
    ownerId: string,
    ownerType: OwnerType,
    filename: string,
    content: string
  ) {
    this.cache.updateFile(ownerId, ownerType, filename, content);
  }

  private async updateRedis(
    ownerId: string,
    ownerType: OwnerType,
    filename: string,
    content: string
  ) {
    const key = this.getKey(ownerId, ownerType, filename);
    try {
      await this.redisStore.set(key, content);
      console.log(`File update recorded in Redis: ${key}`);
    } catch (error) {
      console.log(
        `Failed to record file update to Redis: ${ownerId}/${filename}`,
        error
      );
    }
  }

  async getFileContent(
    ownerId: string,
    ownerType: OwnerType,
    filename: string
  ) {
    const content = await this.getContentFromCacheOrRedis(
      ownerId,
      ownerType,
      filename
    );
    if (content) return content;

    return this.getContentFromS3(ownerId, ownerType, filename);
  }

  private async getContentFromCacheOrRedis(
    ownerId: string,
    ownerType: OwnerType,
    filename: string
  ) {
    const cacheContent = this.cache.getFileContent(
      ownerId,
      ownerType,
      filename
    );
    if (cacheContent) {
      this.logger.info("Returning cache file content");
      return cacheContent;
    }

    try {
      const redisContent = await this.getFileContentFromRedis(
        this.getKey(ownerId, ownerType, filename)
      );
      if (redisContent) {
        this.logger.info("Returning Redis file content");
        this.updateCache(ownerId, ownerType, filename, redisContent);
        return redisContent;
      }
    } catch (err) {
      this.logger.error(
        `Failed to get file content from Redis: ${ownerType}/${filename}`,
        err
      );
    }

    return null;
  }

  private async getContentFromS3(
    ownerId: string,
    ownerType: OwnerType,
    filename: string
  ) {
    try {
      const s3store = this.getS3Store(ownerType);
      const content = await s3store.getFileContent(ownerId, filename);
      if (content) {
        this.logger.info("Returning S3 file content");
        this.updateCache(ownerId, ownerType, filename, content);
        return content;
      }
    } catch (error) {
      this.logger.error(
        `Failed to get file content from S3: ${ownerType}/${filename}`,
        error
      );
    }
    return null;
  }

  private getS3Store(ownerType: OwnerType): FilesStore {
    return this.filesStore(ownerType === "user" ? "user" : "group");
  }

  private getKey(
    ownerId: string,
    ownerType: OwnerType,
    filename: string
  ): string {
    return `fileUpdate:${ownerType}:${ownerId}:${filename}`;
  }

  private async getFileContentFromRedis(key: string): Promise<string | null> {
    return await this.redisStore.get(key);
  }

  async handleUserDisconnect(ownerId: string, ownerType: OwnerType) {
    await this.flushManager.flushOnDisconnect(ownerId, ownerType);
  }

  async listFiles(ownerId: string, ownerType: OwnerType) {
    return await this.getS3Store(ownerType).listFiles(ownerId);
  }

  async createFile(
    ownerId: string,
    ownerType: OwnerType,
    filename: string,
    content: string
  ) {
    return await this.getS3Store(ownerType).createFile(
      ownerId,
      filename,
      content
    );
  }
}
