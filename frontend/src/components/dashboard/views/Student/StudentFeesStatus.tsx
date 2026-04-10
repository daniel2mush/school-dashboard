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
  const { total, paid } = student.fees
  const feeItems = student.fees.items

  const balance = total - paid
  const percentagePaid = total > 0 ? Math.round((paid / total) * 100) : 100

  return (
    <section className={styles.view}>
      <div className={styles.panel}>
        <div className={styles.eyebrow}>{t('student.fees.eyebrow')}</div>
        <h2 className={styles.title}>{t('student.fees.title')}</h2>
        <p className={styles.copy}>
          {t('student.fees.copy').replace('{yearGroup}', yearGroup.name)}
        </p>
      </div>

      <div className={styles.feeCards}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>
            {t('student.fees.totalBilled')}
          </div>
          <div className={styles.cardValue}>{formatCurrency(total)}</div>

          <div className={styles.progressContainer}>
            <div className={styles.progressLabel}>
              <span>
                {t('student.fees.amountPaid')}: {formatCurrency(paid)}
              </span>
              <span>{percentagePaid}%</span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${percentagePaid}%` }}
              />
            </div>
          </div>
        </div>

        <div className={`${styles.card} ${balance > 0 ? styles.debt : ''}`}>
          <div className={styles.cardLabel}>
            {t('student.fees.outstandingBalance')}
          </div>
          <div className={styles.cardValue}>{formatCurrency(balance)}</div>

          {balance > 0 ? (
            <p className={styles.cardNotice}>
              {t('student.fees.settleNotice')}
            </p>
          ) : (
            <p className={styles.cardSuccess}>{t('student.fees.settled')}</p>
          )}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardLabel}>{t('student.fees.expenseList')}</div>
        {feeItems.length === 0 ? (
          <p className={styles.emptyText}>{t('student.fees.noItems')}</p>
        ) : (
          <div className={styles.expenseList}>
            {feeItems.map((item: any) => (
              <div key={item.id} className={styles.expenseItem}>
                <div className={styles.expenseHeader}>
                  <div>
                    <div className={styles.expenseTitle}>{item.title}</div>
                    <div className={styles.expenseDesc}>
                      {item.description || t('student.fees.yearGroupFeeItem')}
                    </div>
                  </div>
                  <div
                    className={`${styles.expenseStatus} ${
                      item.isFullyPaid ? styles.paid : styles.pending
                    }`}
                  >
                    {item.isFullyPaid
                      ? t('student.fees.fullyPaid')
                      : t('student.fees.pending')}
                  </div>
                </div>
                <div className={styles.expenseGrid}>
                  <span>
                    {t('student.fees.total')}: {formatCurrency(item.amount)}
                  </span>
                  <span>
                    {t('student.fees.paid')}: {formatCurrency(item.paid)}
                  </span>
                  <span>
                    {t('student.fees.remaining')}:{' '}
                    {formatCurrency(item.remaining)}
                  </span>
                </div>
                {item.amountInWords ? (
                  <div className={styles.amountInWords}>
                    {t('student.fees.amountInWords')}: {item.amountInWords}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
