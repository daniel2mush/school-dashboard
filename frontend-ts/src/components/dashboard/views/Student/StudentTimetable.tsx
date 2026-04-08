import { BookOpen, CalendarRange, Clock3, Sparkles } from 'lucide-react'
import styles from './StudentTimetable.module.scss'
import useCurrentStudent from '#/components/hooks/useCurrentStudent.ts'

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

  const periods = Array.from(
    new Map(
      studentTimetableSlots
        .filter((slot) => !slot.period.isBreak)
        .sort((left, right) => left.periodId - right.periodId)
        .map((slot) => [
          slot.periodId,
          {
            id: slot.periodId,
            label: slot.period.label,
            startTime: slot.period.startTime,
            endTime: slot.period.endTime,
          },
        ]),
    ).values(),
  )

  const visiblePeriods = periods.length > 0 ? periods : FALLBACK_PERIODS

  const scheduledSubjects = new Set(
    studentTimetableSlots
      .map((slot) => slot.subject?.name)
      .filter((subject): subject is string => Boolean(subject)),
  )

  const lessonCount = studentTimetableSlots.filter((slot) =>
    Boolean(slot.subject?.name),
  ).length

  const firstClass = visiblePeriods[0]
    ? `${visiblePeriods[0].startTime} - ${visiblePeriods[0].endTime}`
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

        <div className={styles.calendarScroller}>
          <div className={styles.calendarGrid}>
            <div className={styles.cornerCell}>Day</div>
            {visiblePeriods.map((period) => (
              <div key={period.id} className={styles.periodHeaderCell}>
                <span className={styles.periodHeaderTitle}>{period.label}</span>
                <span className={styles.periodHeaderMeta}>
                  {period.startTime} - {period.endTime}
                </span>
              </div>
            ))}

            {DAYS.map((day) => {
              const daySchedule = studentTimetableSlots.filter(
                (slot) => slot.day === day,
              )
              const lessonTotal = daySchedule.filter((slot) =>
                Boolean(slot.subject?.name),
              ).length

              return (
                <div key={day} className={styles.dayRow}>
                  <div className={styles.dayCell}>
                    <span className={styles.dayHeaderTitle}>{day}</span>
                    <span className={styles.dayHeaderMeta}>
                      {lessonTotal} lessons
                    </span>
                  </div>

                  {visiblePeriods.map((period) => {
                    const slot = daySchedule.find(
                      (entry) => entry.periodId === period.id,
                    )
                    const subject = slot?.subject?.name
                    const teacher = slot?.teacher?.name
                    const isFree = !subject

                    return (
                      <div
                        key={`${day}-${period.label}`}
                        className={styles.slotCell}
                      >
                        <div
                          className={`${styles.lessonCard} ${isFree ? styles.freeCard : formatSubjectTone(subject)}`}
                        >
                          <span className={styles.lessonState}>
                            {isFree ? 'Free slot' : 'Scheduled'}
                          </span>
                          <strong className={styles.lessonSubject}>
                            {isFree ? 'No class assigned' : subject}
                          </strong>
                          <span className={styles.lessonMeta}>
                            {isFree
                              ? `${period.startTime} - ${period.endTime}`
                              : `${period.startTime} - ${period.endTime} · ${teacher || 'Teacher unassigned'}`}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </section>
  )
}
