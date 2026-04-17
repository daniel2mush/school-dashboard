import styles from './StudentReportCard.module.scss'
import { useDashboardTranslation } from '#/components/dashboard/i18n'
import {
  getPerformanceLabel,
  getPerformanceText,
  reportDate,
} from './StudentReportCard.utils'
import type { GradeRecord } from './StudentReportCard.utils'
import {
  User,
  GraduationCap,
  Calendar,
  Hash,
  ShieldCheck,
  TrendingUp,
  Award,
  BookOpen,
  CheckCircle2,
} from 'lucide-react'

const performanceLabelKeyMap: Record<string, string> = {
  'Excellent progress': 'student.report.excellentProgress',
  'Solid performance': 'student.report.solidPerformance',
  'Needs support': 'student.report.needsSupport',
}

type ReportHeaderProps = {
  schoolName: string
  termLabel: string
  logo?: string
}

export function ReportHeader({
  schoolName,
  termLabel,
  logo,
}: ReportHeaderProps) {
  const { t } = useDashboardTranslation()
  return (
    <header className={styles.reportHeader}>
      <div className={styles.schoolIdentity}>
        {logo && (
          <div className={styles.logoWrapper}>
            <img src={logo} alt={schoolName} className={styles.schoolLogo} />
          </div>
        )}
        <div className={styles.identityText}>
          <p className={styles.kicker}>
            {t('student.report.officialStudentReport')}
          </p>
          <h1 className={styles.schoolName}>{schoolName}</h1>
          <p className={styles.schoolMeta}>
            {t('student.report.issuedOn').replace('{date}', reportDate)}
          </p>
        </div>
      </div>

      <div className={styles.reportTitle}>
        <div className={styles.titleBadge}>
          <strong>{t('student.dashboard.reportCard')}</strong>
          <span>{termLabel}</span>
        </div>
        <div className={styles.metaChips}>
          <span>
            <ShieldCheck size={14} style={{ marginRight: 6 }} />
            {t('student.report.verifiedAcademicRecord')}
          </span>
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
        <div className={styles.iconHeading}>
          <User size={20} className={styles.headingIcon} />
          <div>
            <h2>{t('student.report.studentDetails')}</h2>
            <p>{t('student.report.studentDetailsCopy')}</p>
          </div>
        </div>
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
          <span className={styles.statusVerified}>
            <CheckCircle2 size={14} style={{ marginRight: 4 }} />
            {t('student.report.verified')}
          </span>
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
        <div className={styles.metricHeader}>
          <span className={styles.metricLabel}>
            {t('student.report.overallAverage')}
          </span>
          <div className={styles.metricIconBox}>
            <TrendingUp size={18} />
          </div>
        </div>
        <div className={styles.metricValue}>
          <strong>{averageScore}%</strong>
          <p>{t(performanceLabelKeyMap[performanceLabel])}</p>
        </div>
      </div>

      <div className={styles.metricCard}>
        <div className={styles.metricHeader}>
          <span className={styles.metricLabel}>
            {t('student.report.finalGrade')}
          </span>
          <div className={styles.metricIconBox} style={{ color: 'var(--amber)' }}>
            <Award size={18} />
          </div>
        </div>
        <div className={styles.metricValue}>
          <strong>{averageGrade}</strong>
          <p>{overallPerformanceText || t('student.report.computedFromScores')}</p>
        </div>
      </div>

      <div className={styles.metricCard}>
        <div className={styles.metricHeader}>
          <span className={styles.metricLabel}>
            {t('student.report.subjectsGraded')}
          </span>
          <div className={styles.metricIconBox} style={{ color: '#3b82f6' }}>
            <BookOpen size={18} />
          </div>
        </div>
        <div className={styles.metricValue}>
          <strong>{subjectsCount}</strong>
          <p>{t('student.report.subjectsIncluded')}</p>
        </div>
      </div>
    </section>
  )
}


function GradeRow({ grade }: { grade: GradeRecord }) {
  return (
    <tr className={styles.gradeRow}>
      <td className={styles.subjectCell}>
        <div className={styles.subjectInfo}>
          <strong>{grade.subject}</strong>
          <span>{grade.teacher || 'Assigning...'}</span>
        </div>
      </td>
      <td className={styles.scoreCell}>
        <div className={styles.scoreValue}>
          <strong>{grade.score}%</strong>
          <span className={styles.gradeBadge}>{grade.grade}</span>
        </div>
      </td>
      <td className={styles.performanceCell}>
        <div className={styles.performanceWrapper}>
          <div className={styles.performanceText}>
            {getPerformanceText(grade.score, grade.performance)}
          </div>
          <div className={styles.performanceTrack}>
            <div
              className={styles.performanceFill}
              style={{ width: `${grade.score}%` }}
            />
          </div>
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
        <div className={styles.iconHeading}>
          <BookOpen size={20} className={styles.headingIcon} />
          <div>
            <h2>{t('student.report.academicPerformance')}</h2>
            <p>{t('student.report.academicPerformanceCopy')}</p>
          </div>
        </div>
      </div>

      <div className={styles.tableShell}>
        <table className={styles.reportTable}>
          <thead>
            <tr>
              <th>{t('student.report.subject')}</th>
              <th>{t('student.report.score')}</th>
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
                <td colSpan={3} className={styles.emptyRow}>
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
    <section className={styles.remarksPanel}>
      <div className={styles.sectionHeading}>
        <div className={styles.iconHeading}>
          <Award size={20} className={styles.headingIcon} />
          <div>
            <h2>{t('student.report.teacherRemarks')}</h2>
            <p>{t('student.report.teacherRemarksCopy')}</p>
          </div>
        </div>
      </div>

      <div className={styles.remarksBody}>
        {performance && (
          <div className={styles.summaryBadge}>
            <TrendingUp size={14} style={{ marginRight: 6 }} />
            {performance}
          </div>
        )}
        <blockquote className={styles.remarkQuote}>
          <p>"{teacherReport ?? defaultRemark}"</p>
        </blockquote>
      </div>
    </section>
  )
}

export function ReportFooter() {
  const { t } = useDashboardTranslation()
  return (
    <footer className={styles.reportFooter}>
      <div className={styles.footerSeal}>
        <div className={styles.sealCircle}>
          <ShieldCheck size={32} />
        </div>
        <div className={styles.sealText}>
          <strong>{t('student.report.officialSeal')}</strong>
          <span>{t('student.report.approvedBySchool')}</span>
        </div>
      </div>

      <div className={styles.signatures}>
        {[
          t('student.report.classTeacher'),
          t('student.report.principal'),
          t('student.report.parentGuardian'),
        ].map((label) => (
          <div key={label} className={styles.signature}>
            <div className={styles.signatureLine} />
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className={styles.copyright}>
        © {new Date().getFullYear()} {t('student.report.allRightsReserved')}
      </div>
    </footer>
  )
}
