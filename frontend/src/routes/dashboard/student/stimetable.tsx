import { createFileRoute } from '@tanstack/react-router'
import { StudentTimetable } from '#/components/dashboard/views/Student'

export const Route = createFileRoute('/dashboard/student/stimetable')({
  component: RouteComponent,
})

function RouteComponent() {
  return <StudentTimetable />
}
