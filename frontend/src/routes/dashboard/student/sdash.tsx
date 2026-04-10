import { createFileRoute } from '@tanstack/react-router'
import { StudentDashboard } from '#/components/dashboard/views/Student'

export const Route = createFileRoute('/dashboard/student/sdash')({
  component: RouteComponent,
})

function RouteComponent() {
  return <StudentDashboard />
}
