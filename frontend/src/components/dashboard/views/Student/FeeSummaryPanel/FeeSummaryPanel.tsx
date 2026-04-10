// components/FeeSummaryPanel/FeeSummaryPanel.tsx
import { CheckCircle } from 'lucide-react'
import { useDashboardTranslation } from '#/components/dashboard/i18n'
import styles from './FeeSummaryPanel.module.scss'

interface FeeSummaryPanelProps {
  yearGroupName: string
  isFullyPaid: boolean
}

export function FeeSummaryPanel({
  yearGroupName,
  isFullyPaid,
}: FeeSummaryPanelProps) {
  const { t } = useDashboardTranslation()

  return (
    <div
      className={`${styles.panel} ${isFullyPaid ? styles.panelSuccess : ''}`}
    >
      <div className={styles.eyebrow}>{t('student.fees.eyebrow')}</div>
      <h2 className={styles.title}>{t('student.fees.title')}</h2>
      <p className={styles.copy}>
        {t('student.fees.copy').replace('{yearGroup}', yearGroupName)}
      </p>

      {isFullyPaid && (
        <div className={styles.thankYouBanner}>
          <CheckCircle className={styles.thankYouIcon} size={28} />
          <div>
            <div className={styles.thankYouTitle}>
              {t('student.fees.thankYou')}
            </div>
            <div className={styles.thankYouText}>
              {t('student.fees.thankYouCopy').replace(
                '{yearGroup}',
                yearGroupName,
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
