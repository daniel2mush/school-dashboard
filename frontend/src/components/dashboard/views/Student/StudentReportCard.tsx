import { Download, Loader2 } from 'lucide-react'
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
    <div
      className={printMode ? styles.printPage : styles.view}
      style={{
        background: 'linear-gradient(to bottom, #f9f9f9, #e9e9e9)',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      {!printMode && (
        <div className={styles.actionsRow}>
          <button
            className={styles.downloadBtn}
            onClick={handleDownload}
            disabled={pdfGenerating}
            style={{
              backgroundColor: '#007BFF',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              padding: '10px 20px',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = '#0056b3')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = '#007BFF')
            }
          >
            {pdfGenerating ? (
              <Loader2 className={styles.spinner} size={16} />
            ) : (
              <Download size={20} />
            )}
            {pdfGenerating
              ? t('student.report.generatingPdf')
              : t('student.report.downloadPdf')}
          </button>
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
            padding: '20px',
            backgroundColor: '#fff',
            borderRadius: '10px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
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

          <GradeTable
            grades={grades}
            style={{
              marginTop: '20px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              overflow: 'hidden',
            }}
          />

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
