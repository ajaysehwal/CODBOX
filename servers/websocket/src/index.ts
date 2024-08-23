import "dotenv/config";
import cluster from "cluster";
import os from "os";
import { Logger } from "./utils/logger";
import { Server } from "./server";
import { WorkerManager } from "./managers/WorkerManager";

const numCPUs = os.cpus().length;
const PORT = process.env.PORT || 8000;

class Application {
  private server: Server;
  private workerManager: WorkerManager;
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
    this.server = new Server(PORT as number, this.logger);
    this.workerManager = new WorkerManager(numCPUs, this.logger);
  }

  async start() {
    if (cluster.isPrimary && process.env.NODE_ENV === "production") {
      this.logger.info(`Primary ${process.pid} is running`);
      this.workerManager.startWorkers(this.server.start.bind(this.server));
    } else {
      await this.server.start();
    }
  }
}

const app = new Application();
app.start().catch((error) => {
  console.error("Failed to start the application:", error);
  process.exit(1);
});
