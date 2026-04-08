import { useMemo } from 'react'
import { Calendar, Clock, MapPin, Sparkles } from 'lucide-react'
import useUserStore from '#/components/store/UserStore'
import {
  useGetTeacherClasses,
  type TaughtYearGroupData,
} from '#/components/query/TeacherQuery'
import styles from './TeacherSidebarTimetable.module.scss'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

type TimetableSlot = TaughtYearGroupData['timetables'][number]

function getPeriodKey(slot: TimetableSlot) {
  return `${slot.periodId}`
}

export function TeacherSidebarTimetable() {
  const user = useUserStore((state) => state.user)
  const { data: classes, isLoading, error } = useGetTeacherClasses()

  const timetable = useMemo(() => {
    if (!classes) return null

    const periods = Array.from(
      new Map(
        classes
          .flatMap((yearGroup) => yearGroup.timetables)
          .filter((slot) => slot.period && !slot.period.isBreak)
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
    ).sort((a, b) => {
      const [aHour, aMinute] = a.startTime.split(':').map(Number)
      const [bHour, bMinute] = b.startTime.split(':').map(Number)
      return aHour * 60 + aMinute - (bHour * 60 + bMinute)
    })

    const slotsByDayAndPeriod: Record<string, Record<string, any>> = {}
    const activeDays = new Set<string>()
    let totalSlots = 0

    DAYS.forEach((day) => {
      slotsByDayAndPeriod[day] = {}
    })

    classes.forEach((yearGroup) => {
      yearGroup.timetables.forEach((slot) => {
        if (!slot.period || slot.period.isBreak) return

        const isMine = slot.teacherId === user?.id || slot.teacher?.id === user?.id
        if (!isMine) return

        totalSlots += 1
        activeDays.add(slot.day)
        slotsByDayAndPeriod[slot.day][getPeriodKey(slot)] = {
          ...slot,
          yearGroupName: yearGroup.name,
          roomNumber: yearGroup.roomNumber,
        }
      })
    })

    return {
      periods,
      slotsByDayAndPeriod,
      activeDays,
      totalSlots,
      classCount: classes.length,
    }
  }, [classes, user?.id])

  if (isLoading) {
    return <div className={styles.loading}>Loading your timetable...</div>
  }

  if (error || !classes || !timetable) {
    return <div className={styles.loading}>Unable to load timetable.</div>
  }

  return (
    <section className={styles.view}>
      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}>
            <Sparkles size={14} />
            Teacher schedule
          </div>
          <h1 className={styles.title}>Weekly timetable</h1>
          <p className={styles.copy}>
            A week-at-a-glance view of the lessons you are scheduled to teach.
            Only your assigned days and periods are highlighted.
          </p>
        </div>

        <div className={styles.heroBadge}>
          <Calendar size={16} />
          <span>{timetable.activeDays.size} active days</span>
        </div>
      </header>

      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <Clock size={18} />
          </div>
          <div>
            <div className={styles.summaryLabel}>Weekly lessons</div>
            <div className={styles.summaryValue}>{timetable.totalSlots}</div>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <Calendar size={18} />
          </div>
          <div>
            <div className={styles.summaryLabel}>Teaching days</div>
            <div className={styles.summaryValue}>
              {timetable.activeDays.size}
            </div>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <MapPin size={18} />
          </div>
          <div>
            <div className={styles.summaryLabel}>Assigned classes</div>
            <div className={styles.summaryValue}>{timetable.classCount}</div>
          </div>
        </div>
      </div>

      <div className={styles.tableShell}>
        <div className={styles.tableHeader}>
          <div>
            <h2>Weekly grid</h2>
            <p>
              Days with lessons are highlighted. Empty cells represent free
              periods or days you are not scheduled to teach.
            </p>
          </div>
          <div className={styles.tableLegend}>
            <span>
              <i className={styles.legendActive} />
              Scheduled
            </span>
            <span>
              <i className={styles.legendIdle} />
              Free
            </span>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.timetableTable}>
            <thead>
              <tr>
                <th className={styles.timeHeader}>Period</th>
                {DAYS.map((day) => (
                  <th
                    key={day}
                    className={`${styles.dayHeader} ${
                      timetable.activeDays.has(day) ? styles.dayHeaderActive : ''
                    }`}
                  >
                    <span className={styles.dayLabel}>{day}</span>
                    <span className={styles.dayMeta}>
                      {timetable.activeDays.has(day)
                        ? 'On your schedule'
                        : 'Free day'}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {timetable.periods.map((period) => (
                <tr key={period.id}>
                  <td className={styles.periodCell}>
                    <div className={styles.periodLabel}>{period.label}</div>
                    <div className={styles.periodTime}>
                      {period.startTime} - {period.endTime}
                    </div>
                  </td>
                  {DAYS.map((day) => {
                    const slot = timetable.slotsByDayAndPeriod[day]?.[period.id]
                    const isScheduled = Boolean(slot)

                    return (
                      <td
                        key={`${day}-${period.id}`}
                        className={`${styles.slotCell} ${
                          isScheduled ? styles.slotCellActive : styles.slotCellIdle
                        }`}
                      >
                        {slot ? (
                          <div className={styles.slotContent}>
                            <div className={styles.slotSubject}>
                              {slot.subject?.name || 'Lesson'}
                            </div>
                            <div className={styles.slotMeta}>
                              <span>{slot.yearGroupName}</span>
                              <span className={styles.dot}>•</span>
                              <span>{slot.roomNumber || 'No room set'}</span>
                            </div>
                          </div>
                        ) : (
                          <span className={styles.emptyMark}>Free</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
