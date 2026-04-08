import styles from './AdminAnalytics.module.scss'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts'
import type { TooltipValueType } from 'recharts'
import {
  Users,
  GraduationCap,
  Wallet,
  CheckCircle,
  Search,
  Edit2,
  X,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCurrency, type CurrencyCode } from '#/context/CurrencyContext'
import { Input } from '@/components/ui'
import {
  useGetAdminAnalytics,
  useUpsertFeePayment,
} from '#/components/query/AdminQuery'

function StudentEditModal({
  student,
  onClose,
}: {
  student: any
  onClose: () => void
}) {
  const { formatCurrency } = useCurrency()
  const upsertPayment = useUpsertFeePayment()
  const [drafts, setDrafts] = useState<
    Record<number, { amountPaid: string; isFullyPaid: boolean }>
  >(
    Object.fromEntries(
      student.fees.map((f: any) => [
        f.feeId,
        { amountPaid: String(f.amountPaid), isFullyPaid: f.isFullyPaid },
      ]),
    ),
  )

  const savePayment = async (feeId: number) => {
    const draft = drafts[feeId]
    await upsertPayment.mutateAsync({
      feeId,
      studentId: student.studentId,
      amountPaid: Number(draft.amountPaid),
      isFullyPaid: draft.isFullyPaid,
      amountInWords: '',
    })
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalDialog} onClick={(e) => e.stopPropagation()}>
        <header className={styles.modalHead}>
          <div>
            <div className={styles.eyebrow}>Edit Student Records</div>
            <h3 className={styles.modalTitle}>{student.name}</h3>
            <p className={styles.modalSubtitle}>
              {student.yearGroupName} · {student.email}
            </p>
          </div>
          <button className={styles.modalClose} onClick={onClose}>
            <X size={20} />
          </button>
        </header>
        <div className={styles.modalBody}>
          <h4
            style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--text-tertiary)',
            }}
          >
            Fee Payments
          </h4>
          {student.fees.map((f: any) => (
            <div key={f.feeId} className={styles.feeItemRow}>
              <div className={styles.feeItemHeader}>
                <span className={styles.feeItemTitle}>{f.title}</span>
                <span
                  style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}
                >
                  Total: {formatCurrency(f.totalAmount)}
                </span>
              </div>
              <div className={styles.feeItemInputGrid}>
                <Input
                  label="Paid"
                  value={drafts[f.feeId].amountPaid}
                  onChange={(e) =>
                    setDrafts((prev) => ({
                      ...prev,
                      [f.feeId]: {
                        ...prev[f.feeId],
                        amountPaid: e.target.value,
                      },
                    }))
                  }
                />
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginTop: 24,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={drafts[f.feeId].isFullyPaid}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [f.feeId]: {
                          ...prev[f.feeId],
                          isFullyPaid: e.target.checked,
                        },
                      }))
                    }
                  />
                  <span style={{ fontSize: '0.85rem' }}>Fully Paid</span>
                </div>
              </div>
              <div className={styles.feeItemActions}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => savePayment(f.feeId)}
                  disabled={upsertPayment.isPending}
                >
                  Save
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function AdminAnalytics() {
  const { currency, setCurrency, formatCurrency } = useCurrency()
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])
  const { data: stats, isLoading } = useGetAdminAnalytics()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedYearGroup, setSelectedYearGroup] = useState<string>('All')
  const [selectedStatus, setSelectedStatus] = useState<
    'All' | 'Unpaid' | 'Paid'
  >('All')
  const [activeTab, setActiveTab] = useState<'fees' | 'attendance'>('fees')
  const [editingStudent, setEditingStudent] = useState<any | null>(null)

  if (isLoading || !stats) {
    return (
      <div className={styles.view}>
        <div className={styles.hero}>
          <div className={styles.eyebrow}>Analytics</div>
          <h2 className={styles.title}>Loading school-wide data...</h2>
        </div>
      </div>
    )
  }

  const tooltipValueToNumber = (value: TooltipValueType | undefined) => {
    const rawValue = Array.isArray(value) ? value[0] : value
    const parsedValue = Number(rawValue)
    return Number.isFinite(parsedValue) ? parsedValue : 0
  }

  const yearGroups = Array.from(
    new Set(stats.studentStats.map((s) => s.yearGroupName)),
  ).sort()

  const filteredStudents = stats.studentStats
    .filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.yearGroupName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesYearGroup =
        selectedYearGroup === 'All' || s.yearGroupName === selectedYearGroup
      const matchesStatus =
        selectedStatus === 'All' ||
        (selectedStatus === 'Unpaid' && s.balance > 0) ||
        (selectedStatus === 'Paid' && s.balance <= 0)

      return matchesSearch && matchesYearGroup && matchesStatus
    })
    .sort((a, b) => a.yearGroupName.localeCompare(b.yearGroupName))

  const collectionRate =
    stats.totalExpectedRevenue > 0
      ? (stats.totalCollectedRevenue / stats.totalExpectedRevenue) * 100
      : 0
  const teacherStudentRatio =
    stats.teachers > 0 ? (stats.students / stats.teachers).toFixed(1) : 'N/A'
  const attendanceRate = stats.attendancePresentPct ?? 0

  const revenueData = [
    { name: 'Collected', value: stats.totalCollectedRevenue, color: '#10b981' },
    {
      name: 'Outstanding',
      value: Math.max(
        0,
        stats.totalExpectedRevenue - stats.totalCollectedRevenue,
      ),
      color: '#f59e0b',
    },
  ]

  const paymentDistributionData = [
    {
      name: 'Fully Paid',
      value: stats.paymentStats.fullyPaid,
      color: '#10b981',
    },
    {
      name: 'Partial',
      value: stats.paymentStats.partiallyPaid,
      color: '#f59e0b',
    },
    { name: 'Unpaid', value: stats.paymentStats.notPaid, color: '#ef4444' },
  ]

  // Aggregate attendance by Year Group
  const attendanceByCohort = Array.from(
    stats.studentStats
      .reduce((acc, s) => {
        const cohort = s.yearGroupName
        if (!acc.has(cohort)) {
          acc.set(cohort, { name: cohort, present: 0, total: 0 })
        }
        const item = acc.get(cohort)!
        item.present += s.attendance.present
        item.total += s.attendance.total
        return acc
      }, new Map<string, { name: string; present: number; total: number }>())
      .values(),
  ).map((c) => ({
    name: c.name,
    rate: c.total > 0 ? Math.round((c.present / c.total) * 100) : 0,
  }))

  return (
    <section className={styles.view}>
      <header className={styles.hero}>
        <div className={styles.eyebrow}>Institutional Overview</div>
        <h2 className={styles.title}>School Performance Analytics</h2>
        <div className={styles.currencyTabs}>
          {(['XOF', 'NGN', 'GHS', 'EUR', 'USD'] as CurrencyCode[]).map(
            (code) => (
              <button
                key={code}
                type="button"
                className={`${styles.currencyTab} ${currency === code ? styles.currencyTabActive : ''}`}
                onClick={() => setCurrency(code)}
              >
                {code}
              </button>
            ),
          )}
        </div>
        <p
          style={{
            marginTop: 12,
            color: 'var(--text-secondary)',
            maxWidth: 600,
          }}
        >
          Real-time insights into student enrollment, financial health, and
          operational efficiency across all cohorts.
        </p>
      </header>

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span className={styles.metricLabel}>Total Students</span>
            <Users size={20} color="var(--accent)" />
          </div>
          <div className={styles.metricValue}>{stats.students}</div>
          <div className={styles.metricFooter}>
            Across {stats.yearGroups} Year Groups
          </div>
        </div>

        <div className={styles.metricCard}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span className={styles.metricLabel}>Faculty Members</span>
            <GraduationCap size={20} color="#10b981" />
          </div>
          <div className={styles.metricValue}>{stats.teachers}</div>
          <div className={styles.metricFooter}>
            {teacherStudentRatio}:1 Student/Teacher Ratio
          </div>
        </div>

        <div className={styles.metricCard}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span className={styles.metricLabel}>Total Revenue</span>
            <Wallet size={20} color="#f59e0b" />
          </div>
          <div className={styles.metricValue}>
            {formatCurrency(stats.totalCollectedRevenue)}
          </div>
          <div className={styles.metricFooter}>
            {collectionRate.toFixed(1)}% Collection Rate
          </div>
        </div>

        <div className={styles.metricCard}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span className={styles.metricLabel}>Attendance</span>
            <CheckCircle size={20} color="#4f46e5" />
          </div>
          <div className={styles.metricValue}>{attendanceRate.toFixed(1)}%</div>
          <div className={styles.metricFooter}>Daily average presence</div>
        </div>
      </div>

      {/* School Fee Section */}
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>School Fees Revenue</h3>
            <p className={styles.chartSub}>Collected vs Outstanding Fees</p>
          </div>
          <div className={styles.chartContent} style={{ minWidth: 0 }}>
            {isMounted && (
              <ResponsiveContainer
                width="100%"
                height={250}
                minWidth={0}
                minHeight={0}
              >
                <BarChart data={revenueData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border-light)"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                  />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: 'var(--shadow-md)',
                      background: 'var(--bg-primary)',
                    }}
                    formatter={(value) => [
                      formatCurrency(tooltipValueToNumber(value)),
                      'Amount',
                    ]}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={60}>
                    {revenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div style={{ marginTop: 16 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.85rem',
                marginBottom: 6,
              }}
            >
              <span style={{ color: 'var(--text-secondary)' }}>
                Goal: {formatCurrency(stats.totalExpectedRevenue)}
              </span>
              <span style={{ fontWeight: 600 }}>
                {collectionRate.toFixed(1)}%
              </span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${collectionRate}%`,
                  backgroundColor: '#10b981',
                }}
              />
            </div>
          </div>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Payment Status Distribution</h3>
            <p className={styles.chartSub}>Breakdown of fee item settlements</p>
          </div>
          <div className={styles.chartContent} style={{ minWidth: 0 }}>
            {isMounted && (
              <ResponsiveContainer
                width="100%"
                height={250}
                minWidth={0}
                minHeight={0}
              >
                <PieChart>
                  <Pie
                    data={paymentDistributionData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {paymentDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: 'var(--shadow-md)',
                      background: 'var(--bg-primary)',
                    }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className={styles.chartCard} style={{ gridColumn: 'span 2' }}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Attendance by Cohort</h3>
            <p className={styles.chartSub}>Presence rate per year group</p>
          </div>
          <div className={styles.chartContent} style={{ minWidth: 0 }}>
            {isMounted && (
              <ResponsiveContainer
                width="100%"
                height={300}
                minWidth={0}
                minHeight={0}
              >
                <BarChart
                  data={attendanceByCohort}
                  layout="vertical"
                  margin={{ left: 40, right: 40 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="var(--border-light)"
                  />
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                    width={100}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: 'var(--shadow-md)',
                      background: 'var(--bg-primary)',
                    }}
                    formatter={(value) => [
                      `${tooltipValueToNumber(value)}%`,
                      'Attendance Rate',
                    ]}
                  />
                  <Bar
                    dataKey="rate"
                    radius={[0, 4, 4, 0]}
                    barSize={24}
                    fill="var(--accent)"
                  >
                    {attendanceByCohort.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.rate > 90
                            ? '#10b981'
                            : entry.rate > 75
                              ? '#f59e0b'
                              : '#ef4444'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div
          className={styles.chartHeader}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <h3 className={styles.chartTitle}>Student Registry</h3>
            <div className={styles.tabs}>
              <div
                className={`${styles.tab} ${activeTab === 'fees' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('fees')}
              >
                Fee Management
              </div>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <div style={{ position: 'relative', width: '250px' }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-tertiary)',
                }}
              />
              <input
                type="text"
                placeholder="Search students..."
                className="input"
                style={{ paddingLeft: 40, width: '100%' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="select"
              style={{ minWidth: 140 }}
              value={selectedYearGroup}
              onChange={(e) => setSelectedYearGroup(e.target.value)}
            >
              <option value="All">All Classes</option>
              {yearGroups.map((yg) => (
                <option key={yg} value={yg}>
                  {yg}
                </option>
              ))}
            </select>

            <select
              className="select"
              style={{ minWidth: 140 }}
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value as 'All' | 'Unpaid' | 'Paid')
              }
            >
              <option value="All">All Status</option>
              <option value="Unpaid">Unpaid Only</option>
              <option value="Paid">Fully Paid</option>
            </select>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Student</th>
                <th>Cohort</th>
                <th>Fee Items</th>
                <th>Total Billed</th>
                <th>Total Paid</th>
                <th>Balance</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.studentId}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{student.name}</div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-tertiary)',
                      }}
                    >
                      {student.email}
                    </div>
                  </td>
                  <td>{student.yearGroupName}</td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {student.fees.map((f) => (
                        <span
                          key={f.feeId}
                          className={styles.feeBadge}
                          style={{
                            background: f.isFullyPaid
                              ? 'rgba(16, 185, 129, 0.1)'
                              : 'rgba(239, 68, 68, 0.1)',
                            color: f.isFullyPaid ? '#10b981' : '#ef4444',
                          }}
                        >
                          {f.title}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>{formatCurrency(student.totalBilled)}</td>
                  <td>{formatCurrency(student.totalPaid)}</td>
                  <td
                    style={{
                      color: student.balance > 0 ? '#ef4444' : '#10b981',
                      fontWeight: 600,
                    }}
                  >
                    {formatCurrency(student.balance)}
                  </td>
                  <td>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setEditingStudent(student)}
                    >
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingStudent && (
        <StudentEditModal
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
        />
      )}
    </section>
  )
}
