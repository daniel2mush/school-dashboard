// components/FeeSummaryPanel/FeeSummaryPanel.tsx
import { CheckCircle } from 'lucide-react'
import styles from './FeeSummaryPanel.module.scss'

interface FeeSummaryPanelProps {
  yearGroupName: string
  isFullyPaid: boolean
}

export function FeeSummaryPanel({
  yearGroupName,
  isFullyPaid,
}: FeeSummaryPanelProps) {
  return (
    <div
      className={`${styles.panel} ${isFullyPaid ? styles.panelSuccess : ''}`}
    >
      <div className={styles.eyebrow}>Finances</div>
      <h2 className={styles.title}>Fee Status &amp; Bills</h2>
      <p className={styles.copy}>
        Keep track of your outstanding balances for {yearGroupName}.
      </p>

      {isFullyPaid && (
        <div className={styles.thankYouBanner}>
          <CheckCircle className={styles.thankYouIcon} size={28} />
          <div>
            <div className={styles.thankYouTitle}>Thank You!</div>
            <div className={styles.thankYouText}>
              All your fees for {yearGroupName} have been fully paid. We
              appreciate your prompt payment.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
