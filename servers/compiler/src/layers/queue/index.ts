import Bull, { Job, JobOptions, Queue, JobCounts, JobStatusClean } from "bull";
import { config } from "../../config";
import { Logger } from "../../utils/Logger";
import { ExecutionResult } from "../execution";

export interface CodeJob {
  code: string;
  language: string;
}

export class JobQueue {
  private queue: Queue<CodeJob>;
  private logger: Logger;

  constructor(name: string) {
    this.queue = new Bull<CodeJob>(name, this.getRedisConfig());
    this.logger = new Logger();
    this.setupEventListeners();
  }

  private getRedisConfig(): Bull.QueueOptions {
    return {
      redis: {
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        username: config.redis.username,
      },
    };
  }

  async add(data: CodeJob, options?: JobOptions) {
    try {
      const job = await this.queue.add(data, options);
      this.logger.info(`Job added successfully: ${job.id}`);
      return job;
    } catch (error) {
      this.handleError("Failed to add job", error);
      throw error;
    }
  }

  startProcessing(
    processor: (job: Job<CodeJob>) => Promise<ExecutionResult>,
    concurrency: number = 1
  ): void {
    this.queue.process(concurrency, async (job) => {
      try {
        await job.progress(10);
        const result = await processor(job);
        await job.progress(100);
        return this.createSuccessResponse(result);
      } catch (error) {
        this.handleError(`Error processing job ${job.id}`, error);
        throw error;
      }
    });
  }

  private createSuccessResponse(result: ExecutionResult): object {
    return {
      status: "success",
      message: "Job completed successfully",
      result,
    };
  }

  private setupEventListeners(): void {
    this.queue.on("failed", this.onJobFailed.bind(this));
    this.queue.on("completed", this.onJobCompleted.bind(this));
    this.queue.on("progress", this.onJobProgress.bind(this));
  }

  private onJobFailed(job: Job<CodeJob>, err: Error): void {
    this.logger.error(`Failed job ${job.id}: ${err.message}`);
  }

  private onJobCompleted(job: Job<CodeJob>, result: any): void {
    this.logger.info(`Completed job ${job.id}: ${JSON.stringify(result)}`);
  }

  private onJobProgress(job: Job<CodeJob>, progress: number): void {
    this.logger.info(`Job ${job.id} progress: ${progress}%`);
  }

  async getAllJobs(): Promise<Job<CodeJob>[]> {
    try {
      return await this.queue.getJobs([
        "waiting",
        "active",
        "completed",
        "failed",
        "delayed",
      ]);
    } catch (error) {
      this.handleError("Failed to get all jobs", error);
      throw error;
    }
  }

  async getJobCounts(): Promise<JobCounts> {
    try {
      return await this.queue.getJobCounts();
    } catch (error) {
      this.handleError("Failed to get job counts", error);
      throw error;
    }
  }

  async cleanQueue(
    grace: number = 1000,
    limit: number = 1000,
    status?: JobStatusClean
  ): Promise<Job<CodeJob>[]> {
    try {
      const cleaned = await this.queue.clean(grace, status, limit);
      this.logger.info(
        `Queue cleaned successfully. Removed ${cleaned.length} jobs.`
      );
      return cleaned;
    } catch (error) {
      this.handleError("Failed to clean queue", error);
      throw error;
    }
  }

  async pauseQueue(): Promise<void> {
    try {
      await this.queue.pause();
      this.logger.info("Queue paused successfully");
    } catch (error) {
      this.handleError("Failed to pause queue", error);
      throw error;
    }
  }

  async resumeQueue(): Promise<void> {
    try {
      await this.queue.resume();
      this.logger.info("Queue resumed successfully");
    } catch (error) {
      this.handleError("Failed to resume queue", error);
      throw error;
    }
  }

  async waitForCompletion(jobId: Bull.JobId): Promise<ExecutionResult> {
    return new Promise((resolve, reject) => {
      this.queue
        .getJob(jobId)
        .then((job) => {
          if (!job) {
            reject(new Error(`Job with ID ${jobId} not found`));
            return;
          }

          const checkJobStatus = async () => {
            const status = await job.getState();
            if (status === "completed") {
              const result = await job.finished();
              resolve(result.result);
            } else if (status === "failed") {
              const failedReason = job.failedReason;
              reject(new Error(failedReason));
            } else {
              setTimeout(checkJobStatus, 1000);
            }
          };

          checkJobStatus();
        })
        .catch(reject);
    });
  }

  private handleError(message: string, error: unknown): void {
    this.logger.error(`${message}: ${(error as Error).message}`);
  }
}
