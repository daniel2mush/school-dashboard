import { createFileRoute } from '@tanstack/react-router'
import { StudentSubjects } from '#/components/dashboard/views/Student'

export const Route = createFileRoute('/dashboard/student/ssubjects')({
  component: RouteComponent,
})

function RouteComponent() {
  return <StudentSubjects />
}
