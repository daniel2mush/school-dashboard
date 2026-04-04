import AppError from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";
import { sendJson } from "../utils/sendJson.js";
import { User } from "../types/Types.js";

export const AuthenticateRequest = asyncHandler(async (req, res, next) => {
  const headers = req.headers["authorization"];
  const token = headers?.split(" ")[1];

  if (!token) {
    throw new AppError(
      "Authrization required, please login and try again",
      401,
    );
  }

  logger.error(token);

  try {
    const decode = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
    req.user = decode as User;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      logger.warn("Access token expired");
      return sendJson(
        res,
        401,
        false,
        "Token has expired. Please login again.",
      );
    }

    if (err instanceof jwt.JsonWebTokenError) {
      logger.warn("Invalid JWT signature or malformed token");
      return sendJson(res, 401, false, "Invalid token.");
    }

    // Fallback for unexpected errors
    logger.error("JWT verification error", err);
    return sendJson(res, 401, false, "Authentication failed.");
  }
});
