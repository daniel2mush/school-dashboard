import { createFileRoute } from '@tanstack/react-router'
import { TeachSubjectsContent } from '#/components/dashboard/views/Teach'

export const Route = createFileRoute('/dashboard/teacher/tsubjects')({
  component: RouteComponent,
})

function RouteComponent() {
  return <TeachSubjectsContent />
}
