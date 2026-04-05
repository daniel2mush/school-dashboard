import { prisma } from "../clients/prismaClient.js";
import {
  Gender,
  Level,
  Priority,
  Role,
  TargetType,
} from "../../generated/prisma/index.js";
import AppError from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendJson } from "../utils/sendJson.js";
import {
  AdminCreateStudentSchema,
  AdminCreateTeacherSchema,
  AdminUpdateStatusSchema,
  type AdminCreateStudentInput,
  type AdminCreateTeacherInput,
} from "../validations/adminUserValidations.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

// Ensure requesting user is Admin
const checkAdmin = (role: string) => {
  if (role !== "ADMIN") {
    throw new AppError("Unauthorized access. Admin privileges required.", 403);
  }
};

// Overview/Analytics Aggregation
export const GetAdminAnalytics = asyncHandler(async (req, res) => {
  checkAdmin(req.user.role);

  // Run aggregations concurrently
  const [
    totalStudents,
    totalTeachers,
    totalYearGroups,
    totalSubjects,
    feeData,
    actionableAttendanceCount,
    presentAttendanceCount,
    feeRows,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT", status: "Active" } }),
    prisma.user.count({ where: { role: "TEACHER", status: "Active" } }),
    prisma.yearGroup.count(),
    prisma.subject.count(),
    prisma.fee.aggregate({
      _sum: {
        amount: true,
        paid: true,
      },
    }),
    prisma.attendance.count({
      where: { status: { in: ["P", "A", "T"] } },
    }),
    prisma.attendance.count({ where: { status: "P" } }),
    prisma.fee.findMany({
      select: { yearGroupId: true, amount: true, paid: true },
    }),
  ]);

  const yearGroupIdsWithOutstandingFees = [
    ...new Set(
      feeRows.filter((f) => f.paid < f.amount).map((f) => f.yearGroupId),
    ),
  ];

  const studentsWithOutstandingFees =
    yearGroupIdsWithOutstandingFees.length === 0
      ? 0
      : await prisma.user.count({
          where: {
            role: "STUDENT",
            status: "Active",
            enrolledYearGroupId: { in: yearGroupIdsWithOutstandingFees },
          },
        });

  const attendancePresentPct =
    actionableAttendanceCount === 0
      ? null
      : Math.round(
          (presentAttendanceCount / actionableAttendanceCount) * 100,
        );

  const analyticsLine = {
    students: totalStudents,
    teachers: totalTeachers,
    yearGroups: totalYearGroups,
    subjects: totalSubjects,
    totalExpectedRevenue: feeData._sum.amount || 0,
    totalCollectedRevenue: feeData._sum.paid || 0,
    attendancePresentPct,
    studentsWithOutstandingFees,
  };

  return sendJson(res, 200, true, "Analytics fetched", analyticsLine);
});

// Get all users directory
export const GetAllUsers = asyncHandler(async (req, res) => {
  checkAdmin(req.user.role);

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      specialization: true,
      createdAt: true,
      enrolledYearGroupId: true,
      enrolledYearGroup: { select: { id: true, name: true } },
    },
    orderBy: { name: "asc" },
  });

  return sendJson(res, 200, true, "Users fetched", users);
});

// Get all structure mapping (Year Groups + Subjects + Fees + Timetables)
export const GetSchoolStructure = asyncHandler(async (req, res) => {
  checkAdmin(req.user.role);

  const yearGroups = await prisma.yearGroup.findMany({
    include: {
      subjects: true,
      fees: true,
      teachers: {
        select: {
          id: true,
          name: true,
          email: true,
          specialization: true,
        },
        orderBy: { name: "asc" },
      },
      timetables: {
        include: {
          period: true,
          subject: true,
        },
      },
      _count: {
        select: { students: true, teachers: true },
      },
    },
    orderBy: [{ level: "asc" }, { name: "asc" }],
  });

  return sendJson(res, 200, true, "Structure fetched", yearGroups);
});

// Create a new announcement
export const CreateAnnouncement = asyncHandler(async (req, res) => {
  checkAdmin(req.user.role);
  const { title, content, priority, targetType, targetYearGroupId } = req.body;

  if (!title || !content) {
    throw new AppError("Title and content are required", 400);
  }

  const announcement = await prisma.announcement.create({
    data: {
      title,
      content,
      priority: priority || "Normal",
      authorId: req.user.userId,
      targetType: targetType || "ALL",
      targetYearGroupId: targetYearGroupId ? Number(targetYearGroupId) : null
    }
  });

  return sendJson(res, 201, true, "Announcement created successfully", announcement);
});

const LEVEL_VALUES = new Set<string>(Object.values(Level));

export const CreateYearGroup = asyncHandler(async (req, res) => {
  checkAdmin(req.user.role);
  const { name, level, roomNumber } = req.body;

  if (!name || typeof name !== "string" || !name.trim()) {
    throw new AppError("Year group name is required", 400);
  }
  if (!level || typeof level !== "string" || !LEVEL_VALUES.has(level)) {
    throw new AppError("A valid level is required", 400);
  }

  const yearGroup = await prisma.yearGroup.create({
    data: {
      name: name.trim(),
      level: level as Level,
      roomNumber:
        roomNumber && String(roomNumber).trim()
          ? String(roomNumber).trim()
          : null,
    },
  });

  return sendJson(res, 201, true, "Year group created", yearGroup);
});

export const AssignTeacherToYearGroup = asyncHandler(async (req, res) => {
  checkAdmin(req.user.role);
  const { yearGroupId, teacherId } = req.body;

  const ygId = Number(yearGroupId);
  const tId = Number(teacherId);
  if (!Number.isFinite(ygId) || !Number.isFinite(tId)) {
    throw new AppError("yearGroupId and teacherId are required", 400);
  }

  const [yearGroup, teacher] = await Promise.all([
    prisma.yearGroup.findUnique({ where: { id: ygId } }),
    prisma.user.findFirst({
      where: { id: tId, role: "TEACHER", status: "Active" },
    }),
  ]);

  if (!yearGroup) throw new AppError("Year group not found", 404);
  if (!teacher) throw new AppError("Active teacher not found", 404);

  await prisma.yearGroup.update({
    where: { id: ygId },
    data: { teachers: { connect: { id: tId } } },
  });

  return sendJson(res, 200, true, "Teacher assigned to year group", {
    yearGroupId: ygId,
    teacherId: tId,
  });
});

export const UnassignTeacherFromYearGroup = asyncHandler(async (req, res) => {
  checkAdmin(req.user.role);
  const { yearGroupId, teacherId } = req.body;

  const ygId = Number(yearGroupId);
  const tId = Number(teacherId);
  if (!Number.isFinite(ygId) || !Number.isFinite(tId)) {
    throw new AppError("yearGroupId and teacherId are required", 400);
  }

  const yearGroup = await prisma.yearGroup.findUnique({ where: { id: ygId } });
  if (!yearGroup) throw new AppError("Year group not found", 404);

  await prisma.yearGroup.update({
    where: { id: ygId },
    data: { teachers: { disconnect: { id: tId } } },
  });

  return sendJson(res, 200, true, "Teacher removed from year group", {
    yearGroupId: ygId,
    teacherId: tId,
  });
});

export const MoveStudentYearGroup = asyncHandler(async (req, res) => {
  checkAdmin(req.user.role);
  const { studentId, yearGroupId } = req.body;

  const sId = Number(studentId);
  const ygId = Number(yearGroupId);
  if (!Number.isFinite(sId) || !Number.isFinite(ygId)) {
    throw new AppError("studentId and yearGroupId are required", 400);
  }

  const [student, yearGroup] = await Promise.all([
    prisma.user.findFirst({
      where: { id: sId, role: "STUDENT", status: "Active" },
    }),
    prisma.yearGroup.findUnique({ where: { id: ygId } }),
  ]);

  if (!student) throw new AppError("Active student not found", 404);
  if (!yearGroup) throw new AppError("Year group not found", 404);
  if (student.enrolledYearGroupId === ygId) {
    throw new AppError("Student is already in this year group", 400);
  }

  const updated = await prisma.user.update({
    where: { id: sId },
    data: { enrolledYearGroupId: ygId },
    select: {
      id: true,
      name: true,
      enrolledYearGroupId: true,
      enrolledYearGroup: { select: { id: true, name: true } },
    },
  });

  return sendJson(res, 200, true, "Student moved to year group", updated);
});

function initialsFromName(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "NA";
}

/** One-time password shown to admin after create or reset (never stored). */
function generateAdminTemporaryPassword(): string {
  const chars =
    "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(16);
  let s = "";
  for (let i = 0; i < 16; i++) s += chars[bytes[i]! % chars.length];
  return s;
}

const userPublicSelect = {
  id: true,
  email: true,
  name: true,
  initials: true,
  role: true,
  status: true,
  gender: true,
  phoneNumber: true,
  specialization: true,
  enrolledYearGroupId: true,
  enrolledYearGroup: { select: { id: true, name: true } },
  createdAt: true,
} as const;

export const AdminCreateUser = asyncHandler(async (req, res) => {
  checkAdmin(req.user.role);
  const body = req.body;
  const role = body?.role as string;

  if (role !== "TEACHER" && role !== "STUDENT") {
    throw new AppError("role must be TEACHER or STUDENT", 400);
  }

  const parsedTeacher =
    role === "TEACHER" ? AdminCreateTeacherSchema.safeParse(body) : null;
  const parsedStudent =
    role === "STUDENT" ? AdminCreateStudentSchema.safeParse(body) : null;

  const parsed = parsedTeacher ?? parsedStudent;
  if (!parsed?.success) {
    const err = parsedTeacher?.error ?? parsedStudent?.error;
    const msg = err?.issues[0]?.message ?? "Invalid payload";
    throw new AppError(`Validation: ${msg}`, 400);
  }

  const data = parsed.data;
  const existing = await prisma.user.findUnique({
    where: { email: data.email.trim().toLowerCase() },
  });
  if (existing) {
    throw new AppError("That email is already registered", 409);
  }

  const plainPassword = data.password;
  const hashedPassword = await bcrypt.hash(plainPassword, 12);
  const emailNorm = data.email.trim().toLowerCase();
  const nameTrim = data.name.trim();
  const gender = (data.gender ?? "Other") as Gender;

  let specialization: string | null = null;
  let enrolledYearGroupId: number | null = null;

  if (role === "TEACHER") {
    const t = data as AdminCreateTeacherInput;
    specialization = t.specialization?.trim() || null;
  } else {
    const s = data as AdminCreateStudentInput;
    const yg = await prisma.yearGroup.findUnique({
      where: { id: s.enrolledYearGroupId },
    });
    if (!yg) throw new AppError("Year group not found", 404);
    enrolledYearGroupId = s.enrolledYearGroupId;
  }

  const user = await prisma.user.create({
    data: {
      email: emailNorm,
      password: hashedPassword,
      name: nameTrim,
      initials: initialsFromName(nameTrim),
      gender,
      role: role === "TEACHER" ? Role.TEACHER : Role.STUDENT,
      status: "Active",
      phoneNumber: data.phoneNumber?.trim() || null,
      specialization,
      enrolledYearGroupId,
    },
    select: userPublicSelect,
  });

  return sendJson(res, 201, true, "Account created", {
    user,
    temporaryPassword: plainPassword,
  });
});

export const AdminUpdateUserStatus = asyncHandler(async (req, res) => {
  checkAdmin(req.user.role);
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) throw new AppError("Invalid user id", 400);

  const parsed = AdminUpdateStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message ?? "Invalid status", 400);
  }
  const { status } = parsed.data;

  if (id === req.user.userId && status !== "Active") {
    throw new AppError("You cannot restrict your own account", 400);
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) throw new AppError("User not found", 404);

  const updated = await prisma.user.update({
    where: { id },
    data: { status },
    select: userPublicSelect,
  });

  if (status !== "Active") {
    await prisma.refreshToken.deleteMany({ where: { userId: id } });
  }

  return sendJson(res, 200, true, "Status updated", updated);
});

export const AdminResetUserPassword = asyncHandler(async (req, res) => {
  checkAdmin(req.user.role);
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) throw new AppError("Invalid user id", 400);

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) throw new AppError("User not found", 404);
  if (target.role === "ADMIN" && id !== req.user.userId) {
    // allow admin resetting another admin? optional - allow for super flexibility
  }

  const temporaryPassword = generateAdminTemporaryPassword();
  const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

  await prisma.$transaction([
    prisma.refreshToken.deleteMany({ where: { userId: id } }),
    prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    }),
  ]);

  return sendJson(res, 200, true, "Password reset — share once with the user", {
    email: target.email,
    temporaryPassword,
  });
});

export const AdminDeleteUser = asyncHandler(async (req, res) => {
  checkAdmin(req.user.role);
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) throw new AppError("Invalid user id", 400);

  if (id === req.user.userId) {
    throw new AppError("You cannot delete your own account", 400);
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) throw new AppError("User not found", 404);

  if (target.role === "ADMIN") {
    const admins = await prisma.user.count({ where: { role: "ADMIN" } });
    if (admins <= 1) {
      throw new AppError("Cannot delete the only administrator account", 400);
    }
  }

  const ann = await prisma.announcement.count({ where: { authorId: id } });
  if (ann > 0) {
    throw new AppError(
      "This user authored announcements. Remove or reassign them first.",
      400,
    );
  }

  const gradesAsTeacher = await prisma.grade.count({
    where: { teacherId: id },
  });
  if (gradesAsTeacher > 0) {
    throw new AppError(
      "This user has recorded grades. Reassign or remove those grades first.",
      400,
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.refreshToken.deleteMany({ where: { userId: id } });

    if (target.role === "TEACHER" || target.role === "ADMIN") {
      await tx.user.update({
        where: { id },
        data: { taughtYearGroups: { set: [] } },
      });
    }

    if (target.role === "STUDENT") {
      await tx.attendance.deleteMany({ where: { studentId: id } });
      await tx.grade.deleteMany({ where: { studentId: id } });
    }

    await tx.user.delete({ where: { id } });
  });

  return sendJson(res, 200, true, "User removed", { id });
});
