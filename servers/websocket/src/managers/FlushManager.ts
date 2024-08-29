import { debounce } from "lodash";
import { OwnerType } from "../interface";
import { FilesStore, StoreType } from "../store/FilesStore";
import { RedisStore } from "../store/redisStore";
import { Cache } from "./CacheManger";
import { Logger } from "../utils/logger";

export class FlushManager {
  private cache: Cache;
  private redisStore: RedisStore;
  private filesStore: (type: StoreType) => FilesStore;
  private logger: Logger;
  private s3FlushInterval: NodeJS.Timeout | null = null;
  private s3FlushDebounced: { [key in OwnerType]: (ownerId: string) => void };

  constructor(
    cache: Cache,
    redisStore: RedisStore,
    filesStore: (type: StoreType) => FilesStore,
    logger: Logger
  ) {
    this.cache = cache;
    this.redisStore = redisStore;
    this.filesStore = filesStore;
    this.logger = logger;

    this.s3FlushDebounced = {
      user: debounce(this.flushToS3.bind(this, "user"), 20000, {
        maxWait: 50000,
      }),
      group: debounce(this.flushToS3.bind(this, "group"), 20000, {
        maxWait: 50000,
      }),
    };
  }

  startIntervalFlush(intervalMs: number = 60000) {
    this.s3FlushInterval = setInterval(() => this.flushAllToS3(), intervalMs);
    this.logger.info("Interval-based S3 flush started");
  }

  stopIntervalFlush() {
    if (this.s3FlushInterval) {
      clearInterval(this.s3FlushInterval);
      this.s3FlushInterval = null;
    }
    this.logger.info("Interval-based S3 flush stopped");
  }

  triggerFlush(ownerId: string, ownerType: OwnerType) {
    this.s3FlushDebounced[ownerType](ownerId);
  }

  async flushOnDisconnect(ownerId: string, ownerType: OwnerType) {
    await this.flushToS3(ownerType, ownerId);
  }

  private async flushAllToS3() {
    await Promise.all([this.flushToS3("user"), this.flushToS3("group")]);
  }

  private async flushToS3(ownerType: OwnerType, ownerId?: string) {
    const store = this.filesStore(ownerType);
    const updates = ownerId
      ? this.cache.getUpdatesForOwner(ownerId, ownerType)
      : this.cache.getAllUpdatesForOwnerType(ownerType);

    if (updates.length === 0) return;

    const batchSize = 10;
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (update) => {
          try {
            await store.updateFile(
              update.ownerId,
              update.filename,
              update.content
            );
            this.cache.removeUpdate(update.ownerId, ownerType, update.filename);
          } catch (error) {
            this.logger.error(
              `Failed to update file in S3: ${update.ownerId}/${update.filename}`,
              error
            );
          }
        })
      );
    }

    this.logger.info(
      `Flushed ${updates.length} updates to S3 for ${ownerType}`
    );
  }
}
