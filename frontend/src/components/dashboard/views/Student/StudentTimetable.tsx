import { BookOpen, CalendarRange, Clock3, Sparkles } from 'lucide-react'
import styles from './StudentTimetable.module.scss'
import useCurrentStudent from '#/components/hooks/useCurrentStudent.ts'
import { useMemo } from 'react'
import { useDashboardTranslation } from '#/components/dashboard/i18n'

const DAY_KEYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
] as const
const DAY_LOOKUP = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

const formatSubjectTone = (subject: string) => {
  const tones = [
    styles.toneCyan,
    styles.toneBlue,
    styles.toneGold,
    styles.toneMint,
    styles.toneRose,
  ]

  const seed = subject
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0)

  return tones[seed % tones.length]
}

export function StudentTimetable() {
  const currentData = useCurrentStudent()
  const { t } = useDashboardTranslation()

  if (!currentData) return null

  const { studentTimetableSlots, yearGroup } = currentData

  const periods = useMemo(() => {
    const pMap = new Map()
    studentTimetableSlots.forEach((slot) => {
      if (!slot.period.isBreak) {
        pMap.set(slot.periodId, slot.period)
      }
    })
    return Array.from(pMap.values()).sort((a: any, b: any) => {
      const [hA, mA] = a.startTime.split(':').map(Number)
      const [hB, mB] = b.startTime.split(':').map(Number)
      return hA * 60 + mA - (hB * 60 + mB)
    })
  }, [studentTimetableSlots])

  // Map slots for easy lookup: day -> periodId -> slot
  const slotsByDayAndPeriod = useMemo(() => {
    const map: Record<string, Record<number, any>> = {}
    studentTimetableSlots.forEach((slot) => {
      if (!(slot.day in map)) map[slot.day] = {}
      map[slot.day][slot.periodId] = slot
    })
    return map
  }, [studentTimetableSlots])

  const lessonCount = studentTimetableSlots.filter((slot) =>
    Boolean(slot.subject?.name),
  ).length

  const scheduledSubjects = new Set(
    studentTimetableSlots
      .map((slot) => slot.subject?.name)
      .filter((subject): subject is string => Boolean(subject)),
  )

  const firstClass =
    periods.length > 0
      ? `${periods[0].startTime} - ${periods[0].endTime}`
      : 'N/A'
  const dayEntries = DAY_KEYS.map((day, index) => ({
    label: t(`student.timetable.${day}`),
    lookup: DAY_LOOKUP[index],
  }))

  return (
    <section className={styles.view}>
      <section className={styles.summaryGrid}>
        <article className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <CalendarRange size={18} />
          </div>
          <div>
            <div className={styles.summaryLabel}>
              {t('student.timetable.activeDays')}
            </div>
            <div className={styles.summaryValue}>{dayEntries.length}</div>
          </div>
        </article>

        <article className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <BookOpen size={18} />
          </div>
          <div>
            <div className={styles.summaryLabel}>
              {t('student.timetable.subjectsThisWeek')}
            </div>
            <div className={styles.summaryValue}>{scheduledSubjects.size}</div>
          </div>
        </article>

        <article className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <Clock3 size={18} />
          </div>
          <div>
            <div className={styles.summaryLabel}>
              {t('student.timetable.lessonsScheduled')}
            </div>
            <div className={styles.summaryValue}>{lessonCount}</div>
          </div>
        </article>
      </section>

      <section className={styles.board}>
        <div className={styles.boardHeader}>
          <div>
            <p className={styles.boardEyebrow}>
              {t('student.timetable.weekAtAGlance')}
            </p>
            <h3 className={styles.boardTitle}>
              {t('student.timetable.calendarTimetable')}
            </h3>
          </div>
          <div className={styles.boardMeta}>
            {t('student.timetable.firstClassStarts').replace(
              '{time}',
              firstClass,
            )}
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <div className={styles.miniGrid}>
            <div className={styles.cornerCell}>
              <CalendarRange size={18} />
            </div>
            {dayEntries.map((day) => (
              <div key={day.lookup} className={styles.dayColumnHeader}>
                <span className={styles.dayLabel}>{day.label}</span>
                <span className={styles.dayShort}>{day.label.slice(0, 3)}</span>
              </div>
            ))}

            {periods.map((period: any) => (
              <div key={period.id} className={styles.dayRow}>
                <div className={styles.periodHeaderCell}>
                  <div className={styles.periodLabel}>{period.label}</div>
                  <div className={styles.periodTime}>
                    {period.startTime} - {period.endTime}
                  </div>
                </div>

                {dayEntries.map((day) => {
                  const daySlots = slotsByDayAndPeriod[day.lookup] as
                    | Record<number, any>
                    | undefined
                  const slot = daySlots?.[period.id]
                  const subject = slot?.subject?.name
                  const teacher = slot?.teacher?.name
                  const isFree = !subject

                  return (
                    <div
                      key={`${day.lookup}-${period.id}`}
                      className={`${styles.slot} ${
                        !isFree ? styles.populated : styles.empty
                      }`}
                    >
                      {!isFree ? (
                        <>
                          <div className={styles.slotValue}>{subject}</div>
                          <div className={styles.slotMeta}>
                            {teacher || t('student.timetable.noTeacher')}
                          </div>
                        </>
                      ) : (
                        <div className={styles.slotValue}>-</div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <span
              className={`${styles.legendColor} ${styles.populated}`}
            ></span>
            <span>{t('student.timetable.scheduledLessons')}</span>
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.legendColor} ${styles.empty}`}></span>
            <span>{t('student.timetable.freePeriods')}</span>
          </div>
        </div>
      </section>
    </section>
  )
}
