import { prisma } from "../clients/prismaClient.js";
import AppError from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendJson } from "../utils/sendJson.js";
import { startOfDay, endOfDay } from "date-fns";
import logger from "../utils/logger.js";

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
          timetables: {
            include: {
              period: true,
              subject: true,
              teacher: {
                select: {
                  id: true,
                  name: true,
                  initials: true
                }
              }
            }
          },
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

// Submit a grade for a student (Upsert logic)
export const SubmitGrades = asyncHandler(async (req, res) => {
  const { userId, role } = req.user;

  const { studentId, subjectId, score, grade, midterm, assignmentAvg, projectFinal, performance, teacherReport } = req.body;

  if (role !== "TEACHER") {
    throw new AppError("Unauthorized access. Teachers only.", 403);
  }

  if (studentId === undefined || studentId === null || subjectId === undefined || subjectId === null) {
    throw new AppError("Missing required fields: studentId, subjectId", 400);
  }

  // Check if a grade already exists for this student and subject
  const existingGrade = await prisma.grade.findFirst({
    where: {
      studentId: Number(studentId),
      subjectId: Number(subjectId),
    },
  });

  let savedGrade;
  if (existingGrade) {
    savedGrade = await prisma.grade.update({
      where: { id: existingGrade.id },
      data: {
        score: score !== undefined ? Number(score) : undefined,
        grade: grade ? String(grade) : undefined,
        midterm: midterm !== undefined ? Number(midterm) : undefined,
        assignmentAvg: assignmentAvg !== undefined ? Number(assignmentAvg) : undefined,
        projectFinal: projectFinal !== undefined ? Number(projectFinal) : undefined,
        performance: performance ? String(performance) : undefined,
        teacherReport: teacherReport ? String(teacherReport) : undefined,
        teacherId: userId, // Update who last graded it
      },
    });
  } else {
    if (score === undefined || grade === undefined) {
      throw new AppError("Missing required fields for a new grade: score, grade", 400);
    }

    savedGrade = await prisma.grade.create({
      data: {
        score: Number(score),
        grade: String(grade),
        midterm: midterm !== undefined ? Number(midterm) : null,
        assignmentAvg: assignmentAvg !== undefined ? Number(assignmentAvg) : null,
        projectFinal: projectFinal !== undefined ? Number(projectFinal) : null,
        performance: performance ? String(performance) : null,
        teacherReport: teacherReport ? String(teacherReport) : null,
        test: false,
        test2: false,
        studentId: Number(studentId),
        subjectId: Number(subjectId),
        teacherId: userId
      }
    });
  }

  return sendJson(res, 201, true, "Grade saved successfully", savedGrade);
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

// Fetch materials for a teacher
export const GetTeacherMaterials = asyncHandler(async (req, res) => {
  const { userId, role } = req.user;

  if (role !== "TEACHER") {
    throw new AppError("Unauthorized access. Teachers only.", 403);
  }

  const materials = await prisma.material.findMany({
    where: { teacherId: userId },
    include: {
      subject: true,
      yearGroup: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return sendJson(res, 200, true, "Materials fetched successfully", materials);
});

// Upload material
export const UploadMaterial = asyncHandler(async (req, res) => {
  const { userId, role } = req.user;
  const { title, description, fileUrl, subjectId, yearGroupId, fileType, isPublished } = req.body;

  if (role !== "TEACHER") {
    throw new AppError("Unauthorized access. Teachers only.", 403);
  }

  if (!title || !fileUrl || !subjectId) {
    throw new AppError("Missing required fields: title, fileUrl, subjectId", 400);
  }

  const material = await prisma.material.create({
    data: {
      title,
      description,
      fileUrl,
      fileType: fileType || "pdf",
      subjectId: Number(subjectId),
      yearGroupId: yearGroupId ? Number(yearGroupId) : null,
      teacherId: userId,
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
    },
    include: {
      subject: true,
      yearGroup: true,
    },
  });

  return sendJson(res, 201, true, "Material uploaded successfully", material);
});

// Toggle material publication status
export const ToggleMaterialStatus = asyncHandler(async (req, res) => {
  const { userId, role } = req.user;
  const { id } = req.params;
  const { isPublished } = req.body;

  if (role !== "TEACHER") {
    throw new AppError("Unauthorized access. Teachers only.", 403);
  }

  const material = await prisma.material.findUnique({
    where: { id: Number(id) }
  });

  if (!material) {
    throw new AppError("Material not found", 404);
  }

  if (material.teacherId !== userId) {
    throw new AppError("Unauthorized. You do not own this material.", 403);
  }

  const updatedMaterial = await prisma.material.update({
    where: { id: Number(id) },
    data: { isPublished: Boolean(isPublished) },
    include: {
      subject: true,
      yearGroup: true,
    },
  });

  return sendJson(res, 200, true, "Material status updated", updatedMaterial);
});

// Create a new announcement from a teacher
export const CreateTeacherAnnouncement = asyncHandler(async (req, res) => {
  const { userId, role } = req.user;
  const { title, content, targetYearGroupId, targetType, priority } = req.body;

  if (role !== "TEACHER") {
    throw new AppError("Unauthorized access. Teachers only.", 403);
  }

  if (!title || !content || !targetYearGroupId) {
    throw new AppError("Missing required fields: title, content, targetYearGroupId", 400);
  }

  if (targetType && targetType !== "YEAR_GROUP") {
    throw new AppError("Teachers can only send announcements to their classes.", 403);
  }

  // Verify the teacher is assigned to the target year group
  const teacher = await prisma.user.findFirst({
    where: {
      id: userId,
      taughtYearGroups: {
        some: { id: Number(targetYearGroupId) }
      }
    }
  });

  if (!teacher) {
    throw new AppError("You are not authorized to send announcements to this year group.", 403);
  }

  const announcement = await prisma.announcement.create({
    data: {
      title,
      content,
      authorId: userId,
      targetType: "YEAR_GROUP",
      targetYearGroupId: Number(targetYearGroupId),
      priority: priority || "Normal",
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          role: true,
        }
      },
      targetYearGroup: true,
    }
  });

  return sendJson(res, 201, true, "Announcement broadcasted successfully", announcement);
});
