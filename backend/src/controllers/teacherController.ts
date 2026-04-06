import { prisma } from "../clients/prismaClient.js";
import AppError from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendJson } from "../utils/sendJson.js";
import { startOfDay, endOfDay } from "date-fns";

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

// Submit attendance for a student (Upsert logic)
export const SubmitAttendance = asyncHandler(async (req, res) => {
  const { role } = req.user;
  const { studentId, status, date } = req.body;

  if (role !== "TEACHER" && role !== "ADMIN") {
    throw new AppError("Unauthorized access.", 403);
  }

  if (!studentId || !status) {
    throw new AppError("Missing required fields: studentId, status", 400);
  }

  const attendanceDate = date ? new Date(date) : new Date();
  
  // Find if an attendance record already exists for this student on this day
  const existingAttendance = await prisma.attendance.findFirst({
    where: {
      studentId: Number(studentId),
      date: {
        gte: startOfDay(attendanceDate),
        lte: endOfDay(attendanceDate),
      },
    },
  });

  let attendance;
  if (existingAttendance) {
    attendance = await prisma.attendance.update({
      where: { id: existingAttendance.id },
      data: {
        status: status, // "P", "A", "T", "H"
        updatedAt: new Date(),
      },
    });
  } else {
    attendance = await prisma.attendance.create({
      data: {
        studentId: Number(studentId),
        status: status,
        date: attendanceDate,
      },
    });
  }

  return sendJson(res, 201, true, "Attendance marked successfully", attendance);
});
