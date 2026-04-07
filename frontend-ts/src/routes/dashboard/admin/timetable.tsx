import { AdminTimetable } from '#/components/dashboard/views/Admin'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/admin/timetable')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AdminTimetable />
}
