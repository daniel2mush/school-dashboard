import styles from './StudentReportCard.module.scss'
import useCurrentStudent from '#/components/hooks/useCurrentStudent.ts'
import { Download } from 'lucide-react'
import { useRef } from 'react'

export function StudentReportCard() {
  const currentData = useCurrentStudent()
  const reportRef = useRef<HTMLDivElement>(null)

  if (!currentData) return null

  const { student, studentGrades, yearGroup } = currentData

  // Calculate average score
  const totalScore = studentGrades.reduce(
    (sum: number, g: any) => sum + (g.score || 0),
    0,
  )
  const averageScore =
    studentGrades.length > 0 ? Math.round(totalScore / studentGrades.length) : 0

  const getGradeLetter = (score: number) => {
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  }

  const averageGrade = getGradeLetter(averageScore)

  const handleDownload = () => {
    window.print()
  }

  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className={styles.view}>
      <button className={styles.downloadBtn} onClick={handleDownload}>
        <Download size={20} />
        Download PDF
      </button>

      <div className={styles.reportCard} ref={reportRef}>
        <div className={styles.reportHeader}>
          <div className={styles.schoolInfo}>
            <h1>EXCELLENCE ACADEMY</h1>
            <p>123 Education Lane, Knowledge City</p>
            <p>Phone: +1 234 567 890 | Email: info@excellence.edu</p>
          </div>
          <div className={styles.reportTitle}>
            <h2>Official Report Card</h2>
            <p>Academic Year 2025/2026</p>
          </div>
        </div>

        <div className={styles.studentDetails}>
          <div className={styles.detailItem}>
            <label>Student Name</label>
            <span>{student.name}</span>
          </div>
          <div className={styles.detailItem}>
            <label>Year Group</label>
            <span>{yearGroup.name}</span>
          </div>
          <div className={styles.detailItem}>
            <label>Term</label>
            <span>Second Term</span>
          </div>
          <div className={styles.detailItem}>
            <label>Student ID</label>
            <span>#STU-{student.id.toString().padStart(4, '0')}</span>
          </div>
          <div className={styles.detailItem}>
            <label>Date Issued</label>
            <span>{today}</span>
          </div>
          <div className={styles.detailItem}>
            <label>Year</label>
            <span>2026</span>
          </div>
        </div>

        <table className={styles.reportTable}>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Score (%)</th>
              <th>Grade</th>
              <th>Teacher</th>
              <th>Performance</th>
            </tr>
          </thead>
          <tbody>
            {studentGrades.length > 0 ? (
              studentGrades.map((g: any, index: number) => (
                <tr key={index}>
                  <td>{g.subject}</td>
                  <td>{g.score}%</td>
                  <td>{g.grade}</td>
                  <td>{g.teacher}</td>
                  <td>
                    {g.performance ||
                      (g.score >= 50 ? 'Satisfactory' : 'Needs Improvement')}
                    <div className={styles.performanceLine}>
                      <div
                        className={styles.fill}
                        style={{ width: `${g.score}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: 'var(--text-tertiary)',
                  }}
                >
                  No grades available for this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className={styles.averageSection}>
          <div className={styles.avgItem}>
            <label>Overall Average</label>
            <span>{averageScore}%</span>
          </div>
          <div className={styles.avgItem}>
            <label>Final Grade</label>
            <span>{averageGrade}</span>
          </div>
        </div>

        <div className={styles.remarksSection}>
          <div className={styles.remarkBox}>
            <h3>Class Teacher's Report</h3>
            <p>
              {studentGrades.find((g: any) => g.teacherReport)?.teacherReport ||
                (averageScore >= 80
                  ? `${student.name} has demonstrated exceptional academic performance this term. Keep up the excellent work!`
                  : averageScore >= 60
                    ? `${student.name} has shown good progress. Continued focus on core subjects will yield even better results.`
                    : `${student.name} needs to put in more effort in the coming term to improve their overall standing.`)}
            </p>
          </div>
        </div>

        <div className={styles.reportFooter}>
          <div className={styles.signature}>
            <div className={styles.line} />
            <span>Class Teacher</span>
          </div>
          <div className={styles.signature}>
            <div className={styles.line} />
            <span>Principal</span>
          </div>
          <div className={styles.signature}>
            <div className={styles.line} />
            <span>Parent/Guardian</span>
          </div>
        </div>
      </div>
    </div>
  )
}
