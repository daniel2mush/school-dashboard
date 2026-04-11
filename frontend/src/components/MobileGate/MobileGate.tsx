import { Monitor } from 'lucide-react'
import { useDashboardTranslation } from '#/components/dashboard/i18n'
import { Button } from '#/components/ui/Button/Button'
import styles from './MobileGate.module.scss'

interface MobileGateProps {
  onLogout?: () => void
  isLoggingOut?: boolean
}

export function MobileGate({ onLogout, isLoggingOut }: MobileGateProps) {
  const { t } = useDashboardTranslation()

  return (
    <main className={styles.mobileGate}>
      <div className={styles.mobileGateCard}>
        <div className={styles.mobileGateIcon}>
          <Monitor size={48} strokeWidth={1.5} />
        </div>
        <span className={styles.mobileGateEyebrow}>
          {t('auth.mobileRestrictedEyebrow')}
        </span>
        <h1 className={styles.mobileGateTitle}>
          {t('auth.mobileRestrictedTitle')}
        </h1>
        <p className={styles.mobileGateCopy}>
          {t('auth.mobileRestrictedMessage').replace(
            'after login. Please sign out now and',
            'to',
          )}
        </p>
        {onLogout && (
          <Button
            type="button"
            variant="danger"
            size="lg"
            loading={isLoggingOut}
            onClick={onLogout}
            fullWidth
          >
            {t('common.signOut')}
          </Button>
        )}
      </div>
    </main>
  )
}
