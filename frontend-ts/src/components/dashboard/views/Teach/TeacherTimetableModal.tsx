import type { TaughtYearGroupData } from '#/components/query/TeacherQuery'
import useUserStore from '#/components/store/UserStore'
import styles from './TeacherTimetableModal.module.scss'
import { X, CalendarDays, MapPin, Clock } from 'lucide-react'
import { useMemo } from 'react'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

interface TeacherTimetableModalProps {
  yearGroup: TaughtYearGroupData
  onClose: () => void
}

export function TeacherTimetableModal({
  yearGroup,
  onClose,
}: TeacherTimetableModalProps) {
  const user = useUserStore((state) => state.user)

  // Extract unique periods from the timetable slots
  const periods = useMemo(() => {
    const pMap = new Map()
    yearGroup.timetables.forEach((slot) => {
      if (slot.period) {
        pMap.set(slot.periodId, slot.period)
      }
    })
    return Array.from(pMap.values()).sort((a, b) => {
      const [hA, mA] = a.startTime.split(':').map(Number)
      const [hB, mB] = b.startTime.split(':').map(Number)
      return hA * 60 + mA - (hB * 60 + mB)
    })
  }, [yearGroup.timetables])

  // Map slots for easy lookup: day -> periodId -> slot
  const slotsByDayAndPeriod = useMemo(() => {
    const map: Record<string, Record<number, any>> = {}
    yearGroup.timetables.forEach((slot) => {
      if (!map[slot.day]) map[slot.day] = {}
      map[slot.day][slot.periodId] = slot
    })
    return map
  }, [yearGroup.timetables])

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <div className={styles.modalEyebrow}>Timetable View</div>
            <h2 className={styles.modalTitle}>{yearGroup.name} Schedule</h2>
            <div className={styles.modalMeta}>
              <span className={styles.metaItem}>
                <MapPin size={14} /> Room {yearGroup.roomNumber || 'N/A'}
              </span>
              <span className={styles.metaItem}>
                <Clock size={14} /> Weekly View
              </span>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.tableWrapper}>
          <div className={styles.miniGrid}>
            <div className={styles.cornerCell}>
              <CalendarDays size={18} />
            </div>
            {DAYS.map((day) => (
              <div key={day} className={styles.dayColumnHeader}>
                <span className={styles.dayLabel}>{day}</span>
                <span className={styles.dayShort}>{day.slice(0, 3)}</span>
              </div>
            ))}

            {periods.map((period) => (
              <div key={period.id} className={styles.dayRow}>
                <div className={styles.periodHeaderCell}>
                  <div className={styles.periodLabel}>{period.label}</div>
                  <div className={styles.periodTime}>
                    {period.startTime} - {period.endTime}
                  </div>
                </div>

                {DAYS.map((day) => {
                  const slot = slotsByDayAndPeriod[day]?.[period.id]
                  const isAssignedToCurrentTeacher =
                    slot?.teacherId === user?.id || slot?.teacher?.id === user?.id

                  return (
                    <div
                      key={`${day}-${period.id}`}
                      className={`${styles.slot} ${slot ? styles.populated : styles.empty} ${
                        isAssignedToCurrentTeacher ? styles.highlighted : ''
                      }`}
                    >
                      {slot ? (
                        <>
                          <div className={styles.slotValue}>
                            {slot.subject?.name || 'Free Period'}
                          </div>
                          <div className={styles.slotMeta}>
                            {slot.teacher?.name || 'No teacher'}
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
              className={`${styles.legendColor} ${styles.highlighted}`}
            ></span>
            <span>Your lessons</span>
          </div>
          <div className={styles.legendItem}>
            <span
              className={`${styles.legendColor} ${styles.populated}`}
            ></span>
            <span>Other assigned lessons</span>
          </div>
        </div>
      </div>
    </div>
  )
}
