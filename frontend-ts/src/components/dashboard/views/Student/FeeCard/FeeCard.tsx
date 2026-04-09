// components/FeeCard/FeeCard.tsx
import { AlertCircle, CheckCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import styles from './FeeCard.module.scss'

interface FeeCardProps {
  label: string
  value: string // pre-formatted currency string
  icon: LucideIcon
  variant?: 'default' | 'debt' | 'settled'
  /** Optional progress bar shown below the value */
  progress?: {
    label: string // e.g. "Amount Paid: GHS 1,800"
    percentage: number
  }
  /** Optional notice shown at the bottom of the card */
  notice?: {
    type: 'warning' | 'success'
    message: string
  }
}

export function FeeCard({
  label,
  value,
  icon: Icon,
  variant = 'default',
  progress,
  notice,
}: FeeCardProps) {
  const iconClass =
    variant === 'debt'
      ? styles.iconWrapperDebt
      : variant === 'settled'
        ? styles.iconWrapperSettled
        : styles.iconWrapperDefault

  return (
    <div
      className={`${styles.card} ${variant !== 'default' ? styles[variant] : ''}`}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={`${styles.iconWrapper} ${iconClass}`}>
          <Icon size={20} className={styles.icon} />
        </div>
        <div className={styles.label}>{label}</div>
      </div>

      {/* Main value */}
      <div className={styles.value}>{value}</div>

      {/* Progress bar (optional) */}
      {progress && (
        <div className={styles.progressContainer}>
          <div className={styles.progressLabel}>
            <span>{progress.label}</span>
            <span
              className={
                progress.percentage === 100 ? styles.progressPctSuccess : ''
              }
            >
              {progress.percentage}%
            </span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={`${styles.progressFill} ${progress.percentage === 100 ? styles.progressFillSuccess : ''}`}
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Notice box (optional) */}
      {notice && (
        <div
          className={
            notice.type === 'warning' ? styles.noticeBox : styles.successBox
          }
        >
          {notice.type === 'warning' ? (
            <AlertCircle size={16} className={styles.noticeIcon} />
          ) : (
            <CheckCircle size={16} className={styles.successIcon} />
          )}
          <p
            className={
              notice.type === 'warning' ? styles.noticeText : styles.successText
            }
          >
            {notice.message}
          </p>
        </div>
      )}
    </div>
  )
}
