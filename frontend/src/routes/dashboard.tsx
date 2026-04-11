import {
  createFileRoute,
  Outlet,
  redirect,
  useLocation,
} from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import useUserStore from '#/components/store/UserStore'
import DashboardHeader from '#/components/dashboard/DashboardHeader/DashboardHeader'
import { useDashboardLanguage, useDashboardTranslation } from '#/components/dashboard/i18n'
import Sidebar from '#/components/dashboard/Sidebar/Sidebar'
import styles from './dashboard/Dashboard.module.scss'
import { getSectionLabel } from '#/components/constants/navigation'
import { useLogout } from '#/components/query/AuthQuery'
import { Button } from '#/components/ui/Button/Button'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: () => {
    if (typeof window !== 'undefined') {
      const user = useUserStore.getState().user
      if (!user) {
        throw redirect({ to: '/login' })
      }
    }
  },
  component: DashboardLayout,
})

function DashboardLayout() {
  const { user } = useUserStore()
  const location = useLocation()
  const language = useDashboardLanguage()
  const { t } = useDashboardTranslation()
  const { mutateAsync: logoutMutation, isPending: isLoggingOut } = useLogout()
  const [isPhoneScreen, setIsPhoneScreen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(max-width: 767px)')
    const updateScreenSize = (event?: MediaQueryListEvent) => {
      setIsPhoneScreen(event ? event.matches : mediaQuery.matches)
    }

    updateScreenSize()
    mediaQuery.addEventListener('change', updateScreenSize)

    return () => mediaQuery.removeEventListener('change', updateScreenSize)
  }, [])

  // Derive the current section from the URL path
  // Example: /dashboard/admin/announcements -> 'announcements'
  const pathParts = location.pathname.split('/').filter(Boolean)
  const currentSection = pathParts[pathParts.length - 1] || 'overview'

  if (!user) return null

  if (isPhoneScreen) {
    return (
      <main className={styles.mobileGate}>
        <div className={styles.mobileGateCard}>
          <span className={styles.mobileGateEyebrow}>
            {t('auth.mobileRestrictedEyebrow')}
          </span>
          <h1 className={styles.mobileGateTitle}>
            {t('auth.mobileRestrictedTitle')}
          </h1>
          <p className={styles.mobileGateCopy}>
            {t('auth.mobileRestrictedMessage')}
          </p>
          <Button
            type="button"
            variant="danger"
            size="lg"
            loading={isLoggingOut}
            onClick={() => logoutMutation()}
          >
            {t('common.signOut')}
          </Button>
        </div>
      </main>
    )
  }

  return (
    <div className={styles.layout}>
      <Sidebar />

      <main className={styles.main}>
        <DashboardHeader
          role={user.role}
          user={user}
          sectionLabel={getSectionLabel(user.role, currentSection, language)}
        />

        <section className={styles.content}>
          <Outlet />
        </section>
      </main>
    </div>
  )
}
