import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { Logger } from "../../utils/Logger";

export interface CompilationResult {
  success: boolean;
  compiledPath?: string;
  error?: string;
}

export class CompilerLayer {
  private CODE_DIR: string;
  private logger: Logger;

  constructor() {
    this.CODE_DIR = path.join(process.cwd(), "code");
    this.logger = new Logger();
    this.ensureCodeDir();
  }

  private async ensureCodeDir() {
    try {
      await fs.mkdir(this.CODE_DIR, { recursive: true });
      this.logger.info(`Code directory ensured at: ${this.CODE_DIR}`);
    } catch (err) {
      this.logger.error(
        `Failed to create code directory: ${(err as Error).message}`
      );
      throw err;
    }
  }

  async compile(code: string, language: string): Promise<CompilationResult> {
    console.log(code, language);
    const fileId = uuidv4();
    const langDir = path.join(this.CODE_DIR, language);

    try {
      await fs.mkdir(langDir, { recursive: true });

      const extension = this.getFileExtension(language);
      const filePath = path.join(langDir, `${fileId}.${extension}`);

      await fs.writeFile(filePath, code);
      this.logger.info(`File written successfully at: ${filePath}`);

      const stats = await fs.stat(filePath);
      if (stats.isFile()) {
        return { success: true, compiledPath: filePath };
      } else {
        throw new Error(`Failed to create file: ${filePath}`);
      }
    } catch (error) {
      this.logger.error(`Compilation error: ${(error as Error).message}`);
      return { success: false, error: (error as Error).message };
    }
  }
  private getFileExtension(language: string): string {
    const extensions: { [key: string]: string } = {
      python: "py",
      javascript: "js",
      // Add more languages here
    };
    return extensions[language.toLowerCase()] || "txt";
  }

  async cleanup(filePath: string, compiledPath?: string): Promise<void> {
    try {
      await fs.unlink(filePath);
      this.logger.info(`File deleted: ${filePath}`);
      if (compiledPath) {
        await fs.unlink(compiledPath);
        this.logger.info(`Compiled file deleted: ${compiledPath}`);
      }
    } catch (err) {
      this.logger.error(`Cleanup error: ${(err as Error).message}`);
    }
  }
}
