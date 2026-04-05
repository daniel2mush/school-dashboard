import { prisma } from "../clients/prismaClient.js";
import AppError from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendJson } from "../utils/sendJson.js";

// Fetch classes (Year Groups) assigned to this teacher
export const GetTeacherClasses = asyncHandler(async (req, res) => {
  const { userId, role } = req.user;

  if (role !== "TEACHER") {
    throw new AppError("Unauthorized access. Teachers only.", 403);
  }

  const teacher = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      taughtYearGroups: {
        include: {
          subjects: true,
          students: {
            select: {
              id: true,
              name: true,
              email: true,
              attendance: { take: 10, orderBy: { date: "desc" } },
              grades: { include: { subject: true } }
            }
          }
        }
      }
    }
  });

  if (!teacher) {
    throw new AppError("Teacher profile not found", 404);
  }

  return sendJson(
    res,
    200,
    true,
    "Teacher classes fetched successfully",
    teacher.taughtYearGroups
  );
});

// Submit a grade for a student
export const SubmitGrades = asyncHandler(async (req, res) => {
  const { userId, role } = req.user;
  const { studentId, subjectId, score, grade } = req.body;

  if (role !== "TEACHER") {
    throw new AppError("Unauthorized access. Teachers only.", 403);
  }

  if (!studentId || !subjectId || score === undefined || !grade) {
    throw new AppError("Missing required fields: studentId, subjectId, score, grade", 400);
  }

  const newGrade = await prisma.grade.create({
    data: {
      score: Number(score),
      grade: String(grade),
      studentId: Number(studentId),
      subjectId: Number(subjectId),
      teacherId: userId
    }
  });

  return sendJson(res, 201, true, "Grade submitted successfully", newGrade);
});

// Submit attendance for a student
export const SubmitAttendance = asyncHandler(async (req, res) => {
  const { role } = req.user;
  const { studentId, status, date } = req.body;

  if (role !== "TEACHER") {
    throw new AppError("Unauthorized access. Teachers only.", 403);
  }

  if (!studentId || !status) {
    throw new AppError("Missing required fields: studentId, status", 400);
  }

  const newAttendance = await prisma.attendance.create({
    data: {
      studentId: Number(studentId),
      status: status, // "P", "A", "T", "H"
      date: date ? new Date(date) : new Date()
    }
  });

  return sendJson(res, 201, true, "Attendance marked successfully", newAttendance);
});
