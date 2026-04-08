import { Badge } from '@/components/ui'
import styles from './StudentAttendance.module.scss'
import useCurrentStudent from '#/components/hooks/useCurrentStudent.ts'

// Formatter for nicer dates
const formatDate = (dateStr: string) => {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'P':
      return <Badge variant="green">Present</Badge>
    case 'A':
      return <Badge variant="red">Absent</Badge>
    case 'T':
      return <Badge variant="amber">Tardy / Late</Badge>
    case 'H':
      return <Badge variant="blue">Holiday</Badge>
    default:
      return <Badge variant="gray">Unknown</Badge>
  }
}

export function StudentAttendance() {
  const currentData = useCurrentStudent()

  if (!currentData) return null

  const { student } = currentData
  const attendanceRecords = student.attendance || []

  const total = attendanceRecords.length
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
      <div className={styles.panel}>
        <div className={styles.eyebrow}>Attendance</div>
        <h2 className={styles.title}>Presence, punctuality, and habits</h2>
        <p className={styles.copy}>
          Follow your attendance pattern and stay informed about school targets.
        </p>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{student.att}%</div>
          <div className={styles.statLabel}>Overall Attendance</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statValue} ${styles.red}`}>
            {absentCount}
          </div>
          <div className={styles.statLabel}>Absences</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statValue} ${styles.amber}`}>
            {tardyCount}
          </div>
          <div className={styles.statLabel}>Late Arrivals</div>
        </div>
      </div>

      <div className={styles.historyContainer}>
        <div className={styles.historyHeader}>Recent History</div>
        {attendanceRecords.length === 0 ? (
          <div className={styles.emptyState}>
            No attendance records found yet.
          </div>
        ) : (
          <div className={styles.timeline}>
            {attendanceRecords.map((record: any) => (
              <div
                key={record.id || record.date}
                className={styles.timelineRow}
              >
                <div className={styles.dateInfo}>
                  <div className={styles.dateString}>
                    {formatDate(record.date)}
                  </div>
                </div>
                <div className={styles.statusWrapper}>
                  {getStatusBadge(record.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
