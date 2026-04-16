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
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Filter,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCurrency } from '#/context/CurrencyContext'
import type { CurrencyCode } from '#/context/CurrencyContext'
import { Button, Input } from '@/components/ui'
import {
  useGetAdminAnalytics,
  useUpsertFeePayment,
} from '#/components/query/AdminQuery'
import { useDashboardTranslation } from '#/components/dashboard/i18n'

function StudentEditModal({
  student,
  onClose,
}: {
  student: any
  onClose: () => void
}) {
  const { t } = useDashboardTranslation()
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalDialog} onClick={(e) => e.stopPropagation()}>
        <header className={styles.modalHead}>
          <div className={styles.modalHeadContent}>
            <div className={styles.studentAvatar}>
              {getInitials(student.name)}
            </div>
            <div>
              <div className={styles.eyebrow}>
                {t('admin.analytics.editStudentRecords')}
              </div>
              <h3 className={styles.modalTitle}>{student.name}</h3>
              <p className={styles.modalSubtitle}>
                {student.yearGroupName} · {student.email}
              </p>
            </div>
          </div>
          <Button className={styles.modalClose} onClick={onClose}>
            <X size={20} />
          </Button>
        </header>

        <div className={styles.modalBody}>
          <div className={styles.sectionHeader}>
            <Wallet size={18} className={styles.sectionIcon} />
            <h4>{t('admin.analytics.feePayments')}</h4>
          </div>

          <div className={styles.feeCardsGrid}>
            {student.fees.map((f: any) => {
              const draft = drafts[f.feeId]
              const total = f.totalAmount
              const paid = Number(draft.amountPaid)
              const percent = Math.min(100, Math.round((paid / total) * 100))

              return (
                <div key={f.feeId} className={styles.feeCard}>
                  <div className={styles.feeCardHeader}>
                    <div>
                      <span className={styles.feeCardTitle}>{f.title}</span>
                      <div className={styles.feeCardAmount}>
                        {formatCurrency(total)}
                      </div>
                    </div>
                    <div
                      className={`${styles.statusBadge} ${draft.isFullyPaid ? styles.statusPaid : styles.statusPending}`}
                    >
                      {draft.isFullyPaid
                        ? t('admin.analytics.fullyPaid')
                        : t('admin.analytics.partial')}
                    </div>
                  </div>

                  <div className={styles.feeCardProgress}>
                    <div className={styles.progressText}>
                      <span>
                        {percent}% {t('admin.analytics.paid')}
                      </span>
                      <span>
                        {formatCurrency(total - paid)}{' '}
                        {t('admin.analytics.outstanding')}
                      </span>
                    </div>
                    <div className={styles.miniProgressBar}>
                      <div
                        className={styles.miniProgressFill}
                        style={{
                          width: `${percent}%`,
                          backgroundColor: draft.isFullyPaid
                            ? '#10b981'
                            : '#f59e0b',
                        }}
                      />
                    </div>
                  </div>

                  <div className={styles.feeCardControls}>
                    <div className={styles.inputGroup}>
                      <label>{t('admin.analytics.updatePayment')}</label>
                      <div className={styles.inputWithAction}>
                        <Input
                          value={draft.amountPaid}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [f.feeId]: {
                                ...prev[f.feeId],
                                amountPaid: e.target.value,
                              },
                            }))
                          }
                          className={styles.premiumInput}
                        />
                        <button
                          className={styles.saveIconButton}
                          onClick={() => savePayment(f.feeId)}
                          disabled={upsertPayment.isPending}
                          title={t('admin.analytics.save')}
                        >
                          <CheckCircle size={18} />
                        </button>
                      </div>
                    </div>

                    <label className={styles.checkboxAction}>
                      <input
                        type="checkbox"
                        checked={draft.isFullyPaid}
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
                      <span>{t('admin.analytics.markAsFullyPaid')}</span>
                    </label>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export function AdminAnalytics() {
  const { t } = useDashboardTranslation()
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
  const [editingStudent, setEditingStudent] = useState<any | null>(null)
  const [sortConfig, setSortConfig] = useState<{
    field: 'name' | 'yearGroupName' | 'balance'
    direction: 'asc' | 'desc'
  }>({ field: 'name', direction: 'asc' })

  const handleSort = (field: typeof sortConfig.field) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  if (isLoading || !stats) {
    return (
      <div className={styles.view}>
        <div className={styles.hero}>
          <div className={styles.eyebrow}>{t('admin.analytics.eyebrow')}</div>
          <h2 className={styles.title}>{t('admin.analytics.loading')}</h2>
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
    .sort((a, b) => {
      const field = sortConfig.field
      const dir = sortConfig.direction === 'asc' ? 1 : -1

      if (field === 'balance') {
        return (a.balance - b.balance) * dir
      }

      return a[field].localeCompare(b[field]) * dir
    })

  const collectionRate =
    stats.totalExpectedRevenue > 0
      ? (stats.totalCollectedRevenue / stats.totalExpectedRevenue) * 100
      : 0
  const teacherStudentRatio =
    stats.teachers > 0 ? (stats.students / stats.teachers).toFixed(1) : 'N/A'
  const attendanceRate = stats.attendancePresentPct ?? 0

  const revenueData = [
    {
      name: t('admin.analytics.collected'),
      value: stats.totalCollectedRevenue,
      color: '#10b981',
    },
    {
      name: t('admin.analytics.outstanding'),
      value: Math.max(
        0,
        stats.totalExpectedRevenue - stats.totalCollectedRevenue,
      ),
      color: '#f59e0b',
    },
  ]

  const paymentDistributionData = [
    {
      name: t('admin.analytics.fullyPaid'),
      value: stats.paymentStats.fullyPaid,
      color: '#10b981',
    },
    {
      name: t('admin.analytics.partial'),
      value: stats.paymentStats.partiallyPaid,
      color: '#f59e0b',
    },
    {
      name: t('admin.analytics.unpaid'),
      value: stats.paymentStats.notPaid,
      color: '#ef4444',
    },
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
            <span className={styles.metricLabel}>
              {t('admin.analytics.totalStudents')}
            </span>
            <Users size={20} color="var(--accent)" />
          </div>
          <div className={styles.metricValue}>{stats.students}</div>
          <div className={styles.metricFooter}>
            {t('admin.analytics.acrossYearGroups').replace(
              '{count}',
              String(stats.yearGroups),
            )}
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
            <span className={styles.metricLabel}>
              {t('admin.analytics.facultyMembers')}
            </span>
            <GraduationCap size={20} color="#10b981" />
          </div>
          <div className={styles.metricValue}>{stats.teachers}</div>
          <div className={styles.metricFooter}>
            {t('admin.analytics.studentTeacherRatio').replace(
              '{ratio}',
              String(teacherStudentRatio),
            )}
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
            <span className={styles.metricLabel}>
              {t('admin.analytics.totalRevenue')}
            </span>
            <Wallet size={20} color="#f59e0b" />
          </div>
          <div className={styles.metricValue}>
            {formatCurrency(stats.totalCollectedRevenue)}
          </div>
          <div className={styles.metricFooter}>
            {t('admin.analytics.collectionRate').replace(
              '{rate}',
              collectionRate.toFixed(1),
            )}
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
            <span className={styles.metricLabel}>
              {t('admin.analytics.attendance')}
            </span>
            <CheckCircle size={20} color="#4f46e5" />
          </div>
          <div className={styles.metricValue}>{attendanceRate.toFixed(1)}%</div>
          <div className={styles.metricFooter}>
            {t('admin.analytics.dailyAveragePresence')}
          </div>
        </div>
      </div>

      {/* School Fee Section */}
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>
              {t('admin.analytics.schoolFeesRevenue')}
            </h3>
            <p className={styles.chartSub}>
              {t('admin.analytics.collectedVsOutstandingFees')}
            </p>
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
                      t('admin.analytics.amount'),
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
                {t('admin.analytics.goalAmount').replace(
                  '{amount}',
                  formatCurrency(stats.totalExpectedRevenue),
                )}
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
            <h3 className={styles.chartTitle}>
              {t('admin.analytics.paymentStatusDistribution')}
            </h3>
            <p className={styles.chartSub}>
              {t('admin.analytics.breakdownOfSettlements')}
            </p>
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
            <h3 className={styles.chartTitle}>
              {t('admin.analytics.attendanceByCohort')}
            </h3>
            <p className={styles.chartSub}>
              {t('admin.analytics.presenceRatePerYearGroup')}
            </p>
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
                      t('admin.analytics.attendanceRate'),
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
        <div className={styles.chartHeader}>
          <div>
            <h3 className={styles.chartTitle}>
              {t('admin.analytics.studentRegistry')}
            </h3>
            <p className={styles.chartSub}>
              {t('admin.analytics.manageStudentFeesAndRecords')}
            </p>
          </div>
        </div>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={18} />
          <input
            type="text"
            placeholder={t('admin.analytics.searchStudents')}
            className={styles.premiumSearchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <div className={styles.filterSelectWrapper}>
            <Filter size={14} className={styles.filterSelectIcon} />
            <select
              className={styles.premiumSelect}
              value={selectedYearGroup}
              onChange={(e) => setSelectedYearGroup(e.target.value)}
            >
              <option value="All">{t('admin.analytics.allClasses')}</option>
              {yearGroups.map((yg) => (
                <option key={yg} value={yg}>
                  {yg}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterSelectWrapper}>
            <CheckCircle size={14} className={styles.filterSelectIcon} />
            <select
              className={styles.premiumSelect}
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value as 'All' | 'Unpaid' | 'Paid')
              }
            >
              <option value="All">{t('admin.analytics.allStatus')}</option>
              <option value="Unpaid">{t('admin.analytics.unpaidOnly')}</option>
              <option value="Paid">{t('admin.analytics.fullyPaid')}</option>
            </select>
          </div>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th
                onClick={() => handleSort('name')}
                className={styles.sortableHeader}
              >
                <div className={styles.headerWithIcon}>
                  {t('admin.analytics.student')}
                  {sortConfig.field === 'name' ? (
                    sortConfig.direction === 'asc' ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )
                  ) : (
                    <ArrowUpDown size={14} opacity={0.3} />
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort('yearGroupName')}
                className={styles.sortableHeader}
              >
                <div className={styles.headerWithIcon}>
                  {t('admin.analytics.cohort')}
                  {sortConfig.field === 'yearGroupName' ? (
                    sortConfig.direction === 'asc' ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )
                  ) : (
                    <ArrowUpDown size={14} opacity={0.3} />
                  )}
                </div>
              </th>
              <th>{t('admin.analytics.feeItems')}</th>
              <th>{t('admin.analytics.totalBilled')}</th>
              <th>{t('admin.analytics.totalPaid')}</th>
              <th
                onClick={() => handleSort('balance')}
                className={styles.sortableHeader}
              >
                <div className={styles.headerWithIcon}>
                  {t('admin.analytics.balance')}
                  {sortConfig.field === 'balance' ? (
                    sortConfig.direction === 'asc' ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )
                  ) : (
                    <ArrowUpDown size={14} opacity={0.3} />
                  )}
                </div>
              </th>
              <th>{t('admin.analytics.action')}</th>
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

      {editingStudent && (
        <StudentEditModal
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
        />
      )}
    </section>
  )
}
