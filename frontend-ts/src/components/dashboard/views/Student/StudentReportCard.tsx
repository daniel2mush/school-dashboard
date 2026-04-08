import { Badge } from '@/components/ui'
import styles from './StudentReportCard.module.scss'
import useCurrentStudent from '#/components/hooks/useCurrentStudent.ts'

// Helper to determine badge color based on grade
const getGradeBadge = (grade: string) => {
  switch (grade) {
    case 'A':
      return <Badge variant="green">{grade}</Badge>
    case 'B':
      return <Badge variant="blue">{grade}</Badge>
    case 'C':
      return <Badge variant="amber">{grade}</Badge>
    case 'D':
    case 'F':
      return <Badge variant="red">{grade}</Badge>
    default:
      return <Badge variant="gray">{grade}</Badge>
  }
}

export function StudentReportCard() {
  const currentData = useCurrentStudent()

  if (!currentData) return null

  const { studentGrades, yearGroup } = currentData

  // Calculate average score
  const totalScore = studentGrades.reduce(
    (sum: number, g: any) => sum + g.score,
    0,
  )
  const averageScore =
    studentGrades.length > 0 ? Math.round(totalScore / studentGrades.length) : 0

  return (
    <section className={styles.view}>
      <div className={styles.panel}>
        <div className={styles.eyebrow}>Report Card</div>
        <h2 className={styles.title}>Academic Performance</h2>
        <p className={styles.copy}>
          Your official grades and scores for {yearGroup.name}.
        </p>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.headerRow}>
          <div>Subject</div>
          <div>Score</div>
          <div>Grade</div>
        </div>

        {studentGrades.length === 0 ? (
          <div className={styles.emptyState}>
            No grades have been published yet.
          </div>
        ) : (
          <>
            {studentGrades.map((grade: any) => (
              <div key={grade.subject} className={styles.row}>
                <div className={styles.subjectCol}>{grade.subject}</div>
                <div className={styles.scoreCol}>{grade.score}%</div>
                <div className={styles.gradeCol}>
                  {getGradeBadge(grade.grade)}
                </div>
              </div>
            ))}

            {/* Summary / Average Row */}
            <div className={`${styles.row} ${styles.summaryRow}`}>
              <div className={styles.subjectCol}>Overall Average</div>
              <div className={styles.scoreCol}>{averageScore}%</div>
              <div className={styles.gradeCol}>
                {getGradeBadge(
                  averageScore >= 90
                    ? 'A'
                    : averageScore >= 80
                      ? 'B'
                      : averageScore >= 70
                        ? 'C'
                        : 'D',
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
