import { Gender } from "../../generated/prisma/index.js";
import { prisma } from "../clients/prismaClient.js";
import AppError from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendJson } from "../utils/sendJson.js";
import {
  RegistrationTypes,
  ValidateRegistration,
} from "../validations/authValidations.js";

import bcrypt from "bcrypt";

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
  await prisma.user.create({
    data: {
      ...userData,
      password: hashedPassword,
      gender: gender as Gender,
    },
  });

  return sendJson(res, 201, true, "User registration successful");
});
