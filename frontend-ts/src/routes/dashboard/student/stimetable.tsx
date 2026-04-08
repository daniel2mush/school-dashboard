import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/student/stimetable')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/student/stimetable"!</div>
}
