import "reflect-metadata";
import express, { Application } from "express";
import compression from "compression";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import session from "express-session";
import cors from "cors";
import { prisma } from "./services/prisma";
import logger from "./services/logger";
import { errorHandler } from "./middleware/errorHandler";
import config from "./config";
import router from "./routes";

class Server {
  private app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares() {
    this.app.use(compression());
    this.app.use(
      helmet({
        contentSecurityPolicy: false,
        xDownloadOptions: false,
      })
    );
    this.app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: "Too many requests per second",
      })
    );
    this.app.use(express.json());
    this.app.use(
      session({
        secret: process.env.SESSION_SECRET || "your_session_secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: process.env.NODE_ENV === "production",
          maxAge: 1000 * 60 * 60 * 24, // 24 hours
        },
      })
    );
    this.app.use(
      morgan("combined", {
        stream: { write: (message) => logger.info(message.trim()) },
        skip: (req, res) => process.env.NODE_ENV === "test",
      })
    );
    this.app.use(
      cors({
        origin: [process.env.CLIENT_URL as string, process.env.CLIENT_URL1 as string],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
      })
    );
  }

  private initializeRoutes() {
    this.app.use("/", router);
  }

  private initializeErrorHandling() {
    this.app.use(errorHandler);
  }

  public listen() {
    const server = this.app.listen(config.port, () => {
      logger.info(`Server started on port ${config.port}`);
    });

    process.on("SIGTERM", () => this.gracefulShutdown(server));
    process.on("SIGINT", () => this.gracefulShutdown(server));
  }

  private gracefulShutdown(server: any) {
    logger.info("Starting graceful shutdown");
    server.close(async () => {
      logger.info("Server closed");
      await prisma.$disconnect();
      logger.info("Database connection closed");
      process.exit(0);
    });

    setTimeout(() => {
      logger.error("Could not close connections in time, forcefully shutting down");
      process.exit(1);
    }, 10000);
  }
}

(async () => {
  try {
    const server = new Server();
    server.listen();
  } catch (error) {
    logger.error("Failed to start server", error);
    await prisma.$disconnect();
    process.exit(1);
  }
})();
