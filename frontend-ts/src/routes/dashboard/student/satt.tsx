import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/student/satt')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/student/satt"!</div>
}
