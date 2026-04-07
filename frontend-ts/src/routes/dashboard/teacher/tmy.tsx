import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/teacher/tmy')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/teacher/tmy"!</div>
}
