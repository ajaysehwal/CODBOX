import { OwnerType } from "../interface";
import { Logger } from "../utils/logger";

export interface FileUpdate {
  content: string;
  lastUpdated: number;
}

interface OwnerFiles {
  files: Map<string, FileUpdate>;
  lastAccessed: number;
}

export class Cache {
  private _cache: Map<string, OwnerFiles> = new Map();
  private maxCacheSize: number;
  private cleanupThreshold: number;
  private logger: Logger;
  constructor(maxCacheSize: number = 1000, cleanupThreshold: number = 0.9) {
    this.maxCacheSize = maxCacheSize;
    this.cleanupThreshold = cleanupThreshold;
    this.logger = new Logger();
    this.logCacheStats();
  }

  private getOwnerKey(id: string, ownerType: OwnerType): string {
    return `${ownerType}:${id}`;
  }

  private getOrCreateOwnerFiles(id: string, ownerType: OwnerType): OwnerFiles {
    const key = this.getOwnerKey(id, ownerType);
    let ownerFiles = this._cache.get(key);
    if (!ownerFiles) {
      ownerFiles = { files: new Map(), lastAccessed: Date.now() };
      this._cache.set(key, ownerFiles);
      this.logger.info("Created new OwnerFiles for ${key}");
    } else {
      this.logger.info("Retrieved existing OwnerFiles for ${key}");
    }
    return ownerFiles;
  }

  updateFile(
    id: string,
    ownerType: OwnerType,
    filename: string,
    content: string
  ): void {
    const ownerFiles = this.getOrCreateOwnerFiles(id, ownerType);
    ownerFiles.files.set(filename, { content, lastUpdated: Date.now() });
    ownerFiles.lastAccessed = Date.now();
    this.logger.info(`Updated file ${filename} for ${ownerType}:${id}`);
    this.cleanup();
  }

  getFileContent(
    id: string,
    ownerType: OwnerType,
    filename: string
  ): string | null {
    const ownerFiles = this._cache.get(this.getOwnerKey(id, ownerType));
    if (ownerFiles) {
      const fileUpdate = ownerFiles.files.get(filename);
      if (fileUpdate) {
        ownerFiles.lastAccessed = Date.now();
        this.logger.info(
          `Retrieved content for file ${filename} of ${ownerType}:${id}`
        );
        return fileUpdate.content;
      }
    }
    return null;
  }

  getUpdatesForOwner(
    id: string,
    ownerType: OwnerType
  ): Array<{ ownerId: string; filename: string; content: string }> {
    const ownerFiles = this._cache.get(this.getOwnerKey(id, ownerType));
    if (!ownerFiles) return [];

    return Array.from(ownerFiles.files.entries()).map(([filename, update]) => ({
      ownerId: id,
      filename,
      content: update.content,
    }));
  }

  getAllUpdatesForOwnerType(
    ownerType: OwnerType
  ): Array<{ ownerId: string; filename: string; content: string }> {
    const updates: Array<{
      ownerId: string;
      filename: string;
      content: string;
    }> = [];
    for (const [key, ownerFiles] of this._cache.entries()) {
      if (key.startsWith(`${ownerType}:`)) {
        const ownerId = key.split(":")[1];
        updates.push(...this.getUpdatesForOwner(ownerId, ownerType));
      }
    }
    return updates;
  }

  removeUpdate(id: string, ownerType: OwnerType, filename: string): void {
    const ownerFiles = this._cache.get(this.getOwnerKey(id, ownerType));
    if (ownerFiles) {
      ownerFiles.files.delete(filename);
      ownerFiles.lastAccessed = Date.now();
      this.logger.info(`Removed file ${filename} for ${ownerType}:${id}`);
    }
  }

  clearOwnerFiles(id: string, ownerType: OwnerType): void {
    const key = this.getOwnerKey(id, ownerType);
    const deleted = this._cache.delete(key);
    this.logger.info(
      `Cleared all files for ${ownerType}:${id}. Deleted: ${deleted}`
    );
  }

  private cleanup(): void {
    if (this._cache.size > this.maxCacheSize * this.cleanupThreshold) {
      this.logger.info(
        `Cache size (${this._cache.size}) exceeded threshold. Starting cleanup..`
      );
      const sortedEntries = Array.from(this._cache.entries()).sort(
        (a, b) => a[1].lastAccessed - b[1].lastAccessed
      );
      const entriesToRemove = sortedEntries.slice(
        0,
        Math.floor(this.maxCacheSize * (1 - this.cleanupThreshold))
      );
      for (const [key] of entriesToRemove) {
        this._cache.delete(key);
        this.logger.info(`Removed ${key} from cache during cleanup`);
      }
      this.logger.info(`Cleanup complete. New cache size: ${this._cache.size}`);
    }
  }

  logCacheStats(): void {
    this.logger.info(`Current cache size: ${this._cache.size}`);
    this.logger.info(`Max cache size: ${this.maxCacheSize}`);
    this.logger.info(`Cleanup threshold: ${this.cleanupThreshold}`);
    for (const [key, ownerFiles] of this._cache.entries()) {
      this.logger.info(
        `${key}: ${ownerFiles.files.size} files, Last accessed: ${new Date(
          ownerFiles.lastAccessed
        ).toISOString()}`
      );
    }
  }
}
