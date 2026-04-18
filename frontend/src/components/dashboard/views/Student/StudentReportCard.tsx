import { Download, Loader2 } from 'lucide-react'
import { Button } from '#/components/ui/Button/Button'
import { useMemo, useRef, useCallback, useState } from 'react'
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

  const [pdfGenerating, setPdfGenerating] = useState(false)

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

  // ---------------------------------------------------------------------------
  // PDF / Print handling
  // ---------------------------------------------------------------------------
  // const handlePrint = useReactToPrint({
  //   content: () => reportRef.current,
  //   documentTitle: `${student?.name ?? 'Student'}-Report`,
  //   onBeforePrint: () => setPdfGenerating(true),
  //   onAfterPrint: () => setPdfGenerating(false),
  //   removeAfterPrint: true,
  // })

  const handleDownload = useCallback(() => {
    setPdfGenerating(true)
    const printUrl = '/student-report-print'
    const printWindow = window.open(printUrl, '_blank', 'noopener,noreferrer')

    const timer = setInterval(() => {
      if (printWindow?.closed) {
        setPdfGenerating(false)
        clearInterval(timer)
      }
    }, 500)

    setTimeout(() => {
      setPdfGenerating(false)
      clearInterval(timer)
    }, 10000)
  }, [])

  // ---------------------------------------------------------------------------

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
      {!printMode && (
        <div className={styles.actionsRow}>
          <Button
            variant="primary"
            size="md"
            onClick={handleDownload}
            disabled={pdfGenerating}
            loading={pdfGenerating}
            fullWidth={false}
          >
            {pdfGenerating ? (
              t('student.report.generatingPdf')
            ) : (
              <>
                <Download size={20} />
                {t('student.report.downloadPdf')}
              </>
            )}
          </Button>
        </div>
      )}

      <article className={styles.reportCard} ref={reportRef}>
        <ReportHeader
          schoolName={school.name || 'School'}
          termLabel={school.term || 'Current Term'}
          logo={school.logo}
        />

        <div
          className={styles.cardBody}
          style={{
            padding: 'var(--spacing-large)',
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-medium)',
            boxShadow: 'var(--shadow-elevation-low)',
          }}
        >
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
