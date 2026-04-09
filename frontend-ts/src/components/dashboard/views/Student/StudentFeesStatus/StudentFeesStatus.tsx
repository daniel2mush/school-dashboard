// components/StudentFeesStatus/StudentFeesStatus.tsx
//
// This component is now a thin orchestrator.
// All visual logic lives in its sub-components:
//   FeeSummaryPanel   — hero header with optional "thank you" banner
//   FeeCard           — reusable metric card (total billed + outstanding)
//   ExpenseBreakdown  — list wrapper with empty state
//   ExpenseItem       — individual fee line item

import useCurrentStudent from '#/components/hooks/useCurrentStudent'
import { useCurrency } from '#/context/CurrencyContext'
import { Banknote, CreditCard, CheckCircle } from 'lucide-react'
import { ExpenseBreakdown } from '../ExpenseBreakdown'
import { FeeCard } from '../FeeCard'
import styles from './StudentFeesStatus.module.scss'
import { FeeSummaryPanel } from '../FeeSummaryPanel'

export function StudentFeesStatus() {
  const currentData = useCurrentStudent()
  const { formatCurrency } = useCurrency()

  if (!currentData) return null

  const { student, yearGroup } = currentData
  const { total, paid } = student.fees
  const feeItems = student.fees.items ?? []

  const balance = total - paid
  const percentagePaid = total > 0 ? Math.round((paid / total) * 100) : 100
  const isFullyPaid = balance === 0 && total > 0

  return (
    <section className={styles.view}>
      {/* ── Hero panel ── */}
      <FeeSummaryPanel
        yearGroupName={yearGroup.name}
        isFullyPaid={isFullyPaid}
      />

      {/* ── Summary cards ── */}
      <div className={styles.cardGrid}>
        <FeeCard
          label="Total Billed"
          value={formatCurrency(total)}
          icon={Banknote}
          progress={{
            label: `Paid: ${formatCurrency(paid)}`,
            percentage: percentagePaid,
          }}
        />

        <FeeCard
          label="Amount Paid"
          value={formatCurrency(paid)}
          icon={CheckCircle}
          variant={percentagePaid >= 100 ? 'settled' : 'default'}
          progress={{
            label: 'Completion',
            percentage: percentagePaid,
          }}
        />

        <FeeCard
          label="Outstanding Balance"
          value={formatCurrency(balance)}
          icon={CreditCard}
          variant={balance > 0 ? 'debt' : 'settled'}
          notice={
            balance > 0
              ? {
                  type: 'warning',
                  message:
                    'Please settle the outstanding balance before end of term to avoid disruptions.',
                }
              : {
                  type: 'success',
                  message: 'Your account is fully settled. Thank you!',
                }
          }
        />
      </div>

      {/* ── Itemised breakdown ── */}
      <ExpenseBreakdown items={feeItems} formatCurrency={formatCurrency} />
    </section>
  )
}
