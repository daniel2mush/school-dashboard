// components/ExpenseBreakdown/ExpenseBreakdown.tsx
import { useDashboardTranslation } from '#/components/dashboard/i18n'
import { ExpenseItem } from '../ExpenseItem'
import type { FeeItem } from '../ExpenseItem'
import styles from './ExpenseBreakdown.module.scss'

interface ExpenseBreakdownProps {
  items: FeeItem[]
  formatCurrency: (value: number) => string
}

export function ExpenseBreakdown({
  items,
  formatCurrency,
}: ExpenseBreakdownProps) {
  const { t } = useDashboardTranslation()
  const pendingCount = items.filter((item) => !item.isFullyPaid).length
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0)

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.label}>{t('student.fees.expenseList')}</div>
        {items.length > 0 && (
          <div className={styles.summary}>
            {t('student.fees.breakdownSummary')
              .replace('{items}', String(items.length))
              .replace('{pending}', String(pendingCount))}{' '}
            ·{' '}
            {formatCurrency(totalAmount)}
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className={styles.list}>
          {items.map((item) => (
            <ExpenseItem
              key={item.id}
              item={item}
              formatCurrency={formatCurrency}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  const { t } = useDashboardTranslation()

  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>💰</div>
      <p className={styles.emptyText}>
        {t('student.fees.noItems')}
      </p>
    </div>
  )
}
