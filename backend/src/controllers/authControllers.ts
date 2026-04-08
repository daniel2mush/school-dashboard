import { Gender } from "../../generated/prisma/index.js";
import jwt from "jsonwebtoken";
import { prisma } from "../clients/prismaClient.js";
import AppError from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from "../utils/GenerateToken.js";
import { sendJson } from "../utils/sendJson.js";
import {
  ValidateLogin,
  ValidateRegistration,
} from "../validations/authValidations.js";

import bcrypt from "bcrypt";
import logger from "../utils/logger.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (matching JWT_REFRESH_EXPIRY)
};

export const Register = asyncHandler(async (req, res) => {
  const {
    data: validatedData,
    success,
    error,
  } = ValidateRegistration(req.body);

  if (!success || !validatedData) {
    const errorDetails = error?.issues[0].message;
    throw new AppError(
      `Validation error: ${errorDetails || "Invalid data"}`,
      400,
    );
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: validatedData.email },
  });

  if (existingUser) {
    throw new AppError(
      "Email is already in use. Please use a different one.",
      409,
    );
  }

  // Hash password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(validatedData.password, saltRounds);

  const { password, gender, ...userData } = validatedData;

  // Create user
  const user = await prisma.user.create({
    data: {
      ...userData,
      password: hashedPassword,
      gender: gender as Gender,
    },
    select: {
      id: true,
      role: true,
      email: true,
      name: true,
    },
  });

  const accessToken = generateAccessToken(
    user.id,
    user.role,
    user.email,
    user.name,
  );
  const refreshToken = generateRefreshToken(
    user.id,
    user.role,
    user.email,
    user.name,
  );

  // Save refresh token to database
  await prisma.refreshToken.create({
    data: {
      hashedToken: hashToken(refreshToken),
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // Set HTTP-only cookie
  res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

  const data = {
    accessToken,
    user,
  };

  return sendJson(res, 201, true, "User registration successful", data);
});

const studentInclude = {
  enrolledYearGroup: {
    include: {
      subjects: true,
      teachers: {
        select: {
          id: true,
          name: true,
          email: true,
          specialization: true,
        },
      },
      timetables: {
        include: {
          period: true,
          subject: true,
          teacher: {
            select: {
              id: true,
              name: true,
              email: true,
              specialization: true,
            },
          },
        },
      },
      fees: {
        include: {
          payments: true,
        },
      },
    },
  },
  grades: {
    include: {
      subject: true,
      teacher: {
        select: { id: true, name: true, email: true },
      },
    },
    take: 10,
    orderBy: { date: "desc" as const },
  },
  attendance: {
    take: 30,
    orderBy: { date: "desc" as const },
  },
} as any;

export const Login = asyncHandler(async (req, res) => {
  const { success, data, error } = ValidateLogin(req.body);

  if (!success || !data) {
    const errorDetails = error?.issues[0].message;
    throw new AppError(
      `Validation error: ${errorDetails || "Invalid data"}`,
      400,
    );
  }

  // check if the email exist
  const validUser = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
    include: studentInclude,
  });

  if (!validUser) {
    throw new AppError("Invalid email or password", 401);
  }

  // checking the password
  const validPassword = await bcrypt.compare(data.password, validUser.password);

  if (!validPassword) {
    throw new AppError("Invalid email or password", 401);
  }

  if (validUser.status !== "Active") {
    throw new AppError(
      "This account is not active. Contact your administrator.",
      403,
    );
  }

  // generate tokens
  const refreshToken = generateRefreshToken(
    validUser.id,
    validUser.role,
    validUser.email,
    validUser.name,
  );

  const accessToken = generateAccessToken(
    validUser.id,
    validUser.role,
    validUser.email,
    validUser.name,
  );

  // Save refresh token to database
  await prisma.refreshToken.create({
    data: {
      hashedToken: hashToken(refreshToken),
      userId: validUser.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // Set HTTP-only cookie
  res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

  const { password: _, ...userWithoutPassword } = validUser;

  const responseData = {
    accessToken,
    user: userWithoutPassword,
  };

  return sendJson(res, 200, true, "User login successful", responseData);
});

export const Logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    const hashedToken = hashToken(refreshToken);

    // Delete from DB if it exists
    await prisma.refreshToken
      .delete({
        where: { hashedToken },
      })
      .catch(() => {
        /* Ignore error if already deleted or not found */
      });
  }

  // Always clear the cookie
  res.clearCookie("refreshToken", COOKIE_OPTIONS);

  return sendJson(res, 200, true, "User logout successful", {});
});

export const GenerateRefreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new AppError("No refresh token found", 401);
  }

  // 1. Verify JWT cryptographically
  try {
    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || "default_refresh_secret",
    );
  } catch (error) {
    // If JWT is invalid or expired, clear cookie and throw
    res.clearCookie("refreshToken", COOKIE_OPTIONS);
    throw new AppError("Invalid or expired refresh token", 401);
  }

  // 2. Check Database for token
  const hashedToken = hashToken(refreshToken);

  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { hashedToken },
    include: {
      user: {
        include: studentInclude,
      },
    },
  });

  if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
    res.clearCookie("refreshToken", COOKIE_OPTIONS);
    throw new AppError("Refresh token not found or expired", 401);
  }

  const { user } = tokenRecord;

  if (user.status !== "Active") {
    res.clearCookie("refreshToken", COOKIE_OPTIONS);
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    throw new AppError(
      "This account is not active. Contact your administrator.",
      403,
    );
  }

  // 3. Generate a new access token.
  // Keep the same refresh token until logout/expiry so brief retries do not
  // invalidate the session or create a rotation race.
  const newAccessToken = generateAccessToken(
    user.id,
    user.role,
    user.email,
    user.name,
  );

  const { password: _, ...userWithoutPassword } = user;

  const responseData = {
    accessToken: newAccessToken,
    user: userWithoutPassword,
  };

  return sendJson(
    res,
    200,
    true,
    "Refresh token generated successfully",
    responseData,
  );
});
