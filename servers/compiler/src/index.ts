import http from "http";
import express from "express";
import WebSocket from "ws";
import { Logger } from "./utils/Logger";
import os from "os";
const { version } = require("../package.json");
import { config } from "./config";
import { Layers } from "./layers";
const GRACEFUL_SHUTDOWN_TIMEOUT = 10000;
interface HealthCheckResult {
  status: "OK" | "WARNING" | "CRITICAL";
  version: string;
  uptime: number;
  responseTime: number;
  memoryUsage: {
    total: number;
    free: number;
    usedPercentage: number;
  };
  cpuLoad: number[];
  result?: any;
}

class Server {
  private app: express.Application;
  private httpServer: http.Server;
  private wss: WebSocket.Server;

  constructor(private port: number, private logger: Logger) {
    this.app = express();
    this.httpServer = http.createServer(this.app);
    this.wss = new WebSocket.Server({ server: this.httpServer });
  }

  public async start(): Promise<void> {
    this.setupRoutes();
    this.setupWebSocket();
    this.setupErrorHandlers();

    return new Promise((resolve, reject) => {
      this.httpServer
        .listen(this.port, () => {
          this.logger.info(`Server started on port ${this.port}`);
          resolve();
        })
        .on("error", reject);
    });
  }

  private async setupRoutes() {
    this.app.get("/health", this.healthCheck);
  }

  private setupWebSocket(): void {
    this.wss.on("connection", this.handleWebSocketConnection);
  }

  private setupErrorHandlers(): void {
    process.on("SIGTERM", this.gracefulShutdown);
    process.on("unhandledRejection", this.handleUnhandledRejection);
    process.on("uncaughtException", this.handleUncaughtException);
  }
  private async check() {
    try {
      const layer = new Layers();
      const result = await layer.startProcess("console.log('hello world')", "javascript");
      return result;
    } catch (err) {
      return (err as Error).message;
    }
  }
  private healthCheck = async (
    req: express.Request,
    res: express.Response
  ): Promise<void> => {
    const start = process.hrtime();

    try {
      const healthCheckResult = this.performHealthCheck(start);

      res.status(200).json({ ...healthCheckResult, check: await this.check() });
    } catch (error) {
      this.logger.error("Health check failed:", error);
      res.status(503).json({
        status: "CRITICAL",
        error: "Health check failed",
      });
    }
  };

  private performHealthCheck(start: [number, number]): HealthCheckResult {
    const [seconds, nanoseconds] = process.hrtime(start);
    const responseTime = seconds * 1000 + nanoseconds / 1e6;

    return {
      status: "OK",
      version: version,
      uptime: process.uptime(),
      responseTime: Number(responseTime.toFixed(2)),
      memoryUsage: this.getMemoryUsage(),
      cpuLoad: os.loadavg(),
    };
  }

  private getMemoryUsage(): HealthCheckResult["memoryUsage"] {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    return {
      total: Math.round(totalMemory / 1024 / 1024),
      free: Math.round(freeMemory / 1024 / 1024),
      usedPercentage: Number(((usedMemory / totalMemory) * 100).toFixed(2)),
    };
  }

  private handleWebSocketConnection = (ws: WebSocket): void => {
    this.logger.info(`New WebSocket connection: ${ws}`);
    ws.on("message", this.handleCompileRequest);
  };

  private handleCompileRequest = (payload: WebSocket.Data): void => {
    this.logger.info(`Received message: ${payload}`);
  };

  private gracefulShutdown = (): void => {
    this.logger.info("Server shutting down gracefully");
    this.httpServer.close(() => {
      this.logger.info("Server closed");
      process.exit(0);
    });

    setTimeout(() => {
      this.logger.error(
        "Forcefully shutting down as graceful shutdown timed out."
      );
      process.exit(1);
    }, GRACEFUL_SHUTDOWN_TIMEOUT);
  };

  private handleUnhandledRejection = (
    reason: any,
    promise: Promise<any>
  ): void => {
    console.log(reason);
    this.logger.error("Unhandled Rejection at:", promise, "Reason:", reason);
    this.gracefulShutdown();
  };

  private handleUncaughtException = (err: Error): void => {
    this.logger.error("Uncaught Exception occurred:", err);
    this.gracefulShutdown();
  };
}

async function main() {
  const server = new Server(config.port, new Logger());
  try {
    await server.start();
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

main();
