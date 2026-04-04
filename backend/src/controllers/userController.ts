import { prisma } from "../clients/prismaClient.js";
import AppError from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendJson } from "../utils/sendJson.js";

export const GetUserProfile = asyncHandler(async (req, res) => {
  const { email, userId } = req.user;

  if (!email || !userId) {
    throw new AppError("User not found, please login in and try again", 401);
  }
  const userProfile = await prisma.user.findUnique({
    where: {
      email,
    },
    omit: {
      password: true,
    },
  });

  return sendJson(
    res,
    200,
    true,
    "User profile fetched successfully",
    userProfile,
  );
});
