import http from "http";
import express from "express";
import WebSocket from "ws";
import { Logger } from "./utils/Logger";
import os from "os";
import cluster from "cluster";
import { cpus } from "os";
import { config } from "./config";
import { Layers } from "./layers";
import { HealthCheckResult, WebSocketMessage } from "./types";
import { ExecutionResult } from "./layers/execution";

const { version } = require("../package.json");

const GRACEFUL_SHUTDOWN_TIMEOUT = 10000;
const numCPUs = cpus().length;

class Server {
  private app: express.Application;
  private httpServer: http.Server;
  private wss: WebSocket.Server;
  private layer: Layers;

  constructor(private port: number, private logger: Logger) {
    this.app = express();
    this.httpServer = http.createServer(this.app);
    this.wss = new WebSocket.Server({ server: this.httpServer });
    this.layer = new Layers();
  }

  public async start(): Promise<void> {
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
    this.setupErrorHandlers();

    return new Promise((resolve, reject) => {
      this.httpServer
        .listen(this.port, () => {
          this.logger.info(
            `Worker ${process.pid} started on port ${this.port}`
          );
          resolve();
        })
        .on("error", reject);
    });
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    // Add more middleware here as needed
  }

  private setupRoutes(): void {
    this.app.get("/health", this.healthCheck);
    // Add more routes here
  }

  private setupWebSocket(): void {
    this.wss.on("connection", this.handleWebSocketConnection);
  }

  private setupErrorHandlers(): void {
    process.on("SIGTERM", this.gracefulShutdown);
    process.on("unhandledRejection", this.handleUnhandledRejection);
    process.on("uncaughtException", this.handleUncaughtException);
  }

  private healthCheck = async (
    req: express.Request,
    res: express.Response
  ): Promise<void> => {
    const start = process.hrtime();

    try {
      const healthCheckResult = this.performHealthCheck(start);
      const checkResult = await this.layerTest();

      res.status(200).json({
        ...healthCheckResult,
        layertest: {
          Layerstest: checkResult,
          result: "SUCCESS",
        },
      });
    } catch (error) {
      this.logger.error("Health check failed:", error);
      res.status(503).json({
        status: "CRITICAL",
        error: "Health check failed",
      });
    }
  };

  private async layerTest(): Promise<ExecutionResult | null> {
    return await this.layer.startProcess(
      "console.log('hello boy')",
      "javascript"
    );
  }

  private performHealthCheck(start: [number, number]): HealthCheckResult {
    const [seconds, nanoseconds] = process.hrtime(start);
    const responseTime = seconds * 1000 + nanoseconds / 1e6;

    return {
      status: "OK",
      version,
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
    this.logger.info(`New WebSocket connection: ${ws.url}`);
    ws.on("message", (payload) => this.handleCompileRequest(ws, payload));
  };

  private handleCompileRequest = async (
    ws: WebSocket,
    payload: WebSocket.Data
  ): Promise<void> => {
    try {
      const message = JSON.parse(payload.toString()) as WebSocketMessage;

      if (message.type !== "request") {
        throw new Error("Invalid request type");
      }

      this.logger.info(
        `Received compilation request for language: ${message.language}`
      );
      const result = await this.layer.startProcess(
        message.code,
        message.language
      );
      ws.send(JSON.stringify(result));
    } catch (error) {
      this.logger.error("Error handling WebSocket message:", error);
      ws.send(JSON.stringify({ error: "Internal server error" }));
    }
  };

  private gracefulShutdown = (): void => {
    this.logger.info("Server shutting down gracefully");
    this.wss.close(() => {
      this.logger.info("WebSocket server closed");
      this.httpServer.close(() => {
        this.logger.info("HTTP server closed");
        process.exit(0);
      });
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
    this.logger.error("Unhandled Rejection at:", promise, "Reason:", reason);
    this.gracefulShutdown();
  };

  private handleUncaughtException = (err: Error): void => {
    this.logger.error("Uncaught Exception occurred:", err);
    this.gracefulShutdown();
  };
}

async function startServer(port: number, logger: Logger): Promise<void> {
  const server = new Server(port, logger);
  try {
    await server.start();
  } catch (err) {
    logger.error("Failed to start server:", err);
    process.exit(1);
  }
}

function main() {
  const logger = new Logger();

  if (cluster.isPrimary && process.env.NODE_ENV === "preproduction") {
    logger.info(`Master ${process.pid} is running`);
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on("exit", (worker, code, signal) => {
      logger.info(`Worker ${worker.process.pid} died`);
      cluster.fork();
    });
  } else {
    startServer(config.port, logger);
  }
}

main();
