import styles from './StudentReportCard.module.scss'
import { useDashboardTranslation } from '#/components/dashboard/i18n'
import {
  getPerformanceLabel,
  getPerformanceText,
  reportDate,
} from './StudentReportCard.utils'
import type { GradeRecord } from './StudentReportCard.utils'

const performanceLabelKeyMap: Record<string, string> = {
  'Excellent progress': 'student.report.excellentProgress',
  'Solid performance': 'student.report.solidPerformance',
  'Needs support': 'student.report.needsSupport',
}

type ReportHeaderProps = {
  schoolName: string
  termLabel: string
}

export function ReportHeader({ schoolName, termLabel }: ReportHeaderProps) {
  const { t } = useDashboardTranslation()
  return (
    <header className={styles.reportHeader}>
      <div className={styles.schoolIdentity}>
        <p className={styles.kicker}>
          {t('student.report.officialStudentReport')}
        </p>
        <h1 className={styles.schoolName}>{schoolName}</h1>
        <p className={styles.schoolMeta}>
          {t('student.report.issuedOn').replace('{date}', reportDate)}
        </p>
      </div>

      <div className={styles.reportTitle}>
        <strong>{t('student.dashboard.reportCard')}</strong>
        <span>{termLabel}</span>
        <div className={styles.metaChips}>
          <span>{t('student.report.verifiedAcademicRecord')}</span>
          <span>{t('student.report.studentCopy')}</span>
        </div>
      </div>
    </header>
  )
}

type StudentDetailsProps = {
  studentName: string
  yearGroup: string
  studentId: string
  termLabel: string
}

export function StudentDetailsCard({
  studentName,
  yearGroup,
  studentId,
  termLabel,
}: StudentDetailsProps) {
  const { t } = useDashboardTranslation()
  return (
    <section className={styles.panel}>
      <div className={styles.sectionHeading}>
        <h2>{t('student.report.studentDetails')}</h2>
        <p>{t('student.report.studentDetailsCopy')}</p>
      </div>

      <div className={styles.studentDetails}>
        <div className={styles.detailItem}>
          <label>{t('student.report.studentName')}</label>
          <span>{studentName}</span>
        </div>
        <div className={styles.detailItem}>
          <label>{t('student.report.yearGroup')}</label>
          <span>{yearGroup}</span>
        </div>
        <div className={styles.detailItem}>
          <label>{t('student.report.term')}</label>
          <span>{termLabel}</span>
        </div>
        <div className={styles.detailItem}>
          <label>{t('student.report.studentId')}</label>
          <span>{studentId}</span>
        </div>
        <div className={styles.detailItem}>
          <label>{t('student.report.dateIssued')}</label>
          <span>{reportDate}</span>
        </div>
        <div className={styles.detailItem}>
          <label>{t('student.report.status')}</label>
          <span>{t('student.report.verified')}</span>
        </div>
      </div>
    </section>
  )
}

type ReportMetricsProps = {
  averageScore: number
  averageGrade: string
  overallPerformanceText: string
  subjectsCount: number
}

export function ReportMetricsCard({
  averageScore,
  averageGrade,
  overallPerformanceText,
  subjectsCount,
}: ReportMetricsProps) {
  const { t } = useDashboardTranslation()
  const performanceLabel = getPerformanceLabel(averageScore)
  return (
    <section className={styles.metricsPanel}>
      <div className={styles.metricCard}>
        <span className={styles.metricLabel}>
          {t('student.report.overallAverage')}
        </span>
        <strong>{averageScore}%</strong>
        <p>{t(performanceLabelKeyMap[performanceLabel])}</p>
      </div>

      <div className={styles.metricCard}>
        <span className={styles.metricLabel}>
          {t('student.report.finalGrade')}
        </span>
        <strong>{averageGrade}</strong>
        <p>{overallPerformanceText || t('student.report.computedFromScores')}</p>
      </div>

      <div className={styles.metricCard}>
        <span className={styles.metricLabel}>
          {t('student.report.subjectsGraded')}
        </span>
        <strong>{subjectsCount}</strong>
        <p>{t('student.report.subjectsIncluded')}</p>
      </div>
    </section>
  )
}

function GradeRow({ grade }: { grade: GradeRecord }) {
  return (
    <tr>
      <td>{grade.subject}</td>
      <td>{grade.score}%</td>
      <td>
        <span className={styles.gradePill}>{grade.grade}</span>
      </td>
      <td>{grade.teacher}</td>
      <td>
        <div className={styles.performanceLabel}>
          {getPerformanceText(grade.score, grade.performance)}
        </div>
        <div className={styles.performanceLine}>
          <div className={styles.fill} style={{ width: `${grade.score}%` }} />
        </div>
      </td>
    </tr>
  )
}

export function GradeTable({ grades }: { grades: GradeRecord[] }) {
  const { t } = useDashboardTranslation()
  return (
    <section className={styles.tablePanel}>
      <div className={styles.sectionHeading}>
        <h2>{t('student.report.academicPerformance')}</h2>
        <p>{t('student.report.academicPerformanceCopy')}</p>
      </div>

      <div className={styles.tableShell}>
        <table className={styles.reportTable}>
          <thead>
            <tr>
              <th>{t('student.report.subject')}</th>
              <th>{t('student.report.score')}</th>
              <th>{t('student.report.grade')}</th>
              <th>{t('student.report.teacher')}</th>
              <th>{t('student.report.performance')}</th>
            </tr>
          </thead>
          <tbody>
            {grades.length > 0 ? (
              grades.map((grade, index) => (
                <GradeRow key={index} grade={grade} />
              ))
            ) : (
              <tr>
                <td colSpan={5} className={styles.emptyRow}>
                  {t('student.report.noGrades')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

type TeacherRemarksProps = {
  studentName: string
  averageScore: number
  performance?: string
  teacherReport?: string
}

export function TeacherRemarks({
  studentName,
  averageScore,
  performance,
  teacherReport,
}: TeacherRemarksProps) {
  const { t } = useDashboardTranslation()
  const defaultRemark =
    averageScore >= 80
      ? t('student.report.remarkExcellent').replace('{name}', studentName)
      : averageScore >= 60
        ? t('student.report.remarkGood').replace('{name}', studentName)
        : t('student.report.remarkNeedsWork').replace('{name}', studentName)

  return (
    <section className={styles.panel}>
      <div className={styles.sectionHeading}>
        <h2>{t('student.report.teacherRemarks')}</h2>
        <p>{t('student.report.teacherRemarksCopy')}</p>
      </div>

      <div className={styles.remarksBody}>
        {performance ? (
          <p className={styles.performanceSummary}>
            <strong>{t('student.report.performance')}:</strong> {performance}
          </p>
        ) : null}
        <p>{teacherReport ?? defaultRemark}</p>
      </div>
    </section>
  )
}

export function ReportFooter() {
  const { t } = useDashboardTranslation()
  return (
    <footer className={styles.reportFooter}>
      <div className={styles.footerNote}>
        <span>{t('student.report.approvedBySchool')}</span>
      </div>

      <div className={styles.signatures}>
        {[
          t('student.report.classTeacher'),
          t('student.report.principal'),
          t('student.report.parentGuardian'),
        ].map((label) => (
          <div key={label} className={styles.signature}>
            <div className={styles.line} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </footer>
  )
}
