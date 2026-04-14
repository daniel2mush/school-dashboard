import {
  useUpsertFeePayment,
  useGetAdminAnalytics,
  useGetFeeManagement,
  useCreateFee,
  useDeleteFee,
} from '#/components/query/AdminQuery'
import type {
  AdminFeeRecord,
  AdminFeeYearGroup,
} from '#/components/query/AdminQuery'
import styles from './AdminFees.module.scss'
import { useCurrency } from '#/context/CurrencyContext'
import type { CurrencyCode } from '#/context/CurrencyContext'

import { Badge, Input } from '#/components/ui'
import { useDashboardTranslation } from '#/components/dashboard/i18n'
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

function FeePaymentModal({
  fee,
  yearGroup,
  onClose,
}: {
  fee: AdminFeeRecord
  yearGroup: AdminFeeYearGroup
  onClose: () => void
}) {
  const { t, language } = useDashboardTranslation()
  const { formatCurrency } = useCurrency()
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
            <div className={styles.modalEyebrow}>
              {t('admin.fees.paymentLedger')}
            </div>
            <h3 className={styles.modalTitle}>{fee.title}</h3>
            <p className={styles.modalSubtitle}>
              {yearGroup.name} ·{' '}
              {t('admin.fees.perStudentAmount').replace(
                '{amount}',
                formatCurrency(fee.amount),
              )}
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
                      {fullyPaid
                        ? t('admin.fees.fullyPaid')
                        : t('admin.fees.outstanding')}
                    </Badge>
                  </div>

                  <div className={styles.paymentSummary}>
                    <span>
                      {t('admin.fees.billedAmount').replace(
                        '{amount}',
                        formatCurrency(fee.amount),
                      )}
                    </span>
                    <span>
                      {t('admin.fees.paidAmount').replace(
                        '{amount}',
                        formatCurrency(amountPaid),
                      )}
                    </span>
                    <span>
                      {t('admin.fees.remainingAmount').replace(
                        '{amount}',
                        formatCurrency(remaining),
                      )}
                    </span>
                  </div>

                  <div className={styles.paymentGrid}>
                    <Input
                      label={t('admin.fees.amountPaid')}
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
                      placeholder={t('admin.fees.amountPlaceholder')}
                      fullWidth
                    />
                    <Input
                      label={t('admin.fees.amountInWords')}
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
                      placeholder={t('admin.fees.amountInWordsPlaceholder')}
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
                    <span>{t('admin.fees.markExpenseFullyPaid')}</span>
                  </label>

                  <div className={styles.paymentActions}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => saveStudentPayment(student.id)}
                      disabled={upsertPayment.isPending}
                    >
                      {t('admin.fees.savePayment')}
                    </button>
                    {payment?.updatedAt ? (
                      <span className={styles.paymentMeta}>
                        {t('admin.fees.updatedOn').replace(
                          '{date}',
                          new Date(payment.updatedAt).toLocaleDateString(
                            language === 'fr' ? 'fr-FR' : 'en-GB',
                          ),
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
  const { t } = useDashboardTranslation()
  const { currency, setCurrency, formatCurrency } = useCurrency()
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
        label: t('admin.fees.expectedRevenue'),
        value: formatCurrency(analytics.totalExpectedRevenue),
        icon: <Receipt size={18} strokeWidth={2} />,
      },
      {
        label: t('admin.fees.collectedRevenue'),
        value: formatCurrency(analytics.totalCollectedRevenue),
        icon: <Banknote size={18} strokeWidth={2} />,
      },
      {
        label: t('admin.fees.outstanding'),
        value: formatCurrency(
          Math.max(
            (analytics.totalExpectedRevenue || 0) -
              (analytics.totalCollectedRevenue || 0),
            0,
          ),
        ),
        icon: <CreditCard size={18} strokeWidth={2} />,
      },
    ]
  }, [analytics, formatCurrency, t])

  if (analyticsLoading || feeLoading) {
    return (
      <div className={styles.view}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>{t('admin.fees.loading')}</p>
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
          <h2>{t('admin.fees.noCohorts')}</h2>
          <p>{t('admin.fees.noCohortsCopy')}</p>
          <div style={{ marginTop: 24 }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              {t('admin.fees.refreshData')}
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
          <h2>{t('admin.fees.analyticsMissing')}</h2>
          <p>{t('admin.fees.analyticsMissingCopy')}</p>
        </div>
      </div>
    )
  }

  const activeYearGroup =
    yearGroups.find((yearGroup) => yearGroup.id === selectedYearGroupId) ||
    yearGroups[0]
  const activeFee = activeYearGroup.fees.find((fee) => fee.id === paymentFeeId)

  const createFeeItem = () => {
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
            <div className={styles.eyebrow}>{t('admin.fees.eyebrow')}</div>
            {/* <h1 className={styles.title}>{t('admin.fees.title')}</h1> */}
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
            {/* <p className={styles.copy}>{t('admin.fees.copy')}</p> */}
          </div>
          <div className={styles.heroMeta}>
            <span className={styles.metaChip}>
              <Users size={14} strokeWidth={2} aria-hidden />
              {t('admin.fees.yearGroupsCount').replace(
                '{count}',
                String(yearGroups.length),
              )}
            </span>
            <span className={styles.metaChip}>
              <CheckCircle2 size={14} strokeWidth={2} aria-hidden />
              {t('admin.fees.studentsWithOutstandingFees').replace(
                '{count}',
                String(analytics.studentsWithOutstandingFees),
              )}
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
            <h2>{t('admin.fees.yearGroups')}</h2>
            <span>{t('admin.fees.selectCohort')}</span>
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
                  className={`${styles.yearGroupCard} ${activeYearGroup.id === yearGroup.id ? styles.yearGroupCardActive : ''}`}
                  onClick={() => setSelectedYearGroupId(yearGroup.id)}
                >
                  <div className={styles.yearGroupName}>{yearGroup.name}</div>
                  <div className={styles.yearGroupMeta}>
                    {t('admin.fees.yearGroupMeta')
                      .replace('{students}', String(yearGroup.students.length))
                      .replace('{charges}', String(yearGroup.fees.length))}
                  </div>
                  <div className={styles.yearGroupValues}>
                    <span>
                      {t('admin.fees.expectedAmount').replace(
                        '{amount}',
                        formatCurrency(expected),
                      )}
                    </span>
                    <span>
                      {t('admin.fees.collectedAmount').replace(
                        '{amount}',
                        formatCurrency(collected),
                      )}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </aside>

        <div className={styles.mainPanel}>
          <>
            <div className={styles.panelHeader}>
              <div>
                <div className={styles.sectionEyebrow}>
                  {t('admin.fees.feeSetup')}
                </div>
                <h2>{activeYearGroup.name}</h2>
                <p>{t('admin.fees.feeSetupCopy')}</p>
              </div>
            </div>

            <section className={styles.createCard}>
              <div className={styles.sectionHead}>
                <h3>{t('admin.fees.addFeeItem')}</h3>
                <span>{t('admin.fees.addFeeItemExamples')}</span>
              </div>
              <div className={styles.createGrid}>
                <Input
                  label={t('admin.fees.feeTitle')}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder={t('admin.fees.feeTitlePlaceholder')}
                  fullWidth
                />
                <Input
                  label={t('admin.fees.amount')}
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder={t('admin.fees.amountPlaceholder')}
                  fullWidth
                />
              </div>
              <Input
                label={t('admin.fees.description')}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder={t('admin.fees.descriptionPlaceholder')}
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
                  {t('admin.fees.addFeeItem')}
                </button>
              </div>
            </section>

            <section className={styles.feesBoard}>
              <div className={styles.sectionHead}>
                <h3>{t('admin.fees.chargeList')}</h3>
                <span>
                  {t('admin.fees.activeFeeItems').replace(
                    '{count}',
                    String(activeYearGroup.fees.length),
                  )}
                </span>
              </div>

              {activeYearGroup.fees.length === 0 ? (
                <div className={styles.emptyState}>
                  {t('admin.fees.noFeeItems')}
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
                        payment.isFullyPaid || payment.amountPaid >= fee.amount,
                    ).length

                    return (
                      <article key={fee.id} className={styles.feeCard}>
                        <div className={styles.feeCardTop}>
                          <div>
                            <h4>{fee.title}</h4>
                            <p>
                              {fee.description ||
                                t('admin.fees.defaultDescription')}
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
                            <span>{t('admin.fees.perStudent')}</span>
                            <strong>{formatCurrency(fee.amount)}</strong>
                          </div>
                          <div>
                            <span>{t('admin.fees.collected')}</span>
                            <strong>{formatCurrency(totalCollected)}</strong>
                          </div>
                          <div>
                            <span>{t('admin.fees.expectedTotal')}</span>
                            <strong>{formatCurrency(expectedTotal)}</strong>
                          </div>
                          <div>
                            <span>{t('admin.fees.fullyPaidStudents')}</span>
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
                            {t('admin.fees.recordPayments')}
                          </button>
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
            </section>
          </>
        </div>
      </div>

      {activeFee ? (
        <FeePaymentModal
          fee={activeFee}
          yearGroup={activeYearGroup}
          onClose={() => setPaymentFeeId(null)}
        />
      ) : null}
    </section>
  )
}
