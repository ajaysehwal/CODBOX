import { S3Store } from "./s3Store";
import { S3Response } from "../interface";
import config from "../config";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { FileUpdate } from "../managers/CacheManger";

export type StoreType = "user" | "group";

export class FilesStore extends S3Store {
  private storeType: StoreType;

  constructor(storeType: StoreType) {
    super(config.aws);
    this.storeType = storeType;
  }

  protected get basePath(): string {
    return this.storeType === "user" ? "users" : "groups";
  }

  async createEntityStore(entityId: string): Promise<S3Response> {
    try {
      await this.ensureFolder(entityId);
      if (this.storeType === "group") {
        await this.uploadFile(entityId, "index.js", "");
      }
      return {
        success: true,
        message: `Folder for ${this.storeType} '${entityId}' created successfully`,
      };
    } catch (error) {
      console.error(
        `Error creating ${this.storeType} folder in S3: ${entityId}`,
        error
      );
      return {
        success: false,
        message: `Failed to create folder for ${this.storeType} '${entityId}'`,
      };
    }
  }

  async createFile(
    entityId: string,
    filename: string,
    content: string
  ): Promise<S3Response> {
    try {
      await this.ensureFolder(entityId);
      if (await this.fileExists(entityId, filename)) {
        return { success: false, message: "File already exists" };
      }
      await this.uploadFile(entityId, filename, content);
      return { success: true, message: "File created successfully" };
    } catch (error) {
      console.error(
        `Error creating file in S3: ${entityId}/${filename}`,
        error
      );
      return { success: false, message: "Failed to create file" };
    }
  }

  async updateFile(
    entityId: string,
    filename: string,
    content: string
  ): Promise<S3Response> {
    try {
      if (!(await this.fileExists(entityId, filename))) {
        return { success: false, message: "File does not exist" };
      }
      await this.uploadFile(entityId, filename, content);
      return { success: true, message: "File updated successfully" };
    } catch (error) {
      console.error(
        `Error updating file in S3: ${entityId}/${filename}`,
        error
      );
      return { success: false, message: "Failed to update file" };
    }
  }

  async updateFiles(
    entityId: string,
    files: Map<string, FileUpdate>
  ): Promise<S3Response> {
    try {
      for (const [filename, { content }] of Object.entries(files)) {
        if (!(await this.fileExists(entityId, filename))) {
          return {
            success: false,
            message: `File '${filename}' does not exist`,
          };
        }
        await this.uploadFile(entityId, filename, content);
      }
      return { success: true, message: "Files updated successfully" };
    } catch (error) {
      console.error(
        `Error updating files in S3 for ${this.storeType}: ${entityId}`,
        error
      );
      return { success: false, message: "Failed to update files" };
    }
  }

  async deleteFile(entityId: string, filename: string): Promise<S3Response> {
    try {
      const key = this.getS3Key(entityId, filename);
      await this.s3Client.send(
        new DeleteObjectCommand({ Bucket: this.bucketName, Key: key })
      );
      return { success: true, message: "File deleted successfully" };
    } catch (error) {
      console.error(
        `Error deleting file from S3: ${entityId}/${filename}`,
        error
      );
      return { success: false, message: "Failed to delete file" };
    }
  }
}
