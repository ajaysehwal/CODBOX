import express from "express";
import http from "http";
import "dotenv/config";
import { SocketProvider } from "./socket";
import cors from "cors";
const PORT = process.env.PORT || 8000;
async function WebServer() {
  const app = express();
  const socketprovider = new SocketProvider();
  app.use(express.json());
  app.use(
    cors({
      origin: ["https://codexf.vercel.app", process.env.CLIENT_URL1 as string],
      methods: ["GET", "POST"],
      credentials: true,
    })
  );
  app.get("/", (req, res) => {
    res.status(200).json({ status: "codexf server is running." });
  });
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
  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
  });
}

WebServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
