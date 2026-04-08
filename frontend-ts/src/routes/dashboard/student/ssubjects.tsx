import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/student/ssubjects')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/student/ssubjects"!</div>
}
