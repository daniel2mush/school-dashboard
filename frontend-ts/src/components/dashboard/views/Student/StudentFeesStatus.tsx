import styles from './StudentFeesStatus.module.scss'
import { useCurrency } from '#/context/CurrencyContext'
import useCurrentStudent from '#/components/hooks/useCurrentStudent.ts'

export function StudentFeesStatus() {
  const currentData = useCurrentStudent()
  const { formatCurrency } = useCurrency()

  if (!currentData) return null

  const { student, yearGroup } = currentData
  const { total, paid } = student.fees
  const feeItems = student.fees.items || []

  const balance = total - paid
  const percentagePaid = total > 0 ? Math.round((paid / total) * 100) : 100

  return (
    <section className={styles.view}>
      <div className={styles.panel}>
        <div className={styles.eyebrow}>Finances</div>
        <h2 className={styles.title}>Fee Status & Bills</h2>
        <p className={styles.copy}>
          Keep track of your outstanding balances for {yearGroup.name}.
        </p>
      </div>

      <div className={styles.feeCards}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Total Billed</div>
          <div className={styles.cardValue}>{formatCurrency(total)}</div>

          <div className={styles.progressContainer}>
            <div className={styles.progressLabel}>
              <span>Amount Paid: {formatCurrency(paid)}</span>
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
          <div className={styles.cardLabel}>Outstanding Balance</div>
          <div className={styles.cardValue}>{formatCurrency(balance)}</div>

          {balance > 0 ? (
            <p className={styles.cardNotice}>
              Please settle the outstanding balance before end of term to avoid
              disruptions.
            </p>
          ) : (
            <p className={styles.cardSuccess}>
              Your account is fully settled. Thank you!
            </p>
          )}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardLabel}>Expense list</div>
        {feeItems.length === 0 ? (
          <p className={styles.emptyText}>
            No fee items have been assigned to your year group yet.
          </p>
        ) : (
          <div className={styles.expenseList}>
            {feeItems.map((item: any) => (
              <div key={item.id} className={styles.expenseItem}>
                <div className={styles.expenseHeader}>
                  <div>
                    <div className={styles.expenseTitle}>{item.title}</div>
                    <div className={styles.expenseDesc}>
                      {item.description || 'Year-group fee item'}
                    </div>
                  </div>
                  <div
                    className={`${styles.expenseStatus} ${
                      item.isFullyPaid ? styles.paid : styles.pending
                    }`}
                  >
                    {item.isFullyPaid ? 'Fully paid' : 'Pending'}
                  </div>
                </div>
                <div className={styles.expenseGrid}>
                  <span>Total: {formatCurrency(item.amount)}</span>
                  <span>Paid: {formatCurrency(item.paid)}</span>
                  <span>Remaining: {formatCurrency(item.remaining)}</span>
                </div>
                {item.amountInWords ? (
                  <div className={styles.amountInWords}>
                    Amount in words: {item.amountInWords}
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
