import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/student/sdash')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/student/sdash"!</div>
}
