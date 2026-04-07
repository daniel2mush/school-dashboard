import { AdminAnalytics } from '#/components/dashboard/views/Admin'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/admin/analytics')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AdminAnalytics />
}
