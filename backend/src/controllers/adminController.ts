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
  AdminUpdateStudentSchema,
  AdminUpdateStatusSchema,
  AdminUpdateTeacherSchema,
  type AdminCreateStudentInput,
  type AdminCreateTeacherInput,
  type AdminUpdateStudentInput,
  type AdminUpdateTeacherInput,
} from "../validations/adminUserValidations.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

const prismaAny = prisma as any;

// Ensure requesting user is Admin
const checkAdmin = (role: string) => {
  if (role !== "ADMIN") {
    throw new AppError("Unauthorized access. Admin privileges required.", 403);
  }
};

// Overview/Analytics Aggregation
export const GetAdminAnalytics = asyncHandler(async (req, res) => {
  checkAdmin(req.user.role);

  const [
    totalStudents,
    totalTeachers,
    totalYearGroups,
    totalSubjects,
    actionableAttendanceCount,
    presentAttendanceCount,
    yearGroups,
    feePayments,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT", status: "Active" } }),
    prisma.user.count({ where: { role: "TEACHER", status: "Active" } }),
    prisma.yearGroup.count(),
    prisma.subject.count(),
    prisma.attendance.count({
      where: { status: { in: ["P", "A", "T"] } },
    }),
    prisma.attendance.count({ where: { status: "P" } }),
    prisma.yearGroup.findMany({
      select: {
        id: true,
        students: {
          where: { role: "STUDENT", status: "Active" },
          select: { id: true },
        },
        fees: {
          select: { id: true, amount: true },
        },
      },
    }),
    prismaAny.feePayment.findMany({
      select: {
        feeId: true,
        studentId: true,
        amountPaid: true,
        isFullyPaid: true,
        fee: { select: { yearGroupId: true, amount: true } },
      },
    }),
  ]);

  const totalExpectedRevenue = yearGroups.reduce(
    (sum: number, yearGroup: any) =>
      sum +
      yearGroup.fees.reduce(
        (feeSum: number, fee: any) => feeSum + fee.amount * yearGroup.students.length,
        0,
      ),
    0,
  );

  const totalCollectedRevenue = feePayments.reduce(
    (sum: number, payment: any) =>
      sum +
      (payment.isFullyPaid || payment.amountPaid >= payment.fee.amount
        ? payment.fee.amount
        : payment.amountPaid),
    0,
  );

  const yearGroupOutstanding = new Set<number>();
  for (const yearGroup of yearGroups) {
    if (yearGroup.students.length === 0 || yearGroup.fees.length === 0) continue;
    const settledStudentsByFee = new Map<number, Set<number>>();

    feePayments
      .filter((payment: any) => payment.fee.yearGroupId === yearGroup.id)
      .forEach((payment: any) => {
        const isSettled =
          payment.isFullyPaid || payment.amountPaid >= payment.fee.amount;
        if (!isSettled) return;

        const current = settledStudentsByFee.get(payment.feeId) || new Set<number>();
        current.add(payment.studentId);
        settledStudentsByFee.set(payment.feeId, current);
      });

    const hasOutstanding = yearGroup.fees.some(
      (fee) => (settledStudentsByFee.get(fee.id)?.size || 0) < yearGroup.students.length,
    );

    if (hasOutstanding) {
      yearGroupOutstanding.add(yearGroup.id);
    }
  }

  const studentsWithOutstandingFees =
    yearGroupOutstanding.size === 0
      ? 0
      : await prisma.user.count({
          where: {
            role: "STUDENT",
            status: "Active",
            enrolledYearGroupId: { in: [...yearGroupOutstanding] },
          },
        });

  const attendancePresentPct =
    actionableAttendanceCount === 0
      ? null
      : Math.round((presentAttendanceCount / actionableAttendanceCount) * 100);

  const analyticsLine = {
    students: totalStudents,
    teachers: totalTeachers,
    yearGroups: totalYearGroups,
    subjects: totalSubjects,
    totalExpectedRevenue,
    totalCollectedRevenue,
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
      fees: {
        include: {
          payments: true,
        } as any,
      },
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
      targetYearGroupId: targetYearGroupId ? Number(targetYearGroupId) : null,
    },
  });

  return sendJson(
    res,
    201,
    true,
    "Announcement created successfully",
    announcement,
  );
});

const LEVEL_VALUES = new Set<string>(Object.values(Level));

export const CreateYearGroup = asyncHandler(async (req, res) => {
  checkAdmin(req.user.role);
  const { name, level, roomNumber, subjectIds, capacity } = req.body;

  if (!name || typeof name !== "string" || !name.trim()) {
    throw new AppError("Year group name is required", 400);
  }
  if (!level || typeof level !== "string" || !LEVEL_VALUES.has(level)) {
    throw new AppError("A valid level is required", 400);
  }

  const normalizedSubjectIds = Array.isArray(subjectIds)
    ? [...new Set(subjectIds.map((value) => Number(value)).filter(Number.isFinite))]
    : [];

  if (normalizedSubjectIds.length > 0) {
    const linkedSubjects = await prisma.subject.count({
      where: { id: { in: normalizedSubjectIds } },
    });

    if (linkedSubjects !== normalizedSubjectIds.length) {
      throw new AppError("One or more selected subjects were not found", 400);
    }
  }

  const normalizedCapacity =
    capacity === undefined || capacity === null || capacity === ""
      ? null
      : Number(capacity);

  if (
    normalizedCapacity !== null &&
    (!Number.isInteger(normalizedCapacity) || normalizedCapacity <= 0)
  ) {
    throw new AppError("Capacity must be a positive whole number", 400);
  }

  const yearGroup = await prisma.yearGroup.create({
    data: {
      name: name.trim(),
      level: level as Level,
      roomNumber:
        roomNumber && String(roomNumber).trim()
          ? String(roomNumber).trim()
          : null,
      capacity: normalizedCapacity,
      subjects:
        normalizedSubjectIds.length > 0
          ? {
              connect: normalizedSubjectIds.map((id) => ({ id })),
            }
          : undefined,
    },
    include: {
      subjects: true,
    },
  });

  return sendJson(res, 201, true, "Year group created", yearGroup);
});

export const UpdateYearGroup = asyncHandler(async (req, res) => {
  checkAdmin(req.user.role);
  const { id } = req.params;
  const { name, level, roomNumber, capacity } = req.body;

  const yearGroupId = Number(id);
  if (!Number.isFinite(yearGroupId)) {
    throw new AppError("A valid year group ID is required", 400);
  }

  if (!name || typeof name !== "string" || !name.trim()) {
    throw new AppError("Year group name is required", 400);
  }
  if (!level || typeof level !== "string" || !LEVEL_VALUES.has(level)) {
    throw new AppError("A valid level is required", 400);
  }

  const normalizedCapacity =
    capacity === undefined || capacity === null || capacity === ""
      ? null
      : Number(capacity);

  if (
    normalizedCapacity !== null &&
    (!Number.isInteger(normalizedCapacity) || normalizedCapacity <= 0)
  ) {
    throw new AppError("Capacity must be a positive whole number", 400);
  }

  const yearGroup = await prisma.yearGroup.update({
    where: { id: yearGroupId },
    data: {
      name: name.trim(),
      level: level as Level,
      roomNumber:
        typeof roomNumber === "string" && roomNumber.trim()
          ? roomNumber.trim()
          : null,
      capacity: normalizedCapacity,
    },
  });

  return sendJson(res, 200, true, "Year group updated", yearGroup);
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
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "NA";
}

/** One-time password shown to admin after create or reset (never stored). */
function generateAdminTemporaryPassword(): string {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
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
    throw new AppError(
      parsed.error.issues[0]?.message ?? "Invalid status",
      400,
    );
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

export const AdminUpdateUser = asyncHandler(async (req, res) => {
  checkAdmin(req.user.role);
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) throw new AppError("Invalid user id", 400);

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) throw new AppError("User not found", 404);
  if (target.role !== "TEACHER" && target.role !== "STUDENT") {
    throw new AppError("Only teachers and students can be edited here", 400);
  }

  const parsedTeacher =
    target.role === "TEACHER" ? AdminUpdateTeacherSchema.safeParse(req.body) : null;
  const parsedStudent =
    target.role === "STUDENT" ? AdminUpdateStudentSchema.safeParse(req.body) : null;
  const parsed = parsedTeacher ?? parsedStudent;

  if (!parsed?.success) {
    const err = parsedTeacher?.error ?? parsedStudent?.error;
    throw new AppError(err?.issues[0]?.message ?? "Invalid payload", 400);
  }

  const data = parsed.data;
  const emailNorm = data.email.trim().toLowerCase();
  const nameTrim = data.name.trim();

  const emailOwner = await prisma.user.findUnique({ where: { email: emailNorm } });
  if (emailOwner && emailOwner.id !== id) {
    throw new AppError("That email is already registered", 409);
  }

  const updateData: {
    email: string;
    name: string;
    initials: string;
    gender?: Gender;
    phoneNumber: string | null;
    specialization?: string | null;
    enrolledYearGroupId?: number | null;
  } = {
    email: emailNorm,
    name: nameTrim,
    initials: initialsFromName(nameTrim),
    phoneNumber: data.phoneNumber?.trim() || null,
  };

  if (data.gender) {
    updateData.gender = data.gender as Gender;
  }

  if (target.role === "TEACHER") {
    const teacherData = data as AdminUpdateTeacherInput;
    updateData.specialization = teacherData.specialization?.trim() || null;
    updateData.enrolledYearGroupId = null;
  } else {
    const studentData = data as AdminUpdateStudentInput;
    if (studentData.enrolledYearGroupId !== null) {
      const yg = await prisma.yearGroup.findUnique({
        where: { id: studentData.enrolledYearGroupId },
      });
      if (!yg) throw new AppError("Year group not found", 404);
    }
    updateData.enrolledYearGroupId = studentData.enrolledYearGroupId;
    updateData.specialization = null;
  }

  const updated = await prisma.user.update({
    where: { id },
    data: updateData,
    select: userPublicSelect,
  });

  return sendJson(res, 200, true, "User updated", updated);
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

//////

export const CreateSubject = asyncHandler(async (req, res) => {
  checkAdmin(req.user.role);
  const { name, description } = req.body;

  if (!name || typeof name !== "string" || !name.trim()) {
    throw new AppError("Subject name is required", 400);
  }

  const subject = await prisma.subject.create({
    data: {
      name: name.trim(),
      description:
        typeof description === "string" && description.trim()
          ? description.trim()
          : null,
    },
  });

  return sendJson(res, 201, true, "Subject created", subject);
});

export const AssignSubjectToYearGroup = asyncHandler(async (req, res) => {
  checkAdmin(req.user.role);
  const { subjectId, yearGroupId } = req.body;

  const sId = Number(subjectId);
  const ygId = Number(yearGroupId);

  if (!Number.isFinite(sId) || !Number.isFinite(ygId)) {
    throw new AppError("subjectId and yearGroupId are required", 400);
  }

  const [subject, yearGroup] = await Promise.all([
    prisma.subject.findUnique({ where: { id: sId } }),
    prisma.yearGroup.findUnique({ where: { id: ygId } }),
  ]);

  if (!subject) throw new AppError("Subject not found", 404);
  if (!yearGroup) throw new AppError("Year group not found", 404);

  await prisma.yearGroup.update({
    where: { id: ygId },
    data: { subjects: { connect: { id: sId } } },
  });

  return sendJson(res, 200, true, "Subject assigned to year group", {
    subjectId: sId,
    yearGroupId: ygId,
  });
});

export const UnassignSubjectFromYearGroup = asyncHandler(async (req, res) => {
  checkAdmin(req.user.role);
  const { subjectId, yearGroupId } = req.body;

  const sId = Number(subjectId);
  const ygId = Number(yearGroupId);

  if (!Number.isFinite(sId) || !Number.isFinite(ygId)) {
    throw new AppError("subjectId and yearGroupId are required", 400);
  }

  const [subject, yearGroup] = await Promise.all([
    prisma.subject.findUnique({ where: { id: sId } }),
    prisma.yearGroup.findUnique({ where: { id: ygId } }),
  ]);

  if (!subject) throw new AppError("Subject not found", 404);
  if (!yearGroup) throw new AppError("Year group not found", 404);

  await prisma.yearGroup.update({
    where: { id: ygId },
    data: { subjects: { disconnect: { id: sId } } },
  });

  return sendJson(res, 200, true, "Subject unassigned from year group", {
    subjectId: sId,
    yearGroupId: ygId,
  });
});

export const UpdateSubject = asyncHandler(async (req, res) => {
  checkAdmin(req.user.role);
  const { id } = req.params;
  const { name, description } = req.body;

  const sId = Number(id);
  if (!Number.isFinite(sId)) {
    throw new AppError("A valid subject ID is required", 400);
  }

  if (!name || typeof name !== "string" || !name.trim()) {
    throw new AppError("Subject name is required", 400);
  }

  const subject = await prisma.subject.update({
    where: { id: sId },
    data: {
      name: name.trim(),
      description:
        typeof description === "string"
          ? description.trim() || null
          : undefined,
    },
  });

  return sendJson(res, 200, true, "Subject updated", subject);
});

export const DeleteSubject = asyncHandler(async (req, res) => {
  checkAdmin(req.user.role);
  const { id } = req.params;

  const sId = Number(id);
  if (!Number.isFinite(sId)) {
    throw new AppError("A valid subject ID is required", 400);
  }

  const subject = await prisma.subject.findUnique({ where: { id: sId } });
  if (!subject) {
    throw new AppError("Subject not found", 404);
  }

  await prisma.subject.delete({
    where: { id: sId },
  });

  return sendJson(res, 200, true, "Subject deleted", { id: sId });
});

export const GetAllSubjects = asyncHandler(async (req, res) => {
  checkAdmin(req.user.role);

  const subjects = await prisma.subject.findMany({
    include: {
      yearGroups: {
        select: {
          id: true,
          name: true,
          level: true,
        },
        orderBy: [{ level: "asc" }, { name: "asc" }],
      },
      _count: {
        select: {
          yearGroups: true,
          grades: true,
          timetable: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return sendJson(res, 200, true, "Subjects fetched", subjects);
});

export const CreateFee = asyncHandler(async (req, res) => {
  checkAdmin(req.user.role);
  const { yearGroupId, amount, title, description } = req.body;

  const ygId = Number(yearGroupId);
  if (!Number.isFinite(ygId)) {
    throw new AppError("A valid yearGroupId is required", 400);
  }
  if (!amount || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    throw new AppError("A valid amount is required", 400);
  }
  if (!title || typeof title !== "string" || !title.trim()) {
    throw new AppError("Title is required", 400);
  }

  const fee = await prisma.fee.create({
    data: {
      yearGroupId: ygId,
      title: title.trim(),
      description:
        typeof description === "string" && description.trim()
          ? description.trim()
          : null,
      amount: Number(amount),
    },
  });

  return sendJson(res, 201, true, "Fee created", fee);
});

export const GetFeesByYearGroup = asyncHandler(async (req, res) => {
  checkAdmin(req.user.role);
  const { yearGroupId } = req.params;

  const ygId = Number(yearGroupId);
  if (!Number.isFinite(ygId)) {
    throw new AppError("A valid yearGroupId is required", 400);
  }

  const yearGroup = await prisma.yearGroup.findUnique({ where: { id: ygId } });
  if (!yearGroup) {
    throw new AppError("Year group not found", 404);
  }

  const fees = await prisma.fee.findMany({
    where: { yearGroupId: ygId },
    include: {
      payments: {
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        } as any,
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return sendJson(res, 200, true, "Fees fetched for year group", fees);
});

export const UpdateFee = asyncHandler(async (req, res) => {
  checkAdmin(req.user.role);
  const { id } = req.params;
  const { amount, title, description } = req.body;

  const feeId = Number(id);
  if (!Number.isFinite(feeId)) {
    throw new AppError("A valid fee ID is required", 400);
  }

  if (title && (typeof title !== "string" || !title.trim())) {
    throw new AppError("Title cannot be empty", 400);
  }
  if (amount && (!Number.isFinite(Number(amount)) || Number(amount) <= 0)) {
    throw new AppError("A valid amount is required", 400);
  }
  if (description && (typeof description !== "string" || !description.trim())) {
    throw new AppError("Description cannot be empty", 400);
  }

  const updatedFee = await prisma.fee.update({
    where: { id: feeId },
    data: {
      title: title ? title.trim() : undefined,
      description:
        typeof description === "string" ? description.trim() || null : undefined,
      amount: amount ? Number(amount) : undefined,
    },
  });
  return sendJson(res, 200, true, "Fee updated", updatedFee);
});

export const DeleteFee = asyncHandler(async (req, res) => {
  checkAdmin(req.user.role);
  const { id } = req.params;

  const feeId = Number(id);
  if (!Number.isFinite(feeId)) {
    throw new AppError("A valid fee ID is required", 400);
  }

  const fee = await prisma.fee.findUnique({ where: { id: feeId } });
  if (!fee) {
    throw new AppError("Fee not found", 404);
  }

  const paymentCount = await prismaAny.feePayment.count({
    where: { feeId },
  });
  if (paymentCount > 0) {
    throw new AppError("Cannot delete fee with payments already made", 400);
  }

  await prisma.fee.delete({ where: { id: feeId } });

  return sendJson(res, 200, true, "Fee deleted", { id: feeId });
});

export const GetFeeManagementOverview = asyncHandler(async (req, res) => {
  checkAdmin(req.user.role);

  const yearGroups = await prisma.yearGroup.findMany({
    include: {
      students: {
        where: { role: "STUDENT", status: "Active" },
        select: {
          id: true,
          name: true,
          email: true,
        },
        orderBy: { name: "asc" },
      },
      fees: {
        include: {
          payments: {
            include: {
              student: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: { updatedAt: "desc" },
          },
        } as any,
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: [{ level: "asc" }, { name: "asc" }],
  });

  return sendJson(res, 200, true, "Fee management fetched", yearGroups);
});

export const UpsertFeePayment = asyncHandler(async (req, res) => {
  checkAdmin(req.user.role);
  const { feeId, studentId } = req.params;
  const { amountPaid, amountInWords, isFullyPaid } = req.body;

  const parsedFeeId = Number(feeId);
  const parsedStudentId = Number(studentId);
  const parsedAmountPaid = Number(amountPaid);

  if (!Number.isFinite(parsedFeeId) || !Number.isFinite(parsedStudentId)) {
    throw new AppError("A valid fee ID and student ID are required", 400);
  }
  if (!Number.isFinite(parsedAmountPaid) || parsedAmountPaid < 0) {
    throw new AppError("A valid paid amount is required", 400);
  }

  const fee = await prisma.fee.findUnique({
    where: { id: parsedFeeId },
    include: { yearGroup: true },
  });
  if (!fee) {
    throw new AppError("Fee not found", 404);
  }

  const student = await prisma.user.findFirst({
    where: {
      id: parsedStudentId,
      role: "STUDENT",
      enrolledYearGroupId: fee.yearGroupId,
    },
  });
  if (!student) {
    throw new AppError("Student not found in selected year group", 404);
  }

  const effectiveAmountPaid = Boolean(isFullyPaid)
    ? fee.amount
    : parsedAmountPaid;

  if (effectiveAmountPaid > fee.amount) {
    throw new AppError("Paid amount cannot exceed the fee amount", 400);
  }

  const payment = await prismaAny.feePayment.upsert({
    where: {
      feeId_studentId: {
        feeId: parsedFeeId,
        studentId: parsedStudentId,
      },
    },
    update: {
      amountPaid: effectiveAmountPaid,
      amountInWords:
        typeof amountInWords === "string" && amountInWords.trim()
          ? amountInWords.trim()
          : null,
      isFullyPaid: Boolean(isFullyPaid) || effectiveAmountPaid >= fee.amount,
      paidAt: effectiveAmountPaid > 0 ? new Date() : null,
    },
    create: {
      feeId: parsedFeeId,
      studentId: parsedStudentId,
      amountPaid: effectiveAmountPaid,
      amountInWords:
        typeof amountInWords === "string" && amountInWords.trim()
          ? amountInWords.trim()
          : null,
      isFullyPaid: Boolean(isFullyPaid) || effectiveAmountPaid >= fee.amount,
      paidAt: effectiveAmountPaid > 0 ? new Date() : null,
    },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return sendJson(res, 200, true, "Fee payment updated", payment);
});
