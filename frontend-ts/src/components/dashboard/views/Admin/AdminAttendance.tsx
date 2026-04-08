import { useState, useMemo, useEffect } from 'react'
import styles from './AdminAttendance.module.scss'
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar as CalendarIcon,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Palmtree,
  Filter,
  LayoutGrid,
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { useGetAdminAnalytics } from '#/components/query/AdminQuery'
import { useSubmitAttendance } from '#/components/query/TeacherQuery'

function BaseModal({
  title,
  subtitle,
  children,
  onClose,
  footer,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  onClose: () => void
  footer?: React.ReactNode
}) {
  const titleId = 'modal-title'

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className={styles.modalOverlay} role="presentation" onClick={onClose}>
      <div
        className={styles.modalDialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.modalHead}>
          <div>
            <h2 id={titleId} className={styles.modalTitle}>
              {title}
            </h2>
            {subtitle ? (
              <p className={styles.modalSubtitle}>{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            className={styles.modalClose}
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </header>
        <div className={styles.modalBody}>{children}</div>
        {footer ? (
          <footer className={styles.modalFooter}>{footer}</footer>
        ) : null}
      </div>
    </div>
  )
}

export function AdminAttendance() {
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])
  const { data: stats, isLoading } = useGetAdminAnalytics()
  const { mutate: submitAttendance, isPending: isSubmitting } =
    useSubmitAttendance()

  const [activeTab, setActiveTab] = useState<'overview' | 'mark'>('overview')
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null,
  )
  const [currentDate, setCurrentDate] = useState(new Date())
  const [markDate, setMarkDate] = useState(
    new Date().toISOString().split('T')[0],
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [yearGroupFilter, setYearGroupFilter] = useState('All')

  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false)
  const [modalStudent, setModalStudent] = useState<{
    id: number
    name: string
  } | null>(null)
  const [modalDate, setModalDate] = useState('')
  const [modalStatus, setModalStatus] = useState('P')

  const openMarkModal = (
    studentId: number,
    studentName: string,
    date: string,
    currentStatus?: string,
  ) => {
    setModalStudent({ id: studentId, name: studentName })
    setModalDate(date)
    setModalStatus(currentStatus || 'P')
    setIsMarkModalOpen(true)
  }

  const closeMarkModal = () => {
    setIsMarkModalOpen(false)
    setModalStudent(null)
  }

  const saveModalAttendance = () => {
    if (modalStudent) {
      submitAttendance(
        {
          studentId: modalStudent.id,
          status: modalStatus,
          date: new Date(modalDate),
        },
        {
          onSuccess: () => closeMarkModal(),
        },
      )
    }
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const yearGroups = useMemo(() => {
    if (!stats) return ['All']
    const names = Array.from(
      new Set(stats.studentStats.map((s) => s.yearGroupName)),
    )
    return ['All', ...names]
  }, [stats])

  const filteredStudents = useMemo(() => {
    if (!stats) return []
    return stats.studentStats.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesYear =
        yearGroupFilter === 'All' || s.yearGroupName === yearGroupFilter
      return matchesSearch && matchesYear
    })
  }, [stats, searchTerm, yearGroupFilter])

  useEffect(() => {
    if (!filteredStudents.length) {
      setSelectedStudentId(null)
      return
    }
    if (
      selectedStudentId === null ||
      !filteredStudents.some((s) => s.studentId === selectedStudentId)
    ) {
      setSelectedStudentId(filteredStudents[0].studentId)
    }
  }, [filteredStudents, selectedStudentId])

  const absenceList = useMemo(() => {
    if (!stats) return []
    return stats.studentStats
      .map((s) => ({
        ...s,
        absentCount: s.attendance_records.filter((r) => r.status === 'A')
          .length,
      }))
      .filter((s) => s.absentCount > 0)
      .sort((a, b) => b.absentCount - a.absentCount)
      .slice(0, 5)
  }, [stats])

  const chartData = useMemo(() => {
    if (!stats) return []
    const counts = { P: 0, A: 0, T: 0, H: 0 }
    const isTrackedStatus = (status: string): status is keyof typeof counts =>
      status in counts

    stats.studentStats.forEach((s) => {
      s.attendance_records.forEach((r) => {
        if (isTrackedStatus(r.status)) {
          counts[r.status]++
        }
      })
    })

    return [
      { name: 'Present', value: counts.P, color: '#10b981' },
      { name: 'Absent', value: counts.A, color: '#ef4444' },
      { name: 'Late', value: counts.T, color: '#f59e0b' },
      { name: 'Holiday', value: counts.H, color: '#6366f1' },
    ]
  }, [stats])

  const trendData = useMemo(() => {
    if (!stats) return []
    const recordsByDate: Partial<
      Record<string, { date: string; Present: number; Absent: number }>
    > = {}

    stats.studentStats.forEach((s) => {
      s.attendance_records.slice(-20).forEach((r) => {
        const dateStr = new Date(r.date).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        })
        if (!recordsByDate[dateStr]) {
          recordsByDate[dateStr] = { date: dateStr, Present: 0, Absent: 0 }
        }
        if (r.status === 'P') recordsByDate[dateStr].Present++
        if (r.status === 'A') recordsByDate[dateStr].Absent++
      })
    })

    return Object.values(recordsByDate)
      .filter(
        (record): record is { date: string; Present: number; Absent: number } =>
          record !== undefined,
      )
      .slice(-7)
  }, [stats])

  if (isLoading || !stats) {
    return (
      <div className={styles.loadingState}>Loading attendance records...</div>
    )
  }

  const selectedStudent = stats.studentStats.find(
    (s) => s.studentId === selectedStudentId,
  )

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const handleMarkAttendance = (studentId: number, status: string) => {
    submitAttendance({
      studentId,
      status,
      date: new Date(markDate),
    })
  }

  const renderCalendarTable = () => {
    if (!selectedStudent) return null

    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()
    const totalCells = 42
    const cells = []

    for (let index = 0; index < totalCells; index++) {
      const day = index - firstDay + 1
      if (day < 1 || day > daysInMonth) {
        cells.push(
          <div key={`empty-${index}`} className={styles.calendarEmptyCell} />,
        )
        continue
      }

      const dayDate = new Date(year, month, day)
      const dateString = dayDate.toISOString().split('T')[0]

      const record = selectedStudent.attendance_records.find((r) => {
        const d = new Date(r.date)
        return (
          d.getDate() === day &&
          d.getMonth() === month &&
          d.getFullYear() === year
        )
      })

      let statusClass = ''
      let icon = null
      if (record?.status === 'P') {
        statusClass = styles.cellP
        icon = <CheckCircle2 size={12} />
      } else if (record?.status === 'A') {
        statusClass = styles.cellA
        icon = <XCircle size={12} />
      } else if (record?.status === 'T') {
        statusClass = styles.cellT
        icon = <Clock size={12} />
      } else if (record?.status === 'H') {
        statusClass = styles.cellH
        icon = <Palmtree size={12} />
      }

      cells.push(
        <button
          key={day}
          type="button"
          className={`${styles.calendarDayCell} ${statusClass} ${styles.clickable}`}
          onClick={() =>
            openMarkModal(
              selectedStudent.studentId,
              selectedStudent.name,
              dateString,
              record?.status,
            )
          }
        >
          <div className={styles.cellDay}>{day}</div>
          {record && <div className={styles.cellStatusIcon}>{icon}</div>}
        </button>,
      )
    }

    return (
      <div className={styles.calendarGrid}>
        {weekDays.map((d) => (
          <div key={d} className={styles.calendarDayHeader}>
            {d}
          </div>
        ))}
        {cells}
      </div>
    )
  }

  return (
    <div className={styles.view}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.eyebrow}>Management</div>
          <h2 className={styles.title}>Student Attendance</h2>
        </div>
        <div className={styles.tabSwitcher}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutGrid size={16} /> Overview
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'mark' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('mark')}
          >
            <CalendarIcon size={16} /> Mark Attendance
          </button>
        </div>
      </header>

      {activeTab === 'overview' ? (
        <>
          <div className={styles.topGrid}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardTitle}>Global Status</h3>
                  <p className={styles.cardSub}>Term-to-date distribution</p>
                </div>
              </div>
              <div className={styles.chartContainer} style={{ minWidth: 0 }}>
                {isMounted && (
                  <ResponsiveContainer
                    width="100%"
                    height={200}
                    minWidth={0}
                    minHeight={0}
                  >
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardTitle}>Daily Attendance Trend</h3>
                  <p className={styles.cardSub}>Last 7 recorded sessions</p>
                </div>
              </div>
              <div className={styles.chartContainer} style={{ minWidth: 0 }}>
                {isMounted && (
                  <ResponsiveContainer
                    width="100%"
                    height={200}
                    minWidth={0}
                    minHeight={0}
                  >
                    <BarChart data={trendData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="var(--border-light)"
                      />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }}
                      />
                      <YAxis hide />
                      <Tooltip
                        cursor={{ fill: 'var(--bg-secondary)' }}
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid var(--border-light)',
                          boxShadow: 'var(--shadow-md)',
                          fontSize: '12px',
                        }}
                      />
                      <Bar
                        dataKey="Present"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                      />
                      <Bar
                        dataKey="Absent"
                        fill="#ef4444"
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardTitle}>At-Risk Students</h3>
                  <p className={styles.cardSub}>Frequent absences this month</p>
                </div>
              </div>
              <div className={styles.riskList}>
                {absenceList.map((s) => (
                  <div key={s.studentId} className={styles.riskItem}>
                    <div className={styles.riskInfo}>
                      <span className={styles.riskName}>{s.name}</span>
                      <span className={styles.riskGroup}>
                        {s.yearGroupName}
                      </span>
                    </div>
                    <div className={styles.riskBadge}>
                      <AlertCircle size={12} /> {s.absentCount} Days
                    </div>
                  </div>
                ))}
                {absenceList.length === 0 && (
                  <p className={styles.emptyText}>All students on track.</p>
                )}
              </div>
            </div>
          </div>

          <div className={styles.mainGrid}>
            <div className={styles.registryCard}>
              <div className={styles.registryHeader}>
                <div className={styles.registryTitleBlock}>
                  <div className={styles.registryLabel}>Student Registry</div>
                  <div className={styles.registryCopy}>
                    Search and filter your cohorts, then open a student to mark
                    or review attendance history.
                  </div>
                </div>
                <div className={styles.registryActions}>
                  <div className={styles.search}>
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Find student..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className={styles.filter}>
                    <Filter size={16} />
                    <select
                      value={yearGroupFilter}
                      onChange={(e) => setYearGroupFilter(e.target.value)}
                    >
                      {yearGroups.map((yg) => (
                        <option key={yg} value={yg}>
                          {yg}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className={styles.tableScroll}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.studentCol}>Student</th>
                      <th className={styles.yearCol}>Year</th>
                      <th className={styles.attendanceCol}>Attendance</th>
                      <th className={styles.recordsCol}>Records</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s) => {
                      const sStats = {
                        present: s.attendance.present,
                        absent: s.attendance.absent,
                        late: s.attendance.tardy,
                        total: s.attendance.total,
                        rate:
                          s.attendance.total > 0
                            ? Math.round(
                                (s.attendance.present / s.attendance.total) *
                                  100,
                              )
                            : 0,
                      }
                      return (
                        <tr
                          key={s.studentId}
                          className={
                            selectedStudentId === s.studentId
                              ? styles.selectedRow
                              : ''
                          }
                          onClick={() => setSelectedStudentId(s.studentId)}
                        >
                          <td>
                            <div className={styles.userCell}>
                              <div className={styles.avatar}>
                                {s.name.charAt(0)}
                              </div>
                              <div>
                                <div className={styles.name}>{s.name}</div>
                                <div className={styles.email}>{s.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={styles.yearTag}>
                              {s.yearGroupName}
                            </span>
                          </td>
                          <td>
                            <div className={styles.progressCell}>
                              <div className={styles.progressInfo}>
                                <span>{sStats.rate}%</span>
                                <span className={styles.textRed}>
                                  {sStats.present}P / {sStats.absent}A
                                </span>
                              </div>
                              <div className={styles.progressBar}>
                                <div
                                  className={styles.progressFill}
                                  style={{
                                    width: `${sStats.rate}%`,
                                    backgroundColor:
                                      sStats.rate < 75 ? '#ef4444' : '#10b981',
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className={styles.recordsCell}>{sStats.total}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div
              className={`${styles.calendarCard} ${!selectedStudent ? styles.hidden : ''}`}
            >
              {selectedStudent ? (
                <>
                  <div className={styles.calendarNav}>
                    <div>
                      <h4 className={styles.calendarName}>
                        {selectedStudent.name}
                      </h4>
                      <p className={styles.calendarSub}>
                        {selectedStudent.yearGroupName} • {monthNames[month]}{' '}
                        {year}
                      </p>
                    </div>
                    <div className={styles.navArrows}>
                      <button onClick={prevMonth}>
                        <ChevronLeft size={16} />
                      </button>
                      <button onClick={nextMonth}>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>

                  <div className={styles.legend}>
                    <div className={styles.lItem}>
                      <span className={styles.dotP} /> P
                    </div>
                    <div className={styles.lItem}>
                      <span className={styles.dotA} /> A
                    </div>
                    <div className={styles.lItem}>
                      <span className={styles.dotT} /> L
                    </div>
                    <div className={styles.lItem}>
                      <span className={styles.dotH} /> H
                    </div>
                  </div>

                  <div className={styles.calendarTableWrapper}>
                    {renderCalendarTable()}
                  </div>
                </>
              ) : (
                <div className={styles.noSelection}>
                  <CalendarIcon size={40} />
                  <p>Select a student to view history</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className={styles.markSection}>
          <div className={styles.markHeader}>
            <div className={styles.markControls}>
              <div className={styles.inputGroup}>
                <label>Target Date</label>
                <input
                  type="date"
                  value={markDate}
                  onChange={(e) => setMarkDate(e.target.value)}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Filter Cohort</label>
                <select
                  value={yearGroupFilter}
                  onChange={(e) => setYearGroupFilter(e.target.value)}
                >
                  {yearGroups.map((yg) => (
                    <option key={yg} value={yg}>
                      {yg}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className={styles.markLegend}>
              <span>P: Present</span>
              <span>A: Absent</span>
              <span>T: Late</span>
              <span>H: Holiday</span>
            </div>
          </div>

          <div className={styles.markList}>
            <table className={styles.markTable}>
              <thead>
                <tr>
                  <th className={styles.studentCol}>Student</th>
                  <th className={styles.yearCol}>Year</th>
                  <th>Recent History</th>
                  <th className={styles.center}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => (
                  <tr key={s.studentId}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.avatar}>{s.name.charAt(0)}</div>
                        <div className={styles.name}>{s.name}</div>
                      </div>
                    </td>
                    <td>{s.yearGroupName}</td>
                    <td>
                      <div className={styles.sparkline}>
                        {s.attendance_records.slice(-10).map((r, i) => (
                          <div
                            key={i}
                            className={`${styles.sparkDot} ${styles['spark' + r.status]}`}
                            title={r.date}
                          />
                        ))}
                      </div>
                    </td>
                    <td className={styles.center}>
                      <div className={styles.statusButtons}>
                        <button
                          className={styles.btnP}
                          onClick={() => handleMarkAttendance(s.studentId, 'P')}
                          disabled={isSubmitting}
                        >
                          P
                        </button>
                        <button
                          className={styles.btnA}
                          onClick={() => handleMarkAttendance(s.studentId, 'A')}
                          disabled={isSubmitting}
                        >
                          A
                        </button>
                        <button
                          className={styles.btnT}
                          onClick={() => handleMarkAttendance(s.studentId, 'T')}
                          disabled={isSubmitting}
                        >
                          L
                        </button>
                        <button
                          className={styles.btnH}
                          onClick={() => handleMarkAttendance(s.studentId, 'H')}
                          disabled={isSubmitting}
                        >
                          H
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isMarkModalOpen && modalStudent && (
        <BaseModal
          title="Mark Attendance"
          subtitle={`Marking ${modalStudent.name} for ${new Date(modalDate).toLocaleDateString()}`}
          onClose={closeMarkModal}
          footer={
            <div className={styles.modalFooterActions}>
              <button className="btn" onClick={closeMarkModal}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={saveModalAttendance}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          }
        >
          <div className={styles.modalForm}>
            <div className={styles.field}>
              <span>Attendance Status</span>
              <div className={styles.modalStatusGrid}>
                <button
                  className={`${styles.statusOption} ${modalStatus === 'P' ? styles.statusP : ''}`}
                  onClick={() => setModalStatus('P')}
                >
                  <CheckCircle2 size={16} />
                  <span>Present</span>
                </button>
                <button
                  className={`${styles.statusOption} ${modalStatus === 'A' ? styles.statusA : ''}`}
                  onClick={() => setModalStatus('A')}
                >
                  <XCircle size={16} />
                  <span>Absent</span>
                </button>
                <button
                  className={`${styles.statusOption} ${modalStatus === 'T' ? styles.statusT : ''}`}
                  onClick={() => setModalStatus('T')}
                >
                  <Clock size={16} />
                  <span>Late</span>
                </button>
                <button
                  className={`${styles.statusOption} ${modalStatus === 'H' ? styles.statusH : ''}`}
                  onClick={() => setModalStatus('H')}
                >
                  <Palmtree size={16} />
                  <span>Holiday</span>
                </button>
              </div>
            </div>
          </div>
        </BaseModal>
      )}
    </div>
  )
}
