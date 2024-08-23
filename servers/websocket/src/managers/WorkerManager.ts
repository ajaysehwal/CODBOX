import cluster from "cluster";
import { Logger } from "../utils/logger";

export class WorkerManager {
  private numWorkers: number;
  private logger: Logger;

  constructor(numWorkers: number, logger: Logger) {
    this.numWorkers = numWorkers;
    this.logger = logger;
  }

  startWorkers(workerFunction: () => Promise<void>) {
    for (let i = 0; i < this.numWorkers; i++) {
      cluster.fork();
    }

    cluster.on("exit", (worker, code, signal) => {
      this.logger.warn(`Worker ${worker.process.pid} died. Starting a new worker...`);
      cluster.fork();
    });

    cluster.on("online", (worker) => {
      this.logger.info(`Worker ${worker.process.pid} is online`);
    });
  }
}