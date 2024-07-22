import http from "http";
import "dotenv/config";
import { SocketProvider } from "./socket";


function setupErrorHandling(server: http.Server) {
  process.on("SIGTERM", () => {
    console.log("SIGTERM received. Shutting down gracefully.");
    server.close(() => {
      console.log("Server closed.");
      process.exit(0);
    });
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
  });
}

async function main() {
  const socketprovider = new SocketProvider();
  const server = http.createServer();
  socketprovider.io.attach(server);
  socketprovider.init();
  socketprovider.start(server);
  setupErrorHandling(server);
}

main().catch(async (error) => {
  console.error("Failed to connect to database:", error);
  process.exit(1);
});