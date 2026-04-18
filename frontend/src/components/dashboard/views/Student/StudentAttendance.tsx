import { Badge, Button } from '@/components/ui'
import styles from './StudentAttendance.module.scss'
import useCurrentStudent from '#/components/hooks/useCurrentStudent.ts'
import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useDashboardTranslation } from '#/components/dashboard/i18n'

// Formatter for nicer dates
const formatDate = (date: Date) => {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date)
  } catch {
    return date.toDateString()
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'P':
      return 'var(--green)'
    case 'A':
      return 'var(--red)'
    case 'T':
      return 'var(--amber)'
    case 'H':
      return 'var(--blue)'
    default:
      return 'transparent'
  }
}

const getStatusLabel = (status: string, t: (key: string) => string) => {
  switch (status) {
    case 'P':
      return t('student.attendance.present')
    case 'A':
      return t('student.attendance.absent')
    case 'T':
      return t('student.attendance.late')
    case 'H':
      return t('student.attendance.holiday')
    default:
      return t('student.attendance.unknown')
  }
}

export function StudentAttendance() {
  const currentData = useCurrentStudent()
  const { t } = useDashboardTranslation()
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  const months = [
    t('student.attendance.months.jan'),
    t('student.attendance.months.feb'),
    t('student.attendance.months.mar'),
    t('student.attendance.months.apr'),
    t('student.attendance.months.may'),
    t('student.attendance.months.jun'),
    t('student.attendance.months.jul'),
    t('student.attendance.months.aug'),
    t('student.attendance.months.sep'),
    t('student.attendance.months.oct'),
    t('student.attendance.months.nov'),
    t('student.attendance.months.dec'),
  ]

  const years = useMemo(() => {
    const current = new Date().getFullYear()
    const result = []
    for (let i = current - 2; i <= current + 1; i++) {
      result.push(i)
    }
    return result
  }, [])

  if (!currentData) return null

  const { student } = currentData
  const attendanceRecords = student.attendance || []

  // Create a map of date string (YYYY-MM-DD) to attendance record
  const attendanceMap = useMemo(() => {
    const map: Record<string, any> = {}
    attendanceRecords.forEach((record: any) => {
      const date = new Date(record.date)
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
      map[dateKey] = record
    })
    return map
  }, [attendanceRecords])

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay() // 0 = Sunday

  const calendarDays = useMemo(() => {
    const days = []
    // Add empty slots for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null)
    }
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }, [daysInMonth, firstDayOfMonth])

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((prev) => prev - 1)
    } else {
      setCurrentMonth((prev) => prev - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((prev) => prev + 1)
    } else {
      setCurrentMonth((prev) => prev + 1)
    }
  }

  const presentCount = attendanceRecords.filter(
    (a: any) => a.status === 'P',
  ).length
  const absentCount = attendanceRecords.filter(
    (a: any) => a.status === 'A',
  ).length
  const tardyCount = attendanceRecords.filter(
    (a: any) => a.status === 'T',
  ).length

  return (
    <section className={styles.view}>
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{student.att}%</div>
          <div className={styles.statLabel}>
            {t('student.attendance.overallAttendance')}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statValue} ${styles.red}`}>
            {absentCount}
          </div>
          <div className={styles.statLabel}>
            {t('student.attendance.absences')}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statValue} ${styles.amber}`}>
            {tardyCount}
          </div>
          <div className={styles.statLabel}>
            {t('student.attendance.lateArrivals')}
          </div>
        </div>
      </div>

      <div className={styles.calendarContainer}>
        <div className={styles.calendarHeader}>
          <div className={styles.monthDisplay}>
            <Button variant="ghost" onClick={handlePrevMonth}>
              <ChevronLeft size={20} />
            </Button>
            <h3 className={styles.monthTitle}>
              {months[currentMonth]} {currentYear}
            </h3>
            <Button variant="ghost" onClick={handleNextMonth}>
              <ChevronRight size={20} />
            </Button>
          </div>
          <div className={styles.filters}>
            <select
              className={styles.select}
              value={currentMonth}
              onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
            >
              {months.map((month, index) => (
                <option key={month} value={index}>
                  {month}
                </option>
              ))}
            </select>
            <select
              className={styles.select}
              value={currentYear}
              onChange={(e) => setCurrentYear(parseInt(e.target.value))}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.calendarGrid}>
          {[
            t('student.attendance.sun'),
            t('student.attendance.mon'),
            t('student.attendance.tue'),
            t('student.attendance.wed'),
            t('student.attendance.thu'),
            t('student.attendance.fri'),
            t('student.attendance.sat'),
          ].map((day) => (
            <div key={day} className={styles.dayHeader}>
              {day}
            </div>
          ))}
          {calendarDays.map((day, index) => {
            if (day === null)
              return <div key={`empty-${index}`} className={styles.emptyDay} />

            const dateKey = `${currentYear}-${currentMonth}-${day}`
            const record = attendanceMap[dateKey]

            return (
              <div key={day} className={styles.calendarDay}>
                <span className={styles.dayNumber}>{day}</span>
                {record && (
                  <div
                    className={styles.statusDot}
                    style={{ backgroundColor: getStatusColor(record.status) }}
                    title={getStatusLabel(record.status, t)}
                  />
                )}
              </div>
            )
          })}
        </div>

        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div
              className={styles.dot}
              style={{ backgroundColor: 'var(--green)' }}
            />
            <span>{t('student.attendance.present')}</span>
          </div>
          <div className={styles.legendItem}>
            <div
              className={styles.dot}
              style={{ backgroundColor: 'var(--red)' }}
            />
            <span>{t('student.attendance.absent')}</span>
          </div>
          <div className={styles.legendItem}>
            <div
              className={styles.dot}
              style={{ backgroundColor: 'var(--amber)' }}
            />
            <span>{t('student.attendance.late')}</span>
          </div>
          <div className={styles.legendItem}>
            <div
              className={styles.dot}
              style={{ backgroundColor: 'var(--blue)' }}
            />
            <span>{t('student.attendance.holiday')}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
