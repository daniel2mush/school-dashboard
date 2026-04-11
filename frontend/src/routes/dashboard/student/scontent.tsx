import { createFileRoute } from '@tanstack/react-router'
import { StudentClassContent } from '#/components/dashboard/views/Student'

export const Route = createFileRoute('/dashboard/student/scontent')({
  component: RouteComponent,
})

function RouteComponent() {
  return <StudentClassContent />
}
