import {
  createFileRoute,
  Outlet,
  redirect,
  useLocation,
} from '@tanstack/react-router'
import useUserStore from '#/components/store/UserStore'
import DashboardHeader from '#/components/dashboard/DashboardHeader/DashboardHeader'
import { useDashboardLanguage } from '#/components/dashboard/i18n'
import Sidebar from '#/components/dashboard/Sidebar/Sidebar'
import styles from './dashboard/Dashboard.module.scss'
import { getSectionLabel } from '#/components/constants/navigation'
import { useMediaQuery } from 'react-responsive'
import { MobileGate } from '#/components/MobileGate/MobileGate'
import { useDashboardTranslation } from '#/components/dashboard/i18n'
import { useLogout } from '#/components/query/AuthQuery'

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
  const isTabletOrMobile = useMediaQuery({ maxWidth: 1024 })

  const pathParts = location.pathname.split('/').filter(Boolean)
  const currentSection = pathParts[pathParts.length - 1] || 'overview'

  if (!user) return null

  if (isTabletOrMobile) {
    return (
      <MobileGate
        onLogout={() => logoutMutation()}
        isLoggingOut={isLoggingOut}
      />
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
