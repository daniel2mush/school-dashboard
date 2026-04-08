-- AlterTable
ALTER TABLE "Fee" DROP COLUMN "paid",
ADD COLUMN "title" TEXT NOT NULL DEFAULT '',
ADD COLUMN "description" TEXT;

ALTER TABLE "Fee" ALTER COLUMN "title" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Grade"
ADD COLUMN "assignmentAvg" DOUBLE PRECISION,
ADD COLUMN "midterm" DOUBLE PRECISION,
ADD COLUMN "projectFinal" DOUBLE PRECISION,
ADD COLUMN "test" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "score" DROP NOT NULL,
ALTER COLUMN "grade" DROP NOT NULL;

ALTER TABLE "Grade" ALTER COLUMN "test" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Timetable"
ADD COLUMN "teacherId" INTEGER;

-- AlterTable
ALTER TABLE "YearGroup"
ADD COLUMN "capacity" INTEGER;

-- CreateTable
CREATE TABLE "FeePayment" (
    "id" SERIAL NOT NULL,
    "feeId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "amountPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amountInWords" TEXT,
    "isFullyPaid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeePayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Material" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "subjectId" INTEGER NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "yearGroupId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FeePayment_feeId_studentId_key" ON "FeePayment"("feeId", "studentId");

-- AddForeignKey
ALTER TABLE "FeePayment" ADD CONSTRAINT "FeePayment_feeId_fkey" FOREIGN KEY ("feeId") REFERENCES "Fee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeePayment" ADD CONSTRAINT "FeePayment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_yearGroupId_fkey" FOREIGN KEY ("yearGroupId") REFERENCES "YearGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timetable" ADD CONSTRAINT "Timetable_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
