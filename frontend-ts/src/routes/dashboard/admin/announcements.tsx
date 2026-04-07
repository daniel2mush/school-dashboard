import { AdminAnnouncements } from '#/components/dashboard/views/Admin'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/admin/announcements')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AdminAnnouncements />
}
