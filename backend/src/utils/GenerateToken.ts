import jwt from "jsonwebtoken";
import crypto from "crypto";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "default_access_secret";
const REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "default_refresh_secret";
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || "15m";
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || "7d";

/**
 * Generates a short-lived Access Token for the user.
 * @param userId - The ID of the user to encode in the token.
 * @returns A signed JWT access token.
 */
export const generateAccessToken = (
  userId: number,
  role: string,
  email: string,
  name: string,
): string => {
  return jwt.sign({ userId, role, email, name }, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRY as any,
  });
};

/**
 * Generates a long-lived Refresh Token for the user.
 * @param userId - The ID of the user to encode in the token.
 * @returns A signed JWT refresh token.
 */
export const generateRefreshToken = (
  userId: number,
  role: string,
  email: string,
  name: string,
): string => {
  return jwt.sign({ userId, role, email, name }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRY as any,
  });
};

/**
 * Hashes a token using SHA-256.
 * @param token - The raw token to hash.
 * @returns The hex-encoded hash of the token.
 */
export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
