import { Download, Loader2 } from 'lucide-react'
import { useMemo, useRef } from 'react'
import { useDashboardTranslation } from '#/components/dashboard/i18n'
import useCurrentStudent from '#/components/hooks/useCurrentStudent.ts'
import { useSchoolData } from '#/components/store/SchoolDataStore'
import useUserStore from '#/components/store/UserStore'
import { useGetUserProfile } from '#/components/query/AuthQuery'
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

export function StudentReportCard({
  printMode = false,
}: {
  printMode?: boolean
}) {
  const user = useUserStore().user
  const { data: freshUser, isLoading } = useGetUserProfile(user?.id || 0)
  const currentData = useCurrentStudent(freshUser)
  const { t } = useDashboardTranslation()
  const { school } = useSchoolData()
  const reportRef = useRef<HTMLDivElement>(null)

  const studentGrades = currentData?.studentGrades || []
  const student = currentData?.student
  const yearGroup = currentData?.yearGroup
  const reportSummary = currentData?.reportSummary

  const grades = useMemo(
    () =>
      studentGrades.map((grade: any) => ({
        subject: grade.subject,
        score: grade.score,
        grade: grade.grade,
        overallGrade: grade.overallGrade,
        teacher: grade.teacher,
        performance: grade.performance,
        teacherReport: grade.teacherReport,
      })) as GradeRecord[],
    [studentGrades],
  )

  const totalScore = grades.reduce((sum, grade) => sum + (grade.score || 0), 0)
  const averageScore =
    grades.length > 0 ? Math.round(totalScore / grades.length) : 0
  const summaryGrade = reportSummary?.overallGrade || null
  const summaryPerformance = reportSummary?.performance || null
  const teacherReport = reportSummary?.teacherComment || null
  const averageGrade = summaryGrade || getGradeLetter(averageScore)

  const handleDownload = () => {
    const printUrl = '/student-report-print'
    window.open(printUrl, '_blank', 'noopener,noreferrer')
  }

  if (isLoading) {
    return (
      <div className={styles.loadingState}>
        <Loader2 className={styles.spinner} />
        <span>{t('student.report.loadingReport')}</span>
      </div>
    )
  }

  if (!currentData || !student || !yearGroup) {
    return (
      <div className={styles.emptyState}>
        <p>{t('student.report.noDataAvailable')}</p>
      </div>
    )
  }

  return (
    <div className={printMode ? styles.printPage : styles.view}>
      {!printMode ? (
        <div className={styles.actionsRow}>
          <button className={styles.downloadBtn} onClick={handleDownload}>
            <Download size={20} />
            {t('student.report.downloadPdf')}
          </button>
        </div>
      ) : null}

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
              overallPerformanceText={
                summaryPerformance || t('student.report.computedFromScores')
              }
              subjectsCount={grades.length}
            />
          </div>

          <GradeTable grades={grades} />

          <TeacherRemarks
            studentName={student.name}
            averageScore={averageScore}
            performance={summaryPerformance || undefined}
            teacherReport={teacherReport || undefined}
          />
        </div>

        <ReportFooter />
      </article>
    </div>
  )
}
