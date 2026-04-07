import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import useUserStore from '#/components/store/UserStore'
import { useEffect } from 'react'
import Loading from '#/components/Loading/Loading'

export const Route = createFileRoute('/dashboard/')({
  // Keep the beforeLoad for internal transitions
  beforeLoad: () => {
    if (typeof window !== 'undefined') {
      const user = useUserStore.getState().user
      if (user?.role === 'ADMIN')
        throw redirect({ to: '/dashboard/admin/overview' })
      if (user?.role === 'TEACHER')
        throw redirect({ to: '/dashboard/teacher/tmy' })
      if (user?.role === 'STUDENT')
        throw redirect({ to: '/dashboard/student/sdash' })
    }
  },
  component: DashboardIndexComponent,
})

function DashboardIndexComponent() {
  const user = useUserStore((state) => state.user)
  const navigate = useNavigate()

  useEffect(() => {
    // If the beforeLoad missed it (due to hydration timing),
    // the component will catch it here.
    if (user?.role === 'ADMIN') navigate({ to: '/dashboard/admin/overview' })
    if (user?.role === 'TEACHER') navigate({ to: '/dashboard/teacher/tmy' })
    if (user?.role === 'STUDENT') navigate({ to: '/dashboard/student/sdash' })
    if (!user) navigate({ to: '/login' })
  }, [user, navigate])

  return <Loading /> // Show a spinner while the redirect is calculated
}
