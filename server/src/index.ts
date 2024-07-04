import express from "express";
import http from "http";
import "dotenv/config";
import { SocketProvider } from "./socket";
const PORT = process.env.PORT;
async function WebServer() {
  const app = express();
  const socketprovider = new SocketProvider();
  app.use(express.json());
  const server = http.createServer(app);
  socketprovider.io.attach(server);
  socketprovider.init();
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  process.on("SIGTERM", () => {
    server.close(() => {
      console.log("Server is closed");
      process.exit(0);
    });
  });
}

WebServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
