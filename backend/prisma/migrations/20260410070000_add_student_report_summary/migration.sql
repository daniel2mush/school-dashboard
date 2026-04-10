-- CreateTable
CREATE TABLE "StudentReportSummary" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "yearGroupId" INTEGER,
    "term" TEXT,
    "academicYear" TEXT,
    "overallGrade" TEXT,
    "performance" TEXT,
    "teacherComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentReportSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentReportSummary_studentId_key" ON "StudentReportSummary"("studentId");

-- AddForeignKey
ALTER TABLE "StudentReportSummary" ADD CONSTRAINT "StudentReportSummary_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentReportSummary" ADD CONSTRAINT "StudentReportSummary_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentReportSummary" ADD CONSTRAINT "StudentReportSummary_yearGroupId_fkey" FOREIGN KEY ("yearGroupId") REFERENCES "YearGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
