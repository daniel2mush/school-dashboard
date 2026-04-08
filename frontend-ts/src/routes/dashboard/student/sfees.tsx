import { createFileRoute } from '@tanstack/react-router'
import { StudentFeesStatus } from '#/components/dashboard/views/Student'

export const Route = createFileRoute('/dashboard/student/sfees')({
  component: RouteComponent,
})

function RouteComponent() {
  return <StudentFeesStatus />
}
