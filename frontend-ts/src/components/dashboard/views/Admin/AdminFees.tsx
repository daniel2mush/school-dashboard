import {
  type AdminFeeRecord,
  type AdminFeeYearGroup,
  useUpsertFeePayment,
  useGetAdminAnalytics,
  useGetFeeManagement,
  useCreateFee,
  useDeleteFee,
} from '#/components/query/AdminQuery'
import styles from './AdminFees.module.scss'

import { Badge, Input } from '#/components/ui'
import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  CreditCard,
  Plus,
  Receipt,
  Trash2,
  Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'

function formatCFA(amount: number) {
  if (typeof amount !== 'number') return 'CFA 0'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  })
    .format(amount)
    .replace('F CFA', 'CFA')
    .replace('FCFA', 'CFA')
}

function FeePaymentModal({
  fee,
  yearGroup,
  onClose,
}: {
  fee: AdminFeeRecord
  yearGroup: AdminFeeYearGroup
  onClose: () => void
}) {
  const upsertPayment = useUpsertFeePayment()
  const [drafts, setDrafts] = useState<
    Record<
      number,
      { amountPaid: string; amountInWords: string; isFullyPaid: boolean }
    >
  >(
    Object.fromEntries(
      yearGroup.students.map((student) => {
        const payment = fee.payments.find(
          (entry) => entry.studentId === student.id,
        )
        return [
          student.id,
          {
            amountPaid: String(payment?.amountPaid ?? 0),
            amountInWords: payment?.amountInWords ?? '',
            isFullyPaid: payment?.isFullyPaid ?? false,
          },
        ]
      }),
    ),
  )

  const saveStudentPayment = async (studentId: number) => {
    const draft = drafts[studentId]
    const amountPaid = Number(String(draft.amountPaid).replace(/,/g, ''))
    await upsertPayment.mutateAsync({
      feeId: fee.id,
      studentId,
      amountPaid,
      amountInWords: draft.amountInWords,
      isFullyPaid: draft.isFullyPaid,
    })
  }

  return (
    <div className={styles.modalOverlay} role="presentation" onClick={onClose}>
      <div
        className={styles.modalDialog}
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.modalHead}>
          <div>
            <div className={styles.modalEyebrow}>Payment Ledger</div>
            <h3 className={styles.modalTitle}>{fee.title}</h3>
            <p className={styles.modalSubtitle}>
              {yearGroup.name} · {formatCFA(fee.amount)} per student
            </p>
          </div>
          <button type="button" className={styles.modalClose} onClick={onClose}>
            ×
          </button>
        </header>

        <div className={styles.modalBody}>
          <div className={styles.paymentList}>
            {yearGroup.students.map((student) => {
              const payment = fee.payments.find(
                (entry) => entry.studentId === student.id,
              )
              const draft = drafts[student.id]
              const amountPaid =
                Number(String(draft.amountPaid).replace(/,/g, '')) || 0
              const remaining = Math.max(fee.amount - amountPaid, 0)
              const fullyPaid = draft.isFullyPaid || amountPaid >= fee.amount

              return (
                <article key={student.id} className={styles.paymentRow}>
                  <div className={styles.paymentHeader}>
                    <div>
                      <div className={styles.paymentStudent}>
                        {student.name}
                      </div>
                      <div className={styles.paymentMeta}>{student.email}</div>
                    </div>
                    <Badge
                      variant={
                        fullyPaid ? 'green' : remaining > 0 ? 'amber' : 'gray'
                      }
                    >
                      {fullyPaid ? 'Fully paid' : 'Outstanding'}
                    </Badge>
                  </div>

                  <div className={styles.paymentSummary}>
                    <span>Billed {formatCFA(fee.amount)}</span>
                    <span>Paid {formatCFA(amountPaid)}</span>
                    <span>Remaining {formatCFA(remaining)}</span>
                  </div>

                  <div className={styles.paymentGrid}>
                    <Input
                      label="Amount paid"
                      value={draft.amountPaid}
                      onChange={(event) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [student.id]: {
                            ...prev[student.id],
                            amountPaid: event.target.value,
                          },
                        }))
                      }
                      placeholder="20,000"
                      fullWidth
                    />
                    <Input
                      label="Amount in words"
                      value={draft.amountInWords}
                      onChange={(event) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [student.id]: {
                            ...prev[student.id],
                            amountInWords: event.target.value,
                          },
                        }))
                      }
                      placeholder="Twenty thousand CFA"
                      fullWidth
                    />
                  </div>

                  <label className={styles.tickRow}>
                    <input
                      type="checkbox"
                      checked={fullyPaid}
                      onChange={(event) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [student.id]: {
                            ...prev[student.id],
                            isFullyPaid: event.target.checked,
                          },
                        }))
                      }
                    />
                    <span>Mark this expense as fully paid</span>
                  </label>

                  <div className={styles.paymentActions}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => saveStudentPayment(student.id)}
                      disabled={upsertPayment.isPending}
                    >
                      Save payment
                    </button>
                    {payment?.updatedAt ? (
                      <span className={styles.paymentMeta}>
                        Updated{' '}
                        {new Date(payment.updatedAt).toLocaleDateString(
                          'en-GB',
                        )}
                      </span>
                    ) : null}
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export function AdminFees() {
  const { data: analytics, isLoading: analyticsLoading } =
    useGetAdminAnalytics()
  const { data: yearGroups = [], isLoading: feeLoading } = useGetFeeManagement()
  const createFee = useCreateFee()
  const deleteFee = useDeleteFee()

  const [selectedYearGroupId, setSelectedYearGroupId] = useState<number | null>(
    null,
  )
  const [paymentFeeId, setPaymentFeeId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')

  const overviewCards = useMemo(() => {
    if (!analytics) return []
    return [
      {
        label: 'Expected Revenue',
        value: formatCFA(analytics.totalExpectedRevenue),
        icon: <Receipt size={18} strokeWidth={2} />,
      },
      {
        label: 'Collected Revenue',
        value: formatCFA(analytics.totalCollectedRevenue),
        icon: <Banknote size={18} strokeWidth={2} />,
      },
      {
        label: 'Outstanding',
        value: formatCFA(
          Math.max(
            (analytics.totalExpectedRevenue || 0) -
              (analytics.totalCollectedRevenue || 0),
            0,
          ),
        ),
        icon: <CreditCard size={18} strokeWidth={2} />,
      },
    ]
  }, [analytics])

  if (analyticsLoading || feeLoading) {
    return (
      <div className={styles.view}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading fee workspace…</p>
        </div>
      </div>
    )
  }

  if (yearGroups.length === 0) {
    return (
      <div className={styles.view}>
        <div className={styles.emptyBoard}>
          <div className={styles.emptyIcon}>
            <AlertCircle size={48} />
          </div>
          <h2>No cohorts found</h2>
          <p>
            You need to create at least one year group from the Structure tab
            before you can manage fees.
          </p>
          <div style={{ marginTop: 24 }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Refresh data
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className={styles.view}>
        <div className={styles.emptyBoard}>
          <div className={styles.emptyIcon}>
            <AlertCircle size={48} />
          </div>
          <h2>Analytics missing</h2>
          <p>Could not load financial analytics. Please try again later.</p>
        </div>
      </div>
    )
  }

  const activeYearGroup =
    yearGroups.find((yearGroup) => yearGroup.id === selectedYearGroupId) ||
    yearGroups[0]
  const activeFee =
    activeYearGroup?.fees.find((fee) => fee.id === paymentFeeId) || null


  const createFeeItem = () => {
    if (!activeYearGroup) return
    createFee.mutate(
      {
        yearGroupId: activeYearGroup.id,
        title: title.trim(),
        description: description.trim() || null,
        amount: Number(amount.replace(/,/g, '')),
      },
      {
        onSuccess: () => {
          setTitle('')
          setDescription('')
          setAmount('')
        },
      },
    )
  }

  return (
    <section className={styles.view}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}>Finance Workspace</div>
            <h1 className={styles.title}>Fee management</h1>
            <p className={styles.copy}>
              Set up fee items for each year group, track partial payments
              student by student, and keep a clear view of what has been paid,
              what is still outstanding, and which expenses are fully settled.
            </p>
          </div>
          <div className={styles.heroMeta}>
            <span className={styles.metaChip}>
              <Users size={14} strokeWidth={2} aria-hidden />
              {yearGroups.length} year groups
            </span>
            <span className={styles.metaChip}>
              <CheckCircle2 size={14} strokeWidth={2} aria-hidden />
              {analytics.studentsWithOutstandingFees} students still owe at
              least one item
            </span>
          </div>
        </div>
      </header>

      <div className={styles.overviewGrid}>
        {overviewCards.map((card) => (
          <article key={card.label} className={styles.overviewCard}>
            <div className={styles.overviewIcon}>{card.icon}</div>
            <div>
              <div className={styles.overviewLabel}>{card.label}</div>
              <div className={styles.overviewValue}>{card.value}</div>
            </div>
          </article>
        ))}
      </div>

      <div className={styles.workspace}>
        <aside className={styles.yearGroupRail}>
          <div className={styles.sectionHead}>
            <h2>Year groups</h2>
            <span>Select a cohort</span>
          </div>
          <div className={styles.yearGroupList}>
            {yearGroups.map((yearGroup) => {
              const expected = yearGroup.fees.reduce(
                (sum, fee) => sum + fee.amount * yearGroup.students.length,
                0,
              )
              const collected = yearGroup.fees.reduce(
                (sum, fee) =>
                  sum +
                  fee.payments.reduce(
                    (paymentSum, payment) => paymentSum + payment.amountPaid,
                    0,
                  ),
                0,
              )

              return (
                <button
                  key={yearGroup.id}
                  type="button"
                  className={`${styles.yearGroupCard} ${activeYearGroup?.id === yearGroup.id ? styles.yearGroupCardActive : ''}`}
                  onClick={() => setSelectedYearGroupId(yearGroup.id)}
                >
                  <div className={styles.yearGroupName}>{yearGroup.name}</div>
                  <div className={styles.yearGroupMeta}>
                    {yearGroup.students.length} students ·{' '}
                    {yearGroup.fees.length} charges
                  </div>
                  <div className={styles.yearGroupValues}>
                    <span>Expected {formatCFA(expected)}</span>
                    <span>Collected {formatCFA(collected)}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </aside>

        <div className={styles.mainPanel}>
          {activeYearGroup ? (
            <>
              <div className={styles.panelHeader}>
                <div>
                  <div className={styles.sectionEyebrow}>Fee setup</div>
                  <h2>{activeYearGroup.name}</h2>
                  <p>
                    Add expense lines that apply to every student in this year
                    group, then record payment against each item individually.
                  </p>
                </div>
              </div>

              <section className={styles.createCard}>
                <div className={styles.sectionHead}>
                  <h3>Add fee item</h3>
                  <span>Examples: School fees, exams, books, transport</span>
                </div>
                <div className={styles.createGrid}>
                  <Input
                    label="Fee title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="e.g. Term 2 School Fees"
                    fullWidth
                  />
                  <Input
                    label="Amount"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="20,000"
                    fullWidth
                  />
                </div>
                <Input
                  label="Description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Optional note about this charge"
                  fullWidth
                />
                <div className={styles.createActions}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={createFeeItem}
                    disabled={
                      createFee.isPending || !title.trim() || !amount.trim()
                    }
                  >
                    <Plus size={16} strokeWidth={2} />
                    Add fee item
                  </button>
                </div>
              </section>

              <section className={styles.feesBoard}>
                <div className={styles.sectionHead}>
                  <h3>Charge list</h3>
                  <span>{activeYearGroup.fees.length} active fee items</span>
                </div>

                {activeYearGroup.fees.length === 0 ? (
                  <div className={styles.emptyState}>
                    No fee items yet. Add a charge for this year group to start
                    tracking payments.
                  </div>
                ) : (
                  <div className={styles.feeList}>
                    {activeYearGroup.fees.map((fee) => {
                      const totalCollected = fee.payments.reduce(
                        (sum, payment) => sum + payment.amountPaid,
                        0,
                      )
                      const expectedTotal =
                        fee.amount * activeYearGroup.students.length
                      const paidStudents = fee.payments.filter(
                        (payment) =>
                          payment.isFullyPaid ||
                          payment.amountPaid >= fee.amount,
                      ).length

                      return (
                        <article key={fee.id} className={styles.feeCard}>
                          <div className={styles.feeCardTop}>
                            <div>
                              <h4>{fee.title}</h4>
                              <p>
                                {fee.description ||
                                  'Applies to every student in this year group.'}
                              </p>
                            </div>
                            <button
                              type="button"
                              className={styles.deleteBtn}
                              onClick={() => deleteFee.mutate(fee.id)}
                              disabled={deleteFee.isPending}
                            >
                              <Trash2 size={16} strokeWidth={2} />
                            </button>
                          </div>

                          <div className={styles.feeMetrics}>
                            <div>
                              <span>Per student</span>
                              <strong>{formatCFA(fee.amount)}</strong>
                            </div>
                            <div>
                              <span>Collected</span>
                              <strong>{formatCFA(totalCollected)}</strong>
                            </div>
                            <div>
                              <span>Expected total</span>
                              <strong>{formatCFA(expectedTotal)}</strong>
                            </div>
                            <div>
                              <span>Fully paid students</span>
                              <strong>
                                {paidStudents}/{activeYearGroup.students.length}
                              </strong>
                            </div>
                          </div>

                          <div className={styles.feeActions}>
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={() => setPaymentFeeId(fee.id)}
                            >
                              Record payments
                            </button>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                )}
              </section>
            </>
          ) : (
            <div className={styles.emptyState}>
              No year groups available yet.
            </div>
          )}
        </div>
      </div>

      {activeYearGroup && activeFee ? (
        <FeePaymentModal
          fee={activeFee}
          yearGroup={activeYearGroup}
          onClose={() => setPaymentFeeId(null)}
        />
      ) : null}
    </section>
  )
}
