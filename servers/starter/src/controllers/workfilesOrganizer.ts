import { S3Client, GetObjectCommand, PutObjectCommand, ListObjectsV2Command, HeadObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { Readable } from "stream";

interface FileData {
  userId: string;
  filename: string;
  content: string;
}

interface S3Config {
  bucketName: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export class FileOrganizer {
  private s3Client: S3Client;
  private bucketName: string;
  private readonly basePath: string = "users";

  constructor(config: S3Config) {
    console.log("Access Key ID:", config.accessKeyId);
    console.log("Secret Access Key:", config.secretAccessKey.substring(0, 5) + "...");
    this.bucketName = config.bucketName;
    this.s3Client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  private getS3Key(userId: string, filename: string): string {
    return `${this.basePath}/${userId}/${filename}`;
  }

  private async ensureUserFolder(userId: string): Promise<void> {
    const folderKey = `${this.basePath}/${userId}/`;
    try {
      await this.s3Client.send(new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: folderKey,
      }));
    } catch (error) {
      await this.s3Client.send(new PutObjectCommand({
        Bucket: this.bucketName,
        Key: folderKey,
        Body: "",
      }));
    }
  }

  private async fileExists(userId: string, filename: string): Promise<boolean> {
    const key = this.getS3Key(userId, filename);
    try {
      await this.s3Client.send(new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }));
      return true;
    } catch (error) {
      return false;
    }
  }

  async createFile(fileData: FileData): Promise<{ success: boolean; message: string }> {
    try {
      await this.ensureUserFolder(fileData.userId);
      
      if (await this.fileExists(fileData.userId, fileData.filename)) {
        return { success: false, message: "File already exists" };
      }

      await this.uploadFile(fileData);
      return { success: true, message: "File created successfully" };
    } catch (error) {
      console.error("Error creating file in S3:", error);
      return { success: false, message: "Failed to create file" };
    }
  }

  private async uploadFile(fileData: FileData): Promise<void> {
    const { userId, filename, content } = fileData;
    const key = this.getS3Key(userId, filename);
    const upload = new Upload({
      client: this.s3Client,
      params: { Bucket: this.bucketName, Key: key, Body: content },
    });
    await upload.done();
  }

  async getFileContent(userId: string, filename: string): Promise<string> {
    try {
      const key = this.getS3Key(userId, filename);
      const command = new GetObjectCommand({ Bucket: this.bucketName, Key: key });
      const response = await this.s3Client.send(command);
      return await this.streamToString(response.Body as Readable);
    } catch (error) {
      console.error("Error getting file from S3:", error);
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

  async updateFile(userId: string, filename: string, content: string): Promise<{ success: boolean; message: string }> {
    if (!(await this.fileExists(userId, filename))) {
      return { success: false, message: "File does not exist" };
    }
    return this.uploadFile({ userId, filename, content })
      .then(() => ({ success: true, message: "File updated successfully" }))
      .catch((error) => {
        console.error("Error updating file in S3:", error);
        return { success: false, message: "Failed to update file" };
      });
  }

  async listUserFiles(userId: string): Promise<string[]> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: `${this.basePath}/${userId}/`,
      });
      const response = await this.s3Client.send(command);
      return this.extractFilenames(response.Contents || []);
    } catch (error) {
      console.error("Error listing user files from S3:", error);
      return [];
    }
  }

  private extractFilenames(contents: { Key?: string }[]): string[] {
    return contents
      .map(object => object.Key?.split("/").pop() || "")
      .filter(filename => filename !== "");
  }
}