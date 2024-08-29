import { Logger } from "../../utils/Logger";
import { spawn } from "child_process";

export interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  executionTime?: number;
  memoryUsage?: number;
}

export class ExecutionLayer {
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
  }

  async execute(filePath: string, language: string): Promise<ExecutionResult> {
    return new Promise((resolve) => {
      const command = this.getExecutionCommand(language);
      this.logger.info(`Executing command: ${command}`);
      const startTime = performance.now();
      const exc = spawn(command, [filePath], {
        env: { ...process.env, NODE_ENV: "execution" },
      });
      let output = "";
      let errorOutput = "";
      exc.stdout.on("data", (data) => {
        output += data.toString();
      });
      exc.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });

      exc.on("close", (code) => {
        const endTime = performance.now();
        const executionTime = (endTime - startTime) / 1000;
        const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;

        if (code === 0) {
          this.logger.info(`Execution successful: ${output.trim()}`);
          resolve({
            success: true,
            output: output.trim(),
            executionTime,
            memoryUsage,
          });
        } else {
          this.logger.warn(`Execution failed: ${errorOutput.trim()}`);
          resolve({
            success: false,
            error: errorOutput.trim() || "Execution failed",
            executionTime,
            memoryUsage,
          });
        }
      });
      setTimeout(() => {
        exc.kill();
        const endTime = performance.now();
        const executionTime = (endTime - startTime) / 1000;
        const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;

        this.logger.error("Execution timed out");
        resolve({
          success: false,
          error: "Execution timed out",
          executionTime,
          memoryUsage,
        });
      }, 10000);
    });
  }

  private getExecutionCommand(language: string): string {
    const commands: Record<string, string> = {
      python: "python",
      javascript: "node",
      // Add more languages here
    };
    return commands[language.toLowerCase()] || "echo";
  }
}

// import { Logger } from "../../utils/Logger";
// import { exec } from "child_process";
// import * as fs from 'fs/promises';
// import * as path from 'path';
// import * as os from 'os';
// import { promisify } from 'util';

// const execAsync = promisify(exec);

// export interface ExecutionResult {
//   success: boolean;
//   output?: string;
//   error?: string;
//   executionTime?: number;
// }

// export class ExecutionLayer {
//   private logger: Logger;

//   constructor() {
//     this.logger = new Logger();
//   }

//   async execute(code: string, language: string): Promise<ExecutionResult> {
//     let tempDir: string | null = null;
//     try {
//       tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'execution-'));
//       const filePath = path.join(tempDir, `code.${this.getFileExtension(language)}`);
//       await fs.writeFile(filePath, code);

//       const { dockerImage, command } = this.getDockerConfig(language);
//       const dockerCommand = `docker run --rm --network none -m 512m -v "${tempDir.replace(/\\/g, '/')}:/code" ${dockerImage} ${command} /code/${path.basename(filePath)}`;

//       this.logger.info(`Executing command: ${dockerCommand}`);
//       const startTime = performance.now();

//       const { stdout, stderr } = await execAsync(dockerCommand, { timeout: 10000 });

//       const endTime = performance.now();
//       const executionTime = (endTime - startTime) / 1000;

//       if (stderr) {
//         this.logger.warn(`Execution produced stderr: ${stderr}`);
//         return {
//           success: false,
//           error: stderr.trim(),
//           executionTime,
//         };
//       }

//       this.logger.info(`Execution successful: ${stdout.trim()}`);
//       return {
//         success: true,
//         output: stdout.trim(),
//         executionTime,
//       };

//     } catch (error) {
//       this.logger.error(`Execution failed: ${error instanceof Error ? error.message : String(error)}`);
//       return {
//         success: false,
//         error: error instanceof Error ? error.message : 'An unknown error occurred',
//         executionTime: 0,
//       };
//     } finally {
//       if (tempDir) {
//         try {
//           await fs.rm(tempDir, { recursive: true, force: true });
//         } catch (error) {
//           this.logger.error(`Failed to remove temporary directory: ${error instanceof Error ? error.message : String(error)}`);
//         }
//       }
//     }
//   }

//   private getDockerConfig(language: string): { dockerImage: string; command: string } {
//     const configs: Record<string, { dockerImage: string; command: string }> = {
//       python: { dockerImage: 'python:3.9-slim', command: 'python' },
//       javascript: { dockerImage: 'node:14-alpine', command: 'node' },
//       // Add more languages here
//     };
//     return configs[language.toLowerCase()] || { dockerImage: 'alpine', command: 'echo' };
//   }

//   private getFileExtension(language: string): string {
//     const extensions: Record<string, string> = {
//       python: 'py',
//       javascript: 'js',
//       // Add more languages here
//     };
//     return extensions[language.toLowerCase()] || 'txt';
//   }
// }
