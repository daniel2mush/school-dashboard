import {
  createFileRoute,
  Outlet,
  redirect,
  useLocation,
} from '@tanstack/react-router'
import useUserStore from '#/components/store/UserStore'
import DashboardHeader from '#/components/dashboard/DashboardHeader/DashboardHeader'
import Sidebar from '#/components/dashboard/Sidebar/Sidebar'
import styles from './dashboard/Dashboard.module.scss'
import { getSectionLabel } from '#/components/constants/navigation'

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

  // Derive the current section from the URL path
  // Example: /dashboard/admin/announcements -> 'announcements'
  const pathParts = location.pathname.split('/').filter(Boolean)
  const currentSection = pathParts[pathParts.length - 1] || 'overview'

  if (!user) return null

  return (
    <div className={styles.layout}>
      <Sidebar />

      <main className={styles.main}>
        <DashboardHeader
          role={user.role}
          user={user}
          sectionLabel={getSectionLabel(user.role, currentSection)}
        />

        <section className={styles.content}>
          <Outlet />
        </section>
      </main>
    </div>
  )
}
