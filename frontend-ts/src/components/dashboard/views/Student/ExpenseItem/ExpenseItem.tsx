// components/ExpenseItem/ExpenseItem.tsx
import { CheckCircle, AlertCircle } from 'lucide-react'
import styles from './ExpenseItem.module.scss'

export interface FeeItem {
  id: string | number
  title: string
  description?: string
  amount: number
  paid: number
  remaining: number
  isFullyPaid: boolean
  amountInWords?: string
}

interface ExpenseItemProps {
  item: FeeItem
  formatCurrency: (value: number) => string
}

export function ExpenseItem({ item, formatCurrency }: ExpenseItemProps) {
  return (
    <div className={`${styles.item} ${item.isFullyPaid ? styles.itemPaid : ''}`}>
      {/* Header row */}
      <div className={styles.header}>
        <div className={styles.infoBox}>
          <div className={styles.title}>{item.title}</div>
          <div className={styles.description}>
            {item.description ?? 'Year-group fee item'}
          </div>
        </div>

        <div className={`${styles.badge} ${item.isFullyPaid ? styles.badgePaid : styles.badgePending}`}>
          {item.isFullyPaid ? (
            <><CheckCircle size={12} /> Fully Paid</>
          ) : (
            <><AlertCircle size={12} /> Pending</>
          )}
        </div>
      </div>

      <div className={styles.divider} />

      {/* Amount grid */}
      <div className={styles.grid}>
        <GridCell label="Total Amount"      value={formatCurrency(item.amount)} />
        <GridCell label="Amount Paid"       value={formatCurrency(item.paid)} />
        <GridCell
          label="Remaining Balance"
          value={formatCurrency(item.remaining)}
          valueVariant={item.isFullyPaid ? 'success' : 'pending'}
        />
      </div>

      {/* Amount in words */}
      {item.amountInWords && (
        <div className={styles.amountInWords}>
          <strong>In words:</strong> {item.amountInWords}
        </div>
      )}
    </div>
  )
}

// ── Internal sub-component ────────────────────────────────────
interface GridCellProps {
  label: string
  value: string
  valueVariant?: 'default' | 'pending' | 'success'
}

function GridCell({ label, value, valueVariant = 'default' }: GridCellProps) {
  return (
    <div className={styles.gridItem}>
      <div className={styles.gridLabel}>{label}</div>
      <div className={`${styles.gridValue} ${valueVariant !== 'default' ? styles[`gridValue_${valueVariant}`] : ''}`}>
        {value}
      </div>
    </div>
  )
}
