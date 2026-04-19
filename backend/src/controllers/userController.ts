import { prisma } from "../clients/prismaClient.js";
import { supabase } from "../clients/superbaseClient.js";
import { TargetType } from "../../generated/prisma/index.js";
import AppError from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendJson } from "../utils/sendJson.js";
import { ensureSchoolSettingsTable } from "../utils/ensureSchoolSettings.js";

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
              payments: {
                where: { studentId: userId },
              },
            } as any,
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
        orderBy: { date: "desc" },
      },
      reportSummaries: {
        take: 1,
        orderBy: { updatedAt: "desc" },
        include: {
          teacher: {
            select: { id: true, name: true, email: true },
          },
          yearGroup: true,
        },
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

  // Resolve the audience scope for the current user.
  let studentYearGroupId: number | null = null;
  let teacherYearGroupIds: number[] = [];

  if (role === "STUDENT") {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { enrolledYearGroupId: true },
    });
    studentYearGroupId = user?.enrolledYearGroupId || null;
  }

  if (role === "TEACHER") {
    const teacher = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        taughtYearGroups: {
          select: {
            id: true,
          },
        },
      },
    });

    teacherYearGroupIds = teacher?.taughtYearGroups.map((yearGroup) => yearGroup.id) || [];
  }

  const announcements = await prisma.announcement.findMany({
    where: {
      OR: [
        { targetType: TargetType.ALL },
        ...(role === "TEACHER"
          ? [
              { targetType: TargetType.TEACHERS_ONLY },
              ...(teacherYearGroupIds.length > 0
                ? [
                    {
                      targetType: TargetType.YEAR_GROUP,
                      targetYearGroupId: { in: teacherYearGroupIds },
                    },
                  ]
                : []),
            ]
          : []),
        ...(studentYearGroupId
          ? [
              {
                targetType: TargetType.YEAR_GROUP,
                targetYearGroupId: studentYearGroupId,
              },
            ]
          : []),
      ],
    },
    include: {
      author: { select: { name: true, role: true } },
      targetYearGroup: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return sendJson(res, 200, true, "Announcements fetched", announcements);
});

export const GetStudentMaterials = asyncHandler(async (req, res) => {
  const { role, userId } = req.user;

  if (role !== "STUDENT") {
    throw new AppError("Unauthorized access. Students only.", 403);
  }

  const student = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      enrolledYearGroupId: true,
    },
  });

  if (!student) {
    throw new AppError("Student profile not found", 404);
  }

  if (!student.enrolledYearGroupId) {
    return sendJson(
      res,
      200,
      true,
      "No class content available for this student yet",
      [],
    );
  }

  const materials = await prisma.material.findMany({
    where: {
      isPublished: true,
      yearGroupId: student.enrolledYearGroupId,
    },
    include: {
      subject: true,
      yearGroup: true,
      teacher: {
        select: {
          id: true,
          name: true,
          email: true,
          initials: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return sendJson(
    res,
    200,
    true,
    "Student materials fetched successfully",
    materials,
  );
});

export const DownloadStudentMaterial = asyncHandler(async (req, res) => {
  const { role, userId } = req.user;
  const { id } = req.params;

  if (role !== "STUDENT") {
    throw new AppError("Unauthorized access. Students only.", 403);
  }

  const student = await prisma.user.findUnique({
    where: { id: userId },
    select: { enrolledYearGroupId: true },
  });

  if (!student?.enrolledYearGroupId) {
    throw new AppError("Student is not assigned to a class", 400);
  }

  const material = await prisma.material.findFirst({
    where: {
      id: Number(id),
      isPublished: true,
      yearGroupId: student.enrolledYearGroupId,
    },
  });

  if (!material) {
    throw new AppError("Material not found", 404);
  }

  const fileName = material.fileUrl.split("/").pop();

  if (!fileName) {
    throw new AppError("Unable to resolve the requested file", 400);
  }

  const { data, error } = await supabase.storage
    .from("School Dashboard")
    .download(fileName);

  if (error || !data) {
    throw new AppError("Failed to download material", 500);
  }

  const fileBuffer = Buffer.from(await data.arrayBuffer());
  const extension = fileName.includes(".") ? fileName.split(".").pop() : "";
  const downloadName = extension
    ? `${material.title}.${extension}`
    : material.title;

  res.setHeader(
    "Content-Type",
    data.type || "application/octet-stream",
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${downloadName.replace(/"/g, "")}"`,
  );
  res.setHeader("Content-Length", fileBuffer.length.toString());

  return res.status(200).send(fileBuffer);
});

export const GetSchoolSettings = asyncHandler(async (_req, res) => {
  await ensureSchoolSettingsTable();

  const settings = await prisma.schoolSetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Sunridge International School",
      description: "Where Eductation meets performance",
      term: "Term 2",
      year: "2026",
      language: "en",
      logo: "/logo.svg",
    },
  });

  return sendJson(res, 200, true, "School settings fetched", settings);
});
