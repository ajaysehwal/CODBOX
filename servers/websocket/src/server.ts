import http from "http";
import express from "express";
import { SocketProvider } from "./socket";
import { Logger } from "./utils/logger";

export class Server {
  private app: express.Application;
  private httpServer: http.Server;
  private socketProvider: SocketProvider;
  private port: number;
  private logger: Logger;

  constructor(port: number, logger: Logger) {
    this.app = express();
    this.httpServer = http.createServer(this.app);
    this.socketProvider = new SocketProvider();
    this.port = port;
    this.logger = logger;
  }

  private setupHealthCheck() {
    this.app.get("/health", (req, res) => {
      res.status(200).json({ health: "OK", status: "running", version: "v1" });
    });
  }

  private setupErrorHandling() {
    process.on("SIGTERM", () => {
      this.logger.info("SIGTERM received. Shutting down gracefully.");

      this.httpServer.close(() => {
        this.logger.info("Server closed. Exiting process.");
        process.exit(0);
      });

      setTimeout(() => {
        this.logger.error(
          "Forcefully shutting down as graceful shutdown timed out."
        );
        process.exit(1);
      }, 10000);
    });

    process.on("unhandledRejection", (reason, promise) => {
      this.logger.error("Unhandled Rejection at:", promise, "Reason:", reason);

      promise.catch((err) => {
        this.logger.error("Error caught in unhandled rejection:", err);
      });

      this.httpServer.close(() => {
        this.logger.error(
          "Server closed due to unhandled rejection. Exiting process."
        );
        process.exit(1);
      });
    });

    process.on("uncaughtException", (err) => {
      this.logger.error("Uncaught Exception occurred:", err);
      this.httpServer.close(() => {
        this.logger.error(
          "Server closed due to uncaught exception. Exiting process."
        );
        process.exit(1);
      });
    });
  }

  async start() {
    this.setupHealthCheck();
    await this.socketProvider.init();
    this.socketProvider.io.attach(this.httpServer);
    this.setupErrorHandling();
    this.httpServer.listen(this.port, () => {
      this.logger.info(`Worker ${process.pid} started on port ${this.port}`);
    });
  }
}
