import { Download } from 'lucide-react'
import { useMemo, useRef } from 'react'
import useCurrentStudent from '#/components/hooks/useCurrentStudent.ts'
import { useSchoolData } from '#/components/providers/SchoolDataProvider'
import styles from './StudentReportCard.module.scss'
import {
  GradeTable,
  ReportFooter,
  ReportHeader,
  ReportMetricsCard,
  StudentDetailsCard,
  TeacherRemarks,
} from './StudentReportCard.sections'
import { getGradeLetter } from './StudentReportCard.utils'
import type { GradeRecord } from './StudentReportCard.utils'

export function StudentReportCard() {
  const currentData = useCurrentStudent()
  const { school } = useSchoolData()
  const reportRef = useRef<HTMLDivElement>(null)

  if (!currentData) return null

  const { student, studentGrades, yearGroup } = currentData
  const grades = useMemo(
    () =>
      studentGrades.map((grade: any) => ({
        subject: grade.subject,
        score: grade.score,
        grade: grade.grade,
        teacher: grade.teacher,
        performance: grade.performance,
        teacherReport: grade.teacherReport,
      })) as GradeRecord[],
    [studentGrades],
  )

  const totalScore = grades.reduce((sum, grade) => sum + (grade.score || 0), 0)
  const averageScore =
    grades.length > 0 ? Math.round(totalScore / grades.length) : 0
  const averageGrade = getGradeLetter(averageScore)
  const teacherReport = grades.find(
    (grade) => grade.teacherReport,
  )?.teacherReport

  const handleDownload = () => {
    window.print()
  }

  return (
    <div className={styles.view}>
      <div className={styles.actionsRow}>
        <button className={styles.downloadBtn} onClick={handleDownload}>
          <Download size={20} />
          Download PDF
        </button>
      </div>

      <article className={styles.reportCard} ref={reportRef}>
        <ReportHeader
          schoolName={school.name || 'School'}
          termLabel={school.term || 'Current Term'}
        />

        <div className={styles.cardBody}>
          <div className={styles.overviewGrid}>
            <StudentDetailsCard
              studentName={student.name}
              yearGroup={yearGroup.name}
              studentId={`#STU-${student.id.toString().padStart(4, '0')}`}
              termLabel={school.term || 'Current Term'}
            />

            <ReportMetricsCard
              averageScore={averageScore}
              averageGrade={averageGrade}
              subjectsCount={grades.length}
            />
          </div>

          <GradeTable grades={grades} />

          <TeacherRemarks
            studentName={student.name}
            averageScore={averageScore}
            teacherReport={teacherReport}
          />
        </div>

        <ReportFooter />
      </article>
    </div>
  )
}
