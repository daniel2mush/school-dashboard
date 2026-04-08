import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/student/sreport')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/student/sreport"!</div>
}
