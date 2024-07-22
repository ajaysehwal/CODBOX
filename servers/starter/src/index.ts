import "reflect-metadata";
import express from "express";
import compression from "compression";
import helmet from "helmet";
import morgan from "morgan";
import { prisma } from "./services/prisma";
import logger from "./services/logger";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middleware/errorHandler";
import config from "./config";
import router from "./routes";
import cors from "cors";
async function main() {
  const app = express();
  app.use(compression());
  app.use(
    helmet({
      contentSecurityPolicy: false,
      xDownloadOptions: false,
    })
  );
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: "Too many requests per second",
    })
  );
  app.use(express.json());
  app.use(errorHandler);
  app.use(
    morgan("combined", {
      stream: { write: (message) => logger.info(message.trim()) },
    })
  );
  app.use(
    cors({
      origin: ["http://localhost:3000", process.env.CLIENT_URL1 as string],
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    })
  );
  app.use("/", router);
  const server = app.listen(config.port, () => {
    console.log("Server is running on", `localhost:${config.port}`);
  });

  process.on("SIGTERM", () => gracefulShutdown(server));
  process.on("SIGINT", () => gracefulShutdown(server));
}
function gracefulShutdown(server: any) {
  console.log("Starting graceful shutdown");
  server.close(async () => {
    console.log("Server closed");
    await prisma.$disconnect();
    console.log("Database connection closed");
    process.exit(0);
  });

  setTimeout(() => {
    console.error(
      "Could not close connections in time, forcefully shutting down"
    );
    process.exit(1);
  }, 10000);
}

// npx prisma migrate dev --name init

main().catch(async (error) => {
  console.error("Failed to connect to database", error);
  await prisma.$disconnect();
  process.exit(1);
});
