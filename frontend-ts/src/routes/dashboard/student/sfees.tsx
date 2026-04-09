import { StudentFeesStatus } from '#/components/dashboard/views/Student'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/student/sfees')({
  component: RouteComponent,
})

function RouteComponent() {
  return <StudentFeesStatus />
}
