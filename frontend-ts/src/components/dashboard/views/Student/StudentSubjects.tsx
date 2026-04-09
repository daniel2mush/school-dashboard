import { Badge } from '@/components/ui'
import styles from './StudentSubjects.module.scss'
import useCurrentStudent from '#/components/hooks/useCurrentStudent.ts'
import { useDashboardTranslation } from '#/components/dashboard/i18n'

// Simple user icon SVG
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
)

export function StudentSubjects() {
  const currentData = useCurrentStudent()
  const { t } = useDashboardTranslation()

  if (!currentData) return null

  const { studentGrades, yearGroup, teachers } = currentData

  return (
    <section className={styles.view}>
      <div className={styles.panel}>
        <div className={styles.eyebrow}>{t('student.subjects.eyebrow')}</div>
        <h2 className={styles.title}>{t('student.subjects.title')}</h2>
        <p className={styles.copy}>
          {t('student.subjects.copy').replace('{yearGroup}', yearGroup.name)}
        </p>
      </div>

      {yearGroup.subjects.length === 0 ? (
        <div className={styles.emptyState}>
          {t('student.subjects.noSubjects')}
        </div>
      ) : (
        <div className={styles.grid}>
          {yearGroup.subjects.map((subjectName) => {
            const gradeInfo = studentGrades.find(
              (g) => g.subject === subjectName,
            )
            const teacher = teachers.find((candidate: any) =>
              candidate.specialization?.includes(subjectName),
            )

            return (
              <div key={subjectName} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <h3 className={styles.subjectName}>{subjectName}</h3>
                    <div className={styles.teacherName}>
                      <UserIcon />
                      {teacher
                        ? teacher.name
                        : t('student.subjects.teacherToBeAssigned')}
                    </div>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.gradeLabel}>
                    {t('student.subjects.currentStanding')}
                  </span>
                  {gradeInfo ? (
                    <Badge variant="blue">{gradeInfo.grade}</Badge>
                  ) : (
                    <Badge variant="gray">{t('student.subjects.noData')}</Badge>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
