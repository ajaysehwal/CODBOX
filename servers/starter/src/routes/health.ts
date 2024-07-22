import express from "express";
import { prisma } from "../services/prisma";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "OK",
      message: "Server is healthy",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Basic health check failed:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Server health check failed",
      error: error,
    });
  }
});
router.get("/stats", async (req, res) => {
  const startTime = process.hrtime();
  try {
    await prisma.$queryRaw`SELECT 1`;

    const endTime = process.hrtime(startTime);
    const duration = endTime[0] * 1000 + endTime[1] / 1000000;

    const stats = {
      status: "OK",
      message: "Server is healthy",
      timestamp: new Date().toISOString(),
      serverUptime: process.uptime(),
      databaseResponseTime: `${duration.toFixed(2)}ms`,
      serverMemoryUsage: process.memoryUsage(),
      activeConnections: 0,
      requestsPerMinute: 0,
      averageResponseTime: 0,
      nodejs: {
        version: process.version,
        pid: process.pid,
      },
      environment: process.env.NODE_ENV || "development",
    };

    res.json(stats);
  } catch (error) {
    console.error("Server stats check failed:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Failed to retrieve server stats",
      error: error,
    });
  }
});
export default router;
