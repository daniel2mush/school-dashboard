import { createFileRoute } from '@tanstack/react-router'
import { StudentAttendance } from '#/components/dashboard/views/Student'

export const Route = createFileRoute('/dashboard/student/satt')({
  component: RouteComponent,
})

function RouteComponent() {
  return <StudentAttendance />
}
