import type { TaughtYearGroupData } from '#/components/query/TeacherQuery'
import { useDashboardTranslation } from '#/components/dashboard/i18n'
import useUserStore from '#/components/store/UserStore'
import styles from './TeacherTimetableModal.module.scss'
import { X, CalendarDays, MapPin, Clock } from 'lucide-react'
import { useMemo } from 'react'

const DAY_KEYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
] as const
const DAY_LOOKUP = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

interface TeacherTimetableModalProps {
  yearGroup: TaughtYearGroupData
  onClose: () => void
}

export function TeacherTimetableModal({
  yearGroup,
  onClose,
}: TeacherTimetableModalProps) {
  const user = useUserStore((state) => state.user)
  const { t } = useDashboardTranslation()

  // Extract unique periods from the timetable slots
  const periods = useMemo(() => {
    const pMap = new Map()
    yearGroup.timetables.forEach((slot) => {
      pMap.set(slot.periodId, slot.period)
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
      if (!(slot.day in map)) map[slot.day] = {}
      map[slot.day][slot.periodId] = slot
    })
    return map
  }, [yearGroup.timetables])
  const dayEntries = DAY_KEYS.map((day, index) => ({
    label: t(`teacher.timetableModal.${day}`),
    lookup: DAY_LOOKUP[index],
  }))

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <div className={styles.modalEyebrow}>
              {t('teacher.timetableModal.view')}
            </div>
            <h2 className={styles.modalTitle}>
              {t('teacher.timetableModal.schedule').replace(
                '{name}',
                yearGroup.name,
              )}
            </h2>
            <div className={styles.modalMeta}>
              <span className={styles.metaItem}>
                <MapPin size={14} />{' '}
                {yearGroup.roomNumber
                  ? t('teacher.timetableModal.room').replace(
                      '{room}',
                      yearGroup.roomNumber,
                    )
                  : t('teacher.timetableModal.roomFallback')}
              </span>
              <span className={styles.metaItem}>
                <Clock size={14} /> {t('teacher.timetableModal.weeklyView')}
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
            {dayEntries.map((day) => (
              <div key={day.lookup} className={styles.dayColumnHeader}>
                <span className={styles.dayLabel}>{day.label}</span>
                <span className={styles.dayShort}>{day.label.slice(0, 3)}</span>
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

                {dayEntries.map((day) => {
                  const daySlots = slotsByDayAndPeriod[day.lookup] as
                    | Record<number, any>
                    | undefined
                  const slot = daySlots?.[period.id]
                  const isAssignedToCurrentTeacher =
                    slot?.teacherId === user?.id ||
                    slot?.teacher?.id === user?.id

                  return (
                    <div
                      key={`${day.lookup}-${period.id}`}
                      className={`${styles.slot} ${slot ? styles.populated : styles.empty} ${
                        isAssignedToCurrentTeacher ? styles.highlighted : ''
                      }`}
                    >
                      {slot ? (
                        <>
                          <div className={styles.slotValue}>
                            {slot.subject?.name ||
                              t('teacher.timetableModal.freePeriod')}
                          </div>
                          <div className={styles.slotMeta}>
                            {slot.teacher?.name ||
                              t('teacher.timetableModal.noTeacher')}
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
            <span>{t('teacher.timetableModal.yourLessons')}</span>
          </div>
          <div className={styles.legendItem}>
            <span
              className={`${styles.legendColor} ${styles.populated}`}
            ></span>
            <span>{t('teacher.timetableModal.otherLessons')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
