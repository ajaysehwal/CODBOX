import { S3 } from "../services";

export class GroupFileStore extends S3 {
  protected basePath: string = "groups";

  async createFile(groupId: string, filename: string, content: string): Promise<{ success: boolean; message: string }> {
    try {
      await this.ensureFolder(groupId);
      
      if (await this.fileExists(groupId, filename)) {
        return { success: false, message: "File already exists" };
      }

      await this.uploadFile(groupId, filename, content);
      return { success: true, message: "File created successfully" };
    } catch (error) {
      console.error("Error creating group file in S3:", error);
      return { success: false, message: "Failed to create file" };
    }
  }

  async updateFile(groupId: string, filename: string, content: string): Promise<{ success: boolean; message: string }> {
    if (!(await this.fileExists(groupId, filename))) {
      return { success: false, message: "File does not exist" };
    }
    return this.uploadFile(groupId, filename, content)
      .then(() => ({ success: true, message: "File updated successfully" }))
      .catch((error) => {
        console.error("Error updating group file in S3:", error);
        return { success: false, message: "Failed to update file" };
      });
  }
}
  