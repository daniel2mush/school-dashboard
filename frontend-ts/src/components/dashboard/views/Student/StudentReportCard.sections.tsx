import styles from './StudentReportCard.module.scss'
import {
  getPerformanceLabel,
  getPerformanceText,
  reportDate,
} from './StudentReportCard.utils'
import type { GradeRecord } from './StudentReportCard.utils'

type ReportHeaderProps = {
  schoolName: string
  termLabel: string
}

export function ReportHeader({ schoolName, termLabel }: ReportHeaderProps) {
  return (
    <header className={styles.reportHeader}>
      <div className={styles.schoolIdentity}>
        <p className={styles.kicker}>Official Student Report</p>
        <h1 className={styles.schoolName}>{schoolName}</h1>
        <p className={styles.schoolMeta}>Issued on {reportDate}</p>
      </div>

      <div className={styles.reportTitle}>
        <strong>Report Card</strong>
        <span>{termLabel}</span>
        <div className={styles.metaChips}>
          <span>Verified Academic Record</span>
          <span>Student Copy</span>
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
  return (
    <section className={styles.panel}>
      <div className={styles.sectionHeading}>
        <h2>Student Details</h2>
        <p>Core student and session information for this report.</p>
      </div>

      <div className={styles.studentDetails}>
        <div className={styles.detailItem}>
          <label>Student Name</label>
          <span>{studentName}</span>
        </div>
        <div className={styles.detailItem}>
          <label>Year Group</label>
          <span>{yearGroup}</span>
        </div>
        <div className={styles.detailItem}>
          <label>Term</label>
          <span>{termLabel}</span>
        </div>
        <div className={styles.detailItem}>
          <label>Student ID</label>
          <span>{studentId}</span>
        </div>
        <div className={styles.detailItem}>
          <label>Date Issued</label>
          <span>{reportDate}</span>
        </div>
        <div className={styles.detailItem}>
          <label>Status</label>
          <span>Verified</span>
        </div>
      </div>
    </section>
  )
}

type ReportMetricsProps = {
  averageScore: number
  averageGrade: string
  subjectsCount: number
}

export function ReportMetricsCard({
  averageScore,
  averageGrade,
  subjectsCount,
}: ReportMetricsProps) {
  return (
    <section className={styles.metricsPanel}>
      <div className={styles.metricCard}>
        <span className={styles.metricLabel}>Overall Average</span>
        <strong>{averageScore}%</strong>
        <p>{getPerformanceLabel(averageScore)}</p>
      </div>

      <div className={styles.metricCard}>
        <span className={styles.metricLabel}>Final Grade</span>
        <strong>{averageGrade}</strong>
        <p>Computed from submitted subject scores</p>
      </div>

      <div className={styles.metricCard}>
        <span className={styles.metricLabel}>Subjects Graded</span>
        <strong>{subjectsCount}</strong>
        <p>Subjects included in this term report</p>
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
  return (
    <section className={styles.tablePanel}>
      <div className={styles.sectionHeading}>
        <h2>Academic Performance</h2>
        <p>
          A subject-by-subject summary of scores, grades, and teacher input.
        </p>
      </div>

      <div className={styles.tableShell}>
        <table className={styles.reportTable}>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Score</th>
              <th>Grade</th>
              <th>Teacher</th>
              <th>Performance</th>
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
                  No grades available for this period.
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
  teacherReport?: string
}

export function TeacherRemarks({
  studentName,
  averageScore,
  teacherReport,
}: TeacherRemarksProps) {
  const defaultRemark =
    averageScore >= 80
      ? `${studentName} has demonstrated exceptional academic performance this term. Keep up the excellent work!`
      : averageScore >= 60
        ? `${studentName} has shown good progress. Continued focus on core subjects will yield even better results.`
        : `${studentName} needs to put in more effort in the coming term to improve their overall standing.`

  return (
    <section className={styles.panel}>
      <div className={styles.sectionHeading}>
        <h2>Teacher's Remarks</h2>
        <p>
          Professional comment provided for the student's overall term
          performance.
        </p>
      </div>

      <div className={styles.remarksBody}>
        <p>{teacherReport ?? defaultRemark}</p>
      </div>
    </section>
  )
}

export function ReportFooter() {
  return (
    <footer className={styles.reportFooter}>
      <div className={styles.footerNote}>
        <span>Report approved by school administration</span>
      </div>

      <div className={styles.signatures}>
        {['Class Teacher', 'Principal', 'Parent/Guardian'].map((label) => (
          <div key={label} className={styles.signature}>
            <div className={styles.line} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </footer>
  )
}
