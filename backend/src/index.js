import express from "express";
import loggerMiddleware from "./middleware/logger.middleware.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import config from "./config/env.config.js";
import log from "./utils/logger.util.js";
import { dbConnection } from "./config/db.config.js";
import errorMiddleware from "./middleware/error.middleware.js";
import cookiesParser from "cookie-parser";
import cors from "cors";
import { app, server } from "./utils/socket.js";
import path from "path";

const __dirname = path.resolve();

app.use(loggerMiddleware);
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookiesParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.use(errorMiddleware);

process.on("uncaughtException", (err) => {
  log.error(`Uncaught Exception: ${err.message}`);
});

process.on("unhandledRejection", (err) => {
  log.error(`Unhandled Rejection: ${err.message}`);
});

const shutdown = async (signal) => {
  log.info(`${signal} signal received: shutting down gracefully...`);
  try {
    log.info("Releasing resources...");
  } catch (error) {
    log.error("Error during shutdown:", error.message);
  }

  if (server) {
    server.close(() => {
      log.info("Server closed.");
      process.exit(0);
    });
  } else {
    log.warn("Server instance is not found. Exiting...");
    process.exit(0);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

if (config.app.env === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(config.app.port, async () => {
  log.info(`Starting app on ${config.app.env}...`);
  log.info(`Server is running on http://${config.app.host}:${config.app.port}`);

  try {
    await dbConnection();
  } catch (error) {
    log.error("Failed to connect to the database.");
    shutdown("Database error");
  }
});
