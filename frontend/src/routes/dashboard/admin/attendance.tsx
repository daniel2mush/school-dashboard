import { AdminAttendance } from '#/components/dashboard/views/Admin'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/admin/attendance')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AdminAttendance />
}
