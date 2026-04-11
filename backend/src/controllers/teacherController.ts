import { prisma } from "../clients/prismaClient.js";
import AppError from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendJson } from "../utils/sendJson.js";
import { startOfDay, endOfDay } from "date-fns";
import logger from "../utils/logger.js";
import { supabase } from "../clients/superbaseClient.js";

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
                  initials: true,
                },
              },
            },
          },
          students: {
            select: {
              id: true,
              name: true,
              email: true,
              attendance: { take: 10, orderBy: { date: "desc" } },
              grades: { include: { subject: true } },
              reportSummaries: {
                take: 1,
                orderBy: { updatedAt: "desc" },
                include: {
                  teacher: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!teacher) {
    throw new AppError("Teacher profile not found", 404);
  }

  return sendJson(
    res,
    200,
    true,
    "Teacher classes fetched successfully",
    teacher.taughtYearGroups,
  );
});

// Submit a grade for a student (Upsert logic)
export const SubmitGrades = asyncHandler(async (req, res) => {
  const { userId, role } = req.user;

  const {
    studentId,
    subjectId,
    score,
    grade,
    midterm,
    assignmentAvg,
    projectFinal,
    performance,
    teacherReport,
    overallGrade,
  } = req.body;

  if (role !== "TEACHER") {
    throw new AppError("Unauthorized access. Teachers only.", 403);
  }

  if (
    studentId === undefined ||
    studentId === null ||
    subjectId === undefined ||
    subjectId === null
  ) {
    throw new AppError("Missing required fields: studentId, subjectId", 400);
  }

  const student = await prisma.user.findUnique({
    where: { id: Number(studentId) },
    select: {
      enrolledYearGroupId: true,
    },
  });

  if (!student) {
    throw new AppError("Student not found", 404);
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
        assignmentAvg:
          assignmentAvg !== undefined ? Number(assignmentAvg) : undefined,
        projectFinal:
          projectFinal !== undefined ? Number(projectFinal) : undefined,
        performance:
          performance !== undefined ? String(performance) : undefined,
        teacherReport:
          teacherReport !== undefined ? String(teacherReport) : undefined,
        teacherId: userId, // Update who last graded it
      },
    });
  } else {
    if (score === undefined || grade === undefined) {
      throw new AppError(
        "Missing required fields for a new grade: score, grade",
        400,
      );
    }

    savedGrade = await prisma.grade.create({
      data: {
        score: Number(score),
        grade: String(grade),
        midterm: midterm !== undefined ? Number(midterm) : null,
        assignmentAvg:
          assignmentAvg !== undefined ? Number(assignmentAvg) : null,
        projectFinal: projectFinal !== undefined ? Number(projectFinal) : null,
        performance: performance !== undefined ? String(performance) : null,
        teacherReport:
          teacherReport !== undefined ? String(teacherReport) : null,
        test: false,
        test2: false,
        studentId: Number(studentId),
        subjectId: Number(subjectId),
        teacherId: userId,
      },
    });
  }

  if (
    overallGrade !== undefined ||
    performance !== undefined ||
    teacherReport !== undefined
  ) {
    const schoolSettings = await prisma.schoolSetting.findFirst({
      orderBy: { updatedAt: "desc" },
      select: { term: true, year: true },
    });

    await (prisma as any).studentReportSummary.upsert({
      where: {
        studentId: Number(studentId),
      },
      update: {
        overallGrade:
          overallGrade !== undefined ? String(overallGrade) : undefined,
        performance:
          performance !== undefined ? String(performance) : undefined,
        teacherComment:
          teacherReport !== undefined ? String(teacherReport) : undefined,
        teacherId: userId,
        yearGroupId: student.enrolledYearGroupId ?? undefined,
      },
      create: {
        studentId: Number(studentId),
        teacherId: userId,
        yearGroupId: student.enrolledYearGroupId ?? null,
        term: schoolSettings?.term ?? null,
        academicYear: schoolSettings?.year ?? null,
        overallGrade: overallGrade !== undefined ? String(overallGrade) : null,
        performance: performance !== undefined ? String(performance) : null,
        teacherComment:
          teacherReport !== undefined ? String(teacherReport) : null,
      },
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

export const DownloadTeacherMaterial = asyncHandler(async (req, res) => {
  const { userId, role } = req.user;
  const { id } = req.params;

  if (role !== "TEACHER") {
    throw new AppError("Unauthorized access. Teachers only.", 403);
  }

  const material = await prisma.material.findUnique({
    where: { id: Number(id) },
  });

  if (!material) {
    throw new AppError("Material not found", 404);
  }

  if (material.teacherId !== userId) {
    throw new AppError("Unauthorized. You do not own this material.", 403);
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

// Upload material
export const UploadMaterial = asyncHandler(async (req, res) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  ];

  const { userId, role } = req.user;
  const { title, description, subjectId, yearGroupId, fileType, isPublished } =
    req.body;

  // 1. Validate required fields FIRST to prevent orphaned files in Supabase
  if (!title || !subjectId) {
    throw new AppError("Missing required fields: title, subjectId", 400);
  }

  const file = req.file;

  if (!file) {
    // 2. Fixed: Throw the error so asyncHandler catches it, rather than just returning it
    throw new AppError("Please upload a file to continue", 400);
  }

  if (!allowedTypes.includes(file.mimetype as string)) {
    throw new AppError(
      "Invalid file type. Only PDF, Word, and PPT allowed.",
      400,
    );
  }

  if (role !== "TEACHER") {
    throw new AppError("Unauthorized access. Teachers only.", 403);
  }

  // 3. Sanitize the filename to prevent URL issues (replaces spaces/special chars with underscores)
  const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
  const fileName = `${Date.now()}-${safeOriginalName}`;

  // 4. Upload to Supabase (Ensure your bucket is named with hyphens, not spaces)
  const { data, error } = await supabase.storage
    .from("School Dashboard")
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
    });

  if (error) {
    throw new AppError(
      `Something went wrong while uploading to Supabase: ${error.message}`,
      500, // Changed to 500 since this is a server/third-party error, not a user error
    );
  }

  // Get the public URL
  const supabaseRes = supabase.storage
    .from("School Dashboard")
    .getPublicUrl(fileName);

  const fileUrl = supabaseRes.data.publicUrl;

  if (!fileUrl) {
    throw new AppError("Failed to generate public URL for the file", 500);
  }

  // 5. Save to Prisma Database
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
    where: { id: Number(id) },
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

// Delete material
export const DeleteMaterial = asyncHandler(async (req, res) => {
  const { userId, role } = req.user;
  const { id } = req.params;

  if (role !== "TEACHER") {
    throw new AppError("Unauthorized access. Teachers only.", 403);
  }

  const material = await prisma.material.findUnique({
    where: { id: Number(id) },
  });

  if (!material) {
    throw new AppError("Material not found", 404);
  }

  if (material.teacherId !== userId) {
    throw new AppError("Unauthorized. You do not own this material.", 403);
  }

  // Delete from Supabase storage
  const fileName = material.fileUrl.split("/").pop();
  if (fileName) {
    await supabase.storage.from("School Dashboard").remove([fileName]);
  }

  // Delete from database
  await prisma.material.delete({
    where: { id: Number(id) },
  });

  return sendJson(res, 200, true, "Material deleted successfully");
});

// Create a new announcement from a teacher
export const CreateTeacherAnnouncement = asyncHandler(async (req, res) => {
  const { userId, role } = req.user;
  const { title, content, targetYearGroupId, targetType, priority } = req.body;

  if (role !== "TEACHER") {
    throw new AppError("Unauthorized access. Teachers only.", 403);
  }

  if (!title || !content || !targetYearGroupId) {
    throw new AppError(
      "Missing required fields: title, content, targetYearGroupId",
      400,
    );
  }

  if (targetType && targetType !== "YEAR_GROUP") {
    throw new AppError(
      "Teachers can only send announcements to their classes.",
      403,
    );
  }

  // Verify the teacher is assigned to the target year group
  const teacher = await prisma.user.findFirst({
    where: {
      id: userId,
      taughtYearGroups: {
        some: { id: Number(targetYearGroupId) },
      },
    },
  });

  if (!teacher) {
    throw new AppError(
      "You are not authorized to send announcements to this year group.",
      403,
    );
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
        },
      },
      targetYearGroup: true,
    },
  });

  return sendJson(
    res,
    201,
    true,
    "Announcement broadcasted successfully",
    announcement,
  );
});
