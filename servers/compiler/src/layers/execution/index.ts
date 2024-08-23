import { Logger } from "../../utils/Logger";
import { spawn } from "child_process";

export interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
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
        if (code === 0) {
          this.logger.info(`Execution successful: ${output.trim()}`);
          resolve({ success: true, output: output.trim() });
        } else {
          this.logger.warn(`Execution failed: ${errorOutput.trim()}`);
          resolve({
            success: false,
            error: errorOutput.trim() || "Execution failed",
          });
        }
      });
      setTimeout(() => {
        exc.kill();
        this.logger.error("Execution timed out");
        resolve({ success: false, error: "Execution timed out" });
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
