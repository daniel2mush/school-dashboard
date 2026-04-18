import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Receipt,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Download,
  Calendar,
  FileText,
} from 'lucide-react'
import styles from './StudentFeesStatus.module.scss'
import { useCurrency } from '#/context/CurrencyContext'
import useCurrentStudent from '#/components/hooks/useCurrentStudent.ts'
import { useDashboardTranslation } from '#/components/dashboard/i18n'

export function StudentFeesStatus() {
  const currentData = useCurrentStudent()
  const { formatCurrency } = useCurrency()
  const { t } = useDashboardTranslation()

  if (!currentData) return null

  const { student, yearGroup } = currentData
  const { total, paid, items: feeItems } = student.fees

  const balance = total - paid
  const percentagePaid = total > 0 ? Math.round((paid / total) * 100) : 100
  const isFullySettled = balance <= 0

  return (
    <section className={styles.view}>
      <div className={styles.statusHero}>
        <div className={styles.mainMetrics}>
          <div className={styles.heroCard}>
            <div className={styles.heroLabel}>
              <TrendingUp size={16} />
              {t('student.fees.totalBilled')}
            </div>
            <div className={styles.heroValue}>{formatCurrency(total)}</div>
            <div className={styles.heroSub}>
              {t('student.fees.amountPaidLabel')}: {formatCurrency(paid)}
            </div>
          </div>

          <div
            className={`${styles.heroCard} ${!isFullySettled ? styles.alert : styles.success}`}
          >
            <div className={styles.heroLabel}>
              {isFullySettled ? (
                <CheckCircle2 size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              {t('student.fees.outstandingBalance')}
            </div>
            <div className={styles.heroValue}>{formatCurrency(balance)}</div>
            <div className={styles.heroSub}>
              {isFullySettled
                ? t('student.fees.settled')
                : t('student.fees.settleNotice')}
            </div>
          </div>
        </div>

        <div className={styles.progressSection}>
          <div className={styles.progressHeader}>
            <span>{t('student.fees.paymentProgress')}</span>
            <strong>{percentagePaid}%</strong>
          </div>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${percentagePaid}%` }}
            />
          </div>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.ledgerSection}>
          <div className={styles.sectionHeading}>
            <Receipt size={20} />
            <h3>{t('student.fees.expenseList')}</h3>
          </div>

          {feeItems.length === 0 ? (
            <div className={styles.emptyState}>
              <FileText size={48} />
              <p>{t('student.fees.noItems')}</p>
            </div>
          ) : (
            <div className={styles.expenseList}>
              {feeItems.map((item: any) => (
                <div key={item.id} className={styles.expenseCard}>
                  <div className={styles.expenseMain}>
                    <div className={styles.expenseIcon}>
                      <CreditCard size={20} />
                    </div>
                    <div className={styles.expenseDetails}>
                      <div className={styles.expenseTop}>
                        <h4>{item.title}</h4>
                        <span
                          className={`${styles.badge} ${item.isFullyPaid ? styles.paid : styles.pending}`}
                        >
                          {item.isFullyPaid
                            ? t('student.fees.fullyPaid')
                            : t('student.fees.pending')}
                        </span>
                      </div>
                      <p>
                        {item.description || t('student.fees.yearGroupFeeItem')}
                      </p>
                    </div>
                  </div>

                  <div className={styles.expenseFinancials}>
                    <div className={styles.finRow}>
                      <label>{t('student.fees.total')}</label>
                      <span>{formatCurrency(item.amount)}</span>
                    </div>
                    <div className={styles.finRow}>
                      <label>{t('student.fees.paid')}</label>
                      <span>{formatCurrency(item.paid)}</span>
                    </div>
                    <div className={`${styles.finRow} ${styles.total}`}>
                      <label>{t('student.fees.remaining')}</label>
                      <span>{formatCurrency(item.remaining)}</span>
                    </div>
                  </div>

                  {item.amountInWords && (
                    <div className={styles.wordAmount}>
                      <ArrowRight size={12} />
                      {item.amountInWords}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.sidebar}>
          <div className={styles.infoBox}>
            <Calendar size={20} />
            <h4>{t('student.fees.paymentSchedule')}</h4>
            <p>{t('student.fees.paymentScheduleCopy')}</p>
          </div>

          <div className={styles.supportBox}>
            <AlertCircle size={20} />
            <h4>{t('student.fees.needSupport')}</h4>
            <p>{t('student.fees.needSupportCopy')}</p>
            <button className={styles.contactBtn}>
              {t('student.fees.contactAccounts')}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
