import { FileManager } from "../managers/FileManager";
import { FileUpdateManager } from "../managers/FileUpdatesManager";

export class CodeService {
  constructor(
    private fileManager: FileManager,
    private fileUpdateManager: FileUpdateManager
  ) {}

  async getGroupFiles(groupId: string): Promise<string[]> {
    return this.fileManager.getGroupStore().listFiles(groupId);
  }

  async getGroupFileCode(groupId: string, filename: string): Promise<string> {
    return this.fileManager.getGroupStore().getFileContent(groupId, filename);
  }

  async updateGroupFileCode(
    groupId: string,
    filename: string,
    newCode: string
  ): Promise<void> {
    await this.fileUpdateManager.recordFileUpdate(
      groupId,
      "group",
      filename,
      newCode
    );
  }

  async getUserFiles(userId: string): Promise<string[]> {
    return this.fileManager.getUserStore().listFiles(userId);
  }

  async getUserFileCode(
    userId: string,
    filename: string
  ): Promise<string | null> {
    return await this.fileUpdateManager.getFileContent(
      userId,
      "user",
      filename
    );
  }

  async updateUserFileCode(
    userId: string,
    filename: string,
    newCode: string
  ): Promise<void> {
    await this.fileUpdateManager.recordFileUpdate(
      userId,
      "user",
      filename,
      newCode
    );
  }
  async createUserFile(
    id: string,
    filename: string,
    content: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return await this.fileManager
      .getUserStore()
      .createFile(id, filename, content);
  }
  async createGroupFile(id: string, filename: string, content: string) {
    return await this.fileManager
      .getGroupStore()
      .createFile(id, filename, content);
  }
}
