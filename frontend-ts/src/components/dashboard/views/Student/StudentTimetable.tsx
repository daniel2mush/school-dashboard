import { BookOpen, CalendarRange, Clock3, Sparkles } from 'lucide-react'
import styles from './StudentTimetable.module.scss'
import useCurrentStudent from '#/components/hooks/useCurrentStudent.ts'
import { useMemo } from 'react'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

const FALLBACK_PERIODS = [
  { id: 1, label: 'Period 1', startTime: '7:30', endTime: '8:30' },
  { id: 2, label: 'Period 2', startTime: '8:30', endTime: '9:30' },
  { id: 3, label: 'Period 3', startTime: '9:30', endTime: '10:30' },
  { id: 4, label: 'Period 4', startTime: '11:00', endTime: '12:00' },
  { id: 5, label: 'Period 5', startTime: '12:00', endTime: '13:00' },
]

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

  if (!currentData) return null

  const { studentTimetableSlots, yearGroup } = currentData

  const periods = useMemo(() => {
    const pMap = new Map()
    studentTimetableSlots.forEach((slot) => {
      if (slot.period && !slot.period.isBreak) {
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
      if (!map[slot.day]) map[slot.day] = {}
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

  const firstClass = periods[0]
    ? `${periods[0].startTime} - ${periods[0].endTime}`
    : 'N/A'

  return (
    <section className={styles.view}>
      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}>Timetable</div>
          <h2 className={styles.title}>A calmer view of your school week</h2>
          <p className={styles.copy}>
            Track every lesson for {yearGroup.name} with a cleaner daily layout,
            clearer time blocks, and space that is easier to scan.
          </p>
        </div>

        <div className={styles.heroBadge}>
          <Sparkles size={18} />
          <span>Weekly rhythm</span>
        </div>
      </header>

      <section className={styles.summaryGrid}>
        <article className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <CalendarRange size={18} />
          </div>
          <div>
            <div className={styles.summaryLabel}>Active days</div>
            <div className={styles.summaryValue}>{DAYS.length}</div>
          </div>
        </article>

        <article className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <BookOpen size={18} />
          </div>
          <div>
            <div className={styles.summaryLabel}>Subjects this week</div>
            <div className={styles.summaryValue}>{scheduledSubjects.size}</div>
          </div>
        </article>

        <article className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <Clock3 size={18} />
          </div>
          <div>
            <div className={styles.summaryLabel}>Lessons scheduled</div>
            <div className={styles.summaryValue}>{lessonCount}</div>
          </div>
        </article>
      </section>

      <section className={styles.board}>
        <div className={styles.boardHeader}>
          <div>
            <p className={styles.boardEyebrow}>Week at a glance</p>
            <h3 className={styles.boardTitle}>Calendar timetable</h3>
          </div>
          <div className={styles.boardMeta}>
            First class starts {firstClass}
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <div className={styles.miniGrid}>
            <div className={styles.cornerCell}>
              <CalendarRange size={18} />
            </div>
            {DAYS.map((day) => (
              <div key={day} className={styles.dayColumnHeader}>
                <span className={styles.dayLabel}>{day}</span>
                <span className={styles.dayShort}>{day.slice(0, 3)}</span>
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

                {DAYS.map((day) => {
                  const slot = slotsByDayAndPeriod[day]?.[period.id]
                  const subject = slot?.subject?.name
                  const teacher = slot?.teacher?.name
                  const isFree = !subject

                  return (
                    <div
                      key={`${day}-${period.id}`}
                      className={`${styles.slot} ${
                        !isFree ? styles.populated : styles.empty
                      }`}
                    >
                      {!isFree ? (
                        <>
                          <div className={styles.slotValue}>{subject}</div>
                          <div className={styles.slotMeta}>
                            {teacher || 'No teacher'}
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
            <span>Scheduled lessons</span>
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.legendColor} ${styles.empty}`}></span>
            <span>Free periods</span>
          </div>
        </div>
      </section>
    </section>
  )
}
