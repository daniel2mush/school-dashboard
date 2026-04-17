import { useState, useMemo, useEffect } from 'react'
import styles from './TeachAttendance.module.scss'
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
import {
  useGetTeacherClasses,
  useSubmitAttendance,
} from '#/components/query/TeacherQuery.ts'
import { useDashboardTranslation } from '#/components/dashboard/i18n'

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

export function TeachAttendance() {
  const { t } = useDashboardTranslation()
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const { data: classes, isLoading } = useGetTeacherClasses()
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
  const [classFilter, setClassFilter] = useState('All')

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

  const weekDays = [
    t('student.attendance.sun'),
    t('student.attendance.mon'),
    t('student.attendance.tue'),
    t('student.attendance.wed'),
    t('student.attendance.thu'),
    t('student.attendance.fri'),
    t('student.attendance.sat'),
  ]

  // Flatten students from all classes
  const allStudents = useMemo(() => {
    if (!classes) return []
    const studentsMap = new Map()
    classes.forEach((c) => {
      c.students.forEach((s) => {
        if (!studentsMap.has(s.id)) {
          studentsMap.set(s.id, {
            ...s,
            className: c.name,
            classLevel: c.level,
            classId: c.id,
          })
        }
      })
    })
    return Array.from(studentsMap.values())
  }, [classes])

  const filteredStudents = useMemo(() => {
    return allStudents.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesClass =
        classFilter === 'All' || s.classId.toString() === classFilter
      return matchesSearch && matchesClass
    })
  }, [allStudents, searchTerm, classFilter])

  const absenceList = useMemo(() => {
    return allStudents
      .map((s) => ({
        ...s,
        absentCount: (s.attendance || []).filter((r: any) => r.status === 'A')
          .length,
      }))
      .filter((s) => s.absentCount > 0)
      .sort((a, b) => b.absentCount - a.absentCount)
      .slice(0, 5)
  }, [allStudents])

  const chartData = useMemo(() => {
    const counts = { P: 0, A: 0, T: 0, H: 0 }
    const isTrackedStatus = (status: string): status is keyof typeof counts =>
      status in counts

    allStudents.forEach((s) => {
      ;(s.attendance || []).forEach((r: any) => {
        if (isTrackedStatus(r.status)) {
          counts[r.status]++
        }
      })
    })

    return [
      {
        name: t('admin.attendance.present'),
        value: counts.P,
        color: '#10b981',
      },
      { name: t('admin.attendance.absent'), value: counts.A, color: '#ef4444' },
      { name: t('admin.attendance.late'), value: counts.T, color: '#f59e0b' },
      {
        name: t('admin.attendance.holiday'),
        value: counts.H,
        color: '#6366f1',
      },
    ]
  }, [allStudents])

  const attendanceTotals = useMemo(() => {
    const totals = chartData.reduce(
      (acc, item) => {
        if (item.name === t('admin.attendance.present'))
          acc.present = item.value
        if (item.name === t('admin.attendance.absent')) acc.absent = item.value
        if (item.name === t('admin.attendance.late')) acc.late = item.value
        if (item.name === t('admin.attendance.holiday'))
          acc.holiday = item.value
        return acc
      },
      { present: 0, absent: 0, late: 0, holiday: 0 },
    )
    const total = totals.present + totals.absent + totals.late + totals.holiday
    const rate = total > 0 ? Math.round((totals.present / total) * 100) : 0
    return { ...totals, total, rate }
  }, [chartData])

  const trendData = useMemo(() => {
    const recordsByDate: Partial<
      Record<string, { date: string; Present: number; Absent: number }>
    > = {}

    allStudents.forEach((s) => {
      ;(s.attendance || []).slice(-20).forEach((r: any) => {
        const dateStr = new Date(r.date).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        })
        if (!recordsByDate[dateStr]) {
          recordsByDate[dateStr] = { date: dateStr, Present: 0, Absent: 0 }
        }
        if (r.status === 'P') recordsByDate[dateStr]!.Present++
        if (r.status === 'A') recordsByDate[dateStr]!.Absent++
      })
    })

    return Object.values(recordsByDate)
      .filter(
        (record): record is { date: string; Present: number; Absent: number } =>
          record !== undefined,
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7)
  }, [allStudents])

  if (isLoading || !classes) {
    return (
      <div className={styles.loadingState}>Loading attendance records...</div>
    )
  }

  const selectedStudent = allStudents.find((s) => s.id === selectedStudentId)

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

      const record = (selectedStudent.attendance || []).find((r: any) => {
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
              selectedStudent.id,
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

  const calculateStats = (student: any) => {
    const records = student?.attendance || []
    const present = records.filter((r: any) => r.status === 'P').length
    const absent = records.filter((r: any) => r.status === 'A').length
    const late = records.filter((r: any) => r.status === 'T').length
    const total = records.length
    const rate = total > 0 ? Math.round((present / total) * 100) : 0
    return { present, absent, late, total, rate }
  }

  return (
    <div className={styles.view}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.eyebrow}>{t('teacher.attendance.eyebrow')}</div>
          <h2 className={styles.title}>{t('teacher.attendance.title')}</h2>
        </div>
        <div className={styles.tabSwitcher}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutGrid size={16} /> {t('admin.attendance.overview')}
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'mark' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('mark')}
          >
            <CalendarIcon size={16} /> {t('admin.attendance.markAttendance')}
          </button>
        </div>
      </header>

      {activeTab === 'overview' ? (
        <>
          <div className={styles.topGrid}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardTitle}>
                    {t('admin.attendance.globalStatus')}
                  </h3>
                  <p className={styles.cardSub}>
                    {t('admin.attendance.termToDateDistribution')}
                  </p>
                </div>
                <div className={styles.cardMeta}>
                  {attendanceTotals.rate}% present
                </div>
              </div>
              <div className={styles.chartContainer}>
                {isMounted && (
                  <ResponsiveContainer width="100%" height={200}>
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
                  <h3 className={styles.cardTitle}>
                    {t('admin.attendance.dailyAttendanceTrend')}
                  </h3>
                  <p className={styles.cardSub}>
                    {t('admin.attendance.last7RecordedSessions')}
                  </p>
                </div>
              </div>
              <div className={styles.chartContainer}>
                {isMounted && (
                  <ResponsiveContainer width="100%" height={200}>
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
                  <h3 className={styles.cardTitle}>
                    {t('admin.attendance.atRiskStudents')}
                  </h3>
                  <p className={styles.cardSub}>
                    {t('admin.attendance.frequentAbsencesThisMonth')}
                  </p>
                </div>
              </div>
              <div className={styles.riskList}>
                {absenceList.map((s) => (
                  <div key={s.id} className={styles.riskItem}>
                    <div className={styles.riskInfo}>
                      <span className={styles.riskName}>{s.name}</span>
                      <span className={styles.riskGroup}>
                        {s.className} ({s.classLevel})
                      </span>
                    </div>
                    <div className={styles.riskBadge}>
                      <AlertCircle size={12} />{' '}
                      {t('admin.attendance.absentDays', {
                        count: s.absentCount,
                      })}
                    </div>
                  </div>
                ))}
                {absenceList.length === 0 && (
                  <p className={styles.emptyText}>
                    {t('teacher.attendance.emptyRisk')}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className={styles.mainGrid}>
            <div className={styles.registryCard}>
              <div className={styles.registryHeader}>
                <div className={styles.registryTitleBlock}>
                  <div className={styles.registryLabel}>
                    {t('teacher.attendance.studentRegistry')}
                  </div>
                  <div className={styles.registryCopy}>
                    {t('teacher.attendance.registryDescription')}
                  </div>
                </div>
                <div className={styles.registryActions}>
                  <div className={styles.search}>
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder={t('teacher.attendance.findStudent')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className={styles.filter}>
                    <Filter size={16} />
                    <select
                      value={classFilter}
                      onChange={(e) => setClassFilter(e.target.value)}
                    >
                      <option value="All">
                        {t('teacher.attendance.allClasses')}
                      </option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.level})
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
                      <th className={styles.studentCol}>
                        {t('admin.attendance.columnStudent')}
                      </th>
                      <th className={styles.classCol}>
                        {t('admin.attendance.columnYear')}
                      </th>
                      <th className={styles.attendanceCol}>
                        {t('admin.attendance.columnAttendance')}
                      </th>
                      <th className={styles.recordsCol}>
                        {t('admin.attendance.columnRecords')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s) => {
                      const sStats = calculateStats(s)
                      return (
                        <tr
                          key={s.id}
                          className={
                            selectedStudentId === s.id ? styles.selectedRow : ''
                          }
                          onClick={() => setSelectedStudentId(s.id)}
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
                              {s.className}
                            </span>
                          </td>
                          <td>
                            <div className={styles.progressCell}>
                              <div className={styles.progressInfo}>
                                <span>{sStats.rate}%</span>
                                <span
                                  className={
                                    sStats.rate < 75 ? styles.textRed : ''
                                  }
                                >
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

            <div className={styles.calendarCard}>
              {selectedStudent ? (
                <>
                  <div className={styles.calendarNav}>
                    <div>
                      <h4 className={styles.calendarName}>
                        {selectedStudent.name}
                      </h4>
                      <p className={styles.calendarSub}>
                        {selectedStudent.className} • {monthNames[month]} {year}
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
                  <p>{t('teacher.attendance.selectStudent')}</p>
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
                <label>{t('admin.attendance.targetDate')}</label>
                <input
                  type="date"
                  value={markDate}
                  onChange={(e) => setMarkDate(e.target.value)}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>{t('teacher.attendance.filterClass')}</label>
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                >
                  <option value="All">
                    {t('teacher.attendance.allClasses')}
                  </option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.level})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className={styles.markLegend}>
              <span>{t('admin.attendance.pPresent')}</span>
              <span>{t('admin.attendance.aAbsent')}</span>
              <span>{t('admin.attendance.tLate')}</span>
              <span>{t('admin.attendance.hHoliday')}</span>
            </div>
          </div>

          <div className={styles.markList}>
            <table className={styles.markTable}>
              <thead>
                <tr>
                  <th className={styles.studentCol}>
                    {t('admin.attendance.columnStudent')}
                  </th>
                  <th className={styles.classCol}>
                    {t('admin.attendance.columnYear')}
                  </th>
                  <th>{t('admin.attendance.recentHistory')}</th>
                  <th className={styles.center}>
                    {t('admin.attendance.status')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.avatar}>{s.name.charAt(0)}</div>
                        <div className={styles.name}>{s.name}</div>
                      </div>
                    </td>
                    <td>{s.className}</td>
                    <td>
                      <div className={styles.sparkline}>
                        {(s.attendance || [])
                          .slice(-10)
                          .map((r: any, i: number) => (
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
                          onClick={() => handleMarkAttendance(s.id, 'P')}
                          disabled={isSubmitting}
                        >
                          P
                        </button>
                        <button
                          className={styles.btnA}
                          onClick={() => handleMarkAttendance(s.id, 'A')}
                          disabled={isSubmitting}
                        >
                          A
                        </button>
                        <button
                          className={styles.btnT}
                          onClick={() => handleMarkAttendance(s.id, 'T')}
                          disabled={isSubmitting}
                        >
                          L
                        </button>
                        <button
                          className={styles.btnH}
                          onClick={() => handleMarkAttendance(s.id, 'H')}
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
          title={t('admin.attendance.markAttendance')}
          subtitle={t('admin.attendance.markAsFor')
            .replace('{name}', modalStudent.name)
            .replace('{date}', new Date(modalDate).toLocaleDateString())}
          onClose={closeMarkModal}
          footer={
            <div className={styles.modalFooterActions}>
              <button className="btn" onClick={closeMarkModal}>
                {t('admin.attendance.cancel')}
              </button>
              <button
                className="btn btn-primary"
                onClick={saveModalAttendance}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? t('admin.attendance.saving')
                  : t('admin.attendance.saveChanges')}
              </button>
            </div>
          }
        >
          <div className={styles.modalForm}>
            <div className={styles.field}>
              <span>{t('admin.attendance.status')}</span>
              <div className={styles.modalStatusGrid}>
                <button
                  className={`${styles.statusOption} ${modalStatus === 'P' ? styles.statusP : ''}`}
                  onClick={() => setModalStatus('P')}
                >
                  <CheckCircle2 size={16} />
                  <span>{t('admin.attendance.present')}</span>
                </button>
                <button
                  className={`${styles.statusOption} ${modalStatus === 'A' ? styles.statusA : ''}`}
                  onClick={() => setModalStatus('A')}
                >
                  <XCircle size={16} />
                  <span>{t('admin.attendance.absent')}</span>
                </button>
                <button
                  className={`${styles.statusOption} ${modalStatus === 'T' ? styles.statusT : ''}`}
                  onClick={() => setModalStatus('T')}
                >
                  <Clock size={16} />
                  <span>{t('admin.attendance.late')}</span>
                </button>
                <button
                  className={`${styles.statusOption} ${modalStatus === 'H' ? styles.statusH : ''}`}
                  onClick={() => setModalStatus('H')}
                >
                  <Palmtree size={16} />
                  <span>{t('admin.attendance.holiday')}</span>
                </button>
              </div>
            </div>
          </div>
        </BaseModal>
      )}
    </div>
  )
}
