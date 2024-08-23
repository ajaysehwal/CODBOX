import { CacheLayer } from "./cache";
import { CodeJob, JobQueue } from "./queue";
import { CompilerLayer } from "./compilation";
import { ExecutionLayer, ExecutionResult } from "./execution";
import Bull, { Job } from "bull";
import { Logger } from "../utils/Logger";

export class Layers {
  private cacheLayer: CacheLayer;
  private jobQueue: JobQueue;
  private compilerLayer: CompilerLayer;
  private executionLayer: ExecutionLayer;
  private logger: Logger;

  constructor() {
    this.cacheLayer = new CacheLayer();
    this.jobQueue = new JobQueue("Compilation");
    this.compilerLayer = new CompilerLayer();
    this.executionLayer = new ExecutionLayer();
    this.logger = new Logger();
    this.initializeJobQueue();
  }

  private initializeJobQueue(): void {
    this.jobQueue.startProcessing(this.processor.bind(this));
  }

  async startProcess(
    code: string,
    language: string
  ): Promise<ExecutionResult | null> {
    try {
      const cacheKey = await this.cacheLayer.getCacheKey(code, language);

      const cachedResult = await this.cacheLayer.getCacheResult(cacheKey);
      if (cachedResult) {
        this.logger.info("Returning cached result.");
        return JSON.parse(cachedResult);
      }

      const job = await this.jobQueue.add({ code, language });
      if (!job.id) {
        throw new Error("Job ID is undefined");
      }
      this.logger.info(`Job queued with ID: ${job.id}`);

      return this.waitForJobAndCache(job.id, cacheKey);
    } catch (error) {
      this.logger.error(
        "Error in startProcess:",
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }

  private async waitForJobAndCache(
    jobId: Bull.JobId,
    cacheKey: string
  ): Promise<ExecutionResult | null> {
    try {
      const result = await this.jobQueue.waitForCompletion(jobId);
      if (!result) {
        return null;
      }
      await this.cacheResult(cacheKey, JSON.stringify(result));
      return result;
    } catch (error) {
      this.logger.error(
        "Error in waitForJobAndCache:",
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }

  private async processor(job: Bull.Job<CodeJob>) {
    const { code, language } = job.data;
    try {
      const compilationResult = await this.compilerLayer.compile(
        code,
        language
      );
      if (!compilationResult.success) {
        throw new Error(compilationResult.error);
      }

      const compiledPath = compilationResult.compiledPath;
      if (!compiledPath) {
        throw new Error("Compiled path is missing");
      }

      const executionResult = await this.executionLayer.execute(
        compiledPath,
        language
      );

      await this.compilerLayer.cleanup(compiledPath);

      return executionResult;
    } catch (error) {
      this.logger.error(
        "Error processing job:",
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }

  private async cacheResult(cacheKey: string, result: string): Promise<void> {
    try {
      await this.cacheLayer.set(cacheKey, result);
    } catch (error) {
      this.logger.error(
        "Error caching result:",
        error instanceof Error ? error.message : String(error)
      );
    }
  }
}
