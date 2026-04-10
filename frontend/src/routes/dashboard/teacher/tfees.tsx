import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/teacher/tfees')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/teacher/tfees"!</div>
}
