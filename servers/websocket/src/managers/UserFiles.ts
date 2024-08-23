import { S3 } from "../services";

export class UserFileStore extends S3 {
  protected basePath: string = "users";

  async createFile(
    userId: string,
    filename: string,
    content: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.ensureFolder(userId);

      if (await this.fileExists(userId, filename)) {
        return { success: false, message: "File already exists" };
      }

      await this.uploadFile(userId, filename, content);
      return { success: true, message: "File created successfully" };
    } catch (error) {
      console.error("Error creating user file in S3:", error);
      return { success: false, message: "Failed to create file" };
    }
  }

  async updateFile(
    userId: string,
    filename: string,
    content: string
  ): Promise<{ success: boolean; message: string }> {
    if (!(await this.fileExists(userId, filename))) {
      return { success: false, message: "File does not exist" };
    }
    return this.uploadFile(userId, filename, content)
      .then(() => ({ success: true, message: "File updated successfully" }))
      .catch((error) => {
        console.error("Error updating user file in S3:", error);
        return { success: false, message: "Failed to update file" };
      });
  }
}
