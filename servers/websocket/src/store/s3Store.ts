import {
  GetObjectCommand,
  PutObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { Readable } from "stream";
import { S3Response, S3Config } from "../interface";
import { createS3Client } from "../services";

export abstract class S3Store {
  protected s3Client: S3Client;
  protected bucketName: string;
  protected abstract basePath: string;

  constructor(config: S3Config) {
    this.bucketName = config.bucketName;
    this.s3Client = createS3Client(config);
  }

  protected getS3Key(id: string, filename: string): string {
    return `${this.basePath}/${id}/${filename}`;
  }

  protected async ensureFolder(id: string): Promise<void> {
    const folderKey = `${this.basePath}/${id}/`;
    try {
      await this.s3Client.send(
        new HeadObjectCommand({ Bucket: this.bucketName, Key: folderKey })
      );
    } catch (error) {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: folderKey,
          Body: "",
        })
      );
    }
  }
  

  protected async fileExists(id: string, filename: string): Promise<boolean> {
    const key = this.getS3Key(id, filename);
    try {
      await this.s3Client.send(
        new HeadObjectCommand({ Bucket: this.bucketName, Key: key })
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  protected async uploadFile(
    id: string,
    filename: string,
    content: string | Buffer | Readable
  ): Promise<void> {
    const key = this.getS3Key(id, filename);
    const upload = new Upload({
      client: this.s3Client,
      params: { Bucket: this.bucketName, Key: key, Body: content },
    });
    await upload.done();
  }

  async getFileContent(id: string, filename: string): Promise<string> {
    try {
      const key = this.getS3Key(id, filename);
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      const response = await this.s3Client.send(command);
      return await this.streamToString(response.Body as Readable);
    } catch (error) {
      console.error(`Error getting file from S3: ${id}/${filename}`, error);
      throw new Error("Failed to get file content");
    }
  }

  private async streamToString(stream: Readable): Promise<string> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks).toString("utf-8");
  }

  async listFiles(id: string): Promise<string[]> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: `${this.basePath}/${id}/`,
      });
      const response = await this.s3Client.send(command);
      return this.extractFilenames(response.Contents || []);
    } catch (error) {
      console.error(`Error listing files from S3: ${id}`, error);
      return [];
    }
  }

  private extractFilenames(contents: { Key?: string }[]): string[] {
    return contents
      .map((object) => object.Key?.split("/").pop() || "")
      .filter((filename) => filename !== "");
  }

  abstract createFile(
    id: string,
    filename: string,
    content: string
  ): Promise<S3Response>;
  abstract updateFile(
    id: string,
    filename: string,
    content: string
  ): Promise<S3Response>;
}
