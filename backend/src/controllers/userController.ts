import { prisma } from "../clients/prismaClient.js";
import { TargetType } from "../../generated/prisma/index.js";
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
    include: {
      enrolledYearGroup: {
        include: {
          subjects: true,
          fees: true,
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
        orderBy: { date: "desc" },
      },
      attendance: {
        take: 30,
        orderBy: { date: "desc" },
      },
    },
  });

  if (userProfile) {
    const { password: _, ...profileWithoutPassword } = userProfile;
    return sendJson(
      res,
      200,
      true,
      "User profile fetched successfully",
      profileWithoutPassword,
    );
  }

  return sendJson(res, 404, false, "User profile not found", null);
});

// Fetch announcements relevant to the user's role and year group
export const GetAnnouncements = asyncHandler(async (req, res) => {
  const { role, userId } = req.user;

  if (role === "ADMIN") {
    const announcements = await prisma.announcement.findMany({
      include: {
        author: { select: { name: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return sendJson(res, 200, true, "Announcements fetched", announcements);
  }

  // Get user's year group if student
  let userYearGroupId: number | null = null;
  if (role === "STUDENT") {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { enrolledYearGroupId: true },
    });
    userYearGroupId = user?.enrolledYearGroupId || null;
  }

  const announcements = await prisma.announcement.findMany({
    where: {
      OR: [
        { targetType: TargetType.ALL },
        ...(role === "TEACHER"
          ? [{ targetType: TargetType.TEACHERS_ONLY }]
          : []),
        ...(userYearGroupId
          ? [
              {
                targetType: TargetType.YEAR_GROUP,
                targetYearGroupId: userYearGroupId,
              },
            ]
          : []),
      ],
    },
    include: {
      author: { select: { name: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return sendJson(res, 200, true, "Announcements fetched", announcements);
});
