// utils/logger.ts
import winston from "winston";

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  // Common formats that all transports should use
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat()
  ),
  transports: [
    // 1. Console: Pretty, colorized, and simple
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple() // simple() works here because the global format didn't stringify yet
      ),
    }),
    // 2. Files: Strictly JSON for easier parsing later
    new winston.transports.File({ 
      filename: "error.log", 
      level: "error",
      format: winston.format.json() 
    }),
    new winston.transports.File({ 
      filename: "combined.log",
      format: winston.format.json() 
    }),
  ],
});

export default logger;