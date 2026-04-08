import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/student/sfees')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/student/sfees"!</div>
}
