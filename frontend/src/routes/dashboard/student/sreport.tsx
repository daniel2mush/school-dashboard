import { createFileRoute } from '@tanstack/react-router'
import { StudentReportCard } from '#/components/dashboard/views/Student'

export const Route = createFileRoute('/dashboard/student/sreport')({
  component: RouteComponent,
})

function RouteComponent() {
  return <StudentReportCard />
}
