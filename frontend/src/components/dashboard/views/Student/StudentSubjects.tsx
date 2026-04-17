import styles from './StudentSubjects.module.scss'
import useCurrentStudent from '#/components/hooks/useCurrentStudent.ts'
import { useDashboardTranslation } from '#/components/dashboard/i18n'
import {
  BookOpen,
  User,
  Search,
  ChevronRight,
  FlaskConical,
  Calculator,
  Languages,
  Palette,
  Music,
  Dna,
  Globe2,
  History,
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { getDashboardHref } from '#/components/constants/navigation'

const SUBJECT_ICONS: Record<string, React.ReactNode> = {
  Mathematics: <Calculator />,
  Math: <Calculator />,
  Science: <FlaskConical />,
  Physics: <FlaskConical />,
  Chemistry: <FlaskConical />,
  Biology: <Dna />,
  English: <Languages />,
  French: <Languages />,
  Spanish: <Languages />,
  History: <History />,
  Geography: <Globe2 />,
  Art: <Palette />,
  Music: <Music />,
  Literature: <BookOpen />,
}

export function StudentSubjects() {
  const currentData = useCurrentStudent()
  const { t } = useDashboardTranslation()
  const navigate = useNavigate()

  if (!currentData) return null

  const { yearGroup, teachers } = currentData

  const handleNavigate = (page: string) => {
    navigate({ to: getDashboardHref('STUDENT', page) })
  }

  const getSubjectIcon = (name: string) => {
    return SUBJECT_ICONS[name] || <BookOpen />
  }

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
          <Search />
          <p>{t('student.subjects.noSubjects')}</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {yearGroup.subjects.map((subjectName) => {
            const teacher = teachers.find((candidate: any) =>
              candidate.specialization?.toLowerCase().includes(subjectName.toLowerCase()),
            )

            return (
              <div key={subjectName} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.iconWrapper}>
                    {getSubjectIcon(subjectName)}
                  </div>
                  <div className={styles.subjectContent}>
                    <h3 className={styles.subjectName}>{subjectName}</h3>
                    <div className={styles.teacherInfo}>
                      <User size={16} />
                      {teacher
                        ? teacher.name
                        : t('student.subjects.teacherToBeAssigned')}
                    </div>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <p className={styles.subjectDescription}>
                    Deep dive into the core concepts of {subjectName} this term. 
                    Explore advanced topics and practical applications.
                  </p>
                  <div className={styles.tags}>
                    <span className={styles.tag}>Core Subject</span>
                    <span className={styles.tag}>Full Term</span>
                  </div>
                </div>

                <div className={styles.cardAction}>
                  <div 
                    className={styles.actionText}
                    onClick={() => handleNavigate('scontent')}
                  >
                    View Materials <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
