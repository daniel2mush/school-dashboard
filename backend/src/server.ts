import express, { NextFunction, Request, Response } from "express";
import "dotenv/config";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { globalErrorHandler } from "./utils/globalErrorHandler.js";
import logger from "./utils/logger.js";
import authRoute from "./routes/authRoute.js";

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging with Morgan (stream to Winston logger)
app.use(
  morgan("dev", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }),
);

// Routes
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "Sunridge Academy Backend is Online",
    timestamp: new Date().toISOString(),
  });
});

// Placeholder for API routes
app.use("/api/auth", authRoute);

// Global Error Handler (must be at the end)
app.use(globalErrorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  logger.info(
    `Server is running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
  );
});
