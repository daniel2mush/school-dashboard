import { createFileRoute } from '@tanstack/react-router'
import { StudentAnnouncements } from '#/components/dashboard/views/Student'

export const Route = createFileRoute('/dashboard/student/sann')({
  component: RouteComponent,
})

function RouteComponent() {
  return <StudentAnnouncements />
}
