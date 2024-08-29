import { OwnerType } from "../interface";

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

  constructor(maxCacheSize: number = 1000, cleanupThreshold: number = 0.9) {
    this.maxCacheSize = maxCacheSize;
    this.cleanupThreshold = cleanupThreshold;
    console.log(
      `Cache initialized with max size: ${maxCacheSize}, cleanup threshold: ${cleanupThreshold}`
    );
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
      console.log(`Created new OwnerFiles for ${key}`);
    } else {
      console.log(`Retrieved existing OwnerFiles for ${key}`);
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
    console.log(this._cache)
    console.log(`Updated file ${filename} for ${ownerType}:${id}`);
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
        console.log(
          `Retrieved content for file ${filename} of ${ownerType}:${id}`
        );
        console.log(fileUpdate)
        return fileUpdate.content;
      }
    }
    console.log(`File ${filename} not found in cache for ${ownerType}:${id}`);
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
      console.log(`Removed file ${filename} for ${ownerType}:${id}`);
    }
  }

  clearOwnerFiles(id: string, ownerType: OwnerType): void {
    const key = this.getOwnerKey(id, ownerType);
    const deleted = this._cache.delete(key);
    console.log(
      `Cleared all files for ${ownerType}:${id}. Deleted: ${deleted}`
    );
  }

  private cleanup(): void {
    if (this._cache.size > this.maxCacheSize * this.cleanupThreshold) {
      console.log(
        `Cache size (${this._cache.size}) exceeded threshold. Starting cleanup...`
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
        console.log(`Removed ${key} from cache during cleanup`);
      }
      console.log(`Cleanup complete. New cache size: ${this._cache.size}`);
    }
  }

  logCacheStats(): void {
    console.log(`Current cache size: ${this._cache.size}`);
    console.log(`Max cache size: ${this.maxCacheSize}`);
    console.log(`Cleanup threshold: ${this.cleanupThreshold}`);
    for (const [key, ownerFiles] of this._cache.entries()) {
      console.log(
        `${key}: ${ownerFiles.files.size} files, Last accessed: ${new Date(
          ownerFiles.lastAccessed
        ).toISOString()}`
      );
    }
  }
}
