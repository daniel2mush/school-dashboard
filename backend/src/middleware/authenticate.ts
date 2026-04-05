import AppError from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";
import { sendJson } from "../utils/sendJson.js";
import { User } from "../types/Types.js";
import { prisma } from "../clients/prismaClient.js";

export const AuthenticateRequest = asyncHandler(async (req, res, next) => {
  const headers = req.headers["authorization"];
  const token = headers?.split(" ")[1];

  if (!token) {
    throw new AppError(
      "Authrization required, please login and try again",
      401,
    );
  }

  try {
    const decode = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET!,
    ) as User & { userId: number };
    req.user = decode as User;

    const account = await prisma.user.findUnique({
      where: { id: decode.userId },
      select: { status: true },
    });
    if (!account) {
      throw new AppError("User no longer exists", 401);
    }
    if (account.status !== "Active") {
      throw new AppError(
        "Your account has been restricted. Contact an administrator.",
        403,
      );
    }

    next();
  } catch (err) {
    if (err instanceof AppError) throw err;

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
